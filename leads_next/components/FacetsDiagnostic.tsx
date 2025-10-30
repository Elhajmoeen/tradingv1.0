/**
 * Diagnostic component for facets debugging
 * Shows facet counts and helps identify sync issues
 * Only renders in development mode
 */

import React from 'react'
import { Box, Typography, Paper, Chip } from '@mui/material'
import { useGetLeadsFacetsQuery, useGetLeadsQuery } from '../state/leadsApi'
import type { LeadsFilters } from '../types/leadFilters'
import { fieldKit } from '../types/leadFilters'

interface FacetsDiagnosticProps {
  filters: LeadsFilters
  search?: string
  visible?: boolean
}

export default function FacetsDiagnostic({ filters, search, visible = false }: FacetsDiagnosticProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !visible) {
    return null
  }

  const { data: facetsData, isLoading: facetsLoading } = useGetLeadsFacetsQuery({
    fields: ['language', 'paymentGateway', 'accountType', 'status', 'source', 'country'],
    filters,
    search: search || ''
  })

  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
    page: 1,
    limit: 1000, // Get all for comparison
    filters,
    search
  })

  if (facetsLoading || leadsLoading) {
    return (
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fef3c7' }}>
        <Typography variant="caption">Loading diagnostic data...</Typography>
      </Paper>
    )
  }

  // Calculate distincts from current page data for comparison
  const pageDistincts = leadsData?.leads ? calculatePageDistincts(leadsData.leads) : {}

  return (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#92400e', fontWeight: 600 }}>
        🔍 Facets Diagnostic (Dev Only)
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            API Facets
          </Typography>
          {facetsData ? (
            Object.entries(facetsData).map(([field, values]) => (
              <Box key={field} sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {field}: 
                </Typography>
                <Chip 
                  label={`${values.length} options`} 
                  size="small" 
                  sx={{ ml: 1, fontSize: '0.75rem' }}
                />
                <Typography variant="caption" sx={{ ml: 1, color: '#6b7280' }}>
                  {values.slice(0, 3).join(', ')}{values.length > 3 ? '...' : ''}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="caption" color="error">No facets data</Typography>
          )}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Current Page Distincts
          </Typography>
          {Object.entries(pageDistincts).map(([field, values]) => (
            <Box key={field} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {field}: 
              </Typography>
              <Chip 
                label={`${values.length} distinct`} 
                size="small" 
                sx={{ ml: 1, fontSize: '0.75rem' }}
                color={facetsData?.[field]?.length === values.length ? 'success' : 'warning'}
              />
              <Typography variant="caption" sx={{ ml: 1, color: '#6b7280' }}>
                {values.slice(0, 3).join(', ')}{values.length > 3 ? '...' : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f59e0b' }}>
        <Typography variant="caption" sx={{ color: '#92400e' }}>
          <strong>Total Leads:</strong> {leadsData?.total || 0} | 
          <strong> Filters:</strong> {filters.length} | 
          <strong> Search:</strong> "{search || 'none'}"
        </Typography>
      </Box>
    </Paper>
  )
}

// Helper function to calculate distinct values from current page data
function calculatePageDistincts(leads: any[]): Record<string, string[]> {
  const distincts: Record<string, Set<string>> = {}
  
  const fieldsToCheck = ['language', 'paymentGateway', 'accountType', 'status', 'source', 'country']
  
  fieldsToCheck.forEach(field => {
    distincts[field] = new Set()
  })

  leads.forEach(lead => {
    fieldsToCheck.forEach(field => {
      const value = (lead as any)[field]
      if (value !== null && value !== undefined && value !== '') {
        distincts[field].add(String(value))
      }
    })
  })

  // Convert sets to sorted arrays
  const result: Record<string, string[]> = {}
  Object.entries(distincts).forEach(([field, valueSet]) => {
    result[field] = Array.from(valueSet).sort()
  })

  return result
}