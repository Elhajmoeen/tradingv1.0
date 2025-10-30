import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
import { accountTypeColumns, ACCOUNT_TYPES_TABLE_ID, initialColumnSizing } from './accountTypeColumns'
import {
  selectAccountTypes,
  renameAccountType,
  setAccountTypeActive,
  AccountType,
} from '@/state/accountTypesSlice'

interface AccountTypesTableProps {
  searchQuery?: string
  data?: any[] // Optional external data for feature flag usage
}

export default function AccountTypesTable({ searchQuery = '', data }: AccountTypesTableProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const reduxData = useSelector(selectAccountTypes)
  const allData = data || reduxData
  const isLoading = false // No loading state for account types currently
  
  // Table state - exactly like UsersTable
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return allData
    
    const query = searchQuery.toLowerCase()
    return allData.filter(accountType =>
      accountType.name.toLowerCase().includes(query)
    )
  }, [allData, searchQuery])

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return
    
    try {
      dispatch(renameAccountType({ id: editingId, name: editingName.trim() }))
      toast.success(`Account type renamed to "${editingName.trim()}"`)
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      toast.error('Failed to rename account type')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  // Table configuration with meta functions - exactly like UsersTable
  const tableMeta = useMemo(() => ({
    onRename: (id: string, current: string) => {
      setEditingId(id)
      setEditingName(current)
    },
    onToggleActive: (id: string, isActive: boolean) => {
      try {
        dispatch(setAccountTypeActive({ id, isActive: !isActive }))
        toast.success(`Account type ${!isActive ? 'enabled' : 'disabled'}`)
      } catch (error) {
        toast.error('Failed to update account type status')
      }
    },
    onSettings: (id: string) => {
      navigate(`/management/trading/account-types/${id}/settings`)
    },
    editingId,
    editingName,
    setEditingName,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
  }), [dispatch, navigate, editingId, editingName])

  // Initialize table - exactly like UsersTable
  const table = useReactTable({
    data: filteredData,
    columns: accountTypeColumns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
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
        <div className="text-gray-500">Loading account types...</div>
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
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                      header.id === '_select' ? 'px-0' : ''
                    }`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : header.id === '_select' ? (
                      // Special handling for checkbox column to match data cell alignment
                      <div className="px-6 py-0">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    ) : (
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
                  {isLoading ? 'Loading account types...' : searchQuery.trim() ? (
                    <div className="space-y-2">
                      <p>No account types match "{searchQuery}"</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : allData.length === 0 ? (
                    <div className="space-y-2">
                      <p>No account types configured yet</p>
                      <p className="text-sm">Add your first account type using the + button above</p>
                    </div>
                  ) : (
                    <p>No account types found.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination at Bottom - Exactly like UsersTable */}
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