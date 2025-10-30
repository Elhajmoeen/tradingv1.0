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
} from '@tanstack/react-table'
import { allowIpColumns, ALLOW_IP_TABLE_ID, initialColumnSizing } from './allowIpColumns'
import { useListAllowIpsQuery, useUpdateAllowIpMutation, useDeleteAllowIpMutation } from './api/allowIpApi'
import type { AllowIp } from './types/allowIp.schema'

interface AllowIpTableProps {
  onEdit?: (allowIp: AllowIp) => void
}

export default function AllowIpTable({ onEdit }: AllowIpTableProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedAt', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // API hooks
  const { data: allowIpsResponse, isLoading } = useListAllowIpsQuery({})
  const [updateAllowIp] = useUpdateAllowIpMutation()
  const [deleteAllowIp] = useDeleteAllowIpMutation()
  
  const allowIps = allowIpsResponse?.data || []

  // Handle edit IP
  const handleEditIp = (allowIp: AllowIp) => {
    onEdit?.(allowIp)
  }

  // Handle toggle active status
  const handleToggleActive = (id: string, isActive: boolean) => {
    try {
      updateAllowIp({
        id,
        updates: {
          status: isActive ? 'disabled' : 'active',
          updatedAt: new Date().toISOString()
        }
      }).unwrap()
      toast.success(`IP ${!isActive ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error('Failed to toggle IP status:', error)
      toast.error('Failed to update IP status')
    }
  }

  // Handle delete IP
  const handleDeleteIp = async (allowIp: AllowIp) => {
    if (window.confirm(`Are you sure you want to delete IP address ${allowIp.ip}?`)) {
      try {
        await deleteAllowIp(allowIp.id).unwrap()
        toast.success('IP address deleted successfully')
      } catch (error) {
        console.error('Failed to delete IP:', error)
        toast.error('Failed to delete IP address')
      }
    }
  }

  // Table configuration with meta functions
  const tableMeta = useMemo(() => ({
    onOpenEdit: handleEditIp,
    onToggleActive: handleToggleActive,
    onDelete: handleDeleteIp,
  }), [])

  // Initialize table
  const table = useReactTable({
    data: allowIps,
    columns: allowIpColumns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      sorting: [{ id: 'updatedAt', desc: true }],
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading IP addresses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? ''}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
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
                  {isLoading ? 'Loading IP addresses...' : 'No IP addresses found.'}
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