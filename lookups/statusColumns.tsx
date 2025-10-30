import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ArrowUp, ArrowDown, PencilSimple, Trash } from '@phosphor-icons/react'

export interface LookupValue {
  id: string;
  key: string;
  label: string;
  color?: string | null;
  order: number;
  active: boolean;
  deprecatedAt?: string | null;
  usageCount?: number;
}

const columnHelper = createColumnHelper<LookupValue>()

export const statusColumns = [
  columnHelper.accessor('order', {
    id: 'order',
    header: 'Order',
    cell: ({ row }) => (
      <div className="flex items-center space-x-1">
        <span className="text-sm font-mono text-gray-500">
          {row.original.order}
        </span>
      </div>
    ),
    size: 80,
  }),

  columnHelper.accessor('label', {
    id: 'label',
    header: 'Label',
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        {row.original.color && (
          <div 
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: row.original.color }}
          />
        )}
        <div className="flex flex-col">
          <span className={`font-medium ${
            row.original.deprecatedAt ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {row.original.label}
          </span>
          {row.original.deprecatedAt && (
            <span className="text-xs text-red-600">
              Deprecated {new Date(row.original.deprecatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    ),
    size: 200,
  }),

  columnHelper.accessor('key', {
    id: 'key',
    header: 'Key',
    cell: ({ getValue }) => (
      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
        {getValue()}
      </code>
    ),
    size: 150,
  }),

  columnHelper.accessor('color', {
    id: 'color',
    header: 'Color',
    cell: ({ getValue }) => {
      const color = getValue()
      return color ? (
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-600 font-mono">{color}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      )
    },
    size: 120,
  }),

  columnHelper.accessor('active', {
    id: 'active',
    header: 'Status',
    cell: ({ row, table }) => {
      const { onToggleActive } = table.options.meta as any
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={row.original.active}
            onCheckedChange={(checked) => onToggleActive(row.original.id, checked)}
            disabled={!!row.original.deprecatedAt}
          />
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      )
    },
    size: 120,
  }),

  columnHelper.accessor('usageCount', {
    id: 'usageCount',
    header: 'Usage',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600">
        {getValue() ?? 0}
      </span>
    ),
    size: 80,
  }),

  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const { onEdit, onMove, onDeprecate } = table.options.meta as any
      const isFirst = row.index === 0
      const isLast = row.index === table.getRowModel().rows.length - 1
      
      return (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(row.original.id, -1)}
            disabled={isFirst}
            className="h-8 w-8 p-0"
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(row.original.id, 1)}
            disabled={isLast}
            className="h-8 w-8 p-0"
          >
            <ArrowDown size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 p-0"
          >
            <PencilSimple size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeprecate(row.original.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash size={14} />
          </Button>
        </div>
      )
    },
    size: 160,
  }),
]

export const STATUS_TABLE_ID = 'status-manager-table'

export const initialColumnSizing = {
  order: 80,
  label: 200,
  key: 150,
  color: 120,
  active: 120,
  usageCount: 80,
  actions: 160,
}