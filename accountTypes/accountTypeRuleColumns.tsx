import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AccountTypeAssetRule } from '@/state/accountTypeAssetRulesSlice'

export const ACCOUNT_TYPE_RULES_TABLE_ID = 'settings.accountTypeRules.v1'

// Helper function to safely parse decimal numbers
const parseDecimal = (input: string): number | null => {
  const cleanInput = input.replace(/,/g, '').trim()
  if (cleanInput === '') return null
  const num = Number(cleanInput)
  return Number.isFinite(num) ? num : null
}

// NumericCell component for large-number safe inputs
const NumericCell: React.FC<{
  value: number | string
  onChange: (value: number) => void
  min?: number
  max?: number
  placeholder?: string
  className?: string
}> = ({ value, onChange, min, max, placeholder = '', className = '' }) => {
  const [localValue, setLocalValue] = React.useState(String(value ?? ''))
  const [isValid, setIsValid] = React.useState(true)

  React.useEffect(() => {
    setLocalValue(String(value ?? ''))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove commas and allow only valid decimal characters
    const sanitized = e.target.value.replace(/,/g, '')
    setLocalValue(sanitized)
    setIsValid(true)
  }

  const handleBlur = () => {
    const parsedValue = parseDecimal(localValue)
    
    if (parsedValue === null) {
      setLocalValue(String(value ?? ''))
      setIsValid(true)
      return
    }

    // Validate bounds
    if (min !== undefined && parsedValue < min) {
      setIsValid(false)
      return
    }

    if (max !== undefined && parsedValue > max) {
      setIsValid(false)
      return
    }

    setIsValid(true)
    onChange(parsedValue)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`h-8 w-full min-w-[110px] rounded-md border bg-white px-2 text-right text-sm tabular-nums focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
        isValid ? 'border-gray-300' : 'border-red-500'
      } ${className}`}
      style={{
        // Hide number spinners
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
      }}
    />
  )
}

