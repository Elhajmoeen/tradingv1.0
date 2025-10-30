import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Key, Power, Users } from '@phosphor-icons/react'
import type { CrmUser, UserPermission } from '@/state/usersSlice'

export const USERS_TABLE_ID = 'settings.users.v1'

// Column sizing for users table
export const initialColumnSizing = {
  _select: 44,
  fullName: 220,
  email: 260,
  startDate: 140,
  phone: 160,
  permission: 140,
  updatedOn: 180,
  status: 110,
  actions: 180,
}

interface TableMeta {
  onOpenEdit: (user: CrmUser) => void
  onToggleActive: (id: string, isActive: boolean) => void
  // PATCH: begin userColumns (team leader meta)
  onManageVisibility?: (user: CrmUser) => void
  // PATCH: end userColumns (team leader meta)
}

export const userColumns: ColumnDef<CrmUser>[] = [
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
    size: 44,
    minSize: 44,
    enableResizing: false,
    enableSorting: false,
  },

  // Full Name with Avatar
  {
    id: 'fullName',
    accessorKey: 'fullName',
    header: 'Full Name',
    cell: ({ row }) => {
      const user = row.original
      const initials = user.fullName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                {initials}
              </div>
            )}
          </div>
          <span className="font-medium text-gray-900">
            {user.fullName}
          </span>
        </div>
      )
    },
    size: 220,
  },

  // Email
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => {
      const email = getValue() as string
      return (
        <span className="text-gray-700 font-mono text-sm">
          {email}
        </span>
      )
    },
    size: 260,
  },

  // Start Date
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ getValue }) => {
      const dateStr = getValue() as string
      if (!dateStr) return <span className="text-gray-500">—</span>
      
      try {
        const date = new Date(dateStr)
        return <span className="text-gray-600">{date.toLocaleDateString()}</span>
      } catch {
        return <span className="text-gray-500">—</span>
      }
    },
    size: 140,
  },

  // Phone
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ getValue }) => {
      const phone = getValue() as string
      return phone ? (
        <span className="text-gray-600 font-mono text-sm">{phone}</span>
      ) : (
        <span className="text-gray-400">—</span>
      )
    },
    size: 160,
  },

  // Permission
  {
    id: 'permission',
    accessorKey: 'permission',
    header: 'Permission',
    cell: ({ getValue }) => {
      const permission = getValue() as UserPermission
      const colors = {
        Admin: 'bg-red-100 text-red-700 border-red-200',
        Manager: 'bg-blue-100 text-blue-700 border-blue-200',
        Agent: 'bg-green-100 text-green-700 border-green-200',
        Viewer: 'bg-gray-100 text-gray-700 border-gray-200'
      }
      
      return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colors[permission] || colors.Viewer}`}>
          {permission || 'Viewer'}
        </span>
      )
    },
    size: 140,
  },

  // Updated On
  {
    id: 'updatedOn',
    accessorKey: 'updatedOn',
    header: 'Updated',
    cell: ({ row }) => {
      const user = row.original
      const dateStr = user.updatedOn || user.createdOn
      if (!dateStr) return <span className="text-gray-500">—</span>
      
      try {
        const date = new Date(dateStr)
        return <span className="text-gray-600 text-sm">{date.toLocaleString()}</span>
      } catch {
        return <span className="text-gray-500">—</span>
      }
    },
    size: 180,
  },

  // Status
  {
    id: 'status',
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
    size: 110,
  },

  // Actions
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as TableMeta | undefined
      
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => meta?.onOpenEdit?.(user)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Edit user"
          >
            <Pencil size={12} />
            Edit
          </button>
          
          <button
            onClick={() => meta?.onToggleActive?.(user.id, user.isActive)}
            className={`h-8 px-3 text-xs rounded border transition-colors flex items-center gap-1 font-medium ${
              user.isActive
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
            title={user.isActive ? 'Disable user' : 'Enable user'}
          >
            <Power size={12} />
            {user.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      )
    },
    enableResizing: false,
    enableSorting: false,
    size: 240,
  },
]
