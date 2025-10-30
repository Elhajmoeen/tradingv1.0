/**
 * WebSocket integration for real-time position updates
 * Invalidates RTK Query cache when position data changes
 */

import { baseApi } from '@/integration/baseApi'
import type { AppDispatch, RootState } from '@/state/store'

interface WSMessage {
  type: string
  data?: any
}

let ws: WebSocket | null = null
let reconnectTimeoutId: number | null = null
let isConnecting = false
let reconnectAttempts = 0
let heartbeatInterval: number | null = null

const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 1000

/**
 * Initialize positions real-time updates
 * Only connects when positions_next feature flag is enabled
 */
export function initPositionsRealtimeNext(
  dispatch: AppDispatch, 
  getState: () => RootState
): void {
  if (!import.meta.env.DEV) {
    console.log('WebSocket: Skipping in production')
    return
  }
  
  if (isConnecting || ws?.readyState === WebSocket.OPEN) {
    console.log('WebSocket: Already connected or connecting')
    return
  }
  
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
  console.log('WebSocket: Connecting to', wsUrl)
  
  isConnecting = true
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket: Connected for positions real-time updates')
    isConnecting = false
    reconnectAttempts = 0
    
    // Subscribe to position updates
    ws?.send(JSON.stringify({
      type: 'subscribe',
      channels: ['positions', 'prices']
    }))
    
    // Start heartbeat in DEV mode
    if (import.meta.env.DEV) {
      startHeartbeat()
    }
  }
  
  ws.onmessage = (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data)
      
      // Handle pong response
      if (message.type === 'pong') {
        return
      }
      
      switch (message.type) {
        case 'price':
        case 'position:update':
        case 'position:created':
        case 'position:closed':
        case 'position:cancelled':
          // Invalidate positions cache to trigger refetch
          dispatch(baseApi.util.invalidateTags(['Position']))
          console.log('WebSocket: Invalidated positions cache due to:', message.type)
          break
          
        default:
          // Ignore unknown message types
          break
      }
    } catch (error) {
      console.warn('WebSocket: Failed to parse message:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket: Error occurred:', error)
    isConnecting = false
  }
  
  ws.onclose = (event) => {
    console.log('WebSocket: Connection closed:', event.code, event.reason)
    isConnecting = false
    ws = null
    stopHeartbeat()
    
    // Auto-reconnect with exponential backoff if not intentionally closed
    if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      scheduleReconnect(dispatch, getState)
    }
  }
}

/**
 * Start heartbeat/ping-pong in DEV mode
 */
function startHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }
  
  heartbeatInterval = window.setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
    }
  }, 30000) // Ping every 30 seconds
}

/**
 * Stop heartbeat
 */
function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

/**
 * Schedule reconnection attempt with exponential backoff
 */
function scheduleReconnect(dispatch: AppDispatch, getState: () => RootState): void {
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId)
  }
  
  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts)
  reconnectAttempts++
  
  console.log(`WebSocket: Scheduling reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`)
  
  reconnectTimeoutId = window.setTimeout(() => {
    console.log('WebSocket: Attempting to reconnect...')
    initPositionsRealtimeNext(dispatch, getState)
  }, delay)
}

/**
 * Close WebSocket connection
 */
export function disconnectPositionsRealtime(): void {
  if (reconnectTimeoutId) {
    clearTimeout(reconnectTimeoutId)
    reconnectTimeoutId = null
  }
  
  stopHeartbeat()
  
  if (ws) {
    ws.close(1000, 'Disconnecting')
    ws = null
  }
  
  isConnecting = false
  reconnectAttempts = 0
}

/**
 * Get current WebSocket connection state
 */
export function getWebSocketState(): {
  connected: boolean
  connecting: boolean
  reconnectAttempts: number
} {
  return {
    connected: ws?.readyState === WebSocket.OPEN,
    connecting: isConnecting,
    reconnectAttempts
  }
}