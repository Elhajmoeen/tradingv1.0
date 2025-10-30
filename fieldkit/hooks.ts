// React hooks for accessing field options with status store integration
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import type { RootState } from '@/state/store'
import type { Option, EntityFieldKey } from './types'
import { optionsByKey, selectOptionsByKey } from './options'
import { useStatusStore } from '@/features/lookups/state/useStatusStore'

/**
 * React hook to get options for a specific field key
 * Automatically integrates with Status Manager for dynamic status options
 */
export function useFieldOptions(fieldKey: EntityFieldKey): Option[] {
  // Get status store state for reactive updates
  const statusStoreState = useStatusStore()
  
  // Get standard options from Redux
  const standardOptions = useSelector((state: RootState) => optionsByKey(state, fieldKey))
  
  // For status fields, we need to ensure reactivity to status store changes
  const statusOptions = useMemo(() => {
    if (fieldKey === 'kycStatus') {
      return statusStoreState.getOptions('kycStatus', false)
    }
    if (fieldKey === 'leadStatus') {
      return statusStoreState.getOptions('leadStatus', false)
    }
    if (fieldKey === 'retentionStatus') {
      return statusStoreState.getOptions('retentionStatus', false)
    }
    return null
  }, [fieldKey, statusStoreState])

  // Return status options if available, otherwise standard options
  return statusOptions || standardOptions
}

/**
 * Hook to get options for multiple fields at once
 */
export function useMultipleFieldOptions(fieldKeys: EntityFieldKey[]): Record<EntityFieldKey, Option[]> {
  const statusStoreState = useStatusStore()
  
  return useMemo(() => {
    const result: Record<string, Option[]> = {}
    
    fieldKeys.forEach(fieldKey => {
      // Status fields use Zustand store
      if (fieldKey === 'kycStatus') {
        result[fieldKey] = statusStoreState.getOptions('kycStatus', false)
      } else if (fieldKey === 'leadStatus') {
        result[fieldKey] = statusStoreState.getOptions('leadStatus', false)
      } else if (fieldKey === 'retentionStatus') {
        result[fieldKey] = statusStoreState.getOptions('retentionStatus', false)
      } else {
        // Use Redux for other fields - note: this won't be reactive
        result[fieldKey] = []
      }
    })
    
    return result as Record<EntityFieldKey, Option[]>
  }, [fieldKeys, statusStoreState])
}

/**
 * Hook specifically for status fields with proper reactivity
 */
export function useStatusFieldOptions() {
  const statusStore = useStatusStore()
  
  return useMemo(() => ({
    kycStatus: statusStore.getOptions('kycStatus', false),
    leadStatus: statusStore.getOptions('leadStatus', false),
    retentionStatus: statusStore.getOptions('retentionStatus', false),
  }), [statusStore])
}

/**
 * Hook for components that need to know when status options have changed
 */
export function useStatusOptionsChangeEffect(callback: () => void) {
  const statusStore = useStatusStore()
  
  // This will trigger whenever the status store changes
  useMemo(() => {
    callback()
  }, [statusStore, callback])
}