/**
 * Enhanced Filter Modal that pre-loads facets and maintains sync with table state
 * Ensures filter dropdowns are always populated with current data
 */

import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material'
import FilterBuilder from './FilterBuilder'
import type { LeadsFilters } from '../types/leadFilters'
import { fieldKit } from '../types/leadFilters'
import { useGetLeadsFacetsQuery } from '../state/leadsApi'

interface FilterModalProps {
  open: boolean
  onClose: () => void
  filters: LeadsFilters
  onFiltersChange: (filters: LeadsFilters) => void
  search?: string
  onApply?: () => void
}

export default function FilterModal({
  open,
  onClose,
  filters,
  onFiltersChange,
  search,
  onApply
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<LeadsFilters>(filters)

  // Pre-load facets for all data-driven fields when modal opens
  // This ensures dropdowns are populated immediately
  const dataDrivenKeys = fieldKit.dataDrivenKeys
  const { data: preloadedFacets, isLoading: isPreloading } = useGetLeadsFacetsQuery(
    { 
      fields: dataDrivenKeys, 
      filters: [], // No filters for initial load to get all possible values
      search: search || '' 
    },
    { 
      skip: !open || dataDrivenKeys.length === 0,
      refetchOnMountOrArgChange: true 
    }
  )

  // Sync local filters with props when modal opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply?.()
    onClose()
  }

  const handleClear = () => {
    setLocalFilters([])
    onFiltersChange([])
  }

  const handleCancel = () => {
    setLocalFilters(filters) // Reset to original
    onClose()
  }

  const activeConditionsCount = localFilters.filter(f => f.field && f.op && f.value !== '' && f.value !== undefined).length

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: 'Poppins, sans-serif', 
        fontWeight: 600,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          Advanced Filters
          {activeConditionsCount > 0 && (
            <Chip 
              label={`${activeConditionsCount} active`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        {isPreloading && (
          <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
            Loading filter options...
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <FilterBuilder 
            filters={localFilters}
            onChange={setLocalFilters}
            search={search}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e5e7eb',
        gap: 2,
        justifyContent: 'space-between'
      }}>
        <Box>
          {preloadedFacets && (
            <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
              Filters loaded for: {Object.keys(preloadedFacets).join(', ')}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={localFilters.length === 0}
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              borderColor: '#e5e7eb',
              color: '#374151'
            }}
          >
            Clear All
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              borderColor: '#e5e7eb',
              color: '#374151'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}