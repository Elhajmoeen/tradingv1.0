/**
 * MSW handlers for positions API
 * Mocks all position-related endpoints
 */

import { http, HttpResponse } from 'msw'
import { positionsSeed } from '@/mocks/data/positionsSeed'
import { parseQuery, processQuery, generateId } from '@/mocks/utils'
import type { PositionDTO, CreatePositionRequest } from '@/features/positions_next/types/position'

// In-memory store (will reset on page refresh)
let positions = [...positionsSeed]

// TODO: Remove clientId compatibility once backend aligned
function addClientIdForCompatibility(position: PositionDTO): PositionDTO & { clientId?: string } {
  return { ...position, clientId: position.accountId }
}

export const positionsHandlers = [
  // GET /positions/open
  http.get('/api/positions/open', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const openPositions = positions.filter(p => p.status === 'OPEN')
    const result = processQuery(openPositions, query)
    
    // Add clientId for backward compatibility
    const compatibleData = result.data.map(addClientIdForCompatibility)
    
    return HttpResponse.json(compatibleData)
  }),

  // GET /positions/pending
  http.get('/api/positions/pending', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const pendingPositions = positions.filter(p => p.status === 'PENDING')
    const result = processQuery(pendingPositions, query)
    
    const compatibleData = result.data.map(addClientIdForCompatibility)
    return HttpResponse.json(compatibleData)
  }),

  // GET /positions/closed
  http.get('/api/positions/closed', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const closedPositions = positions.filter(p => p.status === 'CLOSED')
    const result = processQuery(closedPositions, query)
    
    const compatibleData = result.data.map(addClientIdForCompatibility)
    return HttpResponse.json(compatibleData)
  }),

  // GET /positions (all positions with filters)
  http.get('/api/positions', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const result = processQuery(positions, query)
    
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

  // GET /positions/:id
  http.get('/api/positions/:id', ({ params }) => {
    const { id } = params
    const position = positions.find(p => p.id === id)
    
    if (!position) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(position)
  }),

  // POST /positions
  http.post('/api/positions', async ({ request }) => {
    const body = await request.json() as CreatePositionRequest
    
    const newPosition: PositionDTO = {
      id: generateId(),
      ...body,
      currentPrice: body.openPrice,
      closePrice: null,
      closeTime: null,
      closeReason: null,
      commission: 0,
      swap: 0,
      openTime: new Date().toISOString(),
      status: 'OPEN',
      expirationTime: body.expirationTime || null
    }
    
    positions.push(newPosition)
    
    return HttpResponse.json(newPosition, { status: 201 })
  }),

  // PATCH /positions/:id
  http.patch('/api/positions/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    
    const positionIndex = positions.findIndex(p => p.id === id)
    if (positionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    positions[positionIndex] = { ...positions[positionIndex], ...updates }
    
    return HttpResponse.json(positions[positionIndex])
  }),

  // POST /positions/:id/close
  http.post('/api/positions/:id/close', async ({ params, request }) => {
    const { id } = params
    const { closePrice, closeReason } = await request.json()
    
    const positionIndex = positions.findIndex(p => p.id === id)
    if (positionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    positions[positionIndex] = {
      ...positions[positionIndex],
      status: 'CLOSED',
      closePrice,
      closeTime: new Date().toISOString(),
      closeReason: closeReason || 'MANUAL'
    }
    
    return HttpResponse.json(positions[positionIndex])
  }),

  // POST /positions/:id/cancel
  http.post('/api/positions/:id/cancel', async ({ params, request }) => {
    const { id } = params
    const { reason } = await request.json()
    
    const positionIndex = positions.findIndex(p => p.id === id)
    if (positionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    positions[positionIndex] = {
      ...positions[positionIndex],
      status: 'CANCELLED',
      closeTime: new Date().toISOString(),
      closeReason: reason || 'CANCELLED'
    }
    
    return HttpResponse.json(positions[positionIndex])
  }),

  // POST /positions/:id/reopen
  http.post('/api/positions/:id/reopen', async ({ params, request }) => {
    const { id } = params
    const { openPrice, openReason } = await request.json()
    
    const positionIndex = positions.findIndex(p => p.id === id)
    if (positionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    positions[positionIndex] = {
      ...positions[positionIndex],
      status: 'OPEN',
      openPrice: openPrice || positions[positionIndex].openPrice,
      openReason: openReason || 'REOPENED',
      currentPrice: openPrice || positions[positionIndex].openPrice,
      closePrice: null,
      closeTime: null,
      closeReason: null,
      openTime: new Date().toISOString()
    }
    
    return HttpResponse.json(positions[positionIndex])
  }),

  // DELETE /positions/:id
  http.delete('/api/positions/:id', ({ params }) => {
    const { id } = params
    const positionIndex = positions.findIndex(p => p.id === id)
    
    if (positionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    positions.splice(positionIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // ========== ACCOUNT ID ALIASES FOR BACKWARD COMPATIBILITY ==========
  
  // GET /accounts/:accountId/positions - Alias for client positions
  http.get('/api/accounts/:accountId/positions', ({ params, request }) => {
    const { accountId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    // Add accountId to query filters
    query.accountId = accountId as string
    
    const result = processQuery(positions, query)
    const compatibleData = result.data.map(addClientIdForCompatibility)
    
    return HttpResponse.json(compatibleData)
  }),

  // GET /clients/:clientId/positions - Legacy client positions endpoint
  http.get('/api/clients/:clientId/positions', ({ params, request }) => {
    const { clientId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    // Add clientId to query filters for backward compatibility
    query.clientId = clientId as string
    
    const result = processQuery(positions, query)
    const compatibleData = result.data.map(addClientIdForCompatibility)
    
    return HttpResponse.json(compatibleData)
  }),
]