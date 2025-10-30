import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table'
import { paymentGatewayColumns, PAYMENT_GATEWAY_TABLE_ID, initialColumnSizing } from './paymentGatewayColumns'
import {
  selectGatewaysByQuery,
  updateGateway,
  setGatewayActive,
  Gateway,
} from '@/state/paymentGatewaysSlice'
import type { RootState } from '@/state/store'

interface PaymentGatewaysTableProps {
  searchQuery?: string
  onOpenAddModal: () => void
  onOpenEditModal: (gateway: Gateway) => void
}

export default function PaymentGatewaysTable({ 
  searchQuery = '', 
  onOpenAddModal, 
  onOpenEditModal
}: PaymentGatewaysTableProps) {
  const dispatch = useDispatch()
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedOn', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Filter data based on search query
  const data = useSelector((state: RootState) => selectGatewaysByQuery(state, searchQuery))

  // Handle toggle active status
  const handleToggleActive = (id: string, isActive: boolean) => {
    try {
      dispatch(setGatewayActive({ id, isActive: !isActive }))
      toast.success(`Gateway ${!isActive ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      toast.error('Failed to update gateway status')
    }
  }

  // Table configuration with meta functions
  const tableMeta = useMemo(() => ({
    onToggleActive: handleToggleActive,
    onOpenEdit: onOpenEditModal,
  }), [])

  // Initialize table
  const table = useReactTable({
    data,
    columns: paymentGatewayColumns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      sorting: [{ id: 'updatedOn', desc: true }],
      columnSizing: initialColumnSizing,
      pagination: {
        pageSize: 25,
      },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    meta: tableMeta,
  })

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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
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
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {searchQuery.trim() ? (
                    <div className="space-y-2">
                      <p>No payment gateways match "{searchQuery}"</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="space-y-2">
                      <p>No payment gateways configured yet</p>
                      <p className="text-sm">Create your first gateway using the + button above</p>
                    </div>
                  ) : (
                    <p>No results found</p>
                  )}
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