import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { EntityTable, type EntityTableConfig } from '@/components/EntityTable'
import { ListHeaderBar } from '@/components/ListHeaderBar'
import { ColumnsDrawer, type ColumnDefinition } from '@/components/ColumnsDrawer'
import { ViewsMenu } from '@/components/ViewsMenu'
import { FilterDrawer } from '@/components/leads/FilterDrawer'
import { selectTransactionEntityRows } from '@/state/transactionsSlice'
import { transactionsEntityColumns } from '@/config/transactionColumns'
import { loadViewsForTable, saveViewsForTable } from '@/features/tableViews/columnViewsSlice'
import { convertToFilterColumnDefs } from '@/components/leads/columnAdapter'
import type { RootState } from '@/state/store'
import type { ColumnView } from '@/features/tableViews/columnViewsSlice'
import type { FilterState } from '@/components/leads/filters'
import { applyFilters } from '@/components/leads/filters'
import { Button as MUIButton } from '@mui/material'
import { SquaresFour } from '@phosphor-icons/react'

export default function TransactionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [viewsRefreshKey, setViewsRefreshKey] = useState(0)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  
  // Views management
  const tableId = 'transactions'
  const [savedViews, setSavedViews] = useState<ColumnView[]>(() => loadViewsForTable(tableId))
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  
  // Get joined data from selector - aggregate all clients' transactions
  const rows = useSelector((state: RootState) => 
    selectTransactionEntityRows(state)
  )

  // Filter by search term and filter rules
  const filteredRows = useMemo(() => {
    let result = rows
    
    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim()
      result = result.filter((row: any) => {
        const searchableFields = [
          'accountId', 'firstName', 'lastName', 'email', 'transactionType', 
          'description', 'paymentMethod', 'createdBy'
        ]
        
        return searchableFields.some(field => {
          const value = row[field]
          return value && String(value).toLowerCase().includes(searchTerm)
        })
      })
    }
    
    // Apply filter conditions using the generic filter system
    if (filterState.conditions.length > 0) {
      // Convert transaction columns to filter column definitions
      const filterColumns = convertToFilterColumnDefs(transactionsEntityColumns.map(col => ({
        ...col,
        defaultVisible: col.defaultVisible ?? true,
        isCustomDocument: false
      })))
      result = applyFilters(result, filterState, filterColumns)
    }
    
    return result
  }, [rows, search, filterState])

  // EntityTable configuration - using ALL columns (profile + transaction fields)
  const tableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'transaction',
    entityNameSingular: 'transaction',
    entityNamePlural: 'transactions',
    columns: transactionsEntityColumns,
    storageKey: 'global.transactions'
  }), [])

  // Convert EntityColumnDefinition to ColumnDefinition for ColumnsDrawer compatibility
  const columnsDrawerColumns: ColumnDefinition[] = useMemo(() => 
    transactionsEntityColumns.map(col => ({
      ...col,
      defaultVisible: col.defaultVisible ?? true,
      isCustomDocument: false
    })), [])

  // Initialize column visibility and order - default visible only
  const getDefaultVisibleColumns = () => {
    const result: Record<string, boolean> = {}
    transactionsEntityColumns.forEach(col => {
      result[col.id] = col.defaultVisible
    })
    return result
  }

  const getAllColumnsVisible = () => {
    const result: Record<string, boolean> = {}
    transactionsEntityColumns.forEach(col => {
      result[col.id] = true
    })
    return result
  }

  const getAllColumnsHidden = () => {
    const result: Record<string, boolean> = {}
    transactionsEntityColumns.forEach(col => {
      result[col.id] = false
    })
    return result
  }

  // Initialize states on mount
  React.useEffect(() => {
    if (Object.keys(visibleColumns).length === 0) {
      setVisibleColumns(getDefaultVisibleColumns())
    }
    if (columnOrder.length === 0) {
      setColumnOrder(transactionsEntityColumns.map(col => col.id))
    }
  }, [])

  // Export function
  const handleExport = () => {
    const visibleCols = transactionsEntityColumns.filter(col => visibleColumns[col.id])
    const headers = visibleCols.map(col => col.header).join(',')
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers + "\n"
      + filteredRows.map(row => 
          visibleCols.map(col => {
            const value = row[col.path] || ''
            return `"${String(value).replace(/"/g, '""')}"` // Escape quotes
          }).join(",")
        ).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transactions-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Column management functions
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns(prev => ({ ...prev, [columnId]: visible }))
  }

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder)
  }

  const handleSelectAllColumns = () => {
    setVisibleColumns(getAllColumnsVisible())
  }

  const handleClearAllColumns = () => {
    setVisibleColumns(getAllColumnsHidden())
  }

  const handleResetToDefault = () => {
    const defaultVisible = getDefaultVisibleColumns()
    setVisibleColumns(defaultVisible)
    setColumnOrder(transactionsEntityColumns.map(col => col.id))
  }

  // Views management functions
  const handleApplyView = (view: ColumnView) => {
    const newVisibleColumns = getAllColumnsHidden()
    view.selectedColumnIds.forEach(columnId => {
      newVisibleColumns[columnId] = true
    })
    setVisibleColumns(newVisibleColumns)
    setColumnOrder(view.columnOrder)
    setActiveViewId(view.id)
  }

  const handleRenameView = (viewId: string, newName: string) => {
    const updatedViews = savedViews.map(view =>
      view.id === viewId ? { ...view, name: newName } : view
    )
    setSavedViews(updatedViews)
    saveViewsForTable(tableId, updatedViews)
  }

  const handleDeleteView = (viewId: string) => {
    const updatedViews = savedViews.filter(view => view.id !== viewId)
    setSavedViews(updatedViews)
    saveViewsForTable(tableId, updatedViews)
    if (activeViewId === viewId) {
      setActiveViewId(null)
    }
  }

  const handleSetFavorite = (viewId: string | null) => {
    // Toggle favorite status - simple implementation
    console.log('Toggle favorite for view:', viewId)
  }

  // Row click handler - navigate to client profile using accountId
  const handleRowClick = (row: any) => {
    if (row.accountId) {
      navigate(`/clients/${row.accountId}`)
    }
  }

  // Account ID click handler - set up global handler for EntityTable
  React.useEffect(() => {
    (window as any).handleAccountIdClick = (accountId: string) => {
      navigate(`/clients/${accountId}`)
    }
    
    // Cleanup on unmount
    return () => {
      delete (window as any).handleAccountIdClick
    }
  }, [navigate])

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ListHeaderBar - replaces the old toolbar */}
      <ListHeaderBar
        onSearch={setSearch}
        entityNamePlural="transactions"
        actions={{
          onExport: handleExport,
          onFilter: () => setFilterDrawerOpen(true),
          filtersActive: filterState.conditions.length > 0,
        }}
        viewsMenu={
          <ViewsMenu
            views={savedViews}
            currentViewId={activeViewId}
            onApplyView={handleApplyView}
            onRenameView={handleRenameView}
            onDeleteView={handleDeleteView}
            onSetFavorite={handleSetFavorite}
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
            columns={columnsDrawerColumns}
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onColumnOrderChange={handleColumnOrderChange}
            columnOrder={columnOrder}
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
              <SquaresFour size={12} />
              Columns
            </MUIButton>
          </ColumnsDrawer>
        }
      />

      {/* EntityTable */}
      <div className="flex-1 overflow-hidden w-full">
        <EntityTable
          rows={filteredRows as any}
          config={tableConfig}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        columns={convertToFilterColumnDefs(columnsDrawerColumns)}
        filterState={filterState}
        onApply={setFilterState}
        tableId={tableId}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
      />
    </div>
  )
}