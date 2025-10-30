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
import { allowIpColumns, ALLOW_IP_TABLE_ID, initialColumnSizing } from './allowIpColumns'
import {
  selectAllIps,
  updateIp,
  setIpActive,
  AllowIp,
} from '@/state/allowIpSlice'
import { isValidIp } from '@/utils/ipValidation'

interface AllowIpTableProps {
  onOpenAddModal: () => void
  onOpenEditModal: (allowIp: AllowIp) => void
}

export default function AllowIpTable({ 
  onOpenAddModal, 
  onOpenEditModal 
}: AllowIpTableProps) {
  const dispatch = useDispatch()
  const allData = useSelector(selectAllIps)
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdOn', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingIp, setEditingIp] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingIpError, setEditingIpError] = useState<string | null>(null)
  const [editingDescriptionError, setEditingDescriptionError] = useState<string | null>(null)

  // Use all data without search filtering
  const data = allData

  // Inline edit handlers
  const handleStartEdit = (id: string, values: { ip: string; description?: string }) => {
    setEditingId(id)
    setEditingIp(values.ip)
    setEditingDescription(values.description || '')
    setEditingIpError(null)
    setEditingDescriptionError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingIp('')
    setEditingDescription('')
    setEditingIpError(null)
    setEditingDescriptionError(null)
  }

  const handleInlineCommit = (id: string, patch: Partial<Pick<AllowIp, 'ip' | 'description'>>) => {
    // Validate IP if it's being updated
    if (patch.ip !== undefined && !isValidIp(patch.ip)) {
      setEditingIpError('Invalid IP address')
      return
    }

    // Validate description length
    if (patch.description !== undefined && patch.description.length > 200) {
      setEditingDescriptionError('Description must be 200 characters or less')
      return
    }

    try {
      dispatch(updateIp({ id, patch }))
      toast.success('IP updated successfully')
      handleCancelEdit()
    } catch (error) {
      toast.error('Failed to update IP')
    }
  }

  // Toggle active/inactive
  const handleToggleActive = (id: string, isActive: boolean) => {
    try {
      dispatch(setIpActive({ id, isActive: !isActive }))
      toast.success(`IP ${!isActive ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update IP status')
    }
  }

  // Table meta for column handlers
  const meta = useMemo(
    () => ({
      // Inline editing
      editingId,
      editingIp,
      editingDescription,
      editingIpError,
      editingDescriptionError,
      setEditingIp,
      setEditingDescription,
      setEditingIpError,
      setEditingDescriptionError,
      onStartEdit: handleStartEdit,
      onCancelEdit: handleCancelEdit,
      onInlineCommit: handleInlineCommit,
      
      // Modal editing
      onOpenEdit: onOpenEditModal,
      onToggleActive: handleToggleActive,
    }),
    [
      editingId, 
      editingIp, 
      editingDescription, 
      editingIpError, 
      editingDescriptionError,
      onOpenEditModal
    ]
  )

  const table = useReactTable({
    data,
    columns: allowIpColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
    },
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    meta,
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Table - Match Account Types table styling */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-1'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'desc' ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                </svg>
                              )}
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {table.getRowModel().rows.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={allowIpColumns.length} className="text-center py-12 text-gray-500">
                  {allData.length === 0 ? (
                    <div className="space-y-2">
                      <p>No IP addresses configured yet</p>
                      <p className="text-sm">Add your first allowed IP using the + button above</p>
                    </div>
                  ) : (
                    <p>No results found</p>
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
            
            <span className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}