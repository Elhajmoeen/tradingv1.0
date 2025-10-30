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

interface ClosedPositionsTableProps {
  rows: Position[]
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

const columnHelper = createColumnHelper<Position>()

function handleViewDetails(position: Position) {
  toast.info(`View details for position ${position.id}`)
}

export default function ClosedPositionsTable({ 
  rows, 
  selectedIds = [], 
  onSelectionChange 
}: ClosedPositionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'closedAt', desc: true }
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
    columnHelper.accessor('amount', {
      header: 'Volume',
      cell: (info) => VolumeCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('openPrice', {
      header: 'Open Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('closedPrice', {
      header: 'Close Price',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('totalPnL', {
      header: 'Total P&L',
      cell: (info) => PnlCell(info.getValue() as number),
      size: 120,
    }),
    columnHelper.accessor('commission', {
      header: 'Commission',
      cell: (info) => PriceCell(info.getValue() || 0),
      size: 120,
    }),
    columnHelper.accessor('swap', {
      header: 'Swap',
      cell: (info) => {
        const value = info.getValue() as number
        return <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>${value?.toFixed(2)}</span>
      },
      size: 100,
    }),
    columnHelper.accessor('closedAt', {
      header: 'Closed At',
      cell: (info) => DateTimeCell(info.getValue() as string),
      size: 140,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDetails(row.original)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </button>
        </div>
      ),
      size: 80,
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
      emptyMessage="No closed positions found."
    />
  )
}