export const accountTypeRuleColumns: ColumnDef<AccountTypeAssetRule>[] = [
  {
    id: '_select',
    header: ({ table }) => (
      <div className="flex justify-center px-2 py-1.5">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            const meta = table.options.meta as any
            meta?.onSelectAll?.(e.target.checked)
          }}
        />
      </div>
    ),
    cell: ({ row, table }) => (
      <div className="flex justify-center px-2 py-1.5">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          checked={(table.options.meta as any)?.selectedRows?.has(row.original.assetId) || false}
          onChange={(e) => {
            const meta = table.options.meta as any
            meta?.onRowSelect?.(row.original.assetId, e.target.checked)
          }}
        />
      </div>
    ),
    size: 44,
    minSize: 44,
    enableResizing: false,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'assetName',
    accessorKey: 'assetName',
    header: 'Asset Name',
    cell: ({ getValue }) => (
      <div className="px-2 py-1.5">
        <span className="font-medium text-sm">{String(getValue())}</span>
      </div>
    ),
    size: 120,
    minSize: 110,
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'includesString',
    meta: { align: 'left' },
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => {
      const value = String(getValue() ?? '')
      
      return (
        <div className="px-2 py-1.5">
          <span className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
            {value}
          </span>
        </div>
      )
    },
    size: 120,
    minSize: 110,
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'includesString',
    meta: { align: 'left' },
  },
  {
    id: 'leverage',
    accessorKey: 'leverage',
    header: 'Leverage',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { leverage: newValue })}
            min={1}
            max={1000}
            placeholder="50"
          />
        </div>
      )
    },
    size: 110,
    minSize: 90,
    meta: { align: 'right' },
  },
  {
    id: 'spread',
    accessorKey: 'spread',
    header: 'Spread',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { spread: newValue })}
            min={0}
            placeholder="20"
          />
        </div>
      )
    },
    size: 110,
    minSize: 90,
    meta: { align: 'right' },
  },
  {
    id: 'defaultSize',
    accessorKey: 'defaultSize',
    header: 'Default',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { defaultSize: newValue })}
            min={0.01}
            placeholder="0.10"
          />
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: { align: 'right' },
  },
  {
    id: 'stepSize',
    accessorKey: 'stepSize',
    header: 'Jump',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { stepSize: newValue })}
            min={0.001}
            placeholder="0.01"
          />
        </div>
      )
    },
    size: 110,
    minSize: 90,
    meta: { align: 'right' },
  },
  {
    id: 'minSize',
    accessorKey: 'minSize',
    header: 'Mini Deal',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { minSize: newValue })}
            min={0.001}
            placeholder="0.01"
          />
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: { align: 'right' },
  },
  {
    id: 'maxSize',
    accessorKey: 'maxSize',
    header: 'Max Deal',
    cell: ({ getValue, row, table }) => {
      const meta = table.options.meta as any
      const value = Number(getValue())
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={value}
            onChange={(newValue) => meta?.onFieldChange?.(row.original.assetId, { maxSize: newValue })}
            min={0.01}
            placeholder="100"
          />
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: { align: 'right' },
  },
  {
    id: 'commission',
    header: 'Commission',
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const rule = row.original
      
      return (
        <div className="px-2 py-1.5 flex gap-1 items-center">
          <select
            value={rule.commissionType}
            onChange={(e) => meta?.onFieldChange?.(rule.assetId, { 
              commissionType: e.target.value as 'perLot' | 'perNotional' 
            })}
            className="px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0 h-8"
          >
            <option value="perLot">Per Lot</option>
            <option value="perNotional">Per Notional</option>
          </select>
          <NumericCell
            value={rule.commissionValue}
            onChange={(newValue) => meta?.onFieldChange?.(rule.assetId, { commissionValue: newValue })}
            min={0}
            placeholder="0"
            className="w-16 text-xs"
          />
        </div>
      )
    },
    size: 130,
    minSize: 120,
    meta: { align: 'right' },
  },
  {
    id: 'swapLong',
    header: 'Swap Long',
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const rule = row.original
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={rule.swapLong}
            onChange={(newValue) => meta?.onFieldChange?.(rule.assetId, { swapLong: newValue })}
            placeholder="0"
          />
        </div>
      )
    },
    size: 110,
    minSize: 90,
    meta: { align: 'right' },
  },
  {
    id: 'swapShort',
    header: 'Swap Short',
    cell: ({ row, table }) => {
      const meta = table.options.meta as any
      const rule = row.original
      
      return (
        <div className="px-2 py-1.5">
          <NumericCell
            value={rule.swapShort}
            onChange={(newValue) => meta?.onFieldChange?.(rule.assetId, { swapShort: newValue })}
            placeholder="0"
          />
        </div>
      )
    },
    size: 110,
    minSize: 90,
    meta: { align: 'right' },
  },
  {
    id: 'status',
    accessorKey: 'enabled',
    header: 'Status',
    cell: ({ getValue }) => {
      const enabled = Boolean(getValue())
      return (
        <div className="px-2 py-1.5 flex justify-center">
          <span
            className={
              'inline-flex items-center rounded-full px-2 py-1 text-xs ' +
              (enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600')
            }
          >
            {enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      )
    },
    size: 110,
    minSize: 90,
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      if (value === 'all') return true
      const enabled = Boolean(row.getValue(id))
      return value === 'active' ? enabled : !enabled
    },
    meta: { align: 'center' },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onToggleEnabled: (assetId: string, enabled: boolean) => void
        onRemove: (assetId: string) => void
      }

      const rule = row.original
      return (
        <div className="px-2 py-1.5 flex justify-center gap-1">
          <button
            className={
              'rounded-md px-2 py-1 text-xs font-medium ' +
              (rule.enabled 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-green-600 hover:bg-green-700 text-white')
            }
            onClick={() => meta?.onToggleEnabled?.(rule.assetId, rule.enabled)}
          >
            {rule.enabled ? 'Disable' : 'Enable'}
          </button>
          <button
            className="rounded-md bg-red-100 text-red-700 px-2 py-1 text-xs hover:bg-red-200 font-medium"
            onClick={() => {
              if (window.confirm(`Remove ${rule.assetName} from this account type?`)) {
                meta?.onRemove?.(rule.assetId)
              }
            }}
          >
            Remove
          </button>
        </div>
      )
    },
    size: 170,
    minSize: 160,
    enableResizing: false,
    enableSorting: false,
    meta: { align: 'center' },
  },
]