"use client"

import React, { CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react"
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
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon, ChevronLeftIcon, ChevronRightIcon, Filter, Eye, EyeOff } from "lucide-react"
import { PersonAdd, Edit, Close, Cancel } from '@mui/icons-material'
import { Popover, IconButton, Box, Stack, Typography, Divider, Button as MUIButton, TextField, MenuItem, Select as MUISelect, FormControl, InputLabel, Checkbox as MUICheckbox, FormGroup, FormControlLabel, RadioGroup, Radio, Autocomplete, Paper, Chip, Slide, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Menu } from '@mui/material'

import { Button } from "@/components/ui/button"
import { SmartFilterControlSafe as SmartFilterControl } from '@/components/tables/filters/SmartFilterControlSafe'
import type { NormalizedFilter } from '@/filters/types'
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
import { getCountryDisplayName, COUNTRIES } from "@/config/countries"
import { LEAD_STATUS } from "@/config/leadStatus"
import { KYC_STATUS } from "@/config/kycStatus"
import { selectActivePaymentGatewayOptions, selectGatewayById } from "@/selectors/paymentGatewayOptions"
import { Entity } from "@/state/entitiesSlice"
import StarRating from "@/components/inputs/StarRating"
import { coerceBoolean, cn } from "@/lib/utils"
import ConversationOwnerDrawer, { type Agent } from "./conversations/ConversationOwnerDrawer"
import RetentionOwnerDrawer from "./conversations/RetentionOwnerDrawer"
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { updateEntityField } from '@/state/entitiesSlice'
// import { closeOpenPositions } from '@/features/positions/positionsSlice' // Removed - positions feature deleted
import { FieldRenderer, optionsByKey } from '@/fieldkit'

// Generic column definition interface
export interface EntityColumnDefinition {
  id: string
  header: string
  path: string
  type: string
  defaultVisible: boolean
  formatter?: (value: any) => string
}

// Generic table configuration
export interface EntityTableConfig {
  entityType: string // 'lead', 'client', etc.
  entityNameSingular: string // 'lead', 'client', etc.
  entityNamePlural: string // 'leads', 'clients', etc.
  columns: EntityColumnDefinition[]
  storageKey: string // for localStorage persistence
}

interface EntityTableProps {
  rows: Entity[]
  config: EntityTableConfig
  onRowClick?: (row: Entity) => void
  visibleColumns?: Record<string, boolean>
  columnOrder?: string[]
  onColumnOrderChange?: (newOrder: string[]) => void
  customDocuments?: Array<{id: string, label: string}>
}

// Mass Changes interfaces
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
  config: EntityTableConfig
}

// Define custom filter functions
const normalizedFilterFn = (row: any, columnId: string, filterValue: any): boolean => {
  if (!filterValue || filterValue === '') return true
  
  try {
    const cellValue = row.getValue(columnId)
    const cellValueStr = String(cellValue ?? '').toLowerCase().trim()
    
    // Handle complex filter objects
    if (typeof filterValue === 'object' && filterValue.op) {
      switch (filterValue.op) {
        case 'notEmpty':
          return cellValueStr !== '' && cellValue != null && cellValue !== undefined
        case 'isEmpty':
          return cellValueStr === '' || cellValue == null || cellValue === undefined
        case 'text':
          const compareValue = String(filterValue.val ?? '').toLowerCase().trim()
          if (filterValue.mode === 'contains') {
            return cellValueStr.includes(compareValue)
          }
          if (filterValue.mode === 'eq' || filterValue.mode === 'equals') {
            return cellValueStr === compareValue
          }
          if (filterValue.mode === 'starts') {
            return cellValueStr.startsWith(compareValue)
          }
          if (filterValue.mode === 'ends') {
            return cellValueStr.endsWith(compareValue)
          }
          return true
        case 'cmp':
          const numValue = parseFloat(cellValue)
          const compareNum = parseFloat(filterValue.val)
          if (isNaN(numValue) || isNaN(compareNum)) return false
          switch (filterValue.rel) {
            case 'eq': return numValue === compareNum
            case 'ne': return numValue !== compareNum
            case 'gt': return numValue > compareNum
            case 'gte': return numValue >= compareNum
            case 'lt': return numValue < compareNum
            case 'lte': return numValue <= compareNum
            default: return true
          }
        case 'bool':
          return Boolean(cellValue) === Boolean(filterValue.val)
        case 'in':
          if (!Array.isArray(filterValue.vals)) return true
          return filterValue.vals.some((val: any) => 
            String(val).toLowerCase().trim() === cellValueStr
          )
        case 'date':
          const cellDate = new Date(cellValue)
          if (filterValue.kind === 'single') {
            const compareDate = new Date(filterValue.value)
            if (isNaN(cellDate.getTime()) || isNaN(compareDate.getTime())) return false
            const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
            const compareDateOnly = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate())
            switch (filterValue.rel) {
              case 'eq': return cellDateOnly.getTime() === compareDateOnly.getTime()
              case 'ne': return cellDateOnly.getTime() !== compareDateOnly.getTime()
              case 'gt': return cellDateOnly.getTime() > compareDateOnly.getTime()
              case 'gte': return cellDateOnly.getTime() >= compareDateOnly.getTime()
              case 'lt': return cellDateOnly.getTime() < compareDateOnly.getTime()
              case 'lte': return cellDateOnly.getTime() <= compareDateOnly.getTime()
              default: return true
            }
          }
          if (filterValue.kind === 'range') {
            const fromDate = new Date(filterValue.from)
            const toDate = new Date(filterValue.to)
            if (isNaN(cellDate.getTime())) return false
            const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate())
            const fromDateOnly = isNaN(fromDate.getTime()) ? new Date(0) : new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
            const toDateOnly = isNaN(toDate.getTime()) ? new Date(9999, 11, 31) : new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
            return cellDateOnly.getTime() >= fromDateOnly.getTime() && cellDateOnly.getTime() <= toDateOnly.getTime()
          }
          return true
        default:
          return true
      }
    }

    // Handle NormalizedFilter objects from SmartFilterControl
    if (typeof filterValue === 'object' && filterValue.kind) {
      const nf = filterValue as NormalizedFilter;
      
      switch (nf.kind) {
        case 'text':
          const textValue = String(nf.value).toLowerCase().trim();
          switch (nf.op) {
            case 'contains': return cellValueStr.includes(textValue);
            case 'eq': return cellValueStr === textValue;
            case 'startsWith': return cellValueStr.startsWith(textValue);
            case 'endsWith': return cellValueStr.endsWith(textValue);
            default: return true;
          }
          
        case 'number':
          const numCellValue = parseFloat(cellValue);
          if (isNaN(numCellValue)) return false;
          
          if (nf.op === 'between' && Array.isArray(nf.value)) {
            const [min, max] = nf.value;
            return numCellValue >= min && numCellValue <= max;
          } else if (typeof nf.value === 'number') {
            switch (nf.op) {
              case 'eq': return numCellValue === nf.value;
              case 'gte': return numCellValue >= nf.value;
              case 'lte': return numCellValue <= nf.value;
              default: return true;
            }
          }
          return true;
          
        case 'date':
          const dateCellValue = new Date(cellValue);
          if (isNaN(dateCellValue.getTime())) return false;
          
          if (nf.op === 'between' && Array.isArray(nf.value)) {
            const [startDate, endDate] = nf.value.map(d => new Date(d));
            return dateCellValue >= startDate && dateCellValue <= endDate;
          } else if (typeof nf.value === 'string') {
            const compareDate = new Date(nf.value);
            if (isNaN(compareDate.getTime())) return false;
            
            switch (nf.op) {
              case 'eq': 
                // Compare dates without time
                const cellDateOnly = new Date(dateCellValue.getFullYear(), dateCellValue.getMonth(), dateCellValue.getDate());
                const compareDateOnly = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());
                return cellDateOnly.getTime() === compareDateOnly.getTime();
              case 'gte': return dateCellValue >= compareDate;
              case 'lte': return dateCellValue <= compareDate;
              default: return true;
            }
          }
          return true;
          
        case 'boolean':
          return Boolean(cellValue) === nf.value;
          
        case 'enum':
        case 'relation':
          if (Array.isArray(nf.value)) {
            return nf.value.some(val => String(val).toLowerCase() === cellValueStr);
          } else {
            return String(nf.value).toLowerCase() === cellValueStr;
          }
          
        default:
          return true;
      }
    }
    
    // Handle simple string filters (for dropdown selections, etc.)
    const compareValue = String(filterValue).toLowerCase().trim()
    return cellValueStr.includes(compareValue)
  } catch (error) {
    console.warn('Filter error:', error)
    return true
  }
}

