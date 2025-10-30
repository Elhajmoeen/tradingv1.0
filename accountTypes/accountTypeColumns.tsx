import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AccountType } from '@/state/accountTypesSlice'

export const ACCOUNT_TYPES_TABLE_ID = 'settings.accountTypes.v1'

// ensure a stable key export
export const AccountTypeKeys = {
  id: 'id',
  name: 'name',
  clientsCount: 'clientsCount',
  status: 'isActive',
  createdByName: 'createdBy',
  createdAt: 'createdAt',
} as const;

// Column sizing for account types table - exactly like users table
export const initialColumnSizing = {
  _select: 44,
  name: 350,
  clientsCount: 120,
  isActive: 140,
  createdBy: 180,
  createdAt: 220,
  actions: 240,
}

interface TableMeta {
  onRename: (id: string, current: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onSettings: (id: string) => void
  editingId: string | null
  editingName: string
  setEditingName: (name: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export const accountTypeColumns: ColumnDef<AccountType>[] = [
  // Selection column - exactly like users table
  {
    id: '_select',
    header: ({ table }) => (
      <div className="flex items-center justify-center w-full h-full">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-full h-full">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    size: 44,
    minSize: 44,
    enableResizing: false,
    enableSorting: false,
  },
  // stable keys -> match your EntityTable expectations
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue, row, table }) => {
      const name = String(getValue() ?? '')
      const meta = table.options.meta as any
      const isEditing = meta?.editingId === row.original.id
      
      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meta?.editingName || name}
              onChange={(e) => meta?.setEditingName?.(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') meta?.onSaveEdit?.()
                if (e.key === 'Escape') meta?.onCancelEdit?.()
              }}
              autoFocus
            />
            <button
              onClick={meta?.onSaveEdit}
              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={meta?.onCancelEdit}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )
      }
      
      return <span className="font-medium">{name}</span>
    },
    size: 350,
  },
  // Clients count column (shows when feature flag enabled)
  {
    id: AccountTypeKeys.clientsCount,
    accessorKey: 'clientsCount',
    header: 'Clients',
    cell: ({ getValue }) => {
      const count = Number(getValue() ?? 0)
      return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">{count}</span>
    },
    size: 120,
    enableSorting: true,
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean
      
      return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
          isActive 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    size: 140,
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ getValue }) => {
      const createdBy = String(getValue() ?? 'System')
      return <span className="text-gray-600 text-sm">{createdBy}</span>
    },
    enableSorting: true,
    size: 180,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => {
      const dateStr = getValue() as string
      if (!dateStr) return <span className="text-gray-500">—</span>
      
      try {
        const date = new Date(dateStr)
        return <span className="text-gray-600 text-sm">{date.toLocaleString()}</span>
      } catch {
        return <span className="text-gray-500">—</span>
      }
    },
    enableSorting: true,
    size: 220,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta | undefined
      const accountType = row.original
      
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => meta?.onRename?.(accountType.id, accountType.name)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Edit account type"
          >
            Edit
          </button>
          
          <button
            onClick={() => meta?.onSettings?.(accountType.id)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Account type settings"
          >
            Settings
          </button>
          
          <button
            onClick={() => meta?.onToggleActive?.(accountType.id, accountType.isActive)}
            className={`h-8 px-3 text-xs rounded border transition-colors flex items-center gap-1 font-medium ${
              accountType.isActive
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
            title={accountType.isActive ? 'Disable account type' : 'Enable account type'}
          >
            {accountType.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      )
    },
    enableResizing: false,
    enableSorting: false,
    size: 240,
  },
]