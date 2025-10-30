// Dynamic column definitions with Status Manager integration
import type { ColumnDefinition } from '@/components/ColumnsDrawer'
import { useStatusStore } from '@/features/lookups/state/useStatusStore'
import { leadColumnDefinitions } from '@/config/columns'

/**
 * Hook to get column definitions with updated status options
 */
export function useColumnDefinitionsWithStatusOptions(): ColumnDefinition[] {
  const statusStore = useStatusStore()
  
  return leadColumnDefinitions.map(col => {
    // Update status column options with current Status Manager data
    if (col.id === 'kycStatus') {
      return {
        ...col,
        options: statusStore.getOptions('kycStatus', false)
      }
    }
    
    if (col.id === 'leadStatus') {
      return {
        ...col,
        options: statusStore.getOptions('leadStatus', false)
      }
    }
    
    if (col.id === 'retentionStatus') {
      return {
        ...col,
        options: statusStore.getOptions('retentionStatus', false)
      }
    }
    
    return col
  })
}

/**
 * Get a specific column definition with updated status options
 */
export function getColumnDefinitionWithStatusOptions(columnId: string): ColumnDefinition | undefined {
  const statusStore = useStatusStore.getState()
  const column = leadColumnDefinitions.find(col => col.id === columnId)
  
  if (!column) return undefined
  
  // Update status column options
  if (columnId === 'kycStatus') {
    return {
      ...column,
      options: statusStore.getOptions('kycStatus', false)
    }
  }
  
  if (columnId === 'leadStatus') {
    return {
      ...column,
      options: statusStore.getOptions('leadStatus', false)
    }
  }
  
  if (columnId === 'retentionStatus') {
    return {
      ...column,
      options: statusStore.getOptions('retentionStatus', false)
    }
  }
  
  return column
}

/**
 * Utility to refresh column options for tables and filters
 */
export function getUpdatedStatusColumnOptions() {
  const statusStore = useStatusStore.getState()
  
  return {
    kycStatus: statusStore.getOptions('kycStatus', false),
    leadStatus: statusStore.getOptions('leadStatus', false),
    retentionStatus: statusStore.getOptions('retentionStatus', false),
  }
}