const selectFilterFn = (row: any, columnId: string, filterValue: any): boolean => {
  if (!filterValue || filterValue === 'All') return true
  
  try {
    const cellValue = row.getValue(columnId)
    const cellValueStr = String(cellValue ?? '').toLowerCase().trim()
    
    // Handle complex filter objects (same as normalizedFilterFn for consistency)
    if (typeof filterValue === 'object' && filterValue.op) {
      return normalizedFilterFn(row, columnId, filterValue)
    }
    
    // For select fields, use exact matching
    const compareValue = String(filterValue).toLowerCase().trim()
    return cellValueStr === compareValue
  } catch (error) {
    console.warn('Select filter error:', error)
    return true
  }
}

// Helper function to get filtered column definitions with custom documents
const getFilteredColumnDefinitions = (
  baseColumns: EntityColumnDefinition[], 
  customDocuments?: Array<{id: string, label: string}>
) => {
  const columns = [...baseColumns]
  
  if (customDocuments) {
    customDocuments.forEach(doc => {
      columns.push({
        id: `custom.${doc.id}`,
        header: doc.label,
        path: `documents.${doc.id}`,
        type: 'text' as const,
        defaultVisible: false
      })
    })
  }
  
  return columns
}

// Get editable fields from the column definitions
const getEditableFields = (config: EntityTableConfig, customDocuments?: Array<{id: string, label: string}>) => {
  const dynamicColumns = getFilteredColumnDefinitions(config.columns, customDocuments)
  const editableFields = dynamicColumns.filter(col => 
    // Exclude calculated fields, select checkbox, and system fields
    col.type !== 'calculated' && 
    col.id !== '_select' &&
    col.id !== 'createdAt' &&
    col.id !== 'age' &&
    col.id !== 'lastUpdated' &&
    col.id !== 'id'
  ).map(col => ({
    key: col.path,
    label: col.header,
    type: col.type as FieldType,
    path: col.path
  }))

  return editableFields
}

