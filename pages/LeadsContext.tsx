import React, { createContext, useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectGlobalCustomDocuments } from '@/state/entitiesSlice'
import { getFilteredLeadColumnDefinitions } from '@/config/columns'

interface LeadsContextType {
  customDocumentColumns: ReturnType<typeof getFilteredLeadColumnDefinitions>
  isInitialized: boolean
}

const LeadsContext = createContext<LeadsContextType | null>(null)

export function LeadsContextProvider({ children }: { children: React.ReactNode }) {
  const customDocuments = useSelector(selectGlobalCustomDocuments)
  
  const customDocumentColumns = useMemo(() => {
    try {
      return getFilteredLeadColumnDefinitions(customDocuments)
    } catch (error) {
      console.warn('Failed to initialize custom document columns, using empty array:', error)
      return []
    }
  }, [customDocuments])

  const value = useMemo(() => ({
    customDocumentColumns,
    isInitialized: true
  }), [customDocumentColumns])

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeadsContext() {
  const context = useContext(LeadsContext)
  if (!context) {
    throw new Error('useLeadsContext must be used within LeadsContextProvider')
  }
  return context
}

// Safe getter for when context is not available
export function getSafeCustomDocumentColumns() {
  try {
    return getFilteredLeadColumnDefinitions([])
  } catch {
    return []
  }
}