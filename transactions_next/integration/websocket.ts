/**
 * WebSocket integration for real-time transaction updates
 * Handles incoming transaction messages and updates RTK Query cache
 */

import { store } from '@/state/store'
import { transactionsApi } from '../api/transactionsApi'
import { parseTransaction } from '../types/transaction.schema'
import { isTransactionsNextEnabled } from '@/lib/flags'

interface TransactionWebSocketMessage {
  type: 'TRANSACTION_UPDATE' | 'TRANSACTION_CREATED' | 'TRANSACTION_APPROVED' | 'TRANSACTION_DECLINED'
  data: unknown // Raw transaction data from WebSocket
  clientId?: string
  transactionId?: string
}

/**
 * Handle incoming transaction WebSocket messages
 */
export const handleTransactionWebSocketMessage = (message: TransactionWebSocketMessage) => {
  // Only process if transactions_next feature is enabled
  if (!isTransactionsNextEnabled()) {
    if (import.meta.env.DEV) {
      console.log('Transaction WebSocket message ignored - feature disabled:', message.type)
    }
    return
  }

  try {
    switch (message.type) {
      case 'TRANSACTION_UPDATE':
        handleTransactionUpdate(message)
        break
      
      case 'TRANSACTION_CREATED':
        handleTransactionCreated(message)
        break
      
      case 'TRANSACTION_APPROVED':
        handleTransactionApproved(message)
        break
      
      case 'TRANSACTION_DECLINED':
        handleTransactionDeclined(message)
        break
      
      default:
        if (import.meta.env.DEV) {
          console.log('Unknown transaction WebSocket message type:', message.type)
        }
    }
  } catch (error) {
    console.error('Failed to handle transaction WebSocket message:', error)
  }
}

/**
 * Handle transaction update
 */
const handleTransactionUpdate = (message: TransactionWebSocketMessage) => {
  if (!message.data || !message.transactionId) return

  try {
    const transaction = parseTransaction(message.data)
    
    if (import.meta.env.DEV) {
      console.log('WebSocket: Transaction updated:', transaction.id)
    }

    // Update single transaction in cache
    store.dispatch(
      transactionsApi.util.updateQueryData('getTransaction', 
        { transactionId: transaction.id }, 
        () => transaction
      )
    )

    // Update in list queries if clientId available
    if (message.clientId) {
      store.dispatch(
        transactionsApi.util.updateQueryData('getTransactions', 
          { clientId: message.clientId }, 
          (draft) => {
            const index = draft.findIndex(t => t.id === transaction.id)
            if (index !== -1) {
              draft[index] = transaction
            }
          }
        )
      )
    }

    // Invalidate filtered queries to ensure consistency
    store.dispatch(transactionsApi.util.invalidateTags([{ type: 'Transaction', id: 'FILTERED' }]))

  } catch (error) {
    console.error('Failed to parse transaction update:', error)
  }
}

/**
 * Handle new transaction creation
 */
const handleTransactionCreated = (message: TransactionWebSocketMessage) => {
  if (!message.data || !message.clientId) return

  try {
    const transaction = parseTransaction(message.data)
    
    if (import.meta.env.DEV) {
      console.log('WebSocket: Transaction created:', transaction.id)
    }

    // Add to client's transaction list
    store.dispatch(
      transactionsApi.util.updateQueryData('getTransactions', 
        { clientId: message.clientId }, 
        (draft) => {
          // Add at beginning for chronological order
          draft.unshift(transaction)
        }
      )
    )

    // Invalidate all related queries
    store.dispatch(transactionsApi.util.invalidateTags([
      { type: 'Transaction', id: 'LIST' },
      { type: 'Transaction', id: 'FILTERED' }
    ]))

  } catch (error) {
    console.error('Failed to parse new transaction:', error)
  }
}

/**
 * Handle transaction approval
 */
const handleTransactionApproved = (message: TransactionWebSocketMessage) => {
  if (!message.data || !message.transactionId) return

  try {
    const transaction = parseTransaction(message.data)
    
    if (import.meta.env.DEV) {
      console.log('WebSocket: Transaction approved:', transaction.id)
    }

    // Update transaction status in all queries
    handleTransactionUpdate(message)

  } catch (error) {
    console.error('Failed to parse transaction approval:', error)
  }
}

/**
 * Handle transaction decline
 */
const handleTransactionDeclined = (message: TransactionWebSocketMessage) => {
  if (!message.data || !message.transactionId) return

  try {
    const transaction = parseTransaction(message.data)
    
    if (import.meta.env.DEV) {
      console.log('WebSocket: Transaction declined:', transaction.id)
    }

    // Update transaction status in all queries
    handleTransactionUpdate(message)

  } catch (error) {
    console.error('Failed to parse transaction decline:', error)
  }
}

/**
 * Subscribe to transaction WebSocket events for a specific client
 */
export const subscribeToTransactionUpdates = (clientId: string) => {
  if (!isTransactionsNextEnabled()) {
    if (import.meta.env.DEV) {
      console.log('Transaction WebSocket subscription skipped - feature disabled')
    }
    return () => {} // Return no-op unsubscribe
  }

  if (import.meta.env.DEV) {
    console.log('Subscribing to transaction updates for client:', clientId)
  }

  // TODO: Implement actual WebSocket subscription logic
  // This would typically involve sending a subscription message to the WebSocket server
  // For now, we just log the subscription
  
  return () => {
    if (import.meta.env.DEV) {
      console.log('Unsubscribing from transaction updates for client:', clientId)
    }
    // TODO: Implement unsubscribe logic
  }
}

/**
 * Initialize transaction WebSocket handlers
 * This should be called when the WebSocket connection is established
 */
export const initializeTransactionWebSocket = () => {
  if (!isTransactionsNextEnabled()) {
    return
  }

  if (import.meta.env.DEV) {
    console.log('Transaction WebSocket handlers initialized')
  }

  // TODO: Register message handlers with the main WebSocket service
  // This would typically involve registering handleTransactionWebSocketMessage 
  // with the global WebSocket message router
}

export default {
  handleTransactionWebSocketMessage,
  subscribeToTransactionUpdates,
  initializeTransactionWebSocket
}