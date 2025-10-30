import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Power } from '@phosphor-icons/react'
import { Gateway } from '@/state/paymentGatewaysSlice'

export const PAYMENT_GATEWAY_TABLE_ID = 'settings.paymentGateways.v1'

// Column sizing to match IP Management table
export const initialColumnSizing = {
  _select: 50,
  name: 200,
  provider: 350,
  status: 140,
  createdBy: 180,
  createdOn: 220,
  updatedOn: 220,
  actions: 280,
}

interface TableMeta {
  onToggleActive: (id: string, isActive: boolean) => void
  onOpenEdit: (gateway: Gateway) => void
}

export const paymentGatewayColumns: ColumnDef<Gateway>[] = [
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

  // Gateway Name
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Gateway Name',
    cell: ({ getValue }) => {
      const name = getValue() as string
      return (
        <span className="font-mono font-medium">
          {name}
        </span>
      )
    },
    size: 200,
  },

  // Provider with Currency
  {
    id: 'provider',
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
      const gateway = row.original
      const provider = gateway.provider
      const currency = gateway.currency
      const displayText = provider && currency ? `${provider} (${currency})` : provider
      
      return (
        <span
          className="block truncate"
          title={displayText}
        >
          {displayText || <span className="text-gray-400 italic">No provider</span>}
        </span>
      )
    },
    size: 350,
  },

  // Status
  {
    id: 'status',
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
            isActive
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}
        >
          {isActive ? 'Active' : 'Disabled'}
        </span>
      )
    },
    size: 140,
  },

  // Created By
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ getValue }) => {
      const createdBy = getValue() as string
      return <span className="text-gray-600">{createdBy}</span>
    },
    size: 180,
  },

  // Created On
  {
    id: 'createdOn',
    accessorKey: 'createdOn',
    header: 'Created On',
    cell: ({ getValue }) => {
      const dateStr = getValue() as string
      if (!dateStr) return <span className="text-gray-500">—</span>
      
      try {
        const date = new Date(dateStr)
        return <span className="text-gray-600">{date.toLocaleString()}</span>
      } catch {
        return <span className="text-gray-500">—</span>
      }
    },
    size: 220,
  },

  // Updated On
  {
    id: 'updatedOn',
    accessorKey: 'updatedOn',
    header: 'Updated On',
    cell: ({ getValue }) => {
      const dateStr = getValue() as string
      if (!dateStr) return <span className="text-gray-500">—</span>
      
      try {
        const date = new Date(dateStr)
        return <span className="text-gray-600">{date.toLocaleString()}</span>
      } catch {
        return <span className="text-gray-500">—</span>
      }
    },
    size: 220,
  },

  // Actions
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const gateway = row.original
      const meta = table.options.meta as TableMeta | undefined
      
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => meta?.onOpenEdit?.(gateway)}
            className="h-8 px-3 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
            title="Edit gateway"
          >
            <Pencil size={12} />
            Edit
          </button>
          
          <button
            onClick={() => meta?.onToggleActive?.(gateway.id, gateway.isActive)}
            className={`h-8 px-3 text-xs rounded border transition-colors flex items-center gap-1 font-medium ${
              gateway.isActive
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
            title={gateway.isActive ? 'Disable gateway' : 'Enable gateway'}
          >
            <Power size={12} />
            {gateway.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      )
    },
    enableResizing: false,
    enableSorting: false,
    size: 280,
  },
]