// Create dynamic columns based on column definitions
const createColumns = (
  config: EntityTableConfig,
  onRowClick?: (row: Entity) => void, 
  customDocuments?: Array<{id: string, label: string}>,
  maskedPhones?: Set<string>,
  setMaskedPhones?: React.Dispatch<React.SetStateAction<Set<string>>>
): ColumnDef<Entity>[] => {
  // Get all field keys from filtered column definitions with custom documents
  const filteredColumnDefinitions = getFilteredColumnDefinitions(config.columns, customDocuments)
  
  // Create the select column first
  const selectColumn: ColumnDef<Entity> = {
    id: "_select",
    header: ({ table }) => {
      const checked = table.getIsAllPageRowsSelected()
      const indeterminate = table.getIsSomePageRowsSelected() && !checked
      return (
        <div className="flex items-center justify-center w-full h-full border-r border-gray-200/70 px-2">
          <input
            type="checkbox"
            checked={checked}
            ref={el => {
              if (el) el.indeterminate = indeterminate
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            onClick={e => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer"
          />
        </div>
      )
    },
    cell: ({ row }) => {
      const checked = row.getIsSelected()
      const indeterminate = row.getIsSomeSelected() && !checked
      return (
        <div className="flex items-center justify-center w-full h-full border-r border-gray-200/70 px-2">
          <input
            type="checkbox"
            checked={checked}
            ref={el => {
              if (el) el.indeterminate = indeterminate
            }}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={e => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer"
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  }

  // Helper function to get nested values from objects
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Helper function to render blurred phone numbers
  const renderBlurredPhone = (phone: string, phoneKey: string) => {
    if (!phone) return null
    
    return React.createElement('div', {
      className: "relative inline-flex items-center group"
    }, [
      // Blurred phone number - actual blur effect
      React.createElement('span', {
        key: 'blurred-phone',
        className: "select-none transition-all duration-200",
        style: { 
          filter: 'blur(5px)', 
          WebkitFilter: 'blur(5px)',
          userSelect: 'none'
        }
      }, phone),
      
      // Eye icon button - positioned over the blurred text
      React.createElement('button', {
        key: 'reveal-button',
        type: 'button',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          if (maskedPhones && setMaskedPhones) {
            const newMaskedPhones = new Set(maskedPhones)
            newMaskedPhones.delete(phoneKey)
            setMaskedPhones(newMaskedPhones)
          }
        },
        className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200",
        title: 'Click to reveal phone number'
      }, React.createElement(Eye, {
        size: 12,
        className: "text-blue-600"
      }))
    ])
  }

  // Helper function to format values based on column type
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return ''
    
    switch (type) {
      case 'money':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value)
      case 'datetime':
        return value ? new Date(value).toLocaleString() : ''
      case 'date':
        return value ? new Date(value).toLocaleDateString() : ''
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value)
      case 'quote':
        return typeof value === 'number' ? value.toFixed(5) : String(value)
      case 'percentage':
        return typeof value === 'number' ? `${value.toFixed(2)}%` : String(value)
      case 'rating':
        return typeof value === 'number' ? `${value} stars` : String(value)
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'verification-checkbox':
        return value ? '✓' : '✗'
      case 'status':
        // Let custom formatters handle status fields, fallback to value or empty string
        return value ? String(value) : ''
      case 'email':
      case 'phone':
      case 'text':
      case 'select':
      default:
        return String(value)
    }
  }

  // Generate the entity fields columns
  const allColumns: ColumnDef<Entity>[] = []

  // Add all entity fields based on filteredColumnDefinitions
  filteredColumnDefinitions.forEach((colDef) => {
    const column: ColumnDef<Entity> = {
      id: colDef.id,
      accessorFn: (row) => getNestedValue(row, colDef.path),
      header: colDef.header,
      cell: ({ row, getValue }) => {
        const value = getValue()
        
        // Special rendering for status type
        if (colDef.type === 'status') {
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px]"
              onClick={() => onRowClick?.(row.original)}
            >
              <div className={`inline-flex items-center px-2 py-0 text-xs font-medium rounded-full ${
                value === 'online' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  value === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {value === 'online' ? 'Online' : 'Offline'}
              </div>
            </div>
          )
        }
        
        // Special rendering for rating type
        if (colDef.type === 'rating') {
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px] flex items-center"
              onClick={() => onRowClick?.(row.original)}
              title={value ? `${value} of 5 stars` : 'No rating'}
            >
              <StarRating 
                value={typeof value === 'number' ? value : undefined} 
                readOnly 
                size={16}
              />
            </div>
          )
        }
        
        // Special rendering for verification-checkbox type
        if (colDef.type === 'verification-checkbox') {
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px] flex items-center justify-center"
              onClick={() => onRowClick?.(row.original)}
              title={value ? 'Verified' : 'Not verified'}
            >
              <span className={`text-sm font-bold ${
                value ? 'text-green-600' : 'text-red-500'
              }`}>
                {value ? '✓' : '✗'}
              </span>
            </div>
          )
        }

        // Special rendering for position type (Buy/Sell) with colored backgrounds
        if ((colDef.id === 'type' && colDef.path === 'positionType') ||
            (colDef.id === 'positionType' && colDef.path === 'positionType') ||
            (colDef.header === 'Type' && (String(value || '').toLowerCase() === 'buy' || String(value || '').toLowerCase() === 'sell'))) {
          const positionType = String(value || '').toLowerCase()
          const isBuy = positionType === 'buy'
          const isSell = positionType === 'sell'
          
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
              onClick={() => onRowClick?.(row.original)}
            >
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                isBuy
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : isSell
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {String(value) || '-'}
              </span>
            </div>
          )
        }

        // Special rendering for PnL values (Open PnL and Total PnL) with green/red colors
        if ((colDef.id === 'openPnl' && colDef.path === 'openPnL') || 
            (colDef.id === 'totalPnl' && colDef.path === 'totalPnL') ||
            (colDef.id === 'totalPnL' && colDef.path === 'totalPnL') ||
            (colDef.id === 'pnlWithout' && colDef.path === 'pnlWithout') ||
            (colDef.id === 'swap' && colDef.path === 'swap') ||
            (colDef.id === 'pnl' && colDef.path === 'computed.realizedPnL') ||
            (colDef.id === 'totalPnl' && colDef.path === 'computed.totalRealizedPnL') ||
            colDef.type === 'pnl') {
          const pnlValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          const isPositive = pnlValue > 0
          const isNegative = pnlValue < 0
          const displayValue = typeof value === 'number' ? `${isPositive ? '+' : ''}${pnlValue.toLocaleString()}` : String(value)
          
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
              onClick={() => onRowClick?.(row.original)}
            >
              <span className={`font-medium ${
                isPositive
                  ? 'text-green-600'
                  : isNegative
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {pnlValue !== 0 ? displayValue : '0.00'}
              </span>
            </div>
          )
        }

        // Special rendering for commission values with red tint (costs)
        if (colDef.id === 'commission' && colDef.path === 'commission') {
          const commissionValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
          const displayValue = typeof value === 'number' ? `$${Math.abs(commissionValue).toLocaleString()}` : String(value)
          
          return (
            <div 
              className="cursor-pointer hover:opacity-80 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
              onClick={() => onRowClick?.(row.original)}
            >
              <span className={`font-medium ${
                commissionValue !== 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {commissionValue !== 0 ? displayValue : '$0.00'}
              </span>
            </div>
          )
        }

        // Special rendering for phone type with blur masking functionality
        if (colDef.type === 'phone' || colDef.id.toLowerCase().includes('phone')) {
          const phoneKey = `${row.original.id || row.original.accountId}-${colDef.id}`
          const isPhoneMasked = maskedPhones?.has(phoneKey) || false
          const phoneValue = String(value || '')
          
          return React.createElement('div', {
            className: "cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded min-w-[100px] text-xs truncate flex items-center group",
            onClick: () => onRowClick?.(row.original)
          }, [
            React.createElement('div', {
              key: 'phone-container',
              className: "flex-1 flex items-center"
            }, [
              // Show blurred phone or normal phone
              phoneValue ? (
                isPhoneMasked 
                  ? renderBlurredPhone(phoneValue, phoneKey)
                  : React.createElement('div', {
                      key: 'clear-phone-container',
                      className: "relative inline-flex items-center group"
                    }, [
                      React.createElement('span', { key: 'clear-phone' }, phoneValue),
                      React.createElement('button', {
                        key: 'hide-button',
                        type: 'button',
                        onClick: (e: React.MouseEvent) => {
                          e.stopPropagation()
                          if (maskedPhones && setMaskedPhones) {
                            const newMaskedPhones = new Set(maskedPhones)
                            newMaskedPhones.add(phoneKey)
                            setMaskedPhones(newMaskedPhones)
                          }
                        },
                        className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-600/20 hover:bg-gray-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1",
                        title: 'Hide phone number'
                      }, React.createElement(EyeOff, { size: 12, className: "text-gray-600" }))
                    ])
              ) : React.createElement('span', { key: 'empty-phone' }, '-')
            ])
          ])
        }

        // Special rendering for clickable Account ID
        if (colDef.type === 'clickable-accountId') {
          const accountId = String(value || '')
          return (
            <div 
              className="cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
              onClick={(e) => {
                e.stopPropagation()
                // Call a custom handler passed via config or context
                if (typeof window !== 'undefined' && (window as any).handleAccountIdClick) {
                  (window as any).handleAccountIdClick(accountId)
                }
              }}
              title={`Click to view profile for account ${accountId}`}
            >
              {accountId || '-'}
            </div>
          )
        }

        // Special rendering for Payment Gateway field with warning badges for disabled gateways
        if (colDef.id === 'paymentGateway' || (colDef.path === 'paymentGateway' && value)) {
          const gatewayName = String(value || '')
          if (!gatewayName || gatewayName === '-') {
            return (
              <div 
                className="cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
                onClick={() => onRowClick?.(row.original)}
              >
                -
              </div>
            )
          }

          // Check if this gateway exists in the system
          const gateway = useSelector(selectGatewayById(gatewayName))
          const isDisabled = gateway && !gateway.isActive
          const isDeleted = !gateway // Gateway was deleted from admin

          return (
            <div 
              className="cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
              onClick={() => onRowClick?.(row.original)}
            >
              <div className="flex items-center gap-1">
                <span className={isDisabled || isDeleted ? 'text-gray-500' : ''}>
                  {gatewayName}
                </span>
                {isDeleted && (
                  <span 
                    className="inline-flex items-center px-1 py-0 text-[10px] font-medium bg-red-100 text-red-700 rounded border border-red-200"
                    title="This payment gateway has been deleted from the system"
                  >
                    DELETED
                  </span>
                )}
                {isDisabled && !isDeleted && (
                  <span 
                    className="inline-flex items-center px-1 py-0 text-[10px] font-medium bg-yellow-100 text-yellow-700 rounded border border-yellow-200"
                    title="This payment gateway is currently disabled"
                  >
                    DISABLED
                  </span>
                )}
              </div>
            </div>
          )
        }
        
        // Use custom formatter if provided, otherwise use default formatValue
        const formattedValue = (colDef as any).formatter 
          ? (() => {
              const result = (colDef as any).formatter(value)
              if (colDef.type === 'status' && ['retentionStatus', 'kycStatus', 'leadStatus', 'transactionType'].includes(colDef.id)) {
                console.log(`🔍 Formatter Debug - Column: ${colDef.id}, Value: ${value}, Result: ${result}`)
              }
              return result
            })()
          : formatValue(value, colDef.type)
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 px-2 py-0.5 rounded min-w-[100px] text-xs truncate"
            onClick={() => onRowClick?.(row.original)}
          >
            {formattedValue !== null && formattedValue !== undefined ? formattedValue : '-'}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      filterFn: colDef.type === 'select' ? selectFilterFn : normalizedFilterFn,
    }
    
    allColumns.push(column)
  })

  return [selectColumn, ...allColumns]
}

// Draggable table header component
function DraggableTableHeader({ 
  header, 
  onOpenFilterMenu 
}: { 
  header: Header<Entity, unknown>
  onOpenFilterMenu: (id: string, el: HTMLElement) => void
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id,
    disabled: header.column.id === "_select", // Disable dragging for select column
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.95 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.columnDef.size,
    zIndex: isDragging ? 1000 : 0,
    backgroundColor: isDragging ? '#f8fafc' : undefined,
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : undefined,
    borderRadius: isDragging ? '6px' : undefined,
  }

  const isActive = header.column.getFilterValue() !== undefined

  return (
    <TableHeadCell
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-gray-100 border-gray-200 font-medium text-gray-900 px-4 py-3 text-left text-xs uppercase tracking-wide relative",
        header.column.id === "_select" ? "min-w-[40px] max-w-[40px] w-[40px]" : "min-w-[100px]"
      )}
    >
      {header.column.id === "_select" ? (
        // Special handling for select column - no drag, no sort
        <div className="w-full h-full">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      ) : (
        <div className="flex items-center gap-1 w-full">
          <button
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="h-3 w-3 text-gray-600" />
          </button>
          
          <div className="flex-1 flex items-center justify-between min-w-0">
            <button
              className="flex items-center gap-1 text-left min-w-0 flex-1"
              onClick={() => header.column.toggleSorting()}
            >
              <span className="font-semibold text-xs truncate">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </span>
              
              {header.column.getCanSort() && (
                <div className="flex flex-col ml-1">
                  <ChevronUpIcon
                    className={cn(
                      "h-2.5 w-2.5",
                      header.column.getIsSorted() === "asc"
                        ? "text-blue-600"
                        : "text-gray-300"
                    )}
                  />
                  <ChevronDownIcon
                    className={cn(
                      "h-2.5 w-2.5 -mt-0.5",
                      header.column.getIsSorted() === "desc"
                        ? "text-blue-600"
                        : "text-gray-300"
                    )}
                  />
                </div>
              )}
            </button>

            {header.column.getCanFilter() && (
              <button
                className={cn(
                  "ml-1 p-0.5 rounded hover:bg-gray-200",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}
                onClick={(e) => {
                  if (header?.column?.id && e.currentTarget) {
                    onOpenFilterMenu(header.column.id, e.currentTarget);
                  }
                }}
              >
                <Filter className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </TableHeadCell>
  )
}

// Table cell component (no longer draggable to avoid conflicts)
function DragAlongCell({ cell }: { cell: Cell<Entity, unknown> }) {
  const style: CSSProperties = {
    width: cell.column.columnDef.size,
    minWidth: cell.column.id === "_select" ? '40px' : '100px',
  }

  return (
    <TableCell 
      style={style} 
      className={cn(
        "py-1 text-xs text-gray-800 font-medium",
        cell.column.id === "_select" ? "px-0 w-[40px]" : "px-2"
      )}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  )
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
  // Early return BEFORE any hooks if column is null
  if (!column) {
    return null;
  }

  const [showCustomFilter, setShowCustomFilter] = useState(false)
  const [customFilterValue, setCustomFilterValue] = useState<any>(null)
  const initRef = useRef(false)
  
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
    if (showCustomFilter && !initRef.current) {
      initRef.current = true;
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
          case 'verification-checkbox':
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
  }, [showCustomFilter, column, fieldType])
  
  const handleResetFilter = () => {
    column?.setFilterValue(undefined)
    onClose()
  }

  const closeCustomFilter = () => {
    setShowCustomFilter(false)
    setCustomFilterValue(null)
    initRef.current = false
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
    closeCustomFilter()
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
    closeCustomFilter()
    onClose()
  }
  
  const handleClearCustomFilter = () => {
    column?.setFilterValue(undefined)
    closeCustomFilter()
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
            minWidth: 280,
            maxWidth: 360,
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
        // Smart Filter Panel
        <Box>
          <SmartFilterControl 
            column={column}
            schema={undefined}
            tableData={rows}
            onApply={(nf: NormalizedFilter) => {
              column?.setFilterValue(nf);
              onClose();
            }}
            onClose={onClose}
          />
        </Box>
      )}
    </Popover>
  )
}

export function EntityTable({ rows, config, onRowClick, visibleColumns, columnOrder: parentColumnOrder, onColumnOrderChange, customDocuments }: EntityTableProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Phone number masking state - tracks which phone fields are currently masked
  const [maskedPhones, setMaskedPhones] = useState<Set<string>>(new Set())

  // Helper function to get nested values (reuse the one from createColumns)
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Initialize phone masking when data changes - all phones start blurred
  useEffect(() => {
    const initialMasked = new Set<string>()
    rows.forEach(item => {
      config.columns.forEach(col => {
        if (col.type === 'phone') {
          const phoneValue = getNestedValue(item, col.path)
          if (phoneValue && String(phoneValue).trim()) {
            initialMasked.add(`${item.id || item.accountId}-${col.id}`)
          }
        }
      })
    })
    setMaskedPhones(initialMasked)
  }, [rows, config.columns])

  // Dialog states for bulk actions
  const [massChangesDialogOpen, setMassChangesDialogOpen] = useState(false)
  const [conversationOwnerDrawerOpen, setConversationOwnerDrawerOpen] = useState(false)
  const [retentionOwnerDrawerOpen, setRetentionOwnerDrawerOpen] = useState(false)
  const [currentAssignmentEntityId, setCurrentAssignmentEntityId] = useState<string>('')
  const [closePositionsDialogOpen, setClosePositionsDialogOpen] = useState(false)
  
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
  
  // Initialize column order from config or parent prop
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (parentColumnOrder) {
      return ['_select', ...parentColumnOrder]
    }
    const dynamicColumns = getFilteredColumnDefinitions(config.columns, customDocuments)
    return ['_select', ...dynamicColumns.map(col => col.id)]
  })

  // Update column order when parent column order changes
  useEffect(() => {
    if (parentColumnOrder) {
      setColumnOrder(['_select', ...parentColumnOrder])
    }
  }, [parentColumnOrder])
  
  // Column filter editor state

  
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
    localStorage.removeItem(`${config.storageKey}-columns`)
    localStorage.removeItem(`${config.storageKey}-table-state`)
    
    const initial: VisibilityState = {}
    initial['_select'] = true
    const dynamicColumns = getFilteredColumnDefinitions(config.columns, customDocuments)
    dynamicColumns.forEach((colDef, index) => {
      // Show all columns for positions page, first 20 for others to avoid horizontal overflow
      initial[colDef.id] = config.entityType === 'position' ? true : (index < 20)
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
    localStorage.setItem(`${config.storageKey}-table-state`, JSON.stringify(state))
  }, [columnOrder, sorting, columnFilters, config.storageKey])

  // Load sorting from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`${config.storageKey}-table-state`)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.sorting) setSorting(state.sorting)
        if (state.columnFilters) setColumnFilters(state.columnFilters)
        if (state.columnOrder && !parentColumnOrder) setColumnOrder(state.columnOrder)
      } catch {}
    }
  }, [config.storageKey])

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

  const columns = createColumns(config, onRowClick, customDocuments, maskedPhones, setMaskedPhones)

  const table = useReactTable({
    data: rows,
    columns,
    columnResizeMode: "onChange",
    getRowId: (row) => row.id || row.accountId || `row-${row.email}`,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnOrder,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableGlobalFilter: true,
  })

  // DnD sensors with proper activation constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require 10px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {})
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    // Only proceed if we have valid drag targets and they're different
    if (!active || !over || active.id === over.id) {
      return
    }
    
    const activeId = active.id as string
    const overId = over.id as string
    
    // Don't allow dragging the select column
    if (activeId === '_select' || overId === '_select') {
      return
    }
    
    const oldIndex = columnOrder.indexOf(activeId)
    const newIndex = columnOrder.indexOf(overId)
    
    // Ensure both columns exist in our order array
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex)
      setColumnOrder(newOrder)
      onColumnOrderChange?.(newOrder)
    }
  }

  // Bulk action handlers
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length
  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)

  const clearSelection = () => {
    setRowSelection({})
  }

  const handleAssign = () => {
    if (selectedRows.length === 1) {
      setCurrentAssignmentEntityId(selectedRows[0].id)
      // Open appropriate drawer based on entity type
      if (config.entityType === 'client') {
        setRetentionOwnerDrawerOpen(true)
      } else {
        setConversationOwnerDrawerOpen(true)
      }
    } else {
      toast.error(`Please select exactly one ${config.entityNameSingular} to assign.`)
    }
  }

  const handleMassChanges = () => {
    if (selectedRows.length > 0) {
      setMassChangesDialogOpen(true)
    } else {
      toast.error(`Please select at least one ${config.entityNameSingular} to make changes.`)
    }
  }

  // Handle close positions - show confirmation dialog
  const handleClosePositions = () => {
    if (selectedRows.length > 0) {
      const positionIds = selectedRows.map(row => row.position?.id).filter(Boolean)
      
      if (positionIds.length === 0) {
        toast.error('No valid positions found to close.')
        return
      }
      
      setClosePositionsDialogOpen(true)
    } else {
      toast.error(`Please select at least one position to close.`)
    }
  }

  // Calculate position summary for dialog
  const getPositionSummary = () => {
    const validPositions = selectedRows.filter(row => row.position?.id)
    const totalPnL = validPositions.reduce((sum, row) => {
      return sum + (row.position?.totalPnL || 0)
    }, 0)
    
    return {
      positions: validPositions.map(row => ({
        id: row.position.id,
        instrument: row.position.instrument,
        type: row.position.type,
        amount: row.position.amount,
        totalPnL: row.position.totalPnL || 0
      })),
      totalPnL,
      count: validPositions.length
    }
  }

  // Confirm close positions - actual closing logic
  const confirmClosePositions = async () => {
    try {
      const positionIds = selectedRows.map(row => row.position?.id).filter(Boolean)
      
      // Dispatch the close positions thunk
      // await dispatch(closeOpenPositions({ ids: positionIds })).unwrap() // Removed - positions feature deleted
      console.log('Position close action removed - positions feature deleted', positionIds)
      
      toast.success(
        `Successfully closed ${positionIds.length} position${positionIds.length === 1 ? '' : 's'}`
      )
      
      setClosePositionsDialogOpen(false)
      setRowSelection({}) // Clear selection
    } catch (error) {
      console.error('Close positions error:', error)
      toast.error('Failed to close positions')
      setClosePositionsDialogOpen(false)
    }
  }

  // Handle mass changes save
  const handleMassChangesSave = async (patch: Record<string, any>, clear: string[]) => {
    try {
      // Apply changes to all selected entities
      const entityIds = selectedRows.map(entity => entity.id)
      
      for (const entityId of entityIds) {
        // Apply patch fields
        for (const [field, value] of Object.entries(patch)) {
          dispatch(updateEntityField({
            id: entityId,
            key: field as keyof Entity,
            value: value
          }))
        }
        
        // Apply clear fields
        for (const field of clear) {
          dispatch(updateEntityField({
            id: entityId,
            key: field as keyof Entity,
            value: null
          }))
        }
      }
      
      const totalChanges = Object.keys(patch).length + clear.length
      toast.success(
        `Applied ${totalChanges} change${totalChanges === 1 ? '' : 's'} to ${selectedRows.length} ${config.entityNameSingular}${selectedRows.length === 1 ? '' : 's'}`
      )
      
      setMassChangesDialogOpen(false)
      setRowSelection({}) // Clear selection
    } catch (error) {
      console.error('Mass changes error:', error)
      toast.error('Failed to apply mass changes')
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
                label={`${selectedRowCount} ${config.entityNameSingular}${selectedRowCount === 1 ? '' : 's'} selected`}
                color="primary"
                size="small"
                sx={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 500
                }}
              />
              <Typography variant="body2" className="text-gray-600">
                Choose an action to apply to the selected {config.entityNamePlural}
              </Typography>
            </Box>
            
            <Box className="flex items-center gap-2">
              {config.entityType === 'position' ? (
                // Close Positions button for position entities
                <MUIButton
                  variant="contained"
                  startIcon={<Cancel />}
                  onClick={handleClosePositions}
                  size="small"
                  sx={{
                    backgroundColor: '#dc2626',
                    '&:hover': {
                      backgroundColor: '#b91c1c'
                    },
                    textTransform: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Close Positions
                </MUIButton>
              ) : (
                // Assign and Mass Changes for other entities
                <>
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
                </>
              )}

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
                      items={headerGroup.headers.map(h => h.column.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} onOpenFilterMenu={openFilterMenu} />
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
                      className={cn(
                        "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 h-8",
                        row.getIsSelected() 
                          ? "bg-blue-100 dark:bg-blue-900/20" 
                          : "bg-gray-50 dark:bg-gray-800"
                      )}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <DragAlongCell key={cell.id} cell={cell} />
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="bg-white border-b-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800" style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No {config.entityNamePlural} found.
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
      
      {/* Pagination Bar - fixed at bottom, full width - matches LeadsTable styling */}
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
            of {table.getFilteredRowModel().rows.length} {config.entityNamePlural}
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
        config={config}
      />

      {/* Conversation Owner Drawer */}
      <ConversationOwnerDrawer
        open={conversationOwnerDrawerOpen}
        onOpenChange={(open) => {
          setConversationOwnerDrawerOpen(open)
          if (!open) {
            setCurrentAssignmentEntityId('')
          }
        }}
        clientId={currentAssignmentEntityId}
      />

      {/* Retention Owner Drawer */}
      <RetentionOwnerDrawer
        open={retentionOwnerDrawerOpen}
        onOpenChange={(open) => {
          setRetentionOwnerDrawerOpen(open)
          if (!open) {
            setCurrentAssignmentEntityId('')
          }
        }}
        clientId={currentAssignmentEntityId}
      />

      {/* Close Positions Confirmation Dialog */}
      {config.entityType === 'position' && (
        <Dialog
          open={closePositionsDialogOpen}
          onClose={() => setClosePositionsDialogOpen(false)}
          aria-labelledby="close-positions-dialog-title"
          aria-describedby="close-positions-dialog-description"
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 10px 40px -12px rgba(0, 0, 0, 0.25)',
              width: '400px',
              maxWidth: '90vw'
            }
          }}
        >
          <DialogTitle 
            id="close-positions-dialog-title"
            sx={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 600,
              fontSize: '1.125rem',
              color: '#1e293b'
            }}
          >
            Close Positions Confirmation
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#ffffff' }}>
            <DialogContentText 
              id="close-positions-dialog-description"
              sx={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', mt: 3, mb: 3 }}
            >
              Are you sure you want to close {(() => {
                const summary = getPositionSummary()
                return summary.count
              })()} position{(() => {
                const summary = getPositionSummary()
                return summary.count === 1 ? '' : 's'
              })()}?
            </DialogContentText>
            
            {(() => {
              const summary = getPositionSummary()
              return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {/* Total P&L */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      backgroundColor: summary.totalPnL >= 0 ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${summary.totalPnL >= 0 ? '#bbf7d0' : '#fecaca'}`,
                      borderRadius: '8px',
                      py: 2,
                      px: 3,
                      minWidth: '180px',
                      maxWidth: '250px'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total P&L
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          color: summary.totalPnL >= 0 ? '#059669' : '#dc2626',
                          fontSize: '1.5rem'
                        }}
                      >
                        ${summary.totalPnL.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )
            })()}
          </DialogContent>
          <DialogActions 
            sx={{ 
              backgroundColor: '#f8fafc', 
              borderTop: '1px solid #e2e8f0',
              gap: '8px',
              pt: 2,
              pb: 2,
              px: 3
            }}
          >
            <MUIButton
              onClick={() => setClosePositionsDialogOpen(false)}
              variant="outlined"
              sx={{
                color: '#475569',
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af'
                },
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px'
              }}
            >
              Cancel
            </MUIButton>
            <MUIButton
              onClick={confirmClosePositions}
              variant="contained"
              sx={{
                backgroundColor: '#dc2626',
                '&:hover': {
                  backgroundColor: '#b91c1c'
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.25)'
              }}
            >
              Yes, Close Positions
            </MUIButton>
          </DialogActions>
        </Dialog>
      )}
    </div>
  )
}

