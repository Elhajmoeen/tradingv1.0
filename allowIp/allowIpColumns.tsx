import React from 'react'
import { ColumnDef } from '@tanstack/react-table'

export const ALLOW_IP_TABLE_ID = 'settings.allowIp.v1'

export const initialColumnSizing = {
  _select: 44,
  ip: 200,
  description: 260,
  status: 110,
  actions: 240,
}

interface TableMeta {
  onOpenEdit: (allowIp: any) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (allowIp: any) => void
}

export const allowIpColumns: ColumnDef<any>[] = [
  {
    id: 'ip',
    accessorKey: 'ip',
    header: 'IP Address',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{String(getValue() || '')}</span>
    ),
    size: 200,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => (
      <span className="text-gray-700">{String(getValue() || 'No description')}</span>
    ),
    size: 260,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => (
      <span className="text-sm">{String(getValue() || '')}</span>
    ),
    size: 110,
  }
]
