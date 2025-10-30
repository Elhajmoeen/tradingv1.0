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
  PnlCell, 
  PriceCell, 
  DateTimeCell, 
  VolumeCell, 
  IdCell 
} from './shared/CellRenderers'

interface OpenPositionsTableProps {
  rows: Position[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

const columnHelper = createColumnHelper<Position>()

function handleModifyPosition(position: Position) {
  toast.info(`Modify position ${position.id}`)
}

function handleClosePosition(position: Position) {
  toast.info(`Close position ${position.id}`)
}

export default function OpenPositionsTable({ 
  rows, 
  selectedIds = [], 
  onSelectionChange 
}: OpenPositionsTableProps) {
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
      header: 'ID',
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
    columnHelper.accessor('openVolume', {
      header: 'Open Volume',
      cell: (info) => VolumeCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('openPrice', {
      header: 'Open Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('currentPrice', {
      header: 'Current Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 130,
    }),
    columnHelper.accessor('stopLoss', {
      header: 'Stop Loss',
      cell: (info) => info.getValue() ? PriceCell(info.getValue()!) : '-',
      size: 120,
    }),
    columnHelper.accessor('takeProfit', {
      header: 'Take Profit',
      cell: (info) => info.getValue() ? PriceCell(info.getValue()!) : '-',
      size: 120,
    }),
    columnHelper.accessor((row) => {
      const openPrice = row.openPrice || 0
      const currentPrice = row.currentPrice || 0
      const volume = row.openVolume || 0
      const isLong = row.type === 'Buy'
      return isLong 
        ? (currentPrice - openPrice) * volume
        : (openPrice - currentPrice) * volume
    }, {
      id: 'pnl',
      header: 'P&L',
      cell: (info) => PnlCell(info.getValue() as number),
      size: 100,
    }),
    columnHelper.accessor('openedAt', {
      header: 'Opened At',
      cell: (info) => DateTimeCell(info.getValue() as string),
      size: 140,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleModifyPosition(row.original)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            Modify
          </button>
          <button
            onClick={() => handleClosePosition(row.original)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Close
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
      emptyMessage="No open positions found."
    />
  )
}
