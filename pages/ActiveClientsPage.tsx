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
import { 
  clientColumnDefinitions, 
  getFilteredClientColumnDefinitions 
} from '@/config/clientColumns'
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

// Storage key for column visibility preferences
const STORAGE_KEY = 'clients.columns.v2'

// Helper function to get nested values from objects
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export default function ActiveClientsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  
  // Column Views (new system)
  const clientTableId = 'table.clients.v1'
  const columnViews = useColumnViews(clientTableId)
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
    // Default: show columns marked as defaultVisible
    return Object.fromEntries(
      clientColumnDefinitions.map(col => [col.id, col.defaultVisible ?? false])
    )
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
    return clientColumnDefinitions.map(col => col.id)
  })

  // Get clients data
  const clients = useSelector(selectEntitiesByType('client'))
  const dispatch = useDispatch<AppDispatch>()

  // Get custom document columns
  const customDocuments = useSelector(selectGlobalCustomDocuments)
  const customDocumentColumns = useMemo(() => {
    return customDocuments.map(doc => ({
      id: `custom.${doc.id}`,
      header: doc.name,
      path: `documents.${doc.id}`,
      type: 'text' as const,
      defaultVisible: false
    }))
  }, [customDocuments])

  // Format custom documents for EntityTable
  const customDocumentsForTable = useMemo(() => {
    return customDocuments.map(doc => ({
      id: doc.id,
      label: doc.name
    }))
  }, [customDocuments])

  // EntityTable configuration for clients
  const clientsTableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'client',
    entityNameSingular: 'client', 
    entityNamePlural: 'clients',
    columns: clientColumnDefinitions,
    storageKey: 'clients'
  }), [])

  // All available columns including custom documents
  const allColumnDefinitions = useMemo(() => {
    return [...clientColumnDefinitions, ...customDocumentColumns]
  }, [customDocumentColumns])

  // Auto-load favorite view when component mounts
  useEffect(() => {
    const favoriteView = getFavoriteView(clientTableId)
    if (favoriteView) {
      console.log('Loading favorite view for clients:', favoriteView.name)
      
      // Apply favorite view's column configuration
      const newVisibleColumns: Record<string, boolean> = {}
      
      // Hide all columns first
      clientColumnDefinitions.forEach(col => {
        newVisibleColumns[col.id] = false
      })
      
      // Show only the columns in the favorite view
      favoriteView.selectedColumnIds.forEach(colId => {
        newVisibleColumns[colId] = true
      })
      
      setVisibleColumns(newVisibleColumns)
      setColumnOrder(favoriteView.columnOrder)
    }
  }, [clientTableId]) // Only run once on mount

  // Filter column definitions for the filter drawer
  const filterColumns = useMemo(() => {
    return convertToFilterColumnDefs(getFilteredClientColumnDefinitions())
  }, [])

  // Apply search filter
  const searchFilteredClients = useMemo(() => {
    if (!query.trim()) return clients
    
    const searchTerm = query.toLowerCase().trim()
    return clients.filter((client: Entity) => {
      // Search in common text fields
      const searchableFields = [
        'accountId', 'firstName', 'lastName', 'email', 'phoneNumber', 
        'accountType', 'status', 'salesManager', 'accountManager', 'desk'
      ]
      
      return searchableFields.some(field => {
        const value = getNestedValue(client, field)
        return value && String(value).toLowerCase().includes(searchTerm)
      })
    })
  }, [clients, query])

  // Apply advanced filters
  const filteredClients = useMemo(() => {
    return applyFilters(searchFilteredClients, filterState, filterColumns)
  }, [searchFilteredClients, filterState, filterColumns])

  // Action handlers
  const handleActions = {
    onExport: () => console.log('Export clicked'),
    onFilter: () => setFilterDrawerOpen(true)
  }

  // Column management handlers
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    const newVisibleColumns = { ...visibleColumns, [columnId]: visible }
    setVisibleColumns(newVisibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibleColumns))
  }

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder)
    localStorage.setItem(`${STORAGE_KEY}.order`, JSON.stringify(newOrder))
  }

  const handleSelectAllColumns = () => {
    const allVisible = Object.fromEntries(
      allColumnDefinitions.map(col => [col.id, true])
    )
    setVisibleColumns(allVisible)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisible))
  }

  const handleClearAllColumns = () => {
    const allHidden = Object.fromEntries(
      allColumnDefinitions.map(col => [col.id, false])
    )
    setVisibleColumns(allHidden)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHidden))
  }

  const handleResetToDefault = () => {
    const defaultVisible = Object.fromEntries(
      allColumnDefinitions.map(col => [col.id, col.defaultVisible ?? false])
    )
    setVisibleColumns(defaultVisible)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisible))
    
    const defaultOrder = allColumnDefinitions.map(col => col.id)
    setColumnOrder(defaultOrder)
    localStorage.setItem(`${STORAGE_KEY}.order`, JSON.stringify(defaultOrder))
  }

  // Row click handler
  const handleRowClick = (row: Entity) => {
    navigate(`/clients/${row.id}`)
  }



  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
          onSearch={setQuery}
          actions={handleActions}
          entityNamePlural="clients"
          viewsMenu={
            <ViewsMenu
              views={columnViews.views}
              currentViewId={columnViews.activeViewId}
              onApplyView={(view: ColumnView) => {
                // Apply the column view - set visible columns and order
                const newVisibleColumns: Record<string, boolean> = {}
                // Hide all columns first
                clientColumnDefinitions.forEach(col => {
                  newVisibleColumns[col.id] = false
                })
                // Show only the columns in the view
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
              columns={allColumnDefinitions}
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onColumnOrderChange={handleColumnOrderChange}
              onSelectAll={handleSelectAllColumns}
              onClearAll={handleClearAllColumns}
              onResetToDefault={handleResetToDefault}
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
          rows={filteredClients} 
          config={clientsTableConfig}
          onRowClick={handleRowClick}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
          customDocuments={customDocumentsForTable}
        />
      </div>



      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        columns={filterColumns}
        filterState={filterState}
        onApply={setFilterState}
        tableId="table.clients.v1"
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onViewSaved={() => {
          console.log('View saved in Active Clients');
        }}
      />


    </div>
  )
}