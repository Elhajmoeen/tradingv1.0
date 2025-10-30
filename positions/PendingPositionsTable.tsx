import React, { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import {
  SortingState,
  RowSelectionState,
  createColumnHelper,
} from '@tanstack/react-table'
import type { Position } from '@/state/positionsSlice'
import { POSITIONS_PAGE_SIZE } from '@/constants/paging'
import TableSkin from './TableSkin'
import { 
  CheckboxCell, 
  SideBadgeCell, 
  PriceCell, 
  DateTimeCell, 
  VolumeCell, 
  IdCell 
} from './shared/CellRenderers'

interface PendingPositionsTableProps {
  rows: Position[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

const columnHelper = createColumnHelper<Position>()

function handleModifyOrder(position: Position) {
  toast.info(`Modify order ${position.id}`)
}

function handleCancelOrder(position: Position) {
  toast.info(`Cancel order ${position.id}`)
}

export default function PendingPositionsTable({ 
  rows, 
  selectedIds = [], 
  onSelectionChange 
}: PendingPositionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'openedAt', desc: true }
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const selectedPositionIds = Object.keys(rowSelection).filter(id => rowSelection[id])
    onSelectionChange?.(selectedPositionIds)
  }, [rowSelection, onSelectionChange])

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: CheckboxCell.header,
      cell: CheckboxCell.cell,
      size: 60,
    }),
    columnHelper.accessor('id', {
      header: 'Order ID',
      cell: (info) => IdCell(info.getValue()),
      size: 80,
    }),
    columnHelper.accessor('instrument', {
      header: 'Symbol',
      cell: (info) => info.getValue(),
      size: 100,
    }),
    columnHelper.accessor(row => row.type === 'Buy' ? 'BUY' : 'SELL', {
      id: 'side',
      header: 'Buy/Sell',
      cell: (info) => SideBadgeCell(info.getValue()),
      size: 90,
    }),
    columnHelper.accessor('amount', {
      header: 'Volume',
      cell: (info) => VolumeCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('openPrice', {
      header: 'Target Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('currentPrice', {
      header: 'Current Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 130,
    }),
    columnHelper.accessor('takeProfit', {
      header: 'Take Profit',
      cell: (info) => info.getValue() ? PriceCell(info.getValue()!) : '-',
      size: 120,
    }),
    columnHelper.accessor('stopLoss', {
      header: 'Stop Loss',
      cell: (info) => info.getValue() ? PriceCell(info.getValue()!) : '-',
      size: 120,
    }),
    columnHelper.accessor('openedAt', {
      header: 'Created At',
      cell: (info) => info.getValue() ? DateTimeCell(info.getValue()!) : '-',
      size: 140,
    }),
    columnHelper.accessor('expirationDate', {
      header: 'Expires',
      cell: (info) => {
        const date = info.getValue()
        if (!date) return <span className="text-muted-foreground">No expiry</span>
        return DateTimeCell(date as string)
      },
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleModifyOrder(row.original)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            Modify
          </button>
          <button
            onClick={() => handleCancelOrder(row.original)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      ),
      size: 120,
    }),
  ], [])

  // Calculate pagination for current page
  const startIndex = currentPage * POSITIONS_PAGE_SIZE
  const endIndex = startIndex + POSITIONS_PAGE_SIZE
  const paginatedRows = rows.slice(startIndex, endIndex)

  return (
    <TableSkin
      items={paginatedRows}
      columns={columns}
      total={rows.length}
      page={currentPage}
      pageSize={POSITIONS_PAGE_SIZE}
      onPageChange={setCurrentPage}
      onRowSelect={onSelectionChange}
      selectedIds={selectedIds}
      sorting={sorting}
      onSortingChange={setSorting}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      emptyMessage="No pending orders found."
    />
  )
}
