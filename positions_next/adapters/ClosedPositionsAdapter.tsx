/**
 * Adapter for Closed Positions page
 * Routes between legacy and RTK Query implementations based on feature flag
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { useListClosedQuery } from '../state/positionsApi'
import { toExistingPosition } from '../types/position.schema'
import ClosedPositionsTable from '@/components/positions/ClosedPositionsTable'
import { selectPositionsByStatus } from '@/state/positionsSlice'
import type { RootState } from '@/state/store'
import { POSITIONS_PAGE_SIZE } from '@/constants/paging'

export function ClosedPositionsAdapter() {
  // Use RTK Query for data fetching with pagination
  const { data: positionsData = [], isLoading, error } = useListClosedQuery({
    pageSize: POSITIONS_PAGE_SIZE
  })
  
  // Map DTOs to existing Position format for table compatibility
  const positions = React.useMemo(() => {
    return positionsData.map(toExistingPosition)
  }, [positionsData])
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading closed positions...</div>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    console.error('Failed to load closed positions:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load positions. Please try again.</div>
      </div>
    )
  }
  
  // Render existing table component with RTK Query data
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Closed Positions</h2>
        <div className="text-sm text-muted-foreground">
          {positions.length} closed position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <ClosedPositionsTable 
        rows={positions}
      />
    </div>
  )
}

/**
 * Legacy component wrapper for backward compatibility
 */
export function LegacyClosedPositionsContent() {
  const positions = useSelector((state: RootState) => selectPositionsByStatus(state, 'closed'))
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Closed Positions</h2>
        <div className="text-sm text-muted-foreground">
          {positions.length} closed position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <ClosedPositionsTable 
        rows={positions}
      />
    </div>
  )
}