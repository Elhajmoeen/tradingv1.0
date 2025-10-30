/**
 * MSW handlers for transactions API
 * Mocks all transaction-related endpoints with filtering and sorting
 */

import { http, HttpResponse } from 'msw'
import { transactionsSeed } from '@/mocks/data/transactionsSeed'
import { parseQuery, processQuery, generateId } from '@/mocks/utils'
import type { TransactionDTO, CreateTransactionRequest } from '@/features/transactions_next/types/transaction'

// In-memory store (will reset on page refresh)
let transactions = [...transactionsSeed]

export const transactionsHandlers = [
  // GET /transactions (with full filtering support)
  http.get('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    // Enhanced filtering for actionType, subType, createdByName, date ranges
    let filtered = [...transactions]
    
    if (query.filter) {
      const filter = query.filter
      if (filter.actionType) {
        filtered = filtered.filter(t => t.actionType === filter.actionType)
      }
      if (filter.subType) {
        filtered = filtered.filter(t => t.subType === filter.subType)
      }
      if (filter.createdByName) {
        filtered = filtered.filter(t => 
          t.createdByName?.toLowerCase().includes(filter.createdByName.toLowerCase())
        )
      }
      if (filter.dateFrom) {
        const fromDate = new Date(filter.dateFrom)
        filtered = filtered.filter(t => new Date(t.createdAt) >= fromDate)
      }
      if (filter.dateTo) {
        const toDate = new Date(filter.dateTo)
        filtered = filtered.filter(t => new Date(t.createdAt) <= toDate)
      }
      if (filter.clientId) {
        filtered = filtered.filter(t => t.clientId === filter.clientId)
      }
    }
    
    // Apply sorting - default to createdAt desc for latest first
    const sortField = query.sort || 'createdAt'
    const sortOrder = query.order || 'desc'
    
    if (sortField === 'createdAt') {
      filtered.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate
      })
    } else if (sortField === 'amount') {
      filtered.sort((a, b) => {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount
      })
    }
    
    const result = processQuery(filtered, query)
    
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

  // GET /transactions/:id
  http.get('/api/transactions/:id', ({ params }) => {
    const { id } = params
    const transaction = transactions.find(t => t.id === id)
    
    if (!transaction) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(transaction)
  }),

  // POST /transactions
  http.post('/api/transactions', async ({ request }) => {
    const body = await request.json() as CreateTransactionRequest
    
    const newTransaction: TransactionDTO = {
      id: generateId(),
      ...body,
      createdAt: new Date().toISOString(),
      createdById: 'system',
      createdByName: 'System',
    }
    
    transactions.unshift(newTransaction) // Add to beginning for chronological order
    
    return HttpResponse.json(newTransaction, { status: 201 })
  }),

  // PATCH /transactions/:id
  http.patch('/api/transactions/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    
    const transactionIndex = transactions.findIndex(t => t.id === id)
    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    transactions[transactionIndex] = { ...transactions[transactionIndex], ...updates }
    
    return HttpResponse.json(transactions[transactionIndex])
  }),

  // DELETE /transactions/:id
  http.delete('/api/transactions/:id', ({ params }) => {
    const { id } = params
    const transactionIndex = transactions.findIndex(t => t.id === id)
    
    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    transactions.splice(transactionIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // ========== ACCOUNT ID ALIASES FOR BACKWARD COMPATIBILITY ==========
  
  // GET /accounts/:accountId/transactions - Alias for client transactions
  http.get('/api/accounts/:accountId/transactions', ({ params, request }) => {
    const { accountId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    query.accountId = accountId as string
    const result = processQuery(transactions, query)
    
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

  // GET /clients/:clientId/transactions - Legacy client transactions endpoint
  http.get('/api/clients/:clientId/transactions', ({ params, request }) => {
    const { clientId } = params
    const url = new URL(request.url)
    const query = parseQuery(url)
    
    query.clientId = clientId as string
    const result = processQuery(transactions, query)
    
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
]