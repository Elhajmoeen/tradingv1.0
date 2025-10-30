/**
 * Adapter for New Position Modal
 * Routes between legacy and enhanced implementations based on feature flag
 */

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPosition } from '@/state/positionsSlice'
import { selectQuoteByInstrument } from '@/features/market/marketSlice'
import { isTpSlAmountEnabled } from '@/lib/flags'
import { EnhancedNewPositionModal } from '../components/EnhancedNewPositionModal'
import { type NewPositionInput } from '../types/position'
import NewPositionModal from '@/components/positions/NewPositionModal'
import type { RootState } from '@/state/store'

interface NewPositionModalAdapterProps {
  open: boolean
  onClose: () => void
  accountId: string
  onSuccess?: () => void
}

export function NewPositionModalAdapter({
  open,
  onClose,
  accountId,
  onSuccess,
}: NewPositionModalAdapterProps) {
  const dispatch = useDispatch()

  // Handle form submission for enhanced modal (using same Redux approach as original)
  const handleEnhancedSubmit = async (data: NewPositionInput) => {
    try {
      // Create position object similar to original modal
      const newPosition = {
        id: `POS-${Date.now()}`,
        clientId: accountId,
        instrument: data.instrument,
        type: data.side === 'BUY' ? 'Buy' : 'Sell',
        amount: data.amountUnits,
        openVolume: data.amountUnits * (data.openPrice || 0),
        openPrice: data.openPrice || 0,
        currentPrice: data.openPrice || 0,
        takeProfit: data.takeProfit || undefined,
        stopLoss: data.stopLoss || undefined,
        openReason: 'Manual',
        openPnL: 0,
        openIp: '192.168.1.1',
        commission: data.amountUnits * 0.0015,
        swap: 0,
        totalPnL: 0,
        status: 'open' as const,
        openedAt: new Date().toISOString()
      }

      dispatch(addPosition(newPosition))
      onSuccess?.()
    } catch (error) {
      // Error handling - re-throw to let component handle it
      throw error
    }
  }

  // Use enhanced modal if feature flag is enabled
  if (isTpSlAmountEnabled()) {
    return (
      <EnhancedNewPositionModal
        open={open}
        onClose={onClose}
        accountId={accountId}
        onSubmit={handleEnhancedSubmit}
        theme="dark"
      />
    )
  }

  // Fallback to legacy modal
  return (
    <NewPositionModal
      open={open}
      onClose={onClose}
      accountId={accountId}
    />
  )
}

/**
 * Legacy modal wrapper for backward compatibility  
 */
export function LegacyNewPositionModal({
  open,
  onClose,
  accountId,
}: NewPositionModalAdapterProps) {
  return (
    <NewPositionModal
      open={open}
      onClose={onClose}
      accountId={accountId}
    />
  )
}