"use client"
import * as React from "react"
import { Box, Button, IconButton, Typography } from "@mui/material"
import { Plus, X } from "@phosphor-icons/react"
import FilterCondition from "./FilterCondition"
import type { LeadsFilters } from "../types/leadFilters"

export interface FilterBuilderProps {
  filters: LeadsFilters
  onChange: (next: LeadsFilters) => void
  search?: string
}

export default function FilterBuilder({ filters, onChange, search }: FilterBuilderProps) {
  const addCondition = () => {
    const newCondition = { field: "", op: "", value: "" }
    onChange([...filters, newCondition])
  }

  const removeCondition = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index)
    onChange(newFilters)
  }

  const updateCondition = (index: number, patch: Partial<LeadsFilters[number]>) => {
    const newFilters = filters.slice()
    newFilters[index] = { ...newFilters[index], ...patch }
    onChange(newFilters)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Filter Conditions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus size={16} />}
          onClick={addCondition}
          sx={{ 
            fontFamily: 'Poppins, sans-serif',
            borderColor: '#e5e7eb',
            color: '#374151',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Add Condition
        </Button>
      </Box>

      {filters.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          color: '#6b7280', 
          fontFamily: 'Poppins, sans-serif' 
        }}>
          No conditions added. Click "Add Condition" to start filtering.
        </Box>
      ) : (
        <Box sx={{ space: 3 }}>
          {filters.map((condition, i) => {
            // Create filters excluding the current condition to avoid circular dependency
            const othersFilters = filters.filter((_, idx) => idx !== i)
            
            return (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FilterCondition
                    idx={i}
                    condition={condition}
                    onChange={(patch) => updateCondition(i, patch)}
                    activeFiltersExcludingSelf={othersFilters}
                    search={search}
                  />
                </Box>
                <IconButton
                  onClick={() => removeCondition(i)}
                  size="small"
                  sx={{ 
                    color: '#ef4444',
                    '&:hover': { 
                      backgroundColor: '#fef2f2' 
                    }
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            )
          })}
        </Box>
      )}

      {filters.length > 0 && (
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e5e7eb' }}>
          <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
            {filters.length} condition{filters.length !== 1 ? 's' : ''} active
          </Typography>
        </Box>
      )}
    </Box>
  )
}