/**
 * WebSocket integration for real-time position updates
 * Handles incoming position messages and updates RTK Query cache
 */

import { store } from '@/state/store'
import { positionsApi } from '../state/positionsApi'
import { parsePositions } from '../types/position.schema'
import { isPositionsNextEnabled } from '@/lib/flags'

interface PositionWebSocketMessage {
  type: 'POSITION_UPDATE' | 'POSITION_CREATED' | 'POSITION_CLOSED' | 'POSITION_CANCELLED'
  data: unknown // Raw position data from WebSocket
  clientId?: string
  positionId?: string
}

/**
 * Handle incoming position WebSocket messages
 */
export const handlePositionWebSocketMessage = (message: PositionWebSocketMessage) => {
  // Only process if positions_next feature is enabled
  if (!isPositionsNextEnabled()) {
    if (import.meta.env.DEV) {
      console.log('Position WebSocket message ignored - feature disabled:', message.type)
    }
    return
  }

  try {
    switch (message.type) {
      case 'POSITION_UPDATE':
        handlePositionUpdate(message)
        break
      
      case 'POSITION_CREATED':
        handlePositionCreated(message)
        break
      
      case 'POSITION_CLOSED':
        handlePositionClosed(message)
        break
      
      case 'POSITION_CANCELLED':
        handlePositionCancelled(message)
        break
      
      default:
        if (import.meta.env.DEV) {
          console.log('Unknown position WebSocket message type:', message.type)
        }
    }
  } catch (error) {
    console.error('Error handling position WebSocket message:', error)
  }
}

/**
 * Handle position updates (price changes, PnL updates, etc.)
 */
const handlePositionUpdate = (message: PositionWebSocketMessage) => {
  try {
    // Parse the position data
    const positions = parsePositions([message.data])
    if (positions.length === 0) {
      console.warn('Invalid position data in WebSocket update')
      return
    }

    const position = positions[0]

    // Update the RTK Query cache
    store.dispatch(
      positionsApi.util.updateQueryData('getById', position.id, (draft) => {
        Object.assign(draft, position)
      })
    )

    // Update list queries if they exist in cache
    updatePositionInListQueries(position)

    if (import.meta.env.DEV) {
      console.log('Position updated via WebSocket:', position.id)
    }
  } catch (error) {
    console.error('Error handling position update:', error)
  }
}

/**
 * Handle new position creation
 */
const handlePositionCreated = (message: PositionWebSocketMessage) => {
  try {
    const positions = parsePositions([message.data])
    if (positions.length === 0) {
      console.warn('Invalid position data in WebSocket creation')
      return
    }

    const position = positions[0]

    // Invalidate relevant list queries to refetch with new position
    if (position.status === 'OPEN') {
      store.dispatch(positionsApi.util.invalidateTags(['Position']))
    } else if (position.status === 'PENDING') {
      store.dispatch(positionsApi.util.invalidateTags(['Position']))
    }

    if (import.meta.env.DEV) {
      console.log('Position created via WebSocket:', position.id)
    }
  } catch (error) {
    console.error('Error handling position creation:', error)
  }
}

/**
 * Handle position closure
 */
const handlePositionClosed = (message: PositionWebSocketMessage) => {
  try {
    const positions = parsePositions([message.data])
    if (positions.length === 0) {
      console.warn('Invalid position data in WebSocket closure')
      return
    }

    const position = positions[0]

    // Update the specific position cache
    store.dispatch(
      positionsApi.util.updateQueryData('getById', position.id, (draft) => {
        Object.assign(draft, position)
      })
    )

    // Invalidate all list queries since position moved between lists
    store.dispatch(positionsApi.util.invalidateTags(['Position']))

    if (import.meta.env.DEV) {
      console.log('Position closed via WebSocket:', position.id)
    }
  } catch (error) {
    console.error('Error handling position closure:', error)
  }
}

/**
 * Handle position cancellation
 */
const handlePositionCancelled = (message: PositionWebSocketMessage) => {
  try {
    const positions = parsePositions([message.data])
    if (positions.length === 0) {
      console.warn('Invalid position data in WebSocket cancellation')
      return
    }

    const position = positions[0]

    // Update the specific position cache
    store.dispatch(
      positionsApi.util.updateQueryData('getById', position.id, (draft) => {
        Object.assign(draft, position)
      })
    )

    // Invalidate all list queries since position moved between lists
    store.dispatch(positionsApi.util.invalidateTags(['Position']))

    if (import.meta.env.DEV) {
      console.log('Position cancelled via WebSocket:', position.id)
    }
  } catch (error) {
    console.error('Error handling position cancellation:', error)
  }
}

/**
 * Update position in all relevant list queries
 */
const updatePositionInListQueries = (position: any) => {
  const state = store.getState()
  const api = state.api as any // RTK Query state

  // Get all cached query keys
  const queryKeys = Object.keys(api.queries || {})
  
  // Find position list queries and update them
  queryKeys.forEach(key => {
    if (key.includes('listOpen') || key.includes('listPending') || key.includes('listClosed')) {
      try {
        store.dispatch(
          positionsApi.util.updateQueryData(
            key.includes('listOpen') ? 'listOpen' : key.includes('listPending') ? 'listPending' : 'listClosed',
            api.queries[key]?.originalArgs,
            (draft) => {
              const index = draft.findIndex((p: any) => p.id === position.id)
              if (index !== -1) {
                draft[index] = position
              }
            }
          )
        )
      } catch (error) {
        // Ignore errors for queries that don't match
      }
    }
  })
}

/**
 * Initialize WebSocket position listeners
 * This should be called when the application starts
 */
export const initializePositionWebSocket = () => {
  if (!isPositionsNextEnabled()) {
    if (import.meta.env.DEV) {
      console.log('Position WebSocket initialization skipped - feature disabled')
    }
    return
  }

  // TODO: Connect to actual WebSocket service
  // This is a placeholder for the actual WebSocket integration
  if (import.meta.env.DEV) {
    console.log('Position WebSocket integration initialized')
  }
}

/**
 * Cleanup WebSocket position listeners
 */
export const cleanupPositionWebSocket = () => {
  // TODO: Disconnect from WebSocket service
  if (import.meta.env.DEV) {
    console.log('Position WebSocket integration cleaned up')
  }
}

// Mock WebSocket message for testing
export const mockPositionWebSocketMessage = (type: PositionWebSocketMessage['type'], positionData: any) => {
  if (import.meta.env.DEV) {
    handlePositionWebSocketMessage({
      type,
      data: positionData,
      clientId: positionData.clientId,
      positionId: positionData.id,
    })
  }
}