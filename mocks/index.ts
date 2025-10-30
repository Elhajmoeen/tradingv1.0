/**
 * Mock Service Worker (MSW) exports
 * Provides comprehensive mocking for all API endpoints when feature flags are enabled
 */

// Browser setup
export { worker } from './browser'

// Mock data seeds
export { positionsSeed } from './data/positionsSeed'
export { transactionsSeed } from './data/transactionsSeed'
export { leadsSeed } from './data/leadsSeed'
export { clientsSeed } from './data/clientsSeed'
export { documentsSeed } from './data/documentsSeed'

// Handlers
export { positionsHandlers } from './handlers/positions'
export { transactionsHandlers } from './handlers/transactions'
export { leadsHandlers } from './handlers/leads'
export { clientsHandlers } from './handlers/clients'
// PATCH: begin lookups handlers export
export { lookupsHandlers } from './handlers/lookups'
// PATCH: end lookups handlers export
export { documentsHandlers } from './handlers/documents'

// Utilities
export {
  parseQuery,
  processQuery,
  filterArray,
  sortArray,
  paginateArray,
  generateId,
  randomDateWithinDays,
  randomItem,
  randomNumber
} from './utils'

// Type exports
export type { QueryParams } from './utils'
export type { ClientDTO } from './data/clientsSeed'
export type { LeadDTO } from './data/leadsSeed'
export type { DocumentDTO } from './data/documentsSeed'