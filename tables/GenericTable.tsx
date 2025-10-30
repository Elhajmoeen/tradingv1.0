import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  Row
} from '@tanstack/react-table'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Typography,
  TablePagination,
  Button
} from '@mui/material'
import { GenericTableHeader } from './GenericTableHeader'
import { ColumnsDrawer } from '../ColumnsDrawer'
import { FilterDrawer } from '../leads/FilterDrawer'
import type { AppDispatch, RootState } from '@/state/store'
import type { Entity } from '@/state/entitiesSlice'
import type { ColumnDefinition } from '../ColumnsDrawer'
import { convertToFilterColumnDefs } from '../leads/columnAdapter'
import type { FilterState } from '../leads/filters'
import { applyFilters } from '../leads/filters'

interface GenericTableProps {
  title: string
  entityType: string
  data: Entity[]
  columnDefinitions: ColumnDefinition[]
  onNewClick: () => void
  onImportClick: () => void
  onExportClick: () => void
  customDocuments?: Array<{id: string, label: string}>
  storageKey?: string
}

export function GenericTable({
  title,
  entityType,
  data,
  columnDefinitions,
  onNewClick,
  onImportClick,
  onExportClick,
  customDocuments,
  storageKey = `${entityType}.columns.v2`
}: GenericTableProps) {
  
  // State management
  const [query, setQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedRows, setSelectedRows] = useState<Entity[]>([])
  const [columnsDrawerOpen, setColumnsDrawerOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({ conditions: [] })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load column visibility:', error)
    }
    
    // Default visibility based on column definitions
    const defaultVisible: Record<string, boolean> = {}
    columnDefinitions.forEach(col => {
      defaultVisible[col.id] = col.defaultVisible !== false
    })
    return defaultVisible
  })

  // Save column visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibleColumns))
    } catch (error) {
      console.error('Failed to save column visibility:', error)
    }
  }, [visibleColumns, storageKey])

  // Filter columns for the filter system
  const filterColumns = useMemo(() => {
    return convertToFilterColumnDefs(columnDefinitions, data)
  }, [columnDefinitions, data])

  // Apply search and filters
  const filteredData = useMemo(() => {
    let result = data

    // Apply search query filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter(item => {
        const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'accountId']
        return searchFields.some(field => {
          const value = item[field as keyof Entity]
          return value && String(value).toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply advanced filters
    if (filterState.conditions.length > 0) {
      result = applyFilters(result, filterState, filterColumns)
    }

    return result
  }, [data, query, filterState, filterColumns])

  // Get visible column definitions
  const visibleColumnDefs = useMemo(() => {
    return columnDefinitions.filter(col => visibleColumns[col.id])
  }, [columnDefinitions, visibleColumns])

  // Create TanStack table columns
  const tableColumns = useMemo<ColumnDef<Entity>[]>(() => {
    const columns: ColumnDef<Entity>[] = [
      // Selection column
      {
        id: 'select',
        size: 50,
        header: ({ table }) => (
          <Checkbox
            checked={selectedRows.length === filteredData.length && filteredData.length > 0}
            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
            onChange={() => {
              if (selectedRows.length === filteredData.length) {
                setSelectedRows([])
              } else {
                setSelectedRows([...filteredData])
              }
            }}
            size="small"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.some(selected => selected.id === row.original.id)}
            onChange={() => {
              setSelectedRows(prev => {
                const exists = prev.some(selected => selected.id === row.original.id)
                if (exists) {
                  return prev.filter(selected => selected.id !== row.original.id)
                } else {
                  return [...prev, row.original]
                }
              })
            }}
            size="small"
          />
        ),
      },
      // Dynamic columns based on column definitions
      ...visibleColumnDefs.map((col): ColumnDef<Entity> => ({
        id: col.id,
        accessorKey: col.path || col.id,
        header: col.header,
        size: 150,
        cell: ({ getValue, row }) => {
          const value = getValue()
          // Add any specific cell rendering logic here based on column type
          return (
            <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {value ? String(value) : '—'}
            </Typography>
          )
        }
      }))
    ]

    return columns
  }, [visibleColumnDefs, selectedRows, filteredData])

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Pagination
  const paginatedRows = useMemo(() => {
    const startIndex = page * rowsPerPage
    return table.getRowModel().rows.slice(startIndex, startIndex + rowsPerPage)
  }, [table, page, rowsPerPage])

  // Column management functions
  const handleSelectAllColumns = () => {
    const allVisible: Record<string, boolean> = {}
    columnDefinitions.forEach(col => {
      allVisible[col.id] = true
    })
    setVisibleColumns(allVisible)
  }

  const handleClearAllColumns = () => {
    const allHidden: Record<string, boolean> = {}
    columnDefinitions.forEach(col => {
      allHidden[col.id] = false
    })
    setVisibleColumns(allHidden)
  }

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }

  return (
    <Box>
      {/* Header */}
      <GenericTableHeader
        title={title}
        entityType={entityType}
        totalCount={data.length}
        selectedCount={selectedRows.length}
        searchQuery={query}
        onSearchChange={setQuery}
        onNewClick={onNewClick}
        onImportClick={onImportClick}
        onExportClick={onExportClick}
        onFilterClick={() => setFilterDrawerOpen(true)}
        onViewsClick={() => {}} // TODO: Implement views
        onColumnsClick={() => setColumnsDrawerOpen(true)}
        onMassChangesClick={() => {}} // TODO: Implement mass changes
        onClearSelection={() => setSelectedRows([])}
        activeFilters={filterState.conditions.length}
      />

      {/* Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '2px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default'
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {paginatedRows.map(row => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      borderBottom: '1px solid #f3f4f6',
                      py: 1.5
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{
          borderTop: '1px solid #e5e7eb',
          '& .MuiTablePagination-toolbar': {
            fontFamily: 'Poppins, sans-serif'
          }
        }}
      />

      {/* Columns Drawer - render as prop */}
      {columnsDrawerOpen && (
        <ColumnsDrawer
          columns={columnDefinitions}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleToggleColumn}
          onSelectAll={handleSelectAllColumns}
          onClearAll={handleClearAllColumns}
          onResetToDefault={() => {
            const defaultVisible: Record<string, boolean> = {}
            columnDefinitions.forEach(col => {
              defaultVisible[col.id] = col.defaultVisible !== false
            })
            setVisibleColumns(defaultVisible)
          }}
        >
          <Button 
            variant="outlined" 
            onClick={() => setColumnsDrawerOpen(false)}
          >
            Close
          </Button>
        </ColumnsDrawer>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        columns={filterColumns}
        filterState={filterState}
        onApply={setFilterState}
        onSaved={() => {}} // TODO: Implement saved views
      />
    </Box>
  )
}