/**
 * Test component for the new Leads Filter Builder with 100% data sync
 * This component demonstrates the enhanced filtering system with real dataset facets
 */

import React, { useState } from 'react'
import { Box, Typography, Paper, Button, Switch, FormControlLabel } from '@mui/material'
import FilterModal from './FilterModal'
import FacetsDiagnostic from './FacetsDiagnostic'
import FieldOptionsTest from './FieldOptionsTest'
import type { LeadsFilters } from '../types/leadFilters'
import { useGetLeadsQuery } from '../state/leadsApi'

export default function FilterBuilderTest() {
  const [filters, setFilters] = useState<LeadsFilters>([])
  const [search, setSearch] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [showDiagnostic, setShowDiagnostic] = useState(true)

  // Get leads data with current filters for comparison
  const { data: leadsData, isLoading, error } = useGetLeadsQuery({
    page: 1,
    limit: 25,
    filters,
    search
  })

  const handleApplyFilters = () => {
    console.log('Applied Filters:', filters)
    console.log('Search:', search)
  }

  const handleClearFilters = () => {
    setFilters([])
    setSearch('')
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
        100% Data-Synced Leads Filter System
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
        This demonstrates the enhanced filter builder with real dataset facets. 
        All select fields (Status, Source, Language, Payment Gateway, etc.) show values from the actual dataset.
        Facets update dynamically based on current filters and search.
      </Typography>

      {/* Diagnostic Panel */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showDiagnostic}
              onChange={(e) => setShowDiagnostic(e.target.checked)}
            />
          }
          label="Show Diagnostic Panel (Dev Mode)"
          sx={{ fontFamily: 'Poppins, sans-serif' }}
        />
      </Box>

      <FacetsDiagnostic 
        filters={filters} 
        search={search} 
        visible={showDiagnostic}
      />

      {/* Field Options Test */}
      <FieldOptionsTest />

      {/* Filter Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => setFilterModalOpen(true)}
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Open Filter Builder
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            disabled={filters.length === 0}
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              borderColor: '#e5e7eb',
              color: '#374151'
            }}
          >
            Clear All Filters
          </Button>

          <Box sx={{ ml: 'auto', color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
            {filters.length} filter{filters.length !== 1 ? 's' : ''} active
          </Box>
        </Box>

        {/* Active Filters Display */}
        {filters.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              Active Filters:
            </Typography>
            {filters.map((filter, index) => (
              <Box key={index} sx={{ 
                p: 2, 
                mb: 1, 
                backgroundColor: '#f3f4f6', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  <strong>{filter.field}</strong> {filter.op} <em>{JSON.stringify(filter.value)}</em>
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Results Display */}
      <Paper elevation={1} sx={{ p: 3, backgroundColor: '#f9fafb' }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
          Current Results
        </Typography>
        
        {isLoading ? (
          <Typography>Loading leads...</Typography>
        ) : error ? (
          <Typography color="error">Error loading leads: {String(error)}</Typography>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              <strong>Total:</strong> {leadsData?.total || 0} leads | 
              <strong> Page:</strong> {leadsData?.leads?.length || 0} shown
            </Typography>
            
            <Box component="pre" sx={{ 
              fontSize: '0.875rem', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              color: '#374151',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {JSON.stringify({ 
                filters, 
                search, 
                totalResults: leadsData?.total,
                sampleLeads: leadsData?.leads?.slice(0, 3) 
              }, null, 2)}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        search={search}
        onApply={handleApplyFilters}
      />
    </Box>
  )
}