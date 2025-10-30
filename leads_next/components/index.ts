/**
 * Enhanced Leads components with facets support
 * Export barrel for the new filter system
 */

export { default as FilterBuilder } from './FilterBuilder'
export { default as FilterCondition } from './FilterCondition'
export { default as FilterModal } from './FilterModal'
export { default as FilterBuilderTest } from './FilterBuilderTest'
export { default as FacetsDiagnostic } from './FacetsDiagnostic'

// Export types and utilities
export type { FieldKitField, LeadsFilters, LeadsFacetsResponse } from '../types/leadFilters'
export { fieldKit } from '../types/leadFilters'
export { useLeadsFacets } from '../hooks/useLeadsFacets'
export { useGetLeadsFacetsQuery } from '../state/leadsApi'
export { normalizeFacetsForField, getNormalizationModeForField } from '../utils/normalize'