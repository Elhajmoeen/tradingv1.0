"use client"

import { CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Cell,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Header,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon, ChevronLeftIcon, ChevronRightIcon, Filter } from "lucide-react"
import { PersonAdd, Edit, Close } from '@mui/icons-material'
import { Popover, IconButton, Box, Stack, Typography, Divider, Button as MUIButton, TextField, MenuItem, Select as MUISelect, FormControl, InputLabel, Checkbox as MUICheckbox, FormGroup, FormControlLabel, RadioGroup, Radio, Autocomplete, Paper, Chip, Slide, Dialog, Menu } from '@mui/material'

import { Button } from "@/components/ui/button"
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import { Checkbox, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput, Select as FlowbiteSelect } from "flowbite-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { flattenRegistry, getFieldConfigByKey, get, type FieldType } from "@/config/fields"
import { leadColumnDefinitions, getFilteredLeadColumnDefinitions } from "@/config/columns"
import { getCountryDisplayName, COUNTRIES } from "@/config/countries"
import { LEAD_STATUS } from "@/config/leadStatus"
import { KYC_STATUS } from "@/config/kycStatus"
import { PAYMENT_GATEWAY_OPTIONS } from "@/config/paymentGateway"
import { Entity } from "@/state/entitiesSlice"
import { coerceBoolean } from "@/lib/utils"
import StarRating from "@/components/inputs/StarRating"
import ConversationOwnerDrawer, { type Agent } from "./conversations/ConversationOwnerDrawer"
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { updateEntityField } from '@/state/entitiesSlice'
import { FieldRenderer, optionsByKey } from '@/fieldkit'

interface LeadsTableProps {
  rows: Entity[]
  onRowClick?: (row: Entity) => void
  visibleColumns?: Record<string, boolean>
  columnOrder?: string[]
  customDocuments?: Array<{id: string, label: string}>
}

