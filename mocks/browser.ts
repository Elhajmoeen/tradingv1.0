/**
 * MSW browser setup
 * Configures Mock Service Worker for development environment
 */

import { setupWorker } from 'msw/browser'
import { positionsHandlers } from '@/mocks/handlers/positions'
import { transactionsHandlers } from '@/mocks/handlers/transactions'
import { leadsHandlers } from '@/mocks/handlers/leads'
import { clientsHandlers } from '@/mocks/handlers/clients'
import { documentsHandlers } from '@/mocks/handlers/documents'
// PATCH: begin lookups handlers import
import { lookupsHandlers } from '@/mocks/handlers/lookups'
// PATCH: end lookups handlers import

// Combine all handlers
const handlers = [
  ...positionsHandlers,
  ...transactionsHandlers,
  ...leadsHandlers,
  ...clientsHandlers,
  ...documentsHandlers,
  // PATCH: begin lookups handlers
  ...lookupsHandlers,
  // PATCH: end lookups handlers
]

// Create MSW worker
export const worker = setupWorker(...handlers)

// Enable logging in development
if (import.meta.env.DEV) {
  console.log('🔧 MSW: Mock Service Worker initialized with handlers:', {
    positions: positionsHandlers.length,
    transactions: transactionsHandlers.length,
    leads: leadsHandlers.length,
    clients: clientsHandlers.length,
    documents: documentsHandlers.length,
    total: handlers.length
  })
}