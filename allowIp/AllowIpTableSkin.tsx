import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table'
import { selectAllIps, AllowIp } from '@/state/allowIpSlice'
import { isValidIp } from '@/utils/ipValidation'

export interface AllowIpTableSkinProps {
  onOpenAddModal: () => void
  onOpenEditModal: (ip: AllowIp) => void
}

export const AllowIpTableSkin: React.FC<AllowIpTableSkinProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const ips = useSelector(selectAllIps)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingIp, setEditingIp] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingIpError, setEditingIpError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const columns = useMemo<ColumnDef<AllowIp>[]>(() => [
    // Selection column
    {
      id: '_select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 50,
      enableResizing: false,
      enableSorting: false,
    },
    
    // IP Address column
    {
      id: 'ip',
      accessorKey: 'ip',
      header: 'IP Address',
      cell: ({ getValue, row }) => {
        const ip = String(getValue() ?? '')
        const isEditing = editingId === row.original.id
        
        if (isEditing) {
          return (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={editingIp}
                onChange={(e) => {
                  setEditingIp(e.target.value)
                  const isValid = isValidIp(e.target.value)
                  setEditingIpError(isValid ? null : 'Invalid IP address')
                }}
                className={`h-8 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  editingIpError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 192.168.1.1"
                autoFocus
              />
              {editingIpError && (
                <span className="text-xs text-red-600">{editingIpError}</span>
              )}
            </div>
          )
        }
        
        return <span className="font-mono text-sm">{ip}</span>
      },
      size: 200,
    },
    
    // Description column
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue, row }) => {
        const description = String(getValue() ?? '')
        const isEditing = editingId === row.original.id
        
        if (isEditing) {
          return (
            <input
              type="text"
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              placeholder="Optional description"
            />
          )
        }
        
        return <span className="text-gray-700">{description || '—'}</span>
      },
      size: 300,
    },
    
    // Status column with soft badge
    {
      id: 'status',
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => {
        const isActive = Boolean(getValue())
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
      size: 100,
    },
    
    // Created By column
    {
      id: 'createdBy',
      accessorKey: 'createdBy',
      header: 'Created By',
      cell: ({ getValue }) => (
        <span className="text-gray-700">{String(getValue() ?? '—')}</span>
      ),
      size: 150,
    },
    
    // Created On column
    {
      id: 'createdOn',
      accessorKey: 'createdOn',
      header: 'Created On',
      cell: ({ getValue }) => (
        <span className="text-gray-600 text-sm">{formatDate(String(getValue() ?? ''))}</span>
      ),
      size: 180,
    },
    
    // Actions column with circular icon buttons
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id
        
        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!editingIpError && editingIp.trim()) {
                    // Here you would dispatch an update action
                    console.log('Save changes:', { 
                      ip: editingIp, 
                      description: editingDescription 
                    })
                    setEditingId(null)
                    setEditingIp('')
                    setEditingDescription('')
                    setEditingIpError(null)
                  }
                }}
                disabled={!!editingIpError || !editingIp.trim()}
                className="w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                title="Save changes"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  setEditingIp('')
                  setEditingDescription('')
                  setEditingIpError(null)
                }}
                className="w-8 h-8 rounded-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center text-sm"
                title="Cancel editing"
              >
                ✕
              </button>
            </div>
          )
        }
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingId(row.original.id)
                setEditingIp(row.original.ip)
                setEditingDescription(row.original.description || '')
                setEditingIpError(null)
              }}
              className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-sm"
              title="Edit inline"
            >
              ✎
            </button>
            <button
              onClick={() => onOpenEditModal(row.original)}
              className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center text-sm"
              title="Edit in modal"
            >
              ⚙
            </button>
          </div>
        )
      },
      size: 120,
      enableSorting: false,
    },
  ], [editingId, editingIp, editingDescription, editingIpError, onOpenEditModal])

  const table = useReactTable({
    data: ips,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  })

  return (
    <div className="space-y-8">
      {/* Table container with new bordered card design - centered with spacing */}
      <div className="border-base-content/25 max-w-6xl mx-auto rounded-lg border">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      style={{ width: header.getSize() }}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted() as string] ?? ' ↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 ${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {ips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No IP addresses configured</div>
            <p className="text-gray-400 text-sm mt-2">
              Use the Add button above to create your first IP address
            </p>
          </div>
        )}
      </div>

      {/* Selection info */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
          <span className="text-sm text-blue-700">
            {Object.keys(rowSelection).length} IP address(es) selected
          </span>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              Bulk Edit
            </button>
            <button className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  )
}