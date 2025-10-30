/**
 * Transactions NEXT feature exports
 * Provides clean API for integrating RTK Query-based transactions
 */

// Types
export type { TransactionDTO, CreateTransactionRequest } from './types/transaction'

// API hooks
export {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionsFilteredQuery,
  useLazyGetTransactionsQuery,
  useLazyGetTransactionQuery,
  useLazyGetTransactionsFilteredQuery
} from './api/transactionsApi'

// Components
export { TransactionsTable } from './components/TransactionsTable'
export { TransactionsAdapter } from './adapters/TransactionsAdapter'

// Schemas and parsers
export { parseTransactions, parseTransaction, toLegacyFormat } from './types/transaction.schema'

// WebSocket integration
export { 
  handleTransactionWebSocketMessage,
  subscribeToTransactionUpdates,
  initializeTransactionWebSocket
} from './integration/websocket'