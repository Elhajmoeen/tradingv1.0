/**
 * WebSocket handlers for real-time transaction invalidation
 * Guards with DEV + flag checks
 */

import { store } from '@/state/store'
import { transactionsApi } from '../state/transactionsApi'
import { isTransactionsNextEnabled } from '@/lib/flags'

interface TransactionWSMessage {
  type: 'transaction:created' | 'transaction:updated' | 'transaction:removed'
  data: {
    id: string
    clientId?: string
    [key: string]: any
  }
}

/**
 * Handle transaction WebSocket messages with invalidation
 */
export function handleTransactionWSMessage(message: TransactionWSMessage) {
  // Guard: Only process in DEV when flag is enabled
  if (!import.meta.env.DEV || !isTransactionsNextEnabled()) {
    return
  }

  if (import.meta.env.DEV) {
    console.log('[TransactionsWS] Handling message:', message.type, message.data?.id)
  }

  try {
    switch (message.type) {
      case 'transaction:created':
      case 'transaction:updated':
        // Invalidate list and specific transaction
        store.dispatch(
          transactionsApi.util.invalidateTags([
            { type: 'Transaction', id: 'LIST' },
            { type: 'Transaction', id: message.data.id },
          ])
        )
        break

      case 'transaction:removed':
        // Invalidate list and remove specific transaction
        store.dispatch(
          transactionsApi.util.invalidateTags([
            { type: 'Transaction', id: 'LIST' },
            { type: 'Transaction', id: message.data.id },
          ])
        )
        break

      default:
        if (import.meta.env.DEV) {
          console.warn('[TransactionsWS] Unknown message type:', message.type)
        }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[TransactionsWS] Error handling message:', error)
    }
  }
}

/**
 * Initialize transaction WebSocket listeners
 */
export function initTransactionWS() {
  if (!import.meta.env.DEV || !isTransactionsNextEnabled()) {
    return
  }

  if (import.meta.env.DEV) {
    console.log('[TransactionsWS] Initialized transaction WebSocket handlers')
  }

  // TODO: Wire up to actual WebSocket service
  // Example: ws.on('message', handleTransactionWSMessage)
}