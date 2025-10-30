import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ListHeaderBar } from '@/components/ListHeaderBar'
import { ColumnsDrawer, type ColumnDefinition } from '@/components/ColumnsDrawer'
import { ViewsMenu } from '@/components/ViewsMenu'
import { FilterDrawer } from '@/components/leads/FilterDrawer'
import { EntityTable, type EntityTableConfig } from '@/components/EntityTable'
import { selectPendingPositionsEntityRows } from '@/state/positionsSlice'
import { pendingPositionsEntityColumns } from '@/config/positionColumns'
import { loadViewsForTable, saveViewsForTable } from '@/features/tableViews/columnViewsSlice'
import { convertToFilterColumnDefs } from '@/components/leads/columnAdapter'
import type { RootState } from '@/state/store'
import type { ColumnView } from '@/features/tableViews/columnViewsSlice'
import type { FilterState } from '@/components/leads/filters'
import { applyFilters } from '@/components/leads/filters'
import { Button as MUIButton } from '@mui/material'
import { SquaresFour, Eye, Columns } from '@phosphor-icons/react'
import { isPositionsNextEnabled } from '@/lib/flags'
import { PendingPositionsAdapter, LegacyPendingPositionsContent } from '@/features/positions_next/adapters/PendingPositionsAdapter'

// DEV-only diagnostics
const PositionsDiag = import.meta.env.DEV ? 
  React.lazy(() => import('@/features/positions_next/dev/PositionsDiag').then(m => ({ default: m.PositionsDiag }))) : 
  null

