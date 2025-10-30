import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Columns, SquaresFour } from '@phosphor-icons/react'
import { selectEntitiesByType, Entity, selectGlobalCustomDocuments, upsertMany } from '@/state/entitiesSlice'
import { ListHeaderBar } from '@/components/ListHeaderBar'
import { EntityTable, type EntityTableConfig } from '@/components/EntityTable'
import { ColumnsDrawer } from '@/components/ColumnsDrawer'
import { FilterDrawer } from '@/components/leads/FilterDrawer'
import { ViewsMenu } from '@/components/ViewsMenu'
import { Button as MUIButton } from '@mui/material'
import type { AppDispatch } from '@/state/store'
import { convertToFilterColumnDefs } from '@/components/leads/columnAdapter'
import { 
  FilterState, 
  applyFilters
} from '@/components/leads/filters'
import { 
  useColumnViews,
  ColumnView,
  getFavoriteView 
} from '@/features/tableViews/columnViewsSlice'
import { complianceColumnDefinitions, getFilteredComplianceColumnDefinitions } from '@/config/complianceColumns'

// Storage key for column visibility preferences
const STORAGE_KEY = 'compliance.columns.v2'

// Helper function to get nested values from objects
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export default function CompliancePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  
  // Column Views (new system)
  const tableId = 'table.compliance.v1'
  const columnViews = useColumnViews(tableId)
  const [viewsRefreshKey, setViewsRefreshKey] = useState(0)
  
  // Column visibility and order state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // If parsing fails, fall back to defaults
      }
    }
    // Default: show key compliance columns
    return {
      accountId: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      kycStatus: true,
      desk: true,
      salesManager: true,
      country: true,
      idPassportUpload: true,
      proofOfAddressUpload: true,
      creditCardFrontUpload: true,
      creditCardBackUpload: true
    }
  })
  
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}.order`)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // If parsing fails, fall back to defaults
      }
    }
    return complianceColumnDefinitions.map(col => col.id)
  })

  // Get client entities for compliance view
  const clientEntities = useSelector(selectEntitiesByType('client'))
  const dispatch = useDispatch<AppDispatch>()

  // Get custom documents for column configuration
  const customDocuments = useSelector(selectGlobalCustomDocuments)
  const customDocumentColumns = useMemo(() => {
    return customDocuments.map(doc => ({
      id: doc.id,
      label: doc.name
    }))
  }, [customDocuments])

  // Persist column settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}.order`, JSON.stringify(columnOrder))
  }, [columnOrder])

  // Auto-load favorite view when component mounts
  useEffect(() => {
    const favoriteView = getFavoriteView(tableId)
    if (favoriteView) {
      console.log('Loading favorite view:', favoriteView.name)
      
      // Apply favorite view's column configuration
      const newVisibleColumns: Record<string, boolean> = {}
      
      // Hide all columns first
      complianceColumnDefinitions.forEach(col => {
        newVisibleColumns[col.id] = false
      })
      
      // Show only the columns in the favorite view
      favoriteView.selectedColumnIds.forEach(colId => {
        newVisibleColumns[colId] = true
      })
      
      setVisibleColumns(newVisibleColumns)
      setColumnOrder(favoriteView.columnOrder)
    }
  }, [tableId])

  // EntityTable configuration for compliance
  const complianceTableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'client',
    entityNameSingular: 'compliance record',
    entityNamePlural: 'compliance records',
    columns: complianceColumnDefinitions,
    storageKey: 'compliance'
  }), [])

  // Convert columns for the filter system
  const filterColumns = useMemo(() => {
    return convertToFilterColumnDefs(complianceColumnDefinitions, clientEntities)
  }, [clientEntities])

  // Filter compliance data based on search query and filter state
  const filteredRows = useMemo(() => {
    let result = clientEntities

    // Apply search query filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter(row => {
        const searchFields = ['firstName', 'lastName', 'email', 'phone', 'accountId', 'salesManager', 'conversationOwner']
        return searchFields.some(field => {
          const value = getNestedValue(row, field)
          return value && String(value).toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply filter state
    if (filterState.conditions.length > 0) {
      result = applyFilters(result, filterState, filterColumns)
    }

    return result
  }, [clientEntities, query, filterState, filterColumns])

  // Handle row click to navigate to client detail
  const handleRowClick = (row: Entity) => {
    navigate(`/clients/${row.id}`)
  }

  // Column management functions
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: visible
    }))
  }

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder)
  }

  // Export current displayed data to CSV
  const handleExport = () => {
    const columnDefs = complianceColumnDefinitions
    const visibleColumnDefs = columnDefs.filter(col => visibleColumns[col.id])
    
    if (visibleColumnDefs.length === 0) {
      console.warn('No visible columns to export')
      return
    }

    // Create CSV headers
    const headers = visibleColumnDefs.map(col => col.header)
    
    // Create CSV rows from filtered data
    const rows = filteredRows.map(row => {
      return visibleColumnDefs.map(col => {
        const value = getNestedValue(row, col.path)
        // Handle different data types for CSV
        if (value === null || value === undefined) return ''
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return String(value).replace(/,/g, ';') // Replace commas to avoid CSV issues
      })
    })
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `compliance-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleActions = {
    onFilter: () => setFilterDrawerOpen(true),
    filtersActive: filterState.conditions.length > 0,
    onExport: handleExport
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
          onSearch={setQuery}
          actions={handleActions}
          entityNamePlural="compliance records"
          viewsMenu={
            <ViewsMenu
              views={columnViews.views}
              currentViewId={columnViews.activeViewId}
              onApplyView={(view) => {
                // Apply the column view - set visible columns and order
                const newVisibleColumns: Record<string, boolean> = {}
                complianceColumnDefinitions.forEach(col => {
                  newVisibleColumns[col.id] = false
                })
                view.selectedColumnIds.forEach(columnId => {
                  newVisibleColumns[columnId] = true
                })
                setVisibleColumns(newVisibleColumns)
                setColumnOrder(view.columnOrder)
                
                // Set as active view
                columnViews.setActiveView(view.id)
              }}
              onRenameView={(viewId, newName) => {
                columnViews.updateView(viewId, { name: newName })
                setViewsRefreshKey(prev => prev + 1)
              }}
              onDeleteView={(viewId) => {
                columnViews.deleteView(viewId)
                setViewsRefreshKey(prev => prev + 1)
              }}
              onSetFavorite={(viewId) => {
                columnViews.setFavorite(viewId)
                setViewsRefreshKey(prev => prev + 1)
              }}
              refreshKey={viewsRefreshKey}
            >
              <MUIButton 
                variant="outlined"
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '0.5rem',
                  textTransform: 'none',
                  gap: 0.5,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <SquaresFour size={12} />
                Views
              </MUIButton>
            </ViewsMenu>
          }
          columnsDrawer={
            <ColumnsDrawer
              columns={complianceColumnDefinitions}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onColumnOrderChange={handleColumnOrderChange}
              onSelectAll={() => {
                const allVisible = complianceColumnDefinitions.reduce((acc, col) => {
                  acc[col.id] = true
                  return acc
                }, {} as Record<string, boolean>)
                setVisibleColumns(allVisible)
              }}
              onClearAll={() => {
                const allHidden = complianceColumnDefinitions.reduce((acc, col) => {
                  acc[col.id] = false
                  return acc
                }, {} as Record<string, boolean>)
                setVisibleColumns(allHidden)
              }}
              onResetToDefault={() => {
                const defaultVisible = complianceColumnDefinitions.slice(0, 20).reduce((acc, col) => {
                  acc[col.id] = true
                  return acc
                }, {} as Record<string, boolean>)
                setVisibleColumns(defaultVisible)
              }}
            >
              <MUIButton 
                variant="outlined"
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '0.5rem',
                  textTransform: 'none',
                  gap: 0.5,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Columns size={12} />
                Columns
              </MUIButton>
            </ColumnsDrawer>
          }
        />
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <EntityTable 
          rows={filteredRows} 
          config={complianceTableConfig}
          onRowClick={handleRowClick}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
          customDocuments={customDocumentColumns}
        />
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        columns={filterColumns}
        filterState={filterState}
        onApply={setFilterState}
        tableId={tableId}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onViewSaved={() => {
          console.log('View saved in Compliance')
        }}
      />
    </div>
  )
}
