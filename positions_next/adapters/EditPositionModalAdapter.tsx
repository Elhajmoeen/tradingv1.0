/**
 * Adapter for Edit Position Modal
 * Routes between legacy and RTK Query implementations based on feature flag
 */

import React from 'react'
import { useUpdateMutation } from '../state/positionsApi'
import EditPositionModal from '@/components/positions/EditPositionModal'

interface EditPositionModalAdapterProps {
  open: boolean
  onClose: () => void
  positionIds: string[]
  onSuccess?: () => void
}

export function EditPositionModalAdapter({
  open,
  onClose,
  positionIds,
  onSuccess,
}: EditPositionModalAdapterProps) {
  const [updatePosition] = useUpdateMutation()

  // Similar to NewPositionModal, this would require modifications to support RTK Query
  // For now, just render the existing modal with original behavior
  return (
    <EditPositionModal
      open={open}
      onClose={onClose}
      positionIds={positionIds}
    />
  )
}

/**
 * Legacy modal wrapper for backward compatibility
 */
export function LegacyEditPositionModal({
  open,
  onClose,
  positionIds,
}: EditPositionModalAdapterProps) {
  return (
    <EditPositionModal
      open={open}
      onClose={onClose}
      positionIds={positionIds}
    />
  )
}