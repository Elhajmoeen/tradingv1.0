import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Columns, SquaresFour } from '@phosphor-icons/react'
import { selectEntitiesByType, Entity, selectGlobalCustomDocuments, upsertMany } from '@/state/entitiesSlice'
import { PageWithHeader } from '@/components/PageWithHeader'
import { ListHeaderBar } from '@/components/ListHeaderBar'
import { EntityTable, type EntityTableConfig } from '@/components/EntityTable'
import { ColumnsDrawer } from '@/components/ColumnsDrawer'
import { NewLeadDrawer } from '@/components/NewLeadDrawer'
import { ImportLeadsModal } from '@/components/ImportLeadsModal'
import { FilterDrawer } from '@/components/leads/FilterDrawer'
import { ViewsMenu } from '@/components/ViewsMenu'
import { Button as MUIButton } from '@mui/material'
import type { AppDispatch } from '@/state/store'
import { 
  leadColumnDefinitions, 
  getDefaultVisibleColumns, 
  getAllColumnsVisible, 
  getAllColumnsHidden,
  getFilteredLeadColumnDefinitions 
} from '@/config/columns'
import { convertToFilterColumnDefs } from '@/components/leads/columnAdapter'
import { 
  FilterState, 
  ViewConfig, 
  applyFilters,
  loadSavedViews,
  saveSavedViews 
} from '@/components/leads/filters'
import { 
  useColumnViews,
  ColumnView,
  updateColumnView,
  deleteColumnView,
  getFavoriteView 
} from '@/features/tableViews/columnViewsSlice'

// Storage key for column visibility preferences
const STORAGE_KEY = 'leads.columns.v2'

