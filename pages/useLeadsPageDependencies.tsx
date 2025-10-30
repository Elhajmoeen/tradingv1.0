import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectGlobalCustomDocuments } from '@/state/entitiesSlice'
import { 
  getFilteredLeadColumnDefinitions,
  getAllColumnsVisible,
  getAllColumnsHidden,
  leadColumnDefinitions 
} from '@/config/columns'

// Pre-initialize the dependencies that LeadsPage needs
export function useLeadsPageDependencies() {
  const [isReady, setIsReady] = useState(false)
  const customDocuments = useSelector(selectGlobalCustomDocuments)

  // Pre-compute customDocumentColumns to avoid initialization errors
  const customDocumentColumns = useMemo(() => {
    try {
      return getFilteredLeadColumnDefinitions(customDocuments)
    } catch (error) {
      console.warn('Using fallback empty columns due to initialization error:', error)
      return []
    }
  }, [customDocuments])

  // Pre-compute default column states to prevent race conditions
  const defaultVisibleColumns = useMemo(() => {
    try {
      return getAllColumnsVisible(customDocumentColumns)
    } catch {
      return {}
    }
  }, [customDocumentColumns])

  const defaultHiddenColumns = useMemo(() => {
    try {
      return getAllColumnsHidden(customDocumentColumns)
    } catch {
      return {}
    }
  }, [customDocumentColumns])

  const defaultColumnOrder = useMemo(() => {
    try {
      return leadColumnDefinitions.map(col => col.id)
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    // Mark as ready once all dependencies are computed
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 50) // Small delay to ensure all computations are complete

    return () => clearTimeout(timer)
  }, [customDocumentColumns])

  return {
    isReady,
    customDocumentColumns,
    defaultVisibleColumns,
    defaultHiddenColumns,
    defaultColumnOrder
  }
}