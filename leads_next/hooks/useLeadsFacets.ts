import * as React from "react"
import { useGetLeadsFacetsQuery } from "../state/leadsApi"
import type { LeadsFilters } from "../types/leadFilters"

const serialize = (x: unknown) => JSON.stringify(x ?? [])

/**
 * Hook to fetch facets for specific fields with current filters
 * Automatically serializes parameters to ensure stable memoization
 * 
 * @param fieldKeys - Array of field keys to fetch facets for
 * @param filters - Current active filters (excluding the condition being edited)
 * @param search - Current search term
 * @returns Object with facets data and loading state
 */
export function useLeadsFacets(fieldKeys: string[], filters: LeadsFilters, search?: string) {
  const arg = React.useMemo(
    () => ({ fields: fieldKeys, filters, search }),
    // Stringify to keep stable memo - prevents unnecessary re-fetches
    [serialize(fieldKeys), serialize(filters), search]
  )

  const { data, isLoading, error } = useGetLeadsFacetsQuery(arg, {
    skip: fieldKeys.length === 0,
    // Cache for 5 minutes since facets don't change frequently
    pollingInterval: 0,
    refetchOnMountOrArgChange: 30,
  })

  return { 
    facets: data ?? {}, 
    isLoading,
    error: error ? String(error) : undefined
  }
}