export default function PendingPositionsPage() {
  // Feature flag check
  const useNext = isPositionsNextEnabled()
  
  // Return new implementation if flag is enabled
  if (useNext) {
    return <PendingPositionsAdapter />
  }
  
  // Legacy implementation
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [viewsRefreshKey, setViewsRefreshKey] = useState(0)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  
  // Views management
  const tableId = 'pendingPositions'
  const [savedViews, setSavedViews] = useState<ColumnView[]>(() => loadViewsForTable(tableId))
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  
  
  // Get joined data from selector - using default account for now
  const rows = useSelector((state: RootState) => 
    selectPendingPositionsEntityRows(state, 'ACC9001')
  )

  // Filter by search term and filter rules
  const filteredRows = useMemo(() => {
    let result = rows
    
    // Apply search filter over common fields (account, client name, email, instrument, position ID, reason)
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim()
      result = result.filter((row: any) => {
        const searchableFields = [
          row.accountId,
          row.firstName,
          row.lastName,
          row.email,
          row.positionId,
          row.instrument,
          row.positionOpenReason,
          // Also search in combined name
          `${row.firstName || ''} ${row.lastName || ''}`.trim()
        ]
        
        return searchableFields.some(value => 
          value && String(value).toLowerCase().includes(searchTerm)
        )
      })
    }
    
    // Apply filter conditions using the generic filter system
    if (filterState.conditions.length > 0) {
      // Convert position columns to filter column definitions
      const filterColumns = convertToFilterColumnDefs(pendingPositionsEntityColumns.map(col => ({
        ...col,
        defaultVisible: col.defaultVisible ?? true,
        isCustomDocument: false
      })))
      result = applyFilters(result, filterState, filterColumns)
    }
    
    return result
  }, [rows, search, filterState])

  // Convert EntityColumnDefinition to ColumnDefinition for ColumnsDrawer compatibility
  const columnsDrawerColumns: ColumnDefinition[] = useMemo(() => 
    pendingPositionsEntityColumns.map(col => ({
      ...col,
      defaultVisible: col.defaultVisible ?? true,
      isCustomDocument: false
    })), [])

  // Initialize column visibility and order
  const getAllColumnsVisible = () => {
    const result: Record<string, boolean> = {}
    pendingPositionsEntityColumns.forEach(col => {
      result[col.id] = true // Show all columns by default for positions
    })
    return result
  }

  const getAllColumnsHidden = () => {
    const result: Record<string, boolean> = {}
    pendingPositionsEntityColumns.forEach(col => {
      result[col.id] = false
    })
    return result
  }

  // Initialize states on mount
  React.useEffect(() => {
    if (Object.keys(visibleColumns).length === 0) {
      setVisibleColumns(getAllColumnsVisible())
    }
    if (columnOrder.length === 0) {
      setColumnOrder(pendingPositionsEntityColumns.map(col => col.id))
    }
  }, [])

  // Export function
  const handleExport = () => {
    const visibleCols = pendingPositionsEntityColumns.filter(col => visibleColumns[col.id])
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
    link.setAttribute("download", `pending-positions-${new Date().toISOString().slice(0, 10)}.csv`)
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
    const defaultVisible = getAllColumnsVisible()
    setVisibleColumns(defaultVisible)
    setColumnOrder(pendingPositionsEntityColumns.map(col => col.id))
  }

  // Views handlers
  const handleApplyView = (view: ColumnView) => {
    const columnConfig: Record<string, boolean> = {}
    pendingPositionsEntityColumns.forEach(col => {
      columnConfig[col.id] = view.selectedColumnIds.includes(col.id)
    })
    setVisibleColumns(columnConfig)
    setColumnOrder(view.columnOrder)
    setActiveViewId(view.id)
  }

  const handleRenameView = (viewId: string, newName: string) => {
    const updatedViews = savedViews.map(v => 
      v.id === viewId ? { ...v, name: newName } : v
    )
    setSavedViews(updatedViews)
    saveViewsForTable(tableId, updatedViews)
  }

  const handleDeleteView = (viewId: string) => {
    const updatedViews = savedViews.filter(v => v.id !== viewId)
    setSavedViews(updatedViews)
    saveViewsForTable(tableId, updatedViews)
    if (activeViewId === viewId) {
      setActiveViewId(null)
    }
    setViewsRefreshKey(prev => prev + 1)
  }

  const handleSetFavorite = (viewId: string) => {
    // Implementation for setting favorite view
    console.log('Set favorite view:', viewId)
  }

  // Table configuration
  const tableConfig: EntityTableConfig = useMemo(() => ({
    entityType: 'position',
    entityNameSingular: 'position',
    entityNamePlural: 'positions',
    columns: pendingPositionsEntityColumns,
    storageKey: 'global.pendingPositions'
  }), [])

  // Row click handler - navigate to client profile using accountId
  const handleRowClick = (row: any) => {
    if (row.accountId) {
      navigate(`/clients/${row.accountId}`)
    }
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
        onSearch={setSearch}
        entityNamePlural="pending positions"
        viewsMenu={
          <ViewsMenu
            key={viewsRefreshKey}
            views={savedViews}
            currentViewId={activeViewId}
            onApplyView={handleApplyView}
            onRenameView={(viewId: string, newName: string) => {
              const updatedViews = savedViews.map(v => 
                v.id === viewId ? { ...v, name: newName } : v
              )
              setSavedViews(updatedViews)
            }}
            onDeleteView={handleDeleteView}
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
              <Eye size={12} />
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
              <Columns size={12} />
              Columns
            </MUIButton>
          </ColumnsDrawer>
        }
        actions={{
          onFilter: () => setFilterDrawerOpen(true),
          onExport: handleExport
        }}
      />
      </div>
      
      {/* Table Container - takes remaining height, full width */}
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
        filterState={filterState}
        onApply={setFilterState}
        columns={convertToFilterColumnDefs(pendingPositionsEntityColumns)}
      />

      {/* DEV Diagnostics Panel - only when positions_next is enabled and in DEV */}
      {import.meta.env.DEV && useNext && PositionsDiag && (
        <React.Suspense fallback={null}>
          <PositionsDiag />
        </React.Suspense>
      )}
    </div>
  )
}