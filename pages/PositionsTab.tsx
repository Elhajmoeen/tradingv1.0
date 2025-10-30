import React from 'react'
import PositionsTabComponent from '@/pages/positions/PositionsTab'

interface PositionsTabProps {
  entityId: string
}

export default function PositionsTab({ entityId }: PositionsTabProps) {
  return (
    <div className="h-full">
      <PositionsTabComponent clientId={entityId} />
    </div>
  )
}
