/**
 * Development diagnostics panel for Positions NEXT
 * Shows RTK Query errors, WebSocket state, and cache controls
 * Only available when feature flag is ON and in DEV mode
 */

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { baseApi } from '@/integration/baseApi'
import { getWebSocketState } from '../ws'
import { store } from '@/state/store'

interface RTKQueryError {
  timestamp: number
  endpoint: string
  error: any
}

export const PositionsDiag: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [errors, setErrors] = useState<RTKQueryError[]>([])
  const [wsState, setWsState] = useState(getWebSocketState())

  // Update WebSocket state every second
  useEffect(() => {
    const interval = setInterval(() => {
      setWsState(getWebSocketState())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Monitor RTK Query errors
  useEffect(() => {
    const state = store.getState()
    const apiState = (state as any).api

    if (apiState?.queries) {
      const newErrors: RTKQueryError[] = []
      
      Object.entries(apiState.queries).forEach(([key, query]: [string, any]) => {
        if (query.error && key.includes('Position')) {
          newErrors.push({
            timestamp: query.fulfilledTimeStamp || Date.now(),
            endpoint: key,
            error: query.error
          })
        }
      })

      // Keep only last 10 errors
      setErrors(newErrors.slice(-10))
    }
  }, [])

  const handleInvalidateCache = () => {
    store.dispatch(baseApi.util.invalidateTags(['Position']))
    console.log('PositionsDiag: Invalidated Position cache')
  }

  const handleClearErrors = () => {
    setErrors([])
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg"
          title="Open Positions Diagnostics"
        >
          🔧 Positions
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-80 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Positions NEXT Diagnostics</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
        {/* WebSocket Status */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">WebSocket Status</h4>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div className="flex items-center space-x-2">
              <span 
                className={`w-2 h-2 rounded-full ${
                  wsState.connected ? 'bg-green-500' : 
                  wsState.connecting ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
              <span>
                {wsState.connected ? 'Connected' : 
                 wsState.connecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            {wsState.reconnectAttempts > 0 && (
              <div className="text-orange-600 mt-1">
                Reconnect attempts: {wsState.reconnectAttempts}
              </div>
            )}
          </div>
        </div>

        {/* RTK Query Errors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-700">RTK Query Errors</h4>
            {errors.length > 0 && (
              <button
                onClick={handleClearErrors}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="text-gray-500">No errors logged</div>
            ) : (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1">
                    <div className="font-medium text-red-600">{error.endpoint}</div>
                    <div className="text-gray-600">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-red-500 break-all">
                      {typeof error.error === 'string' ? error.error : JSON.stringify(error.error)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cache Controls */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">Cache Controls</h4>
          <button
            onClick={handleInvalidateCache}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-xs font-medium"
          >
            Invalidate Positions Cache
          </button>
        </div>
      </div>
    </div>
  )
}