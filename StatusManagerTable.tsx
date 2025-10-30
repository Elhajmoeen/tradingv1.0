import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  ColumnDef,
} from '@tanstack/react-table'

// Status data type
interface StatusValue {
  id: string
  category: string
  key: string
  label: string
  color: string | null
  active: boolean
  usageCount: number
  order: number
  createdOn: Date
  updatedOn: Date
}

// Column sizing - equal spacing for all columns
const initialColumnSizing = {
  _select: 60,
  label: 200,
  key: 180,
  color: 160,
  active: 100,
  order: 100,
  actions: 200,
}

// No mock data - we'll get real data from props

// Table meta interface
interface TableMeta {
  onOpenEdit: (status: StatusValue) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onMove: (id: string, direction: -1 | 1) => void
  onDeprecate: (id: string) => void
}

// Column definitions
const statusManagerColumns: ColumnDef<StatusValue>[] = [
  // Selection column
  {
    id: '_select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    enableSorting: false,
    size: initialColumnSizing._select,
  },

  // Label
  {
    accessorKey: 'label',
    header: 'Label',
    cell: ({ getValue }) => (
      <div className="flex items-center justify-center">
        <span className="text-gray-900">
          {getValue() as string}
        </span>
      </div>
    ),
    size: initialColumnSizing.label,
  },

  // Key
  {
    accessorKey: 'key',
    header: 'Key',
    cell: ({ getValue }) => (
      <div className="flex items-center justify-center">
        <code className="px-2 py-1 text-xs font-mono bg-gray-100 rounded text-gray-800">
          {getValue() as string}
        </code>
      </div>
    ),
    size: initialColumnSizing.key,
  },

  // Color
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ getValue }) => {
      const color = getValue() as string | null
      return (
        <div className="flex items-center justify-center">
          {color ? (
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 font-mono">{color}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
      )
    },
    size: initialColumnSizing.color,
  },

  // Active Status
  {
    accessorKey: 'active',
    header: 'Active',
    cell: ({ getValue, row, table }) => {
      const isActive = getValue() as boolean
      const meta = table.options.meta as TableMeta
      
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => meta?.onToggleActive(row.original.id, isActive)}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isActive ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${isActive ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      )
    },
    enableSorting: false,
    size: initialColumnSizing.active,
  },

  // Order
  {
    accessorKey: 'order',
    header: 'Order',
    cell: ({ getValue }) => (
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-900">
          {getValue() as number || 0}
        </span>
      </div>
    ),
    size: initialColumnSizing.order,
  },

  // Actions
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta
      
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => meta?.onOpenEdit(row.original)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit Status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => meta?.onMove(row.original.id, -1)}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Move Up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => meta?.onMove(row.original.id, 1)}
            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
            title="Move Down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => meta?.onDeprecate(row.original.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Deprecate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    },
    enableSorting: false,
    size: initialColumnSizing.actions,
  },
]

interface StatusManagerTableProps {
  category: string
  data: StatusValue[]
  onEdit: (status: StatusValue) => void
  onToggleActive: (id: string, active: boolean) => void
  onMove: (id: string, direction: -1 | 1) => void
  onDeprecate: (id: string) => void
}

export default function StatusManagerTable({
  category,
  data,
  onEdit,
  onToggleActive,
  onMove,
  onDeprecate,
}: StatusManagerTableProps) {
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'order', desc: false }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Use actual data from props
  const statusData = data || []
  const isLoading = false

  // Table configuration with meta functions
  const tableMeta = useMemo(() => ({
    onOpenEdit: onEdit,
    onToggleActive: onToggleActive,
    onMove: onMove,
    onDeprecate: onDeprecate,
  }), [onEdit, onToggleActive, onMove, onDeprecate])

  // Initialize table
  const table = useReactTable({
    data: statusData,
    columns: statusManagerColumns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      sorting: [{ id: 'order', desc: false }],
      columnSizing: initialColumnSizing,
      pagination: {
        pageSize: 25,
      },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    meta: tableMeta,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="text-gray-500">Loading status values...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Table Container - Full Width */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Sticky Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-center gap-2 ${
                          header.column.getCanSort() 
                            ? 'cursor-pointer select-none hover:text-gray-700' 
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && (
                          <span className="text-gray-400">↑</span>
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <span className="text-gray-400">↓</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  {isLoading ? 'Loading status values...' : 'No status values found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination at Bottom */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>{' '}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}