// Create dynamic columns based on column definitions
const createColumns = (onRowClick?: (row: Entity) => void, customDocuments?: Array<{id: string, label: string}>): ColumnDef<Entity>[] => {
  // Get all field keys from filtered leadColumnDefinitions with custom documents
  const filteredLeadColumnDefinitions = getFilteredLeadColumnDefinitions(customDocuments)
  const leadColumnKeys = filteredLeadColumnDefinitions.map(col => col.id)
  // Create the select column first
  const selectColumn: ColumnDef<Entity> = {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  }

  const dataColumns = filteredLeadColumnDefinitions.map((colDef) => {
    const key = colDef.id
    const header = colDef.header
    const type = colDef.type
    
    return {
      id: key,
      header,
      accessorFn: (row) => {
        if (type === 'calculated') {
          // For calculated fields, try to find the compute function from registry
          const cfg = getFieldConfigByKey(key)
          if (cfg && typeof cfg.compute === 'function') {
            return cfg.compute(row)
          }
        }
        return get(row, colDef.path)
      },
      cell: (info) => {
        const v = info.getValue()
        let formattedValue: string
        
        switch (type) {
          case 'boolean':
            const boolVal = coerceBoolean(v)
            return (
              <span style={{ 
                color: boolVal === true ? '#22c55e' : boolVal === false ? '#ef4444' : '#6b7280',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {boolVal === true ? '✓' : boolVal === false ? '✗' : ''}
              </span>
            )
          case 'date':
            formattedValue = v ? new Date(String(v)).toLocaleDateString() : ''
            break
          case 'datetime':
            formattedValue = v ? new Date(String(v)).toLocaleString() : ''
            break
          case 'number':
            formattedValue = (typeof v === 'number' || typeof v === 'string') ? String(v) : ''
            break
          case 'rating':
            // Special handling for rating type - render stars
            return (
              <div 
                className={`flex items-center ${
                  onRowClick ? 'cursor-pointer hover:opacity-80' : ''
                }`}
                onClick={() => onRowClick?.(info.row.original)}
                title={v ? `${v} of 5 stars` : 'No rating'}
              >
                <StarRating 
                  value={typeof v === 'number' ? v : undefined} 
                  readOnly 
                  size={16}
                />
              </div>
            )
          case 'file':
            formattedValue = v ? 'Uploaded' : ''
            break
          case 'verification-checkbox':
            formattedValue = v ? '✔' : '✖'
            break
          case 'select':
            formattedValue = v !== null && v !== undefined ? String(v) : ''
            break
          case 'status':
            // Special rendering for status with badge-like styling
            return (
              <div 
                className={`inline-flex items-center px-2 py-0 text-xs font-medium rounded-full ${
                  v === 'online' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                } ${onRowClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => onRowClick?.(info.row.original)}
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  v === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                {v === 'online' ? 'Online' : 'Offline'}
              </div>
            )
          default:
            formattedValue = v !== null && v !== undefined ? String(v) : ''
        }
        
        return (
          <div 
            className={`truncate ${type === 'number' ? 'text-right' : 'text-left'} ${
              onRowClick ? 'cursor-pointer hover:text-primary' : ''
            }`}
            onClick={() => onRowClick?.(info.row.original)}
            title={formattedValue}
          >
            {formattedValue}
          </div>
        )
      },
      enableSorting: true,
      minSize: key.includes('email') || key.includes('utm') || key.includes('Landing') ? 200 : 140,
      size: key.includes('email') || key.includes('utm') || key.includes('Landing') ? 200 : 140,
      filterFn: (() => {
        const fieldConfig = getFieldConfigByKey(key)
        const fieldType = fieldConfig?.type || 'text'
        switch (fieldType) {
          case 'select':
            // For now, assume Desk and similar fields might be multi-select
            return key.toLowerCase().includes('desk') ? 'includesAny' : 'enhanced' as any
          case 'number':
          case 'rating':
            return 'betweenNumber'
          case 'date':
          case 'datetime':
            return 'date'
          case 'boolean':
            return 'equalsBoolean'
          case 'verification-checkbox':
          case 'file':
            return 'enhanced' as any
          default:
            return 'enhanced' as any  // Use enhanced filter for text fields to support op-based filtering
        }
      })(),
    } as ColumnDef<Entity>
  })

  return [selectColumn, ...dataColumns]
}

// Enhanced CRM-style filter menu with popover and custom filter panel
interface ColumnFilterMenuProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  column: any // TanStack table column
  table: any // TanStack table instance
  rows: Entity[] // For getting unique values
}

function ColumnFilterMenu({ open, anchorEl, onClose, column, table, rows }: ColumnFilterMenuProps) {
  const [showCustomFilter, setShowCustomFilter] = useState(false)
  const [customFilterValue, setCustomFilterValue] = useState<any>(null)
  
  const hasActiveFilter = column?.getFilterValue() !== undefined
  const currentSort = column?.getIsSorted()
  const fieldConfig = getFieldConfigByKey(column?.id)
  let fieldType = fieldConfig?.type || 'text'
  
  // Apply same selectFields logic as in getEditableFields
  const selectFields = [
    'leadStatus', 'country', 'accountType', 'gender', 'language', 
    'kycStatus', 'paymentGateway', 'citizen', 'ftd', 'ftdSelf', 'desk',
    'idPassportStatus', 'proofOfAddressStatus', 'creditCardFrontStatus', 'creditCardBackStatus'
  ]
  
  if (selectFields.includes(column?.id)) {
    fieldType = 'select'
  }
  
  // Apply date field detection
  const dateFields = ['dateOfBirth', 'ftdDate']
  const datetimeFields = ['createdAt', 'lastContactAt', 'firstLoginAt', 'lastLoginAt', 'lastActivityAt']
  
  if (dateFields.includes(column?.id)) {
    fieldType = 'date'
  } else if (datetimeFields.includes(column?.id)) {
    fieldType = 'datetime'
  }
  
  // Initialize custom filter value
  useEffect(() => {
    if (showCustomFilter && !customFilterValue) {
      const currentFilter = column?.getFilterValue()
      if (currentFilter && typeof currentFilter === 'object' && currentFilter.op) {
        // Convert ISO dates back to HTML5 input format for editing
        if (currentFilter.op === 'date') {
          const convertedFilter = { ...currentFilter }
          if (currentFilter.kind === 'single' && currentFilter.value) {
            const date = new Date(currentFilter.value)
            convertedFilter.value = fieldType === 'datetime' 
              ? date.toISOString().slice(0, 16)  // YYYY-MM-DDTHH:mm
              : date.toISOString().slice(0, 10)  // YYYY-MM-DD
          } else if (currentFilter.kind === 'range') {
            if (currentFilter.from) {
              const fromDate = new Date(currentFilter.from)
              convertedFilter.from = fieldType === 'datetime' 
                ? fromDate.toISOString().slice(0, 16)
                : fromDate.toISOString().slice(0, 10)
            }
            if (currentFilter.to) {
              const toDate = new Date(currentFilter.to)
              convertedFilter.to = fieldType === 'datetime' 
                ? toDate.toISOString().slice(0, 16)
                : toDate.toISOString().slice(0, 10)
            }
          }
          setCustomFilterValue(convertedFilter)
        } else {
          setCustomFilterValue(currentFilter)
        }
      } else {
        // Initialize based on field type
        switch (fieldType) {
          case 'text':
          case 'email':
          case 'phone':
          case 'textarea':
            setCustomFilterValue({ op: 'text', mode: 'contains', val: '' })
            break
          case 'number':
          case 'rating':
            setCustomFilterValue({ op: 'cmp', rel: 'eq', val: '', type: 'number' })
            break
          case 'date':
          case 'datetime':
            setCustomFilterValue({ op: 'date', kind: 'single', rel: 'eq', value: '', from: '', to: '' })
            break
          case 'boolean':
            setCustomFilterValue({ op: 'bool', val: true })
            break
          case 'select':
            setCustomFilterValue({ op: 'in', vals: [] })
            break
          default:
            setCustomFilterValue({ op: 'text', mode: 'contains', val: '' })
        }
      }
    }
  }, [showCustomFilter, column, fieldType, customFilterValue])
  
  const handleResetFilter = () => {
    column?.setFilterValue(undefined)
    onClose()
  }
  
  const handleSortAZ = (e: React.MouseEvent) => {
    const isShiftClick = e.shiftKey
    if (isShiftClick) {
      // Multi-sort: append/modify existing sorts
      const currentSorting = table.getState().sorting || []
      const existingIndex = currentSorting.findIndex((sort: any) => sort.id === column.id)
      let newSorting
      
      if (existingIndex >= 0) {
        // Update existing sort
        newSorting = [...currentSorting]
        newSorting[existingIndex] = { id: column.id, desc: false }
      } else {
        // Add new sort
        newSorting = [...currentSorting, { id: column.id, desc: false }]
      }
      table.setSorting(newSorting)
    } else {
      // Single sort: replace all
      table.setSorting([{ id: column.id, desc: false }])
    }
    onClose()
  }
  
  const handleSortZA = (e: React.MouseEvent) => {
    const isShiftClick = e.shiftKey
    if (isShiftClick) {
      // Multi-sort: append/modify existing sorts
      const currentSorting = table.getState().sorting || []
      const existingIndex = currentSorting.findIndex((sort: any) => sort.id === column.id)
      let newSorting
      
      if (existingIndex >= 0) {
        // Update existing sort
        newSorting = [...currentSorting]
        newSorting[existingIndex] = { id: column.id, desc: true }
      } else {
        // Add new sort
        newSorting = [...currentSorting, { id: column.id, desc: true }]
      }
      table.setSorting(newSorting)
    } else {
      // Single sort: replace all
      table.setSorting([{ id: column.id, desc: true }])
    }
    onClose()
  }
  
  const handleContainsData = () => {
    column?.setFilterValue({ op: 'notEmpty' })
    onClose()
  }
  
  const handleContainsNoData = () => {
    column?.setFilterValue({ op: 'isEmpty' })
    onClose()
  }
  
  const handleCustomFilter = () => {
    setShowCustomFilter(true)
  }
  
  const handleBackToMain = () => {
    setShowCustomFilter(false)
    setCustomFilterValue(null)
  }
  
  const handleApplyCustomFilter = () => {
    if (customFilterValue) {
      let filterToApply = customFilterValue
      
      // Convert date values to ISO strings
      if (customFilterValue.op === 'date') {
        if (customFilterValue.kind === 'single' && customFilterValue.value) {
          filterToApply = {
            ...customFilterValue,
            value: new Date(customFilterValue.value).toISOString()
          }
        } else if (customFilterValue.kind === 'range') {
          filterToApply = {
            ...customFilterValue,
            from: customFilterValue.from ? new Date(customFilterValue.from).toISOString() : null,
            to: customFilterValue.to ? new Date(customFilterValue.to).toISOString() : null
          }
        }
      }
      
      column?.setFilterValue(filterToApply)
    }
    setShowCustomFilter(false)
    setCustomFilterValue(null)
    onClose()
  }
  
  const handleClearCustomFilter = () => {
    column?.setFilterValue(undefined)
    setShowCustomFilter(false)
    setCustomFilterValue(null)
    onClose()
  }
  
  // Get unique values for select fields
  const getUniqueValues = () => {
    const uniqueValues = Array.from(new Set(
      rows.map(row => {
        const value = get(row, fieldConfig?.key || column.id)
        return value !== undefined && value !== null ? String(value) : null
      }).filter(v => v !== null)
    )).sort()
    
    return uniqueValues
  }
  
  const renderCustomFilterPanel = () => {
    if (!customFilterValue) return null
    
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'textarea':
        return (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#ffffff' }}>
            {/* Operator Select */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Condition
              </Typography>
              <TextField
                fullWidth
                select
                value={customFilterValue.mode || 'contains'}
                onChange={(e) => setCustomFilterValue({...customFilterValue, mode: e.target.value})}
                sx={{
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
                    fontSize: '0.875rem',
                  },
                }}
              >
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="eq">Equals</MenuItem>
                <MenuItem value="starts">Starts with</MenuItem>
                <MenuItem value="ends">Ends with</MenuItem>
              </TextField>
            </Box>
            
            {/* Value Input */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Value
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter value..."
                value={customFilterValue.val || ''}
                onChange={(e) => setCustomFilterValue({...customFilterValue, val: e.target.value})}
                sx={{
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
                    fontSize: '0.875rem',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )
      
      case 'number':
      case 'rating':
        return (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: '#ffffff' }}>
            {/* Operator Select */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Condition
              </Typography>
              <TextField
                fullWidth
                select
                value={customFilterValue.rel || 'eq'}
                onChange={(e) => setCustomFilterValue({...customFilterValue, rel: e.target.value})}
                sx={{
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
                    fontSize: '0.875rem',
                  },
                }}
              >
                <MenuItem value="eq">Equals (=)</MenuItem>
                <MenuItem value="ne">Not equal (≠)</MenuItem>
                <MenuItem value="gt">Greater than (&gt;)</MenuItem>
                <MenuItem value="ge">Greater or equal (≥)</MenuItem>
                <MenuItem value="lt">Less than (&lt;)</MenuItem>
                <MenuItem value="le">Less or equal (≤)</MenuItem>
              </TextField>
            </Box>
            
            {/* Number Input */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                {fieldType === 'rating' ? 'Rating Value' : 'Number'}
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder={fieldType === 'rating' ? 'Enter rating (1-5)...' : 'Enter number...'}
                value={customFilterValue.val || ''}
                onChange={(e) => setCustomFilterValue({...customFilterValue, val: e.target.value})}
                inputProps={fieldType === 'rating' ? { min: 1, max: 5, step: 1 } : { step: 0.01 }}
                sx={{
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
                    fontSize: '0.875rem',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )
      
      case 'boolean':
        return (
          <Box sx={{ p: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
              Select Value
            </Typography>
            <RadioGroup
              value={customFilterValue.val === true ? 'true' : 'false'}
              onChange={(e) => setCustomFilterValue({...customFilterValue, val: e.target.value === 'true'})}
              sx={{ gap: 1 }}
            >
              <FormControlLabel 
                value="true" 
                control={<Radio size="small" sx={{ color: '#6b7280' }} />} 
                label={
                  <Typography variant="body2" sx={{ color: '#374151', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    True
                  </Typography>
                }
                sx={{ 
                  margin: 0,
                  p: 1.5,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: '#f9fafb' },
                  ml: -1
                }}
              />
              <FormControlLabel 
                value="false" 
                control={<Radio size="small" sx={{ color: '#6b7280' }} />} 
                label={
                  <Typography variant="body2" sx={{ color: '#374151', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    False
                  </Typography>
                }
                sx={{ 
                  margin: 0,
                  p: 1.5,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: '#f9fafb' },
                  ml: -1
                }}
              />
            </RadioGroup>
          </Box>
        )
      
      case 'select':
        const uniqueValues = getUniqueValues()
        const selectedValues = customFilterValue.vals || []
        
        return (
          <Box sx={{ p: 3, maxHeight: '300px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
              Select Options ({selectedValues.length} selected)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {uniqueValues.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <MUICheckbox
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter(v => v !== option)
                        setCustomFilterValue({...customFilterValue, vals: newValues})
                      }}
                      size="small"
                      sx={{ 
                        color: '#6b7280',
                        '&.Mui-checked': { color: '#263238' }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ 
                      color: '#374151', 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: selectedValues.includes(option) ? 600 : 500,
                      fontSize: '0.875rem'
                    }}>
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    margin: 0,
                    width: '100%',
                    p: 1.5,
                    borderRadius: 2,
                    ml: -1,
                    mr: 0,
                    '&:hover': { backgroundColor: '#f9fafb' },
                    backgroundColor: selectedValues.includes(option) ? '#f0f9ff' : 'transparent',
                  }}
                />
              ))}
              {uniqueValues.length === 0 && (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem'
                }}>
                  No options available
                </Box>
              )}
            </Box>
          </Box>
        )
      
      case 'date':
      case 'datetime':
        const isDateTime = fieldType === 'datetime'
        const filterMode = customFilterValue.kind || 'single'
        
        return (
          <Box sx={{ p: 3, minWidth: 360, maxHeight: '60vh', overflowY: 'auto', backgroundColor: '#ffffff' }}>
            {/* Mode Toggle */}
            <Box className="mb-4">
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Filter Mode
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, p: 0.5, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                <MUIButton
                  onClick={() => setCustomFilterValue({...customFilterValue, kind: 'single', rel: 'eq', value: '', from: '', to: ''})}
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                    backgroundColor: filterMode === 'single' ? '#ffffff' : 'transparent',
                    color: filterMode === 'single' ? '#111827' : '#6b7280',
                    boxShadow: filterMode === 'single' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                    '&:hover': {
                      backgroundColor: filterMode === 'single' ? '#ffffff' : '#ffffff',
                    },
                  }}
                >
                  Single Date
                </MUIButton>
                <MUIButton
                  onClick={() => setCustomFilterValue({...customFilterValue, kind: 'range', from: '', to: '', rel: '', value: ''})}
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                    backgroundColor: filterMode === 'range' ? '#ffffff' : 'transparent',
                    color: filterMode === 'range' ? '#111827' : '#6b7280',
                    boxShadow: filterMode === 'range' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                    '&:hover': {
                      backgroundColor: filterMode === 'range' ? '#ffffff' : '#ffffff',
                    },
                  }}
                >
                  Date Range
                </MUIButton>
              </Box>
            </Box>

            {filterMode === 'single' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Operator Select */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Condition
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    value={customFilterValue.rel || 'eq'}
                    onChange={(e) => setCustomFilterValue({...customFilterValue, rel: e.target.value})}
                    sx={{
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
                        fontSize: '0.875rem',
                      },
                    }}
                  >
                    <MenuItem value="eq">On (=)</MenuItem>
                    <MenuItem value="lt">Before (&lt;)</MenuItem>
                    <MenuItem value="gt">After (&gt;)</MenuItem>
                    <MenuItem value="le">On or Before (≤)</MenuItem>
                    <MenuItem value="ge">On or After (≥)</MenuItem>
                  </TextField>
                </Box>
                
                {/* Date/DateTime Input */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    {isDateTime ? 'Date & Time' : 'Date'}
                  </Typography>
                  <TextField
                    fullWidth
                    type={isDateTime ? 'datetime-local' : 'date'}
                    value={customFilterValue.value || ''}
                    onChange={(e) => setCustomFilterValue({...customFilterValue, value: e.target.value})}
                    sx={{
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
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* From Date */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    From {isDateTime ? 'Date & Time' : 'Date'}
                  </Typography>
                  <TextField
                    fullWidth
                    type={isDateTime ? 'datetime-local' : 'date'}
                    value={customFilterValue.from || ''}
                    onChange={(e) => setCustomFilterValue({...customFilterValue, from: e.target.value})}
                    sx={{
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
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
                
                {/* To Date */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    To {isDateTime ? 'Date & Time' : 'Date'}
                  </Typography>
                  <TextField
                    fullWidth
                    type={isDateTime ? 'datetime-local' : 'date'}
                    value={customFilterValue.to || ''}
                    onChange={(e) => setCustomFilterValue({...customFilterValue, to: e.target.value})}
                    sx={{
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
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Quick Picks */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Quick Picks
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[
                  { label: 'Today', getValue: () => ({ 
                    kind: 'single', 
                    rel: 'eq', 
                    value: new Date().toISOString().split('T')[0] + (isDateTime ? 'T00:00' : '')
                  })},
                  { label: 'Yesterday', getValue: () => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    return { 
                      kind: 'single', 
                      rel: 'eq', 
                      value: yesterday.toISOString().split('T')[0] + (isDateTime ? 'T00:00' : '')
                    }
                  }},
                  { label: 'Last 7 days', getValue: () => {
                    const now = new Date()
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return { 
                      kind: 'range', 
                      from: weekAgo.toISOString().split('T')[0] + (isDateTime ? 'T00:00' : ''),
                      to: now.toISOString().split('T')[0] + (isDateTime ? 'T23:59' : '')
                    }
                  }},
                  { label: 'This Month', getValue: () => {
                    const now = new Date()
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    return { 
                      kind: 'range', 
                      from: firstDay.toISOString().split('T')[0] + (isDateTime ? 'T00:00' : ''),
                      to: lastDay.toISOString().split('T')[0] + (isDateTime ? 'T23:59' : '')
                    }
                  }}
                ].map((quickPick) => (
                  <MUIButton
                    key={quickPick.label}
                    variant="outlined"
                    onClick={() => setCustomFilterValue({...customFilterValue, ...quickPick.getValue()})}
                    sx={{ 
                      py: 1,
                      px: 2,
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      textTransform: 'none',
                      borderRadius: 1.5,
                      backgroundColor: '#ffffff',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      '&:hover': { 
                        backgroundColor: '#f9fafb',
                        borderColor: '#9ca3af',
                      }
                    }}
                  >
                    {quickPick.label}
                  </MUIButton>
                ))}
              </Box>
            </Box>
          </Box>
        )
      
      default:
        return (
          <Box sx={{ p: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
              Filter Value
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter value..."
              value={customFilterValue.val || ''}
              onChange={(e) => setCustomFilterValue({...customFilterValue, val: e.target.value})}
              sx={{
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
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        )
    }
  }
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            minWidth: fieldType === 'date' || fieldType === 'datetime' ? 320 : 280,
            maxWidth: fieldType === 'date' || fieldType === 'datetime' ? 400 : 360,
            maxHeight: '60vh',
            overflow: 'hidden',
            zIndex: 9999,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }
        }
      }}
      disablePortal={false}
    >
      {!showCustomFilter ? (
        // Main menu
        <Box sx={{ p: 1 }}>
          {/* Reset Filter */}
          <MenuItem 
            onClick={handleResetFilter} 
            disabled={!hasActiveFilter}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: hasActiveFilter ? '#374151' : '#9ca3af',
              '&:hover': {
                backgroundColor: hasActiveFilter ? '#f9fafb' : 'transparent'
              },
              '&.Mui-disabled': {
                color: '#d1d5db'
              }
            }}
          >
            Reset Filter
          </MenuItem>
          
          <Divider sx={{ mx: 1, my: 1, borderColor: '#e5e7eb' }} />
          
          {/* Sort A to Z */}
          <MenuItem 
            onClick={handleSortAZ}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            <span>Sort A to Z</span>
            {currentSort === 'asc' && (
              <Typography sx={{ color: '#2563eb', fontWeight: 600, fontSize: '1rem' }}>✓</Typography>
            )}
          </MenuItem>
          
          {/* Sort Z to A */}
          <MenuItem 
            onClick={handleSortZA}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            <span>Sort Z to A</span>
            {currentSort === 'desc' && (
              <Typography sx={{ color: '#2563eb', fontWeight: 600, fontSize: '1rem' }}>✓</Typography>
            )}
          </MenuItem>
          
          <Divider sx={{ mx: 1, my: 1, borderColor: '#e5e7eb' }} />
          
          {/* Contains Data */}
          <MenuItem 
            onClick={handleContainsData}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            Contains Data
          </MenuItem>
          
          {/* Contains No Data */}
          <MenuItem 
            onClick={handleContainsNoData}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            Contains No Data
          </MenuItem>
          
          <Divider sx={{ mx: 1, my: 1, borderColor: '#e5e7eb' }} />
          
          {/* Custom Filter */}
          <MenuItem 
            onClick={handleCustomFilter}
            sx={{
              mx: 1,
              mb: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              color: '#374151',
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            Custom Filter…
          </MenuItem>
        </Box>
      ) : (
        // Custom filter panel
        <Box className="overflow-y-auto max-h-[50vh]">
          {/* Header */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <MUIButton
                onClick={handleBackToMain}
                sx={{ 
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  p: 0,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: '#6b7280',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb',
                  '&:hover': { 
                    backgroundColor: '#f3f4f6',
                    borderColor: '#d1d5db'
                  }
                }}
              >
                ←
              </MUIButton>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '0.9375rem'
                }}
              >
                Filter: {column?.columnDef?.header}
              </Typography>
            </Stack>
          </Box>
          
          {/* Filter Content */}
          <Box className="min-h-[120px]">
            {renderCustomFilterPanel()}
          </Box>
          
          {/* Footer Actions */}
          <Box className="border-t border-gray-200 p-3 bg-gray-50 sticky bottom-0">
            <Stack direction="row" spacing={2}>
              <MUIButton
                variant="outlined"
                size="small"
                onClick={handleClearCustomFilter}
                sx={{ flex: 1 }}
              >
                Clear
              </MUIButton>
              <MUIButton
                variant="contained"
                size="small"
                onClick={handleApplyCustomFilter}
                sx={{ flex: 1 }}
              >
                Apply
              </MUIButton>
            </Stack>
          </Box>
        </Box>
      )}
    </Popover>
  )
}

export function LeadsTable({ rows, onRowClick, visibleColumns, columnOrder: parentColumnOrder, customDocuments }: LeadsTableProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Dialog states for bulk actions
  const [massChangesDialogOpen, setMassChangesDialogOpen] = useState(false)
  const [conversationOwnerDrawerOpen, setConversationOwnerDrawerOpen] = useState(false)
  const [currentAssignmentLeadId, setCurrentAssignmentLeadId] = useState<string>('')
  
  // Scroll synchronization refs and state
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)
  const [scrollWidth, setScrollWidth] = useState(0)
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  
  // Initialize column order from leadColumnDefinitions or parent prop
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (parentColumnOrder) {
      return ['select', ...parentColumnOrder]
    }
    const dynamicColumns = getFilteredLeadColumnDefinitions(customDocuments)
    return ['select', ...dynamicColumns.map(col => col.id)]
  })

  // Update column order when parent column order changes
  useEffect(() => {
    if (parentColumnOrder) {
      setColumnOrder(['select', ...parentColumnOrder])
    }
  }, [parentColumnOrder])
  
  // Column filter editor state
  const [filterAnchor, setFilterAnchor] = useState<{ id: string; el: HTMLElement } | null>(null)
  const openColumnEditor = (id: string, el: HTMLElement) => setFilterAnchor({ id, el })
  const closeColumnEditor = () => setFilterAnchor(null)
  
  // Filter menu state
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<{ id: string; el: HTMLElement } | null>(null)
  const openFilterMenu = (id: string, el: HTMLElement) => setFilterMenuAnchor({ id, el })
  const closeFilterMenu = () => setFilterMenuAnchor(null)
  
  // Column visibility - use prop if provided, otherwise default behavior
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (visibleColumns) {
      return visibleColumns
    }
    // Reset any existing localStorage state to show all fields by default
    localStorage.removeItem('leads-columns')
    localStorage.removeItem('leads-table-state')
    
    const initial: VisibilityState = {}
    initial['select'] = true
    const dynamicColumns = getFilteredLeadColumnDefinitions(customDocuments)
    dynamicColumns.forEach((colDef, index) => {
      // Show first 20 columns by default, hide the rest initially to avoid horizontal overflow
      initial[colDef.id] = index < 20
    })
    return initial
  })

  // Update column visibility when prop changes
  useEffect(() => {
    if (visibleColumns) {
      setColumnVisibility(visibleColumns)
    }
  }, [visibleColumns])

  // Save table state to localStorage (excluding column visibility)
  useEffect(() => {
    const state = {
      columnOrder,
      sorting,
      columnFilters,
    }
    localStorage.setItem('leads-table-state', JSON.stringify(state))
  }, [columnOrder, sorting, columnFilters])

  // Load sorting from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('leads-table-state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.sorting) setSorting(state.sorting)
        if (state.columnFilters) setColumnFilters(state.columnFilters)
        if (state.columnOrder && !parentColumnOrder) setColumnOrder(state.columnOrder)
      } catch {}
    }
  }, [])

  // ResizeObserver to track table width changes
  useEffect(() => {
    const el = tableRef.current
    if (!el) return
    
    const updateScrollWidth = () => {
      setScrollWidth(el.scrollWidth)
    }
    
    const ro = new ResizeObserver(updateScrollWidth)
    ro.observe(el)
    updateScrollWidth()
    
    return () => ro.disconnect()
  }, [rows, columnVisibility])

  // Scroll synchronization handlers
  const onTableScroll = () => {
    if (bottomScrollRef.current && tableScrollRef.current) {
      bottomScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft
    }
  }

  const onBottomScroll = () => {
    if (bottomScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft
    }
  }

  // Date filter helper functions
  const parseToTimestamp = (value: any): number | null => {
    if (!value) return null
    
    // If already a number (timestamp)
    if (typeof value === 'number') return value
    
    // If it's a Date object
    if (value instanceof Date) return value.getTime()
    
    // Try parsing as ISO string or other formats
    const parsed = Date.parse(String(value))
    return isNaN(parsed) ? null : parsed
  }

  const isDateOnlyColumn = (columnId: string): boolean => {
    const fieldConfig = getFieldConfigByKey(columnId)
    return fieldConfig?.type === 'date' || 
           ['dateOfBirth', 'ftdDate'].includes(columnId)
  }

  const startOfDay = (timestamp: number): number => {
    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }

  const endOfDay = (timestamp: number): number => {
    const date = new Date(timestamp)
    date.setHours(23, 59, 59, 999)
    return date.getTime()
  }

  const sameDayOrExact = (tsA: number, tsB: number, isDateOnly: boolean): boolean => {
    if (isDateOnly) {
      // For date-only columns, compare calendar days
      const dateA = new Date(tsA)
      const dateB = new Date(tsB)
      return dateA.getFullYear() === dateB.getFullYear() &&
             dateA.getMonth() === dateB.getMonth() &&
             dateA.getDate() === dateB.getDate()
    } else {
      // For datetime columns, exact match
      return tsA === tsB
    }
  }

  const columns = createColumns(onRowClick, customDocuments)

  const table = useReactTable({
    data: rows,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      includesAny: (row, columnId, filterValue) => {
        const value = row.getValue(columnId)
        if (!Array.isArray(filterValue) || filterValue.length === 0) return true
        return filterValue.some(item => String(value).includes(String(item)))
      },
      equalsBoolean: (row, columnId, filterValue) => {
        if (filterValue === undefined || filterValue === null) return true // Show all if no filter
        const value = coerceBoolean(row.getValue(columnId))
        return value === filterValue
      },

      equals: (row, columnId, filterValue) => {
        const value = row.getValue(columnId)
        if (filterValue === undefined || filterValue === null) return true
        return String(value) === String(filterValue)
      },
      betweenNumber: (row, columnId, filterValue) => {
        const value = Number(row.getValue(columnId))
        if (isNaN(value)) return true
        const { min, max } = filterValue || {}
        if (min !== undefined && value < min) return false
        if (max !== undefined && value > max) return false
        return true
      },
      betweenDate: (row, columnId, filterValue) => {
        const value = row.getValue(columnId)
        if (!value) return true
        const date = new Date(String(value))
        if (isNaN(date.getTime())) return true
        const { from, to } = filterValue || {}
        if (from && date < new Date(from)) return false
        if (to && date > new Date(to)) return false
        return true
      },
      // Enhanced date filter function
      date: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== 'object') return true
        
        const cellValue = row.getValue(columnId)
        const timestamp = parseToTimestamp(cellValue)
        if (timestamp === null) return false

        if (filterValue.kind === 'single') {
          const targetTimestamp = Date.parse(filterValue.value)
          if (isNaN(targetTimestamp)) return false
          
          const isDateColumn = isDateOnlyColumn(columnId)
          
          switch (filterValue.rel) {
            case 'eq':
              return sameDayOrExact(timestamp, targetTimestamp, isDateColumn)
            case 'lt':
              return isDateColumn ? 
                timestamp < startOfDay(targetTimestamp) : 
                timestamp < targetTimestamp
            case 'gt':
              return isDateColumn ? 
                timestamp > endOfDay(targetTimestamp) : 
                timestamp > targetTimestamp
            case 'le':
              return isDateColumn ? 
                timestamp <= endOfDay(targetTimestamp) : 
                timestamp <= targetTimestamp
            case 'ge':
              return isDateColumn ? 
                timestamp >= startOfDay(targetTimestamp) : 
                timestamp >= targetTimestamp
            default:
              return false
          }
        } else if (filterValue.kind === 'range') {
          const fromTimestamp = filterValue.from ? Date.parse(filterValue.from) : null
          const toTimestamp = filterValue.to ? Date.parse(filterValue.to) : null
          
          const isDateColumn = isDateOnlyColumn(columnId)
          
          let isAfterFrom = true
          let isBeforeTo = true
          
          if (fromTimestamp !== null && !isNaN(fromTimestamp)) {
            isAfterFrom = isDateColumn ? 
              timestamp >= startOfDay(fromTimestamp) : 
              timestamp >= fromTimestamp
          }
          
          if (toTimestamp !== null && !isNaN(toTimestamp)) {
            isBeforeTo = isDateColumn ? 
              timestamp <= endOfDay(toTimestamp) : 
              timestamp <= toTimestamp
          }
          
          return isAfterFrom && isBeforeTo
        }
        
        return true
      },
      // Enhanced filter functions
      enhanced: (row, columnId, filterValue) => {
        const value = row.getValue(columnId)
        
        // Handle special operations
        if (filterValue && typeof filterValue === 'object' && filterValue.op) {
          switch (filterValue.op) {
            case 'notEmpty':
              return value !== undefined && value !== null && String(value).trim() !== ''
            case 'isEmpty':
              return value === undefined || value === null || String(value).trim() === ''
            default:
              return true
          }
        }
        
        // Fall back to default string filtering for regular values
        if (filterValue === undefined || filterValue === null || filterValue === '') return true
        const stringValue = String(value).toLowerCase()
        const filterString = String(filterValue).toLowerCase()
        return stringValue.includes(filterString)
      },
      notEmpty: (row, columnId) => {
        const value = row.getValue(columnId)
        return value !== undefined && value !== null && String(value).trim() !== ''
      },
      isEmpty: (row, columnId) => {
        const value = row.getValue(columnId)
        return value === undefined || value === null || String(value).trim() === ''
      },
      text: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== 'object' || filterValue.op !== 'text') return true
        const value = String(row.getValue(columnId) || '').toLowerCase()
        const searchVal = String(filterValue.val || '').toLowerCase()
        
        switch (filterValue.mode) {
          case 'contains':
            return value.includes(searchVal)
          case 'eq':
            return value === searchVal
          case 'starts':
            return value.startsWith(searchVal)
          case 'ends':
            return value.endsWith(searchVal)
          default:
            return true
        }
      },
      cmp: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== 'object' || filterValue.op !== 'cmp') return true
        const cellValue = row.getValue(columnId)
        const filterVal = filterValue.val
        
        // Handle both numbers and dates
        let cellNum, filterNum
        if (filterValue.type === 'date') {
          cellNum = cellValue ? new Date(String(cellValue)).getTime() : null
          filterNum = filterVal ? new Date(String(filterVal)).getTime() : null
        } else {
          cellNum = cellValue ? Number(cellValue) : null
          filterNum = filterVal ? Number(filterVal) : null
        }
        
        if (cellNum === null || filterNum === null || isNaN(cellNum) || isNaN(filterNum)) return true
        
        switch (filterValue.rel) {
          case 'eq': return cellNum === filterNum
          case 'ne': return cellNum !== filterNum
          case 'gt': return cellNum > filterNum
          case 'ge': return cellNum >= filterNum
          case 'lt': return cellNum < filterNum
          case 'le': return cellNum <= filterNum
          default: return true
        }
      },
      bool: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== 'object' || filterValue.op !== 'bool') return true
        const value = coerceBoolean(row.getValue(columnId))
        return value === filterValue.val
      },
      in: (row, columnId, filterValue) => {
        if (!filterValue || typeof filterValue !== 'object' || filterValue.op !== 'in' || !Array.isArray(filterValue.vals)) return true
        const value = String(row.getValue(columnId) || '')
        return filterValue.vals.includes(value)
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      pagination,
      rowSelection,
    },
    onColumnOrderChange: setColumnOrder,
    enableSortingRemoval: false,
    globalFilterFn: (row, columnId, value) => {
      // Search in key fields: firstName, lastName, email, phoneNumber, accountId, country, registeredIp
      const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'accountId', 'country', 'registeredIp']
      const searchTerm = value.toLowerCase()
      
      return searchFields.some(field => {
        const fieldValue = get(row.original, field)
        if (!fieldValue) return false
        
        const stringValue = String(fieldValue).toLowerCase()
        
        // For country field, also search by display name
        if (field === 'country') {
          const displayName = getCountryDisplayName(fieldValue).toLowerCase()
          return stringValue.includes(searchTerm) || displayName.includes(searchTerm)
        }
        
        return stringValue.includes(searchTerm)
      })
    },
  })

  // Handle drag & drop column reordering
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex)
      })
    }
  }

  // Filter editor state
  const [editorFilterValue, setEditorFilterValue] = useState<any>(null);

  // Initialize editor value when popover opens
  useEffect(() => {
    if (filterAnchor?.id) {
      const column = table.getColumn(filterAnchor.id);
      setEditorFilterValue(column?.getFilterValue() || null);
    }
  }, [filterAnchor?.id, table]);

  const renderColumnFilterEditor = (columnId?: string) => {
    if (!columnId) return null;

    const column = table.getColumn(columnId);
    const fieldConfig = getFieldConfigByKey(columnId);
    const fieldType = fieldConfig?.type || 'text';
    
    // Initialize filter value when popover opens
    const currentFilterValue = editorFilterValue ?? column?.getFilterValue() ?? null;

    const apply = () => {
      column?.setFilterValue(currentFilterValue);
      setEditorFilterValue(null);
      closeColumnEditor();
    };

    const clear = () => {
      column?.setFilterValue(undefined);
      setEditorFilterValue(null);
      closeColumnEditor();
    };

    const getUniqueValues = () => {
      return Array.from(new Set(rows.map(r => get(r, fieldConfig?.key || columnId))))
        .filter(v => v !== undefined && v !== null)
        .sort();
    };

    const renderEditor = () => {
      switch (fieldType) {
        case 'text':
        case 'email':
        case 'phone':
        case 'textarea':
          return (
            <TextField
              size="small"
              placeholder="Search..."
              value={currentFilterValue || ''}
              onChange={(e) => setEditorFilterValue(e.target.value)}
              fullWidth
            />
          );

        case 'select':
          // For now, use fieldConfig options - Phase A unified options integration will be improved later
          const rawOptions = fieldConfig?.options || getUniqueValues();
          const options = rawOptions.map((opt: any) => 
            typeof opt === 'object' && opt?.value !== undefined ? opt.value : opt
          );
          const isMulti = columnId.toLowerCase().includes('desk') || false;
          
          if (isMulti) {
            return (
              <Autocomplete
                multiple
                size="small"
                options={options}
                value={Array.isArray(currentFilterValue) ? currentFilterValue : []}
                onChange={(_, newValue) => setEditorFilterValue(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={fieldConfig?.label || columnId}
                    placeholder="Select options..."
                  />
                )}
                fullWidth
              />
            );
          } else {
            return (
              <FormControl size="small" fullWidth>
                <InputLabel>{fieldConfig?.label || columnId}</InputLabel>
                <MUISelect
                  value={currentFilterValue || ''}
                  onChange={(e) => setEditorFilterValue(e.target.value)}
                  label={fieldConfig?.label || columnId}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {options.map((option: any) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </MUISelect>
              </FormControl>
            );
          }

        case 'boolean':
          return (
            <RadioGroup
              value={currentFilterValue === undefined ? 'all' : currentFilterValue === true ? 'true' : currentFilterValue === false ? 'false' : 'all'}
              onChange={(e) => {
                const value = e.target.value;
                setEditorFilterValue(value === 'all' ? undefined : value === 'true' ? true : false);
              }}
            >
              <FormControlLabel value="all" control={<Radio />} label="All" />
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          );

        case 'verification-checkbox':
        case 'file':
          return (
            <RadioGroup
              value={currentFilterValue === undefined ? 'all' : currentFilterValue.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setEditorFilterValue(value === 'all' ? undefined : value === 'true');
              }}
            >
              <FormControlLabel value="all" control={<Radio />} label="All" />
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          );

        case 'rating':
          return (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Filter by rating
              </Typography>
              <Box>
                <Typography variant="body2" gutterBottom>
                  At least (minimum stars):
                </Typography>
                <StarRating
                  value={currentFilterValue?.min || undefined}
                  onChange={(rating) => setEditorFilterValue({
                    ...currentFilterValue, 
                    min: rating,
                    max: currentFilterValue?.max
                  })}
                  allowClear
                  size={20}
                />
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  At most (maximum stars):
                </Typography>
                <StarRating
                  value={currentFilterValue?.max || undefined}
                  onChange={(rating) => setEditorFilterValue({
                    ...currentFilterValue,
                    min: currentFilterValue?.min,
                    max: rating
                  })}
                  allowClear
                  size={20}
                />
              </Box>
            </Stack>
          );

        case 'number':
          return (
            <Stack spacing={1}>
              <TextField
                type="number"
                size="small"
                placeholder="Min"
                value={currentFilterValue?.min || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, min: e.target.value ? Number(e.target.value) : undefined})}
                fullWidth
              />
              <TextField
                type="number"
                size="small"
                placeholder="Max"
                value={currentFilterValue?.max || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, max: e.target.value ? Number(e.target.value) : undefined})}
                fullWidth
              />
            </Stack>
          );

        case 'date':
          return (
            <Stack spacing={1}>
              <TextField
                type="date"
                size="small"
                label="From"
                value={currentFilterValue?.from || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, from: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="date"
                size="small"
                label="To"
                value={currentFilterValue?.to || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, to: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          );

        case 'datetime':
          return (
            <Stack spacing={1}>
              <TextField
                type="datetime-local"
                size="small"
                label="From"
                value={currentFilterValue?.from || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, from: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="datetime-local"
                size="small"
                label="To"
                value={currentFilterValue?.to || ''}
                onChange={(e) => setEditorFilterValue({...currentFilterValue, to: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          );

        default:
          return (
            <TextField
              size="small"
              placeholder="Search..."
              value={currentFilterValue || ''}
              onChange={(e) => setEditorFilterValue(e.target.value)}
              fullWidth
            />
          );
      }
    };

    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Filter {fieldConfig?.label || columnId}
        </Typography>
        
        <Box mb={1.5}>
          {renderEditor()}
        </Box>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <MUIButton variant="outlined" size="small" onClick={clear}>
            Clear
          </MUIButton>
          <MUIButton variant="contained" size="small" onClick={apply}>
            Apply
          </MUIButton>
        </Stack>
      </Box>
    );
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Get selected rows information
  const selectedRowCount = Object.keys(rowSelection).length
  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)

  // Clear row selection
  const clearSelection = () => {
    setRowSelection({})
  }

  // Handle assign action
  const handleAssign = () => {
    if (selectedRowCount > 0) {
      // Use the first selected lead as the context for the drawer
      const firstSelectedLeadId = selectedRows[0]?.id || selectedRows[0]?.accountId || ''
      setCurrentAssignmentLeadId(firstSelectedLeadId)
      setConversationOwnerDrawerOpen(true)
    }
  }

  // Handle mass changes action
  const handleMassChanges = () => {
    setMassChangesDialogOpen(true)
  }

  // Handle conversation owner assignment
  const handleConversationOwnerAssigned = (owner: { id: string; name: string } | null) => {
    // Apply assignment to all selected leads
    selectedRows.forEach(lead => {
      dispatch(updateEntityField({
        id: lead.id,
        key: 'conversationOwner',
        value: owner?.name || null // Store agent name
      }))
      dispatch(updateEntityField({
        id: lead.id,
        key: 'conversationOwnerId', 
        value: owner?.id || null // Store agent ID
      }))
    })
    
    if (owner) {
      toast.success(`Assigned ${selectedRowCount} lead${selectedRowCount === 1 ? '' : 's'} to ${owner.name}`)
    } else {
      toast.success(`Removed conversation owner from ${selectedRowCount} lead${selectedRowCount === 1 ? '' : 's'}`)
    }
    
    setConversationOwnerDrawerOpen(false)
    clearSelection()
  }

  // Handle mass changes save
  const handleMassChangesSave = async (patch: Record<string, any>, clear: string[]) => {
    try {
      // Apply changes to all selected leads
      const leadIds = selectedRows.map(lead => lead.id)
      
      for (const leadId of leadIds) {
        // Apply patch fields
        for (const [field, value] of Object.entries(patch)) {
          dispatch(updateEntityField({
            id: leadId,
            key: field as keyof Entity,
            value: value
          }))
        }
        
        // Apply clear fields
        for (const field of clear) {
          dispatch(updateEntityField({
            id: leadId,
            key: field as keyof Entity,
            value: null
          }))
        }
      }
      
      const totalChanges = Object.keys(patch).length + clear.length
      toast.success(
        `Applied ${totalChanges} change${totalChanges === 1 ? '' : 's'} to ${selectedRows.length} lead${selectedRows.length === 1 ? '' : 's'}`
      )
      
      setMassChangesDialogOpen(false)
      clearSelection()
    } catch (error) {
      console.error('Mass changes error:', error)
      toast.error('Failed to apply changes')
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Bulk Actions Bar - appears when rows are selected */}
      <Slide direction="down" in={selectedRowCount > 0} mountOnEnter unmountOnExit>
        <Paper 
          elevation={3}
          className="mx-4 mb-4 rounded-xl border border-gray-200"
          sx={{
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0'
          }}
        >
          <Box className="flex items-center justify-between p-4">
            <Box className="flex items-center gap-3">
              <Chip
                label={`${selectedRowCount} lead${selectedRowCount === 1 ? '' : 's'} selected`}
                color="primary"
                size="small"
                sx={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              <Typography variant="body2" className="text-gray-600">
                Choose an action to apply to the selected leads
              </Typography>
            </Box>
            
            <Box className="flex items-center gap-2">
              <MUIButton
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleAssign}
                size="small"
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': {
                    backgroundColor: '#059669'
                  },
                  textTransform: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 500
                }}
              >
                Assign
              </MUIButton>
              
              <MUIButton
                variant="contained"
                startIcon={<Edit />}
                onClick={handleMassChanges}
                size="small"
                sx={{
                  backgroundColor: '#f59e0b',
                  '&:hover': {
                    backgroundColor: '#d97706'
                  },
                  textTransform: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 500
                }}
              >
                Mass Changes
              </MUIButton>

              <IconButton
                onClick={clearSelection}
                size="small"
                sx={{
                  backgroundColor: '#f1f5f9',
                  '&:hover': {
                    backgroundColor: '#e2e8f0'
                  },
                  marginLeft: 1
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Table Container - takes remaining space, hide native horizontal scroll */}
      <div 
        ref={tableScrollRef}
        onScroll={onTableScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden w-full min-h-0"
      >
        <DndContext
          id={useId()}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div ref={tableRef} className="flowbite-table-wrapper positions-table">
            <Table hoverable>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} onOpenColumnEditor={openColumnEditor} onOpenFilterMenu={openFilterMenu} />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHead>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="bg-white border-b-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <SortableContext
                          key={cell.id}
                          items={columnOrder}
                          strategy={horizontalListSortingStrategy}
                        >
                          <DragAlongCell key={cell.id} cell={cell} />
                        </SortableContext>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="bg-white border-b-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800" style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No leads found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DndContext>
      </div>
      
      {/* External horizontal scrollbar above pagination */}
      <div
        ref={bottomScrollRef}
        onScroll={onBottomScroll}
        className="mt-2 h-4 w-full overflow-x-auto overflow-y-hidden"
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>
      
      {/* Pagination Bar - fixed at bottom, full width */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-background w-full flex-shrink-0">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </p>
          <p className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} leads
          </p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Column Filter Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor?.el ?? null}
        onClose={closeColumnEditor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { elevation: 6, sx: { p: 2, minWidth: 280, maxWidth: 380 } } }}
      >
        {renderColumnFilterEditor(filterAnchor?.id)}
      </Popover>

      {/* Column Filter Menu */}
      <ColumnFilterMenu
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor?.el ?? null}
        onClose={closeFilterMenu}
        column={filterMenuAnchor?.id ? table.getColumn(filterMenuAnchor.id) : null}
        table={table}
        rows={rows}
      />

      {/* Mass Changes Dialog */}
      <MassChangesDialog 
        open={massChangesDialogOpen}
        onClose={() => setMassChangesDialogOpen(false)}
        selectedRows={selectedRows}
        onSave={handleMassChangesSave}
        customDocuments={customDocuments}
      />

      {/* Conversation Owner Drawer */}
      <ConversationOwnerDrawer
        open={conversationOwnerDrawerOpen}
        onOpenChange={setConversationOwnerDrawerOpen}
        clientId={currentAssignmentLeadId}
        currentOwnerId={null}
        onAssigned={handleConversationOwnerAssigned}
      />
    </div>
  )
}

const DraggableTableHeader = ({
  header,
  onOpenColumnEditor,
  onOpenFilterMenu,
}: {
  header: Header<Entity, unknown>
  onOpenColumnEditor: (columnId: string, el: HTMLElement) => void
  onOpenFilterMenu: (columnId: string, el: HTMLElement) => void
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: header.column.id,
    disabled: header.column.id === 'select', // Disable dragging for select column
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableHeadCell
      ref={setNodeRef}
      className="bg-white hover:bg-gray-50 text-gray-600 relative border-t border-gray-100 before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-gray-100 first:before:bg-transparent"
      style={{...style, backgroundColor: '#ffffff', color: '#4b5563', borderColor: '#f3f4f6', textTransform: 'none'}}
      aria-sort={
        header.column.getIsSorted() === "asc"
          ? "ascending"
          : header.column.getIsSorted() === "desc"
            ? "descending"
            : "none"
      }
    >
      <div className="flex items-center justify-start gap-0.5">
        {header.column.id !== 'select' && (
          <Button
            size="icon"
            variant="ghost"
            className="-ml-2 size-7 shadow-none"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVerticalIcon
              className="opacity-60"
              size={16}
              aria-hidden="true"
            />
          </Button>
        )}
        {header.column.id === 'select' ? (
          <span className="flex items-center justify-center grow truncate">
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </span>
        ) : (
          <div className="flex items-center justify-between whitespace-nowrap w-full">
            <span className="truncate flex-grow">
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenFilterMenu(header.column.id, e.currentTarget);
              }}
              aria-label="Filter column"
              sx={{ 
                ml: 0.5,
                p: 0.25,
                '& svg': { 
                  width: '10px', 
                  height: '10px' 
                } 
              }}
            >
              <Filter />
            </IconButton>
          </div>
        )}
        {header.column.getCanSort() && header.column.id !== 'select' && (
          <Button
            size="icon"
            variant="ghost"
            className="group -mr-1 size-7 shadow-none"
            onClick={header.column.getToggleSortingHandler()}
            onKeyDown={(e) => {
              if (
                header.column.getCanSort() &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault()
                header.column.getToggleSortingHandler()?.(e)
              }
            }}
          >
            {{
              asc: (
                <ChevronUpIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              ),
              desc: (
                <ChevronDownIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              ),
            }[header.column.getIsSorted() as string] ?? (
              <ChevronUpIcon
                className="shrink-0 opacity-0 group-hover:opacity-60"
                size={16}
                aria-hidden="true"
              />
            )}
          </Button>
        )}
      </div>
    </TableHeadCell>
  )
}

const DragAlongCell = ({ cell }: { cell: Cell<Entity, unknown> }) => {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: cell.column.id,
    disabled: cell.column.id === 'select', // Disable dragging for select column
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableCell ref={setNodeRef} className="truncate" style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  )
}

// ==================== Dialog Components ====================

// ==================== Mass Changes Implementation ====================

type TriStateMode = 'none' | 'set' | 'clear'

interface TriStateFieldValue {
  mode: TriStateMode
  value: any
}

interface MassChangesDialogProps {
  open: boolean
  onClose: () => void
  selectedRows: Entity[]
  onSave: (patch: Record<string, any>, clear: string[]) => void
  customDocuments?: Array<{id: string, label: string}>
}

// Get editable fields from the column definitions
const getEditableFields = (customDocuments?: Array<{id: string, label: string}>) => {
  const dynamicColumns = getFilteredLeadColumnDefinitions(customDocuments)
  const editableFields = dynamicColumns.filter(col => 
    // Exclude calculated fields, select checkbox, and system fields
    col.type !== 'calculated' && 
    col.id !== 'select' &&
    col.id !== 'createdAt' &&
    col.id !== 'age' &&
    col.id !== 'lastLoginAt' &&
    col.id !== 'lastActivityAt' &&
    col.id !== 'lastContactAt' &&
    col.id !== 'lastCommentAt' &&
    col.id !== 'conversationAssignedAt' &&
    col.id !== 'firstLoginAt' &&
    col.id !== 'followUpAt' &&
    col.id !== 'ftdDate' &&
    col.id !== 'daysToFtd'
  )
  
  return editableFields.map(col => {
    // Override field types for fields that should be selects
    let fieldType = col.type as FieldType
    
    // Fields that should be selects but might be marked as text
    const selectFields = [
      'leadStatus', 'country', 'accountType', 'gender', 'language', 
      'kycStatus', 'paymentGateway', 'citizen', 'ftd', 'ftdSelf', 'desk',
      'idPassportStatus', 'proofOfAddressStatus', 'creditCardFrontStatus', 'creditCardBackStatus'
    ]
    
    if (selectFields.includes(col.id)) {
      fieldType = 'select'
    }
    
    return {
      key: col.id,
      label: col.header,
      type: fieldType,
      path: col.path
    }
  })
}

function TriStateFieldRow({ 
  field, 
  mode, 
  value, 
  onModeChange, 
  onValueChange, 
  mixed, 
  selectedRows 
}: {
  field: { key: string; label: string; type: FieldType; path: string }
  mode: TriStateMode
  value: any
  onModeChange: (mode: TriStateMode) => void
  onValueChange: (value: any) => void
  mixed: boolean
  selectedRows: Entity[]
}) {
  const allFieldOptions = useSelector((state: RootState) => {
    // Pre-fetch options for key fields that use unified system
    const unifiedFields = ['leadStatus', 'leadSource', 'kycStatus', 'paymentGateway', 'accountType', 'desk', 'gender']
    const options: Record<string, any[]> = {}
    
    unifiedFields.forEach(fieldKey => {
      options[fieldKey] = optionsByKey(state, fieldKey as any)
    })
    
    return options
  })
  
  // Get field options - unified system for supported fields, legacy for others
  const getFieldOptions = (fieldKey: string, fieldType: FieldType) => {
    // Use unified system if available
    if (allFieldOptions[fieldKey]) {
      return allFieldOptions[fieldKey]
    }
    
    // Legacy fallback for non-unified fields
    switch (fieldKey) {
      case 'country':
        return COUNTRIES.map(country => ({ 
          label: country.name, 
          value: country.iso2 
        }))
      
      case 'accountType':
        return [
          { label: 'Micro Mini', value: 'micro-mini' },
          { label: 'Mini', value: 'mini' },
          { label: 'Standard', value: 'standard' },
          { label: 'Gold', value: 'gold' },
          { label: 'Diamond', value: 'diamond' },
          { label: 'VIP', value: 'vip' }
        ]
      
      case 'gender':
        return [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' }
        ]
      
      case 'language':
        return [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Italian', value: 'it' },
          { label: 'Portuguese', value: 'pt' },
          { label: 'Russian', value: 'ru' },
          { label: 'Chinese', value: 'zh' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Arabic', value: 'ar' }
        ]
      
      case 'kycStatus':
        return KYC_STATUS.map(status => ({ 
          label: status, 
          value: status 
        }))
      
      case 'leadStatus':
        return [
          { label: 'New', value: 'New' },
          { label: 'Warm', value: 'Warm' },
          { label: 'Hot', value: 'Hot' },
          { label: 'Nurture', value: 'Nurture' },
          { label: 'Qualified', value: 'Qualified' },
          { label: 'Cold', value: 'Cold' },
          { label: 'Disqualified', value: 'Disqualified' }
        ]
      
      case 'paymentGateway':
        return PAYMENT_GATEWAY_OPTIONS.map(gateway => ({ 
          label: gateway, 
          value: gateway 
        }))
      
      case 'citizen':
        // Reuse countries for citizen field
        return COUNTRIES.map(country => ({ 
          label: country.name, 
          value: country.name 
        }))
      
      case 'desk':
        return [
          { label: 'Arabic Desk', value: 'arabic desk' },
          { label: 'English Desk', value: 'english desk' },
          { label: 'French Desk', value: 'french desk' },
          { label: 'Sales Desk A', value: 'sales desk a' },
          { label: 'Sales Desk B', value: 'sales desk b' },
          { label: 'Sales Desk C', value: 'sales desk c' }
        ]
      
      case 'ftd':
        return [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]
      
      case 'ftdSelf':
        return [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]
      
      case 'regulation':
        return [
          { label: 'Regulated', value: 'true' },
          { label: 'Unregulated', value: 'false' }
        ]
      
      case 'salesSecondHand':
        return [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' }
        ]
      
      // Document status fields
      case 'idPassportStatus':
      case 'proofOfAddressStatus':
      case 'creditCardFrontStatus':
      case 'creditCardBackStatus':
        return [
          { label: 'Approved', value: 'approved' },
          { label: 'Pending', value: 'pending' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Not Submitted', value: 'not_submitted' }
        ]
      
      default:
        return []
    }
  }

  // Enhanced styling to match modern filter system design
  const financeInputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontFamily: 'Poppins, sans-serif',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgb(59 130 246 / 0.1)',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 400,
      color: '#1f2937',
      '&::placeholder': {
        color: '#9ca3af',
        opacity: 1,
      },
    },
    '& .MuiSelect-select': {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 400,
      color: '#1f2937',
    },
    '& .MuiSelect-icon': {
      color: '#6b7280',
    },
  }

  // Disabled field styling
  const disabledInputStyle = {
    ...financeInputStyle,
    '& .MuiOutlinedInput-root': {
      ...financeInputStyle['& .MuiOutlinedInput-root'],
      backgroundColor: '#f1f5f9',
      borderColor: '#e2e8f0',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        boxShadow: 'none',
      },
    },
    '& .MuiInputBase-input': {
      ...financeInputStyle['& .MuiInputBase-input'],
      color: '#64748b',
    },
  }

  const renderInput = () => {
    if (mode === 'none') {
      return (
        <TextField
          size="small"
          value={mixed ? '— multiple values —' : ''}
          disabled
          placeholder={mixed ? '— multiple values —' : 'No change'}
          fullWidth
          sx={{ 
            ...disabledInputStyle,
            '& .MuiInputBase-input': {
              ...disabledInputStyle['& .MuiInputBase-input'],
              fontStyle: mixed ? 'italic' : 'normal',
              color: mixed ? '#64748b' : '#64748b'
            }
          }}
        />
      )
    }

    if (mode === 'clear') {
      return (
        <TextField
          size="small"
          value=""
          disabled
          placeholder="Will be cleared"
          fullWidth
          sx={{ 
            ...disabledInputStyle,
            '& .MuiOutlinedInput-root': {
              ...disabledInputStyle['& .MuiOutlinedInput-root'],
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
              '&:hover': {
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                boxShadow: 'none',
              },
            },
            '& .MuiInputBase-input': {
              ...disabledInputStyle['& .MuiInputBase-input'],
              color: '#dc2626',
            }
          }}
        />
      )
    }

    // Mode is 'set'
    switch (field.type) {
      case 'select':
        const options = getFieldOptions(field.key, field.type)
        
        // For fields with many options (like country), use Autocomplete
        if (field.key === 'country' || field.key === 'citizen') {
          return (
            <Autocomplete
              size="small"
              value={options.find(opt => opt.value === value) || null}
              onChange={(_, newValue) => onValueChange(newValue?.value || '')}
              options={options}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="🔍 Search and select..."
                  sx={{
                    ...financeInputStyle,
                    '& .MuiInputBase-input': {
                      ...financeInputStyle['& .MuiInputBase-input'],
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    py: 1.5,
                    px: 2,
                    mx: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transform: 'translateX(2px)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#3b82f6',
                      flexShrink: 0,
                    }} />
                    {option.label}
                  </Box>
                </Box>
              )}
              noOptionsText={
                <Box sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  fontStyle: 'italic'
                }}>
                  🔍 No matches found
                </Box>
              }
              fullWidth
              sx={{
                '& .MuiAutocomplete-inputRoot': {
                  fontFamily: 'Poppins, sans-serif',
                },
                '& .MuiAutocomplete-paper': {
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  mt: 1,
                },
                '& .MuiAutocomplete-listbox': {
                  py: 1,
                  maxHeight: '200px',
                },
                '& .MuiAutocomplete-endAdornment': {
                  '& .MuiSvgIcon-root': {
                    color: '#6b7280',
                    fontSize: '1.25rem',
                  }
                }
              }}
            />
          )
        }
        
        return (
          <FormControl fullWidth>
            <MUISelect
              value={value || ''}
              onChange={(e) => onValueChange(e.target.value)}
              displayEmpty
              sx={{
                ...financeInputStyle,
                '& .MuiSelect-select': {
                  ...financeInputStyle['& .MuiSelect-select'],
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '20px',
                },
                '& .MuiSelect-icon': {
                  color: '#6b7280',
                  fontSize: '1.25rem',
                  transition: 'transform 0.2s ease-in-out',
                },
                '&.Mui-focused .MuiSelect-icon': {
                  transform: 'rotate(180deg)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    mt: 1,
                    '& .MuiList-root': {
                      py: 1,
                    },
                  }
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              <MenuItem 
                value="" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontStyle: 'italic', 
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#e5e7eb',
                    flexShrink: 0
                  }} />
                  Select value...
                </Box>
              </MenuItem>
              {options.map(opt => (
                <MenuItem 
                  key={opt.value} 
                  value={opt.value}
                  sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    py: 1.5,
                    px: 2,
                    mx: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transform: 'translateX(2px)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#dbeafe',
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: value === opt.value ? '#3b82f6' : '#d1d5db',
                      flexShrink: 0,
                      transition: 'background-color 0.2s ease-in-out'
                    }} />
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </MUISelect>
          </FormControl>
        )
      
      case 'boolean':
        return (
          <FormControl fullWidth>
            <MUISelect
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => onValueChange(e.target.value === 'true')}
              displayEmpty
              sx={{
                ...financeInputStyle,
                '& .MuiSelect-select': {
                  ...financeInputStyle['& .MuiSelect-select'],
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '20px',
                },
                '& .MuiSelect-icon': {
                  color: '#6b7280',
                  fontSize: '1.25rem',
                  transition: 'transform 0.2s ease-in-out',
                },
                '&.Mui-focused .MuiSelect-icon': {
                  transform: 'rotate(180deg)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    mt: 1,
                    '& .MuiList-root': {
                      py: 1,
                    },
                  }
                }
              }}
            >
              <MenuItem 
                value="" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontStyle: 'italic', 
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#e5e7eb',
                    border: '2px solid #d1d5db',
                    flexShrink: 0
                  }} />
                  Select value...
                </Box>
              </MenuItem>
              <MenuItem 
                value="true" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f0fdf4',
                    transform: 'translateX(2px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#bbf7d0',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#22c55e',
                    border: '2px solid #16a34a',
                    flexShrink: 0,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '1px',
                      left: '3px',
                      width: '4px',
                      height: '6px',
                      border: 'solid white',
                      borderWidth: '0 2px 2px 0',
                      transform: 'rotate(45deg)',
                    }
                  }} />
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    Yes
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem 
                value="false" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#fef2f2',
                    transform: 'translateX(2px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#fecaca',
                    color: '#dc2626',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#fca5a5',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#ef4444',
                    border: '2px solid #dc2626',
                    flexShrink: 0,
                    position: 'relative',
                    '&::after': {
                      content: '"×"',
                      position: 'absolute',
                      top: '-2px',
                      left: '2px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      lineHeight: 1,
                    }
                  }} />
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    No
                  </Typography>
                </Box>
              </MenuItem>
            </MUISelect>
          </FormControl>
        )
      
      case 'number':
        return (
          <TextField
            type="number"
            value={value || ''}
            onChange={(e) => onValueChange(Number(e.target.value) || 0)}
            placeholder="🔢 Enter number..."
            fullWidth
            sx={financeInputStyle}
            inputProps={{
              min: 0,
              step: 0.01
            }}
          />
        )
      
      case 'date':
        return (
          <TextField
            type="date"
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={financeInputStyle}
          />
        )
      
      case 'datetime':
        return (
          <TextField
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={financeInputStyle}
          />
        )
      
      case 'rating':
        return (
          <FormControl fullWidth>
            <MUISelect
              value={value || ''}
              onChange={(e) => onValueChange(Number(e.target.value))}
              displayEmpty
              sx={{
                ...financeInputStyle,
                '& .MuiSelect-select': {
                  ...financeInputStyle['& .MuiSelect-select'],
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '20px',
                },
                '& .MuiSelect-icon': {
                  color: '#6b7280',
                  fontSize: '1.25rem',
                  transition: 'transform 0.2s ease-in-out',
                },
                '&.Mui-focused .MuiSelect-icon': {
                  transform: 'rotate(180deg)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    mt: 1,
                    '& .MuiList-root': {
                      py: 1,
                    },
                  }
                }
              }}
            >
              <MenuItem 
                value="" 
                sx={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontStyle: 'italic', 
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    display: 'flex',
                    gap: 0.5,
                    color: '#e5e7eb',
                    fontSize: '1rem'
                  }}>
                    {'☆'.repeat(5)}
                  </Box>
                  Select rating...
                </Box>
              </MenuItem>
              {[1, 2, 3, 4, 5].map(rating => (
                <MenuItem 
                  key={rating} 
                  value={rating} 
                  sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    py: 1.5,
                    px: 2,
                    mx: 1,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#fef3c7',
                      transform: 'translateX(2px)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#fde68a',
                      color: '#92400e',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#fcd34d',
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      <Box sx={{ color: '#f59e0b', display: 'flex' }}>
                        {'★'.repeat(rating)}
                      </Box>
                      <Box sx={{ color: '#e5e7eb', display: 'flex' }}>
                        {'☆'.repeat(5-rating)}
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Poppins, sans-serif',
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    >
                      ({rating} star{rating !== 1 ? 's' : ''})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </MUISelect>
          </FormControl>
        )
      
      case 'textarea':
        return (
          <TextField
            multiline
            rows={3}
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="📝 Enter detailed text..."
            fullWidth
            sx={{
              ...financeInputStyle,
              '& .MuiInputBase-root': {
                alignItems: 'flex-start',
              },
              '& .MuiInputBase-input': {
                ...financeInputStyle['& .MuiInputBase-input'],
                resize: 'vertical',
                minHeight: '60px',
              }
            }}
          />
        )
      
      default:
        return (
          <TextField
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="✏️ Enter value..."
            fullWidth
            sx={{
              ...financeInputStyle,
              '& .MuiInputBase-input': {
                ...financeInputStyle['& .MuiInputBase-input'],
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              }
            }}
          />
        )
    }
  }

  return (
    <Box className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
      {/* Field Label */}
      <Box className="col-span-3">
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.875rem'
          }}
        >
          {field.label}
        </Typography>
      </Box>
      
      {/* Tri-state buttons */}
      <Box className="col-span-4 flex gap-1">
        <MUIButton
          size="small"
          variant={mode === 'none' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('none')}
          sx={{ 
            minWidth: '80px', 
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '6px',
            border: mode === 'none' ? 'none' : '1px solid #e2e8f0',
            color: mode === 'none' ? 'white' : '#64748b',
            backgroundColor: mode === 'none' ? '#64748b' : '#f8fafc',
            boxShadow: mode === 'none' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
            '&:hover': {
              backgroundColor: mode === 'none' ? '#475569' : '#f1f5f9',
              borderColor: mode === 'none' ? '#475569' : '#cbd5e1',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }
          }}
        >
          No change
        </MUIButton>
        <MUIButton
          size="small"
          variant={mode === 'set' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('set')}
          sx={{ 
            minWidth: '60px', 
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '6px',
            border: mode === 'set' ? 'none' : '1px solid #3b82f6',
            color: mode === 'set' ? 'white' : '#3b82f6',
            backgroundColor: mode === 'set' ? '#3b82f6' : '#f8fafc',
            boxShadow: mode === 'set' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
            '&:hover': {
              backgroundColor: mode === 'set' ? '#2563eb' : '#eff6ff',
              borderColor: mode === 'set' ? '#2563eb' : '#2563eb',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }
          }}
        >
          Set
        </MUIButton>
        <MUIButton
          size="small"
          variant={mode === 'clear' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('clear')}
          sx={{ 
            minWidth: '60px', 
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '6px',
            border: mode === 'clear' ? 'none' : '1px solid #ef4444',
            color: mode === 'clear' ? 'white' : '#ef4444',
            backgroundColor: mode === 'clear' ? '#ef4444' : '#f8fafc',
            boxShadow: mode === 'clear' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
            '&:hover': {
              backgroundColor: mode === 'clear' ? '#dc2626' : '#fef2f2',
              borderColor: mode === 'clear' ? '#dc2626' : '#dc2626',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }
          }}
        >
          Clear
        </MUIButton>
      </Box>
      
      {/* Input Field */}
      <Box className="col-span-5">
        {renderInput()}
      </Box>
    </Box>
  )
}

function MassChangesDialog({ open, onClose, selectedRows, onSave, customDocuments }: MassChangesDialogProps) {
  const [fieldStates, setFieldStates] = useState<Record<string, TriStateFieldValue>>({})
  
  const editableFields = useMemo(() => getEditableFields(customDocuments), [customDocuments])
  
  // Initialize field states
  useEffect(() => {
    if (open) {
      const initialStates: Record<string, TriStateFieldValue> = {}
      editableFields.forEach(field => {
        initialStates[field.key] = { mode: 'none', value: null }
      })
      setFieldStates(initialStates)
    }
  }, [open, editableFields])
  
  // Check if a field has mixed values across selected rows
  const isMixedValue = (fieldKey: string) => {
    if (selectedRows.length <= 1) return false
    
    const values = selectedRows.map(row => get(row, fieldKey))
    const uniqueValues = [...new Set(values)]
    return uniqueValues.length > 1
  }
  
  // Check if we can apply changes (at least one field is set or clear)
  const canApply = useMemo(() => {
    return Object.values(fieldStates).some(state => 
      state.mode === 'set' || state.mode === 'clear'
    )
  }, [fieldStates])
  
  // Handle field mode change
  const handleModeChange = (fieldKey: string, mode: TriStateMode) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        mode,
        value: mode === 'set' ? (prev[fieldKey]?.value || null) : null
      }
    }))
  }
  
  // Handle field value change
  const handleValueChange = (fieldKey: string, value: any) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        value
      }
    }))
  }
  
  // Handle apply changes
  const handleApply = () => {
    const patch: Record<string, any> = {}
    const clear: string[] = []
    
    Object.entries(fieldStates).forEach(([fieldKey, state]) => {
      if (state.mode === 'set') {
        patch[fieldKey] = state.value
      } else if (state.mode === 'clear') {
        clear.push(fieldKey)
      }
    })
    
    onSave(patch, clear)
  }
  
  // Reset dialog
  const resetDialog = () => {
    setFieldStates({})
  }
  
  useEffect(() => {
    if (!open) resetDialog()
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "rounded-3xl shadow-2xl"
      }}
    >
      <Box className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <Box className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
          <Box className="flex items-center gap-4">
            <Box className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg">
              <Edit className="w-6 h-6 text-white" />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#1f2937',
                  letterSpacing: '-0.025em'
                }}
              >
                Mass Changes
              </Typography>
              <Typography 
                variant="body1" 
                sx={{
                  color: '#6b7280',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  mt: 0.5
                }}
              >
                Apply updates to {selectedRows.length} lead{selectedRows.length === 1 ? '' : 's'}
              </Typography>
              
              {/* Selected leads summary */}
              <Box className="mt-2">
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#9ca3af',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.75rem'
                  }}
                >
                  Selected: {selectedRows.slice(0, 3).map(row => 
                    `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email || row.accountId
                  ).join(', ')}
                  {selectedRows.length > 3 && ` +${selectedRows.length - 3} more`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: '#6b7280',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-y-auto p-6">
          <Box className="space-y-1">
            {/* Column Headers */}
            <Box className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg px-4 mb-2">
              <Typography 
                variant="caption" 
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                className="col-span-3"
              >
                Field
              </Typography>
              <Typography 
                variant="caption" 
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                className="col-span-4"
              >
                Action
              </Typography>
              <Typography 
                variant="caption" 
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                className="col-span-5"
              >
                Value
              </Typography>
            </Box>
            
            {/* Field Rows */}
            {editableFields.map(field => (
              <TriStateFieldRow
                key={field.key}
                field={field}
                mode={fieldStates[field.key]?.mode || 'none'}
                value={fieldStates[field.key]?.value}
                onModeChange={(mode) => handleModeChange(field.key, mode)}
                onValueChange={(value) => handleValueChange(field.key, value)}
                mixed={isMixedValue(field.key)}
                selectedRows={selectedRows}
              />
            ))}
          </Box>

          {/* Preview section */}
          {canApply && (
            <Box 
              sx={{
                mt: 4,
                p: 3,
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}
            >
              <Typography 
                variant="body1" 
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  color: '#1e40af',
                  mb: 2,
                  fontSize: '0.925rem'
                }}
              >
                📋 Changes Preview:
              </Typography>
              <Box className="space-y-2">
                {Object.entries(fieldStates).map(([fieldKey, state]) => {
                  if (state.mode === 'none') return null
                  const field = editableFields.find(f => f.key === fieldKey)
                  return (
                    <Box 
                      key={fieldKey} 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.5,
                        px: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '6px',
                        border: '1px solid #e0e7ff'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: '#1e40af',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.8rem'
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 600 }}>{field?.label}</Box>
                        {': '}
                        <Box component="span" sx={{ 
                          color: state.mode === 'clear' ? '#dc2626' : '#16a34a',
                          fontWeight: 500 
                        }}>
                          {state.mode === 'clear' ? '🗑️ Will be cleared' : `✏️ Set to "${state.value}"`}
                        </Box>
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Footer */}
        <Box 
          sx={{
            display: 'flex',
            gap: 3,
            p: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <MUIButton
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.875rem',
              py: 1.5,
              border: '1px solid #e2e8f0',
              color: '#64748b',
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }
            }}
          >
            Cancel
          </MUIButton>
          <MUIButton
            variant="contained"
            onClick={handleApply}
            disabled={!canApply}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.875rem',
              py: 1.5,
              background: canApply 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : '#e5e7eb',
              border: 'none',
              color: canApply ? '#ffffff' : '#9ca3af',
              boxShadow: canApply 
                ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
                : 'none',
              '&:hover': {
                background: canApply 
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' 
                  : '#e5e7eb',
                boxShadow: canApply 
                  ? '0 6px 8px -2px rgb(0 0 0 / 0.15), 0 4px 6px -4px rgb(0 0 0 / 0.1)' 
                  : 'none'
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af'
              }
            }}
          >
            🚀 Apply Changes to {selectedRows.length} Lead{selectedRows.length === 1 ? '' : 's'}
          </MUIButton>
        </Box>
      </Box>
    </Dialog>
  )
}

