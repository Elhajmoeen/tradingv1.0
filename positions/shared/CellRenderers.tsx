import React from 'react'

// Shared cell renderers for position tables
export const CheckboxCell = {
  header: ({ table }: any) => (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        ref={(el: HTMLInputElement | null) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected()
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="h-4 w-4 rounded border border-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </div>
  ),
  cell: ({ row }: any) => (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border border-primary ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </div>
  ),
}

export const SideBadgeCell = (value: string) => (
  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
    value === 'BUY' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {value === 'BUY' ? 'Buy' : 'Sell'}
  </span>
)

export const PnlCell = (value: number) => (
  <span className={value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
    ${value?.toFixed(2)}
  </span>
)

export const PriceCell = (value: number) => `$${value?.toFixed(2)}`

export const DateTimeCell = (value: string) => {
  const date = new Date(value)
  return (
    <div className="text-sm">
      <div>{date.toLocaleDateString()}</div>
      <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
    </div>
  )
}

export const DateCell = (value: string) => {
  const date = new Date(value)
  return date.toLocaleDateString()
}

export const VolumeCell = (value: number) => value?.toLocaleString()

export const IdCell = (value: string | number) => `#${value}`