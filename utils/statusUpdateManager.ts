// Global status update notification system
// This ensures all components across the CRM get updated when status options change

import { useEffect, useRef, useState } from 'react'

// Event types for status updates
export type StatusUpdateEvent = {
  category: 'kycStatus' | 'leadStatus' | 'retentionStatus'
  action: 'add' | 'update' | 'delete' | 'reorder' | 'toggle' | 'deprecate'
  id?: string
}

// Global event emitter for status updates
class StatusUpdateManager {
  private listeners: Set<(event: StatusUpdateEvent) => void> = new Set()
  
  // Add a listener for status updates
  subscribe(callback: (event: StatusUpdateEvent) => void): () => void {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }
  
  // Emit a status update event
  emit(event: StatusUpdateEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in status update listener:', error)
      }
    })
  }
  
  // Emit multiple events (for batch operations)
  emitBatch(events: StatusUpdateEvent[]): void {
    events.forEach(event => this.emit(event))
  }
  
  // Clear all listeners (for cleanup)
  clear(): void {
    this.listeners.clear()
  }
}

// Global instance
export const statusUpdateManager = new StatusUpdateManager()

/**
 * React hook to listen for status updates and trigger re-renders
 */
export function useStatusUpdates(
  callback?: (event: StatusUpdateEvent) => void,
  categories?: ('kycStatus' | 'leadStatus' | 'retentionStatus')[]
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const unsubscribe = statusUpdateManager.subscribe((event) => {
      // Filter by categories if specified
      if (categories && !categories.includes(event.category)) {
        return
      }
      
      // Call the callback if provided
      if (callbackRef.current) {
        callbackRef.current(event)
      }
    })
    
    return unsubscribe
  }, [categories])
}

/**
 * React hook to trigger component re-renders when status options change
 */
export function useStatusOptionsUpdates(categories?: ('kycStatus' | 'leadStatus' | 'retentionStatus')[]) {
  const [updateCounter, setUpdateCounter] = useState(0)

  useEffect(() => {
    const unsubscribe = statusUpdateManager.subscribe((event) => {
      // Filter by categories if specified
      if (categories && !categories.includes(event.category)) {
        return
      }
      
      // Force re-render by updating counter
      setUpdateCounter(prev => prev + 1)
    })
    
    return unsubscribe
  }, [categories])

  return updateCounter
}

/**
 * Helper to emit status update events from Status Manager
 */
export function emitStatusUpdate(event: StatusUpdateEvent) {
  statusUpdateManager.emit(event)
  
  // Also emit the browser custom event for backward compatibility
  window.dispatchEvent(new CustomEvent('status-updated', { 
    detail: { 
      category: event.category,
      action: event.action,
      id: event.id 
    } 
  }))
}

/**
 * Batch emit multiple status updates
 */
export function emitStatusUpdates(events: StatusUpdateEvent[]) {
  statusUpdateManager.emitBatch(events)
  
  // Emit a general update event
  events.forEach(event => {
    window.dispatchEvent(new CustomEvent('status-updated', { 
      detail: { 
        category: event.category,
        action: event.action,
        id: event.id 
      } 
    }))
  })
}

// Utility functions for common status update scenarios
export const statusUpdateHelpers = {
  onAdd: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', id: string) => 
    emitStatusUpdate({ category, action: 'add', id }),
    
  onUpdate: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', id: string) => 
    emitStatusUpdate({ category, action: 'update', id }),
    
  onDelete: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', id: string) => 
    emitStatusUpdate({ category, action: 'delete', id }),
    
  onReorder: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus') => 
    emitStatusUpdate({ category, action: 'reorder' }),
    
  onToggle: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', id: string) => 
    emitStatusUpdate({ category, action: 'toggle', id }),
    
  onDeprecate: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', id: string) => 
    emitStatusUpdate({ category, action: 'deprecate', id }),
}