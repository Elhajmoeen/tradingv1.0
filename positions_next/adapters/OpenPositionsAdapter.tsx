/**
 * Adapter for Open Positions page
 * Routes between legacy and RTK Query implementations based on feature flag
 */

import React, { useMemo, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useListOpenQuery } from '../state/positionsApi'
import { toExistingPosition } from '../types/position.schema'
import OpenPositionsTable from '@/components/positions/OpenPositionsTable'
import { selectPositionsByStatus } from '@/state/positionsSlice'
import { isPositionsNextEnabled } from '@/lib/flags'
import type { RootState } from '@/state/store'
import { buildQueryArgsFromTanStack, toSearchParamsV2, ColumnMeta } from '@/integration/query'
import { POSITIONS_PAGE_SIZE } from '@/constants/paging'

export function OpenPositionsAdapter() {
  const useNext = isPositionsNextEnabled()
  
  if (!useNext) {
    // Return legacy component when flag is off
    return <LegacyOpenPositionsContent />
  }

  // Local shadow of TanStack state (controlled but optional)
  const [tsState, setTsState] = useState<{
    pagination?: { pageIndex: number; pageSize: number };
    sorting?: Array<{ id: string; desc: boolean }>;
    columnFilters?: Array<{ id: string; value: any }>;
    globalFilter?: string | null;
  }>({
    pagination: { pageIndex: 0, pageSize: POSITIONS_PAGE_SIZE }
  })

  // OPTIONAL: supply column meta hints if you have them
  // Map columnId -> { type/op }
  const metaById: Record<string, ColumnMeta> = useMemo(() => ({
    // examples; adjust to your columns:
    amount: { type: "number" },
    openPrice: { type: "number" },
    currentPrice: { type: "number" },
    takeProfit: { type: "number" },
    stopLoss: { type: "number" },
    openPnL: { type: "number" },
    commission: { type: "number" },
    swap: { type: "number" },
    totalPnL: { type: "number" },
    type: { type: "enum" },
    instrument: { type: "text" },
  }), [])

  const getMeta = useCallback((id: string) => metaById[id], [metaById])

  const queryArgs = useMemo(() => {
    return buildQueryArgsFromTanStack({
      pagination: tsState.pagination,
      sorting: tsState.sorting,
      columnFilters: tsState.columnFilters,
      globalFilter: tsState.globalFilter ?? null,
      getMeta,
    })
  }, [tsState, getMeta])

  const search = toSearchParamsV2(queryArgs)
  
  // Use RTK Query for data fetching
  const { data: positionsData = [], isLoading, error } = useListOpenQuery(search)
  
  // Map DTOs to existing Position format for table compatibility
  const positions = React.useMemo(() => {
    return positionsData.map(toExistingPosition)
  }, [positionsData])
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading positions...</div>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    console.error('Failed to load open positions:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load positions. Please try again.</div>
      </div>
    )
  }
  
  // Render existing table component with RTK Query data
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h2 className="text-2xl font-semibold">Open Positions</h2>
        <div className="text-sm text-muted-foreground">
          {positions.length} position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <OpenPositionsTable 
          rows={positions ?? []}
          controlledState={tsState}
          onTableStateChange={(s) => setTsState((prev) => ({ ...prev, ...s }))}
        />
      </div>
    </div>
  )
}

/**
 * Legacy component wrapper for backward compatibility
 */
export function LegacyOpenPositionsContent() {
  const positions = useSelector((state: RootState) => selectPositionsByStatus(state, 'open'))
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <h2 className="text-2xl font-semibold">Open Positions</h2>
        <div className="text-sm text-muted-foreground">
          {positions.length} position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <OpenPositionsTable 
          rows={positions}
        />
      </div>
    </div>
  )
}