// Helper function to get nested values from objects
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export default function LeadsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [newLeadDrawerOpen, setNewLeadDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  
  // Saved views state
  const [savedViews, setSavedViews] = useState<ViewConfig[]>(() => loadSavedViews())
  
  // Column Views (new system)
  const tableId = 'table.leads.v1'
  const columnViews = useColumnViews(tableId)
  const [viewsRefreshKey, setViewsRefreshKey] = useState(0)
  
  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    // When no saved state exists, return empty object (will be set properly in useEffect)
    return {}
  })

  // Column order state with localStorage persistence
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const orderKey = `${STORAGE_KEY}.order`
    const saved = localStorage.getItem(orderKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    // Default order is the same as leadColumnDefinitions
    return leadColumnDefinitions.map(col => col.id)
  })
  
  // Persist column visibility to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns])

  // Persist column order to localStorage
  useEffect(() => {
    const orderKey = `${STORAGE_KEY}.order`
    localStorage.setItem(orderKey, JSON.stringify(columnOrder))
  }, [columnOrder])

  // Auto-load favorite view when component mounts
  useEffect(() => {
    const favoriteView = getFavoriteView(tableId)
    if (favoriteView) {
      console.log('Loading favorite view:', favoriteView.name)
      
      // Apply favorite view's column configuration
      const newVisibleColumns: Record<string, boolean> = {}
      
      // Hide all columns first
      leadColumnDefinitions.forEach(col => {
        newVisibleColumns[col.id] = false
      })
      
      // Show only the columns in the favorite view
      favoriteView.selectedColumnIds.forEach(colId => {
        newVisibleColumns[colId] = true
      })
      
      setVisibleColumns(newVisibleColumns)
      setColumnOrder(favoriteView.columnOrder)
    }
  }, [tableId]) // Only run once on mount
  
  // Fetch leads from store
  const dispatch = useDispatch<AppDispatch>()
  const leads = useSelector(selectEntitiesByType('lead'))
  const customDocuments = useSelector(selectGlobalCustomDocuments)
  
  // Convert custom documents to the format needed for columns
  const customDocumentColumns = useMemo(() => 
    customDocuments.map(doc => ({ id: doc.id, label: doc.name })), 
    [customDocuments]
  )

  // Initialize visible columns when customDocumentColumns is available
  useEffect(() => {
    // Only set if we don't have any visible columns yet (empty object)
    if (Object.keys(visibleColumns).length === 0) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        // Set default visible columns when no saved state exists
        setVisibleColumns(getAllColumnsVisible(customDocumentColumns))
      }
    }
  }, [customDocumentColumns, visibleColumns])

  // EntityTable configuration for leads
  const leadsTableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'lead',
    entityNameSingular: 'lead',
    entityNamePlural: 'leads',
    columns: leadColumnDefinitions,
    storageKey: 'leads'
  }), [])

  // Convert columns for the filter system with dynamic options from actual data
  const filterColumns = useMemo(() => {
    return convertToFilterColumnDefs(getFilteredLeadColumnDefinitions(customDocumentColumns), leads)
  }, [leads])

  // Filter leads based on search query and filter state
  const filteredLeads = useMemo(() => {
    let result = leads

    // Apply search query filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter(lead => {
        const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'accountId']
        return searchFields.some(field => {
          const value = getNestedValue(lead, field)
          return value && String(value).toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply filter state
    if (filterState.conditions.length > 0) {
      result = applyFilters(result, filterState, filterColumns)
    }

    return result
  }, [leads, query, filterState, filterColumns])

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

  const handleSelectAllColumns = () => {
    setVisibleColumns(getAllColumnsVisible(customDocumentColumns))
  }

  const handleClearAllColumns = () => {
    setVisibleColumns(getAllColumnsHidden(customDocumentColumns))
  }

  const handleResetToDefault = () => {
    setVisibleColumns(getDefaultVisibleColumns(customDocumentColumns))
  }

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder)
  }

  // Saved views handlers
  const handleSaveCurrentView = (name: string) => {
    const visibleColumnIds = Object.entries(visibleColumns)
      .filter(([_, visible]) => visible)
      .map(([columnId]) => columnId)

    const newView: ViewConfig = {
      id: `view-${Date.now()}`,
      name,
      filterState: { ...filterState },
      visibleColumnIds
    }

    const updatedViews = [...savedViews, newView]
    setSavedViews(updatedViews)
    saveSavedViews(updatedViews)
  }

  const handleApplyView = (view: ViewConfig) => {
    // Apply filters
    setFilterState({ ...view.filterState })
    
    // Apply column visibility
    const newVisibleColumns = getAllColumnsHidden(customDocumentColumns)
    view.visibleColumnIds.forEach(columnId => {
      newVisibleColumns[columnId] = true
    })
    setVisibleColumns(newVisibleColumns)
  }

  const handleRenameView = (viewId: string, newName: string) => {
    const updatedViews = savedViews.map(view =>
      view.id === viewId ? { ...view, name: newName } : view
    )
    setSavedViews(updatedViews)
    saveSavedViews(updatedViews)
  }

  const handleDeleteView = (viewId: string) => {
    const updatedViews = savedViews.filter(view => view.id !== viewId)
    setSavedViews(updatedViews)
    saveSavedViews(updatedViews)
  }

  const handleViewsChanged = (views: ViewConfig[]) => {
    setSavedViews(views)
  }

  const handleViewSaved = () => {
    // Refresh the views menu when a new view is saved
    setViewsRefreshKey(prev => prev + 1)
  }

  // Generate CSV export data with only visible columns
  // Export current displayed data to CSV
  const handleExport = () => {
    const filteredColumnDefs = getFilteredLeadColumnDefinitions(customDocumentColumns)
    const visibleColumnDefs = filteredColumnDefs.filter(col => visibleColumns[col.id])
    
    if (visibleColumnDefs.length === 0) {
      console.warn('No visible columns to export')
      return
    }

    // Create CSV headers
    const headers = visibleColumnDefs.map(col => col.header)
    
    // Create CSV rows from filtered leads (all rows, not just current page)
    const rows = filteredLeads.map(lead => {
      return visibleColumnDefs.map(col => {
        const value = getNestedValue(lead, col.path)
        // Handle different data types for CSV
        if (value === null || value === undefined) return ''
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (col.type === 'date' || col.type === 'datetime') {
          return value ? new Date(String(value)).toISOString() : ''
        }
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
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Import leads from uploaded file
  const handleImport = async (importedLeads: Entity[]) => {
    try {
      // Use existing Redux action to add leads
      dispatch(upsertMany(importedLeads))
      
      // Show success message (you can add a toast notification here)
      console.log(`Successfully imported ${importedLeads.length} leads`)
      
      // Note: We don't reset filters or table state to preserve user's view
    } catch (error) {
      console.error('Failed to import leads:', error)
      throw error
    }
  }

  const handleActions = {
    onNew: () => setNewLeadDrawerOpen(true),
    onFilter: () => {
      setFilterDrawerOpen(true)
    },
    filtersActive: filterState.conditions.length > 0,
    onColumns: () => {
      // Columns drawer will handle this via the ColumnsDrawer component
    },
    onImport: () => setImportModalOpen(true),
    onExport: handleExport
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
          onSearch={setQuery}
          actions={handleActions}
          entityNamePlural="leads"
          viewsMenu={
            <ViewsMenu
              views={columnViews.views}
              currentViewId={columnViews.activeViewId}
              onApplyView={(view) => {
                // Apply the column view - set visible columns and order
                const newVisibleColumns = getAllColumnsHidden(customDocumentColumns)
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
              columns={leadColumnDefinitions}
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
          rows={filteredLeads} 
          config={leadsTableConfig}
          onRowClick={handleRowClick}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
          customDocuments={customDocumentColumns}
        />
      </div>

      {/* New Lead Drawer */}
      <NewLeadDrawer 
        open={newLeadDrawerOpen} 
        onOpenChange={setNewLeadDrawerOpen} 
      />

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
        onViewSaved={handleViewSaved}
      />

      {/* Import Leads Modal */}
      <ImportLeadsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  )
}