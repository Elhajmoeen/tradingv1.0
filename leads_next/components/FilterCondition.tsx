"use client"
import * as React from "react"
import { 
  Select, 
  MenuItem, 
  FormControl, 
  TextField, 
  Box, 
  Switch, 
  FormControlLabel,
  Chip,
  CircularProgress,
  Typography
} from "@mui/material"
import { fieldKit } from "../types/leadFilters"
import type { LeadsFilters } from "../types/leadFilters"
import { useLeadsFacets } from "../hooks/useLeadsFacets"
import { normalizeFacetsForField } from "../utils/normalize"

// Finance drawer style for form inputs (matching existing ConditionRow)
const financeInputStyle = {
  fontFamily: 'Poppins, sans-serif',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f9fafb',
    borderRadius: 2,
    border: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#263238',
        borderWidth: '2px',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontFamily: 'Poppins, sans-serif',
    '&::placeholder': {
      color: '#9ca3af',
      opacity: 1,
    },
  },
}

type Props = {
  idx: number
  condition: { field?: string; op?: string; value?: any }
  onChange: (update: Partial<Props["condition"]>) => void
  activeFiltersExcludingSelf: LeadsFilters // passed down from FilterBuilder
  search?: string
}

export default function FilterCondition({ 
  idx, 
  condition, 
  onChange, 
  activeFiltersExcludingSelf, 
  search 
}: Props) {
  const selectedField = fieldKit.byKey(condition.field ?? "")
  const isSelectLike = selectedField && (selectedField.type === "select" || selectedField.type === "multiselect")
  const isDataDriven = !!(isSelectLike && selectedField?.dataDriven && !selectedField?.options?.length)

  const { facets, isLoading, error } = useLeadsFacets(
    isDataDriven && selectedField ? [selectedField.key] : [],
    activeFiltersExcludingSelf,
    search
  )

  const facetOptions = React.useMemo(() => {
    if (!selectedField) return []
    if (!isSelectLike) return []
    
    // Use static options if available (not data-driven)
    if (!isDataDriven) return selectedField?.options ?? []
    
    // Use facets from API for data-driven fields with normalization
    const rawValues = facets[selectedField.key] ?? []
    const normalizedValues = normalizeFacetsForField(selectedField.key, rawValues)
    
    // Convert to option format and dedupe defensively
    const uniq = Array.from(new Set(normalizedValues))
    return uniq.map(v => ({ value: String(v), label: String(v) }))
  }, [selectedField, isSelectLike, isDataDriven, facets])

  const getDefaultValueForOperator = (operator: string, type: string): any => {
    switch (operator) {
      case 'between':
      case 'between_dates':
        return ['', '']
      case 'in':
      case 'not_in':
        return []
      case 'is':
        return true
      default:
        return ''
    }
  }

  const handleFieldChange = (fieldKey: string) => {
    const field = fieldKit.byKey(fieldKey)
    if (!field) return

    const operators = field.operators
    const defaultOperator = operators[0]
    
    onChange({
      field: fieldKey,
      op: defaultOperator,
      value: getDefaultValueForOperator(defaultOperator, field.type)
    })
  }

  const handleOperatorChange = (operator: string) => {
    const newValue = getDefaultValueForOperator(operator, selectedField?.type || 'text')
    onChange({ op: operator, value: newValue })
  }

  const renderValueEditor = () => {
    if (!selectedField) return null

    const { type, options } = selectedField
    const { op, value } = condition

    // Boolean type with switch
    if (type === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(e) => onChange({ value: e.target.checked })}
              size="small"
            />
          }
          label={value ? 'True' : 'False'}
          sx={{ margin: 0, minWidth: '100px' }}
        />
      )
    }

    // Date types
    if (type === 'date') {
      if (op === 'between_dates') {
        const dateRange = Array.isArray(value) ? value : ['', '']
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '280px' }}>
            <TextField
              type="date"
              value={dateRange[0] || ''}
              onChange={(e) => onChange({ value: [e.target.value, dateRange[1]] })}
              size="small"
              sx={{ width: '130px', ...financeInputStyle }}
            />
            <Box sx={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif' }}>to</Box>
            <TextField
              type="date"
              value={dateRange[1] || ''}
              onChange={(e) => onChange({ value: [dateRange[0], e.target.value] })}
              size="small"
              sx={{ width: '130px', ...financeInputStyle }}
            />
          </Box>
        )
      } else {
        return (
          <TextField
            type="date"
            value={value || ''}
            onChange={(e) => onChange({ value: e.target.value })}
            size="small"
            sx={{ width: '160px', ...financeInputStyle }}
          />
        )
      }
    }

    // Number types
    if (type === 'number') {
      if (op === 'between') {
        const numberRange = Array.isArray(value) ? value : ['', '']
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
            <TextField
              type="number"
              placeholder="Min"
              value={numberRange[0] || ''}
              onChange={(e) => onChange({ value: [Number(e.target.value) || '', numberRange[1]] })}
              size="small"
              sx={{ width: '80px', ...financeInputStyle }}
            />
            <Box sx={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif' }}>to</Box>
            <TextField
              type="number"
              placeholder="Max"
              value={numberRange[1] || ''}
              onChange={(e) => onChange({ value: [numberRange[0], Number(e.target.value) || ''] })}
              size="small"
              sx={{ width: '80px', ...financeInputStyle }}
            />
          </Box>
        )
      } else {
        return (
          <TextField
            type="number"
            placeholder="Enter number"
            value={value || ''}
            onChange={(e) => onChange({ value: Number(e.target.value) || '' })}
            size="small"
            sx={{ width: '130px', ...financeInputStyle }}
          />
        )
      }
    }

    // Select type with single selection
    if (type === 'select' && !['in', 'not_in'].includes(op || '')) {
      return (
        <FormControl size="small" sx={{ minWidth: '200px', ...financeInputStyle }}>
          <Select
            value={value || ''}
            onChange={(e) => onChange({ value: e.target.value })}
            displayEmpty
            disabled={isLoading}
            sx={{
              '& .MuiSelect-select': {
                fontFamily: 'Poppins, sans-serif',
              }
            }}
          >
            <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              <em style={{ color: '#9ca3af' }}>
                {isLoading ? 'Loading...' : 'Select value...'}
              </em>
            </MenuItem>
            {facetOptions.map(option => (
              <MenuItem key={option.value} value={String(option.value)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {isLoading && (
            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
              <CircularProgress size={16} />
            </Box>
          )}
        </FormControl>
      )
    }

    // Multiselect or select with in/not_in operators
    if (type === 'multiselect' || ['in', 'not_in'].includes(op || '')) {
      const selectedValues = Array.isArray(value) ? value : []
      
      return (
        <Box sx={{ minWidth: '240px' }}>
          <FormControl size="small" fullWidth sx={{ ...financeInputStyle }}>
            <Select 
              value=""
              onChange={(e) => {
                const newValue = e.target.value
                const currentValues = Array.isArray(value) ? [...value] : []
                if (!currentValues.includes(newValue)) {
                  onChange({ value: [...currentValues, newValue] })
                }
              }}
              displayEmpty
              disabled={isLoading}
              sx={{
                '& .MuiSelect-select': {
                  fontFamily: 'Poppins, sans-serif',
                }
              }}
            >
              <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                <em style={{ color: '#9ca3af' }}>
                  {isLoading ? 'Loading...' : 
                   selectedValues.length > 0 
                    ? `${selectedValues.length} selected` 
                    : "Select values..."
                  }
                </em>
              </MenuItem>
              {facetOptions.map(option => (
                <MenuItem key={option.value} value={String(option.value)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {isLoading && (
              <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                <CircularProgress size={16} />
              </Box>
            )}
          </FormControl>
          
          {/* Selected values as chips */}
          {selectedValues.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {selectedValues.map((val, idx) => {
                const option = facetOptions.find(opt => String(opt.value) === String(val))
                return (
                  <Chip
                    key={idx}
                    label={option?.label || val}
                    onDelete={() => {
                      const newValues = selectedValues.filter((_, i) => i !== idx)
                      onChange({ value: newValues })
                    }}
                    size="small"
                    variant="outlined"
                  />
                )
              })}
            </Box>
          )}
        </Box>
      )
    }

    // Default text input
    return (
      <TextField
        type="text"
        placeholder="Enter value"
        value={value || ''}
        onChange={(e) => onChange({ value: e.target.value })}
        size="small"
        sx={{ width: '200px', ...financeInputStyle }}
      />
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 2, alignItems: 'center', mb: 2 }}>
      {/* Column */}
      <FormControl size="small" sx={{ ...financeInputStyle }}>
        <Select
          value={condition.field || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              fontFamily: 'Poppins, sans-serif',
            }
          }}
        >
          <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            <em style={{ color: '#9ca3af' }}>Select column...</em>
          </MenuItem>
          {fieldKit.filterable.map(f => (
            <MenuItem key={f.key} value={f.key} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Operator */}
      <FormControl size="small" sx={{ ...financeInputStyle }}>
        <Select
          value={condition.op || ''}
          onChange={(e) => handleOperatorChange(e.target.value)}
          disabled={!selectedField}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              fontFamily: 'Poppins, sans-serif',
            }
          }}
        >
          <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            <em style={{ color: '#9ca3af' }}>Operator</em>
          </MenuItem>
          {(selectedField?.operators ?? []).map(op => (
            <MenuItem key={op} value={op} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {op}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Value */}
      <Box>
        {error ? (
          <Box sx={{ color: 'error.main', fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif' }}>
            Error loading options: {error}
          </Box>
        ) : (
          renderValueEditor()
        )}
      </Box>
    </Box>
  )
}