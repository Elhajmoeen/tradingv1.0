// Enhanced filter options provider for Status Manager integration
import { useMemo } from 'react'
import { useStatusStore } from '@/features/lookups/state/useStatusStore'
import type { Option } from '@/fieldkit/types'

/**
 * Hook to get updated filter options that include dynamic status values
 */
export function useFilterOptionsWithStatus() {
  const statusStore = useStatusStore()
  
  return useMemo(() => {
    const statusOptions = {
      kycStatus: statusStore.getOptions('kycStatus', false),
      leadStatus: statusStore.getOptions('leadStatus', false),
      retentionStatus: statusStore.getOptions('retentionStatus', false),
    }
    
    // Return a function that can get options for any field
    return {
      getOptionsForField: (fieldKey: string): Option[] => {
        if (fieldKey === 'kycStatus') {
          return statusOptions.kycStatus
        }
        if (fieldKey === 'leadStatus') {
          return statusOptions.leadStatus
        }
        if (fieldKey === 'retentionStatus') {
          return statusOptions.retentionStatus
        }
        
        // For other fields, return empty array (they should use other systems)
        return []
      },
      
      // Direct access to status options
      kycStatus: statusOptions.kycStatus,
      leadStatus: statusOptions.leadStatus,
      retentionStatus: statusOptions.retentionStatus,
    }
  }, [statusStore])
}

/**
 * Enhanced options provider for table column filters
 */
export function useTableFilterOptions(columnId: string): Option[] {
  const statusStore = useStatusStore()
  
  return useMemo(() => {
    // Status fields use dynamic options
    if (columnId === 'kycStatus') {
      return statusStore.getOptions('kycStatus', false)
    }
    
    if (columnId === 'leadStatus') {
      return statusStore.getOptions('leadStatus', false)
    }
    
    if (columnId === 'retentionStatus') {
      return statusStore.getOptions('retentionStatus', false)
    }
    
    // For other fields, return empty (they should use their own option providers)
    return []
  }, [columnId, statusStore])
}

/**
 * Mass update helper for bulk operations
 */
export function useStatusMassUpdate() {
  const statusStore = useStatusStore()
  
  return {
    // Get available status options for mass update dropdowns
    getAvailableStatuses: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus') => {
      return statusStore.getOptions(category, false)
    },
    
    // Helper to validate if a status value exists
    isValidStatus: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', value: string) => {
      const options = statusStore.getOptions(category, false)
      return options.some(opt => opt.value === value)
    },
    
    // Get status label for display
    getStatusLabel: (category: 'kycStatus' | 'leadStatus' | 'retentionStatus', value: string) => {
      const options = statusStore.getOptions(category, false)
      const option = options.find(opt => opt.value === value)
      return option?.label || value
    }
  }
}