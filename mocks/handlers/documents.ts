/**
 * MSW handlers for documents API
 * Mocks all document-related endpoints
 */

import { http, HttpResponse } from 'msw'
import { documentsSeed } from '@/mocks/data/documentsSeed'
import { parseQuery, processQuery, generateId } from '@/mocks/utils'
import type { DocumentDTO } from '@/mocks/data/documentsSeed'

// In-memory store (will reset on page refresh)
let documents = [...documentsSeed]

export const documentsHandlers = [
  // GET /documents
  http.get('/api/documents', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    const result = processQuery(documents, query)
    
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

  // GET /documents/:id
  http.get('/api/documents/:id', ({ params }) => {
    const { id } = params
    const document = documents.find(d => d.id === id)
    
    if (!document) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(document)
  }),

  // POST /documents (simulate file upload)
  http.post('/api/documents', async ({ request }) => {
    // In a real implementation, this would handle FormData with file uploads
    // For mocking, we'll accept JSON with document metadata
    const body = await request.json() as Partial<DocumentDTO>
    
    const newDocument: DocumentDTO = {
      id: generateId(),
      clientId: body.clientId || '',
      name: body.name || 'Uploaded Document',
      type: body.type || 'OTHER',
      status: 'PENDING', // New uploads are always pending
      uploadedAt: new Date().toISOString(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      fileUrl: `/uploads/documents/${generateId()}.pdf`,
      fileName: body.fileName || `document_${Date.now()}.pdf`,
      fileSize: body.fileSize || Math.floor(Math.random() * 2000000) + 100000, // 100KB to 2MB
      mimeType: body.mimeType || 'application/pdf',
      notes: body.notes,
    }
    
    documents.push(newDocument)
    
    return HttpResponse.json(newDocument, { status: 201 })
  }),

  // PATCH /documents/:id
  http.patch('/api/documents/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    
    const documentIndex = documents.findIndex(d => d.id === id)
    if (documentIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    documents[documentIndex] = { ...documents[documentIndex], ...updates }
    
    return HttpResponse.json(documents[documentIndex])
  }),

  // POST /documents/:id/approve
  http.post('/api/documents/:id/approve', async ({ params, request }) => {
    const { id } = params
    const { reviewedBy, notes } = await request.json()
    
    const documentIndex = documents.findIndex(d => d.id === id)
    if (documentIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || 'System',
      notes: notes || 'Document approved'
    }
    
    return HttpResponse.json(documents[documentIndex])
  }),

  // POST /documents/:id/reject
  http.post('/api/documents/:id/reject', async ({ params, request }) => {
    const { id } = params
    const { reviewedBy, notes } = await request.json()
    
    const documentIndex = documents.findIndex(d => d.id === id)
    if (documentIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewedBy || 'System',
      notes: notes || 'Document requires resubmission'
    }
    
    return HttpResponse.json(documents[documentIndex])
  }),

  // DELETE /documents/:id
  http.delete('/api/documents/:id', ({ params }) => {
    const { id } = params
    const documentIndex = documents.findIndex(d => d.id === id)
    
    if (documentIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    documents.splice(documentIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /documents/download/:id (simulate file download)
  http.get('/api/documents/download/:id', ({ params }) => {
    const { id } = params
    const document = documents.find(d => d.id === id)
    
    if (!document) {
      return new HttpResponse(null, { status: 404 })
    }
    
    // Return a mock file response
    return new HttpResponse('Mock file content', {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Length': document.fileSize.toString()
      }
    })
  }),
]