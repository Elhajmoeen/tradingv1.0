import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table'
import { statusColumns, STATUS_TABLE_ID, initialColumnSizing, LookupValue } from './statusColumns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react'

type LookupCategoryKey = "kycStatus" | "leadStatus" | "retentionStatus";

interface StatusTableProps {
  category: LookupCategoryKey
  data: LookupValue[]
  onEdit: (value: LookupValue) => void
  onToggleActive: (id: string, active: boolean) => void
  onMove: (id: string, direction: -1 | 1) => void
  onDeprecate: (id: string) => void
}

export default function StatusTable({ 
  category,
  data, 
  onEdit, 
  onToggleActive, 
  onMove, 
  onDeprecate 
}: StatusTableProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'order', desc: false }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Table configuration
  const table = useReactTable({
    data,
    columns: statusColumns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnSizing: initialColumnSizing,
      pagination: {
        pageSize: 15,
      },
    },
    meta: {
      onEdit,
      onToggleActive,
      onMove,
      onDeprecate,
    },
    enableRowSelection: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    debugTable: false,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search statuses..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-80"
            />
            <div className="text-sm text-gray-600">
              {table.getFilteredRowModel().rows.length} of {data.length} statuses
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {globalFilter ? 'No statuses match your search.' : 'No statuses found.'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <span className="text-sm text-gray-500">
            ({table.getFilteredRowModel().rows.length} total)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <CaretDoubleLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <CaretLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <CaretRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <CaretDoubleRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}