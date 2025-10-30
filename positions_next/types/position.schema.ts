/**
 * Zod schemas for position validation and parsing
 * Includes computed fields for PnL calculations
 */

import { z } from 'zod'
import type { PositionDTO } from './position'
import { normalizeMany } from '@/integration/idMap'

// Zod schema for PositionDTO with proper numeric coercion and ID normalization
export const positionDTOSchema = z.object({
  id: z.string(),
  accountId: z.string().optional(),
  clientId: z.string().optional(),
  instrument: z.string(),
  side: z.enum(['BUY', 'SELL']),
  amountUnits: z.coerce.number(),
  openPrice: z.coerce.number(),
  takeProfit: z.coerce.number().optional().nullable(),
  stopLoss: z.coerce.number().optional().nullable(),
  currentPrice: z.coerce.number().optional().nullable(),
  commission: z.coerce.number().optional().nullable(),
  swap: z.coerce.number().optional().nullable(),
  openReason: z.string().optional().nullable(),
  openTime: z.string(), // ISO string
  status: z.enum(['OPEN', 'PENDING', 'CLOSED', 'CANCELLED']),
  closePrice: z.coerce.number().optional().nullable(),
  closeTime: z.string().optional().nullable(), // ISO string
  closeReason: z.string().optional().nullable(),
  expirationTime: z.string().optional().nullable(), // ISO string
}).transform(v => ({ ...v, accountId: v.accountId ?? v.clientId ?? "" }))

// Schema for arrays of positions
export const positionsArraySchema = z.array(positionDTOSchema)

/**
 * Calculate open PnL for a position
 */
export function getOpenPnl(dto: PositionDTO): number {
  if (!dto.currentPrice || dto.status !== 'OPEN') {
    return 0
  }
  
  const priceDiff = dto.side === 'BUY' 
    ? dto.currentPrice - dto.openPrice
    : dto.openPrice - dto.currentPrice
    
  return priceDiff * dto.amountUnits
}

/**
 * Calculate total PnL including commissions and swaps
 */
export function getTotalPnl(dto: PositionDTO): number {
  const openPnl = getOpenPnl(dto)
  const commission = dto.commission ?? 0
  const swap = dto.swap ?? 0
  
  return openPnl - commission + swap
}

/**
 * Parse and validate unknown data as positions array
 */
export function parsePositions(data: unknown): PositionDTO[] {
  try {
    const parsed = positionsArraySchema.parse(data)
    return normalizeMany<PositionDTO>(parsed)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to parse positions data:', error)
      console.warn('Raw data:', data)
    }
    return []
  }
}

/**
 * Map DTO to existing Position type for compatibility
 */
export function toExistingPosition(dto: PositionDTO): import('../../../state/positionsSlice').Position {
  return {
    id: dto.id,
    clientId: dto.accountId, // Use normalized accountId
    instrument: dto.instrument,
    type: dto.side === 'BUY' ? 'Buy' : 'Sell',
    amount: dto.amountUnits,
    openPrice: dto.openPrice,
    currentPrice: dto.currentPrice ?? undefined,
    closedPrice: dto.closePrice ?? undefined,
    takeProfit: dto.takeProfit ?? undefined,
    stopLoss: dto.stopLoss ?? undefined,
    openReason: dto.openReason ?? undefined,
    closeReason: dto.closeReason ?? undefined,
    openPnL: getOpenPnl(dto),
    pnlWithout: getOpenPnl(dto),
    commission: dto.commission ?? undefined,
    swap: dto.swap ?? undefined,
    totalPnL: getTotalPnl(dto),
    status: dto.status.toLowerCase() as any,
    openedAt: dto.openTime,
    closedAt: dto.closeTime ?? undefined,
    expirationDate: dto.expirationTime ?? undefined,
  }
}