// Tri-state field row component for mass changes
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
    const unifiedFields = ['leadStatus', 'leadSource', 'kycStatus', 'paymentGateway', 'accountType', 'desk', 'gender', 'conversationOwner']
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
      

      
      case 'citizen':
        // Reuse countries for citizen field
        return COUNTRIES.map(country => ({ 
          label: country.name, 
          value: country.name 
        }))
      

      
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

  // Enhanced styling to match modern ColumnsDrawer design
  const financeInputStyle = {
    fontFamily: 'Poppins, sans-serif',
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9fafb',
      borderRadius: 3,
      border: '2px solid #e2e8f0',
      fontSize: '0.875rem',
      fontFamily: 'Poppins, sans-serif',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transform: 'translateY(-1px)',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        transform: 'translateY(-1px)',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 16px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      color: '#374151',
      fontSize: '0.875rem',
      '&::placeholder': {
        color: '#94a3b8',
        opacity: 1,
        fontWeight: 400,
      },
    },
    '& .MuiSelect-select': {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      color: '#374151',
      fontSize: '0.875rem',
      padding: '12px 16px',
    },
    '& .MuiSelect-icon': {
      color: '#64748b',
      fontSize: '1.25rem',
      transition: 'transform 0.2s ease-in-out',
    },
    '& .MuiSelect-iconOpen': {
      transform: 'rotate(180deg)',
    },
  }

  // Disabled field styling
  const disabledInputStyle = {
    ...financeInputStyle,
    '& .MuiOutlinedInput-root': {
      ...financeInputStyle['& .MuiOutlinedInput-root'],
      backgroundColor: '#f8fafc',
      borderColor: '#e5e7eb',
      transform: 'none !important',
      '&:hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#e5e7eb',
        boxShadow: 'none',
        transform: 'none !important',
      },
    },
    '& .MuiInputBase-input': {
      ...financeInputStyle['& .MuiInputBase-input'],
      color: '#94a3b8',
      fontWeight: 400,
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
        
        return (
          <FormControl fullWidth>
            <MUISelect
              value={value || ''}
              onChange={(e) => onValueChange(e.target.value)}
              displayEmpty
              size="small"
              sx={financeInputStyle}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: '#374151',
                      py: 1.5,
                      px: 2,
                      margin: '2px 6px',
                      borderRadius: 2,
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        color: '#1e293b',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#dbeafe',
                        },
                      },
                    },
                  },
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
              <MenuItem value="" sx={{ fontStyle: 'italic', color: '#9ca3af !important' }}>
                Select value...
              </MenuItem>
              {options.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: value === opt.value ? '#3b82f6' : '#e2e8f0',
                        transition: 'background-color 0.15s ease-in-out',
                      }}
                    />
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </MUISelect>
          </FormControl>
        )
      
      case 'boolean':
      case 'verification-checkbox':
        return (
          <FormControl fullWidth>
            <MUISelect
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => onValueChange(e.target.value === 'true')}
              displayEmpty
              size="small"
              sx={financeInputStyle}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: '#374151',
                      py: 1.5,
                      px: 2,
                      margin: '2px 6px',
                      borderRadius: 2,
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        color: '#1e293b',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#dbeafe',
                        },
                      },
                    },
                  },
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
              <MenuItem value="" sx={{ fontStyle: 'italic', color: '#9ca3af !important' }}>
                Select value...
              </MenuItem>
              <MenuItem value="true">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: value === true ? '#10b981' : '#e2e8f0',
                      transition: 'background-color 0.15s ease-in-out',
                    }}
                  />
                  Yes
                </Box>
              </MenuItem>
              <MenuItem value="false">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: value === false ? '#ef4444' : '#e2e8f0',
                      transition: 'background-color 0.15s ease-in-out',
                    }}
                  />
                  No
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
            placeholder="Enter number..."
            fullWidth
            size="small"
            sx={financeInputStyle}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: '#64748b', fontSize: '0.875rem', mr: 0.5 }}>
                  #
                </Box>
              ),
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
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={financeInputStyle}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: '#64748b', fontSize: '0.875rem', mr: 0.5 }}>
                  📅
                </Box>
              ),
            }}
          />
        )
      
      default:
        return (
          <TextField
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Enter value..."
            fullWidth
            size="small"
            sx={financeInputStyle}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: '#64748b', fontSize: '0.875rem', mr: 0.5 }}>
                  ✏️
                </Box>
              ),
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
      <Box className="col-span-4 flex gap-1.5">
        <MUIButton
          size="small"
          variant={mode === 'none' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('none')}
          sx={{ 
            minWidth: '75px', 
            height: '32px',
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 2,
            border: mode === 'none' ? 'none' : '1px solid #e2e8f0',
            color: mode === 'none' ? 'white' : '#64748b',
            backgroundColor: mode === 'none' ? '#64748b' : '#ffffff',
            boxShadow: mode === 'none' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: mode === 'none' ? '#475569' : '#f8fafc',
              borderColor: mode === 'none' ? '#475569' : '#cbd5e1',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Skip
        </MUIButton>
        <MUIButton
          size="small"
          variant={mode === 'set' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('set')}
          sx={{ 
            minWidth: '55px', 
            height: '32px',
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 2,
            border: mode === 'set' ? 'none' : '1px solid #3b82f6',
            color: mode === 'set' ? 'white' : '#3b82f6',
            backgroundColor: mode === 'set' ? '#3b82f6' : '#ffffff',
            boxShadow: mode === 'set' ? '0 2px 4px rgba(59, 130, 246, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: mode === 'set' ? '#2563eb' : '#eff6ff',
              borderColor: mode === 'set' ? '#2563eb' : '#2563eb',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(-1px)',
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
            minWidth: '55px', 
            height: '32px',
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 2,
            border: mode === 'clear' ? 'none' : '1px solid #ef4444',
            color: mode === 'clear' ? 'white' : '#ef4444',
            backgroundColor: mode === 'clear' ? '#ef4444' : '#ffffff',
            boxShadow: mode === 'clear' ? '0 2px 4px rgba(239, 68, 68, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: mode === 'clear' ? '#dc2626' : '#fef2f2',
              borderColor: mode === 'clear' ? '#dc2626' : '#fecaca',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              transform: 'translateY(-1px)',
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

// Mass Changes Dialog Component
function MassChangesDialog({ open, onClose, selectedRows, onSave, customDocuments, config }: MassChangesDialogProps) {
  const [fieldStates, setFieldStates] = useState<Record<string, TriStateFieldValue>>({})
  
  const editableFields = useMemo(() => getEditableFields(config, customDocuments), [config, customDocuments])
  
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
                Apply updates to {selectedRows.length} {config.entityNameSingular}{selectedRows.length === 1 ? '' : 's'}
              </Typography>
              
              {/* Selected entities summary */}
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
            🚀 Apply Changes to {selectedRows.length} {config.entityNameSingular}{selectedRows.length === 1 ? '' : 's'}
          </MUIButton>
        </Box>
      </Box>
    </Dialog>
  )
}