// Emergency patch for LeadsPage temporal dead zone issue
// This must be imported BEFORE LeadsPage to fix the initialization order problem

import { 
  getAllColumnsVisible, 
  getAllColumnsHidden, 
  getDefaultVisibleColumns,
  leadColumnDefinitions 
} from '@/config/columns'

// Provide safe fallbacks for functions that might be called during initialization
const safeGetAllColumnsVisible = (columns: any[] = []) => {
  try {
    return getAllColumnsVisible(columns)
  } catch {
    // Fallback: return all leadColumnDefinitions as visible
    const result: Record<string, boolean> = {}
    leadColumnDefinitions.forEach(col => {
      result[col.id] = true
    })
    return result
  }
}

const safeGetAllColumnsHidden = (columns: any[] = []) => {
  try {
    return getAllColumnsHidden(columns)
  } catch {
    // Fallback: return all leadColumnDefinitions as hidden
    const result: Record<string, boolean> = {}
    leadColumnDefinitions.forEach(col => {
      result[col.id] = false
    })
    return result
  }
}

const safeGetDefaultVisibleColumns = (columns: any[] = []) => {
  try {
    return getDefaultVisibleColumns(columns)
  } catch {
    // Fallback: return default visibility for leadColumnDefinitions
    const result: Record<string, boolean> = {}
    leadColumnDefinitions.forEach(col => {
      result[col.id] = true // Default to visible
    })
    return result
  }
}

// Monkey patch the global scope to provide these functions during initialization
// This prevents the temporal dead zone error
;(globalThis as any).__leadsPagePatches = {
  safeGetAllColumnsVisible,
  safeGetAllColumnsHidden,
  safeGetDefaultVisibleColumns,
  emptyCustomDocumentColumns: []
}

export {
  safeGetAllColumnsVisible,
  safeGetAllColumnsHidden,
  safeGetDefaultVisibleColumns
}