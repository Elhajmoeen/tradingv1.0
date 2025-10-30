/**
 * MSW handlers for clients API
 * Mocks all client-related endpoints with Profile NEXT support
 */

import { http, HttpResponse } from 'msw'
import { clientsSeed } from '@/mocks/data/clientsSeed'
import { positionsSeed } from '@/mocks/data/positionsSeed'
import { transactionsSeed } from '@/mocks/data/transactionsSeed'
import { parseQuery, processQuery, generateId } from '@/mocks/utils'
import type { ClientDTO as LegacyClientDTO } from '@/mocks/data/clientsSeed'
import type { ClientDTO as NextClientDTO, UpdateClientRequest, ClientDocument } from '@/features/profile_next/types/client'

// In-memory store (will reset on page refresh)
let clients = [...clientsSeed]
let nextDocuments: ClientDocument[] = []

// Transform legacy ClientDTO to profile_next ClientDTO
function legacyToNext(legacy: LegacyClientDTO): NextClientDTO {
  return {
    id: legacy.id,
    firstName: legacy.firstName,
    lastName: legacy.lastName,
    email: legacy.email,
    phoneCC: null, // Not in legacy
    phoneNumber: legacy.phone || null,
    country: legacy.country || null,
    dob: legacy.dateOfBirth || null,
    createdAt: legacy.registrationDate,
    lastLogin: legacy.lastLoginDate || null,
    leadStatus: null, // Not in legacy
    owners: {
      owner: legacy.salesManager || null,
      conversationOwner: null,
      retentionOwner: null
    }
  }
}

// Transform profile_next UpdateClientRequest to legacy ClientDTO updates
function nextToLegacyUpdate(next: UpdateClientRequest): Partial<LegacyClientDTO> {
  const updates: Partial<LegacyClientDTO> = {}
  
  if (next.firstName) updates.firstName = next.firstName
  if (next.lastName) updates.lastName = next.lastName
  if (next.email) updates.email = next.email
  if (next.phoneNumber) updates.phone = next.phoneNumber
  if (next.country) updates.country = next.country
  if (next.dob) updates.dateOfBirth = next.dob
  if (next.owners?.owner) updates.salesManager = next.owners.owner
  
  return updates
}

export const clientsHandlers = [
  // GET /clients
  http.get('/api/clients', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const result = processQuery(clients, query)
    
    return HttpResponse.json({
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize)
      }
    })
  }),

  // GET /clients/:id
  http.get('/api/clients/:id', ({ params }) => {
    const { id } = params
    const client = clients.find(c => c.id === id)
    
    if (!client) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(client)
  }),

  // PATCH /clients/:id
  http.patch('/api/clients/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json() as Partial<LegacyClientDTO>
    
    const clientIndex = clients.findIndex(c => c.id === id)
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    clients[clientIndex] = { ...clients[clientIndex], ...updates }
    
    return HttpResponse.json(clients[clientIndex])
  }),

  // GET /clients/:id/positions (proxy to positions by clientId)
  http.get('/api/clients/:id/positions', ({ params, request }) => {
    const { id: clientId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const clientPositions = positionsSeed.filter(p => p.clientId === clientId)
    const result = processQuery(clientPositions, query)
    
    return HttpResponse.json(result.data)
  }),

  // GET /clients/:id/transactions (proxy to transactions by clientId)
  http.get('/api/clients/:id/transactions', ({ params, request }) => {
    const { id: clientId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const clientTransactions = transactionsSeed.filter(t => t.clientId === clientId)
    const result = processQuery(clientTransactions, query)
    
    return HttpResponse.json(result.data)
  }),

  // POST /clients (create new client - typically from lead conversion)
  http.post('/api/clients', async ({ request }) => {
    const body = await request.json() as Partial<LegacyClientDTO>
    
    const newClient: LegacyClientDTO = {
      id: body.id || `client_${Date.now()}`,
      accountId: body.accountId || `ACC${Math.floor(Math.random() * 1000000)}`,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      phone: body.phone,
      country: body.country,
      city: body.city,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      kycStatus: body.kycStatus || 'PENDING',
      accountType: body.accountType || 'Standard',
      registrationDate: new Date().toISOString(),
      lastLoginDate: undefined,
      isActive: true,
      totalDeposits: 0,
      totalWithdrawals: 0,
      balance: 0,
      currency: body.currency || 'USD',
      salesManager: body.salesManager,
      desk: body.desk,
      ftd: false,
      regulation: body.regulation,
    }
    
    clients.push(newClient)
    
    return HttpResponse.json(newClient, { status: 201 })
  }),

  // POST /clients/:id/activate
  http.post('/api/clients/:id/activate', ({ params }) => {
    const { id } = params
    const clientIndex = clients.findIndex(c => c.id === id)
    
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      isActive: true
    }
    
    return HttpResponse.json(clients[clientIndex])
  }),

  // POST /clients/:id/deactivate
  http.post('/api/clients/:id/deactivate', ({ params }) => {
    const { id } = params
    const clientIndex = clients.findIndex(c => c.id === id)
    
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      isActive: false
    }
    
    return HttpResponse.json(clients[clientIndex])
  }),

  // ========== PROFILE NEXT SPECIFIC ENDPOINTS ==========

  // GET /profile_next/clients/:id - Get client in NextClientDTO format
  http.get('/api/profile_next/clients/:id', ({ params }) => {
    const { id } = params
    const client = clients.find(c => c.id === id)
    
    if (!client) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(legacyToNext(client))
  }),

  // PATCH /profile_next/clients/:id - Update client with NextClientDTO format
  http.patch('/api/profile_next/clients/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json() as UpdateClientRequest
    
    const clientIndex = clients.findIndex(c => c.id === id)
    if (clientIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    const legacyUpdates = nextToLegacyUpdate(updates)
    clients[clientIndex] = { ...clients[clientIndex], ...legacyUpdates }
    
    return HttpResponse.json(legacyToNext(clients[clientIndex]))
  }),

  // GET /profile_next/clients/:id/documents - Get client documents
  http.get('/api/profile_next/clients/:id/documents', ({ params }) => {
    const { id } = params
    const clientDocs = nextDocuments.filter(doc => doc.clientId === id)
    
    return HttpResponse.json(clientDocs)
  }),

  // POST /profile_next/documents/request - Request document from client
  http.post('/api/profile_next/documents/request', async ({ request }) => {
    const { clientId, type, notes } = await request.json() as {
      clientId: string
      type: ClientDocument['type']
      notes?: string
    }
    
    const newDocument: ClientDocument = {
      id: `doc_${generateId()}`,
      clientId,
      type,
      name: `Requested ${type}`,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      notes
    }
    
    nextDocuments.push(newDocument)
    
    return HttpResponse.json(newDocument)
  }),

  // POST /profile_next/documents/upload - Upload document for client
  http.post('/api/profile_next/documents/upload', async ({ request }) => {
    const formData = await request.formData()
    const clientId = formData.get('clientId') as string
    const type = formData.get('type') as ClientDocument['type']
    const file = formData.get('file') as File
    
    const newDocument: ClientDocument = {
      id: `doc_${generateId()}`,
      clientId,
      type,
      name: file.name,
      status: 'pending',
      uploadedAt: new Date().toISOString()
    }
    
    nextDocuments.push(newDocument)
    
    return HttpResponse.json(newDocument)
  }),
]