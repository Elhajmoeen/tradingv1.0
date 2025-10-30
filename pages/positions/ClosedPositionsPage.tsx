import React from 'react'
import { isPositionsNextEnabled } from '@/lib/flags'
import { ClosedPositionsAdapter, LegacyClosedPositionsContent } from '@/features/positions_next/adapters/ClosedPositionsAdapter'

// DEV-only diagnostics
const PositionsDiag = import.meta.env.DEV ? 
  React.lazy(() => import('@/features/positions_next/dev/PositionsDiag').then(m => ({ default: m.PositionsDiag }))) : 
  null

export default function ClosedPositionsPage() {
  // Feature flag check
  const useNext = isPositionsNextEnabled()
  
  // Return new implementation if flag is enabled
  if (useNext) {
    return (
      <>
        <ClosedPositionsAdapter />
        {/* DEV Diagnostics Panel */}
        {import.meta.env.DEV && PositionsDiag && (
          <React.Suspense fallback={null}>
            <PositionsDiag />
          </React.Suspense>
        )}
      </>
    )
  }
  
  // Legacy implementation
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Closed Positions</h1>
        <p className="text-muted-foreground">
          View all closed trading positions
        </p>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <p>Closed Positions table will be implemented here</p>
      </div>
    </div>
  )
}