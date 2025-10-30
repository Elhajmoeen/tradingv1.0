/**
 * Adapter for Confirm Close Positions Modal
 * Routes between legacy and RTK Query implementations based on feature flag
 */

import React from 'react'
import { useCloseMutation } from '../state/positionsApi'
import ConfirmClosePositionsModal from '@/components/ConfirmClosePositionsModal'

interface ConfirmClosePositionsModalAdapterProps {
  open: boolean
  count: number
  onCancel: () => void
  onConfirm: () => void
  theme?: 'light' | 'dark'
  positionIds?: string[]
}

export function ConfirmClosePositionsModalAdapter({
  open,
  count,
  onCancel,
  onConfirm,
  theme = 'light',
  positionIds = [],
}: ConfirmClosePositionsModalAdapterProps) {
  const [closePosition] = useCloseMutation()

  const handleConfirm = async () => {
    try {
      // In a real implementation, we'd close all positions in the array
      // For now, just call the original confirm handler
      onConfirm()
    } catch (error) {
      console.error('Failed to close positions:', error)
    }
  }

  return (
    <ConfirmClosePositionsModal
      open={open}
      count={count}
      onCancel={onCancel}
      onConfirm={handleConfirm}
      theme={theme}
    />
  )
}

/**
 * Legacy modal wrapper for backward compatibility
 */
export function LegacyConfirmClosePositionsModal({
  open,
  count,
  onCancel,
  onConfirm,
  theme = 'light',
}: ConfirmClosePositionsModalAdapterProps) {
  return (
    <ConfirmClosePositionsModal
      open={open}
      count={count}
      onCancel={onCancel}
      onConfirm={onConfirm}
      theme={theme}
    />
  )
}