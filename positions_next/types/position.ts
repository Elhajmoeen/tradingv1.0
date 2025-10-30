/**
 * Position DTO types for the "next" positions feature
 * These align with API responses and table display requirements
 */

export interface PositionDTO {
  id: string
  accountId: string
  instrument: string
  side: 'BUY' | 'SELL'
  amountUnits: number
  openPrice: number
  takeProfit?: number | null
  stopLoss?: number | null
  currentPrice?: number | null
  commission?: number | null
  swap?: number | null
  openReason?: string | null
  openTime: string // ISO string
  status: 'OPEN' | 'PENDING' | 'CLOSED' | 'CANCELLED'
  closePrice?: number | null
  closeTime?: string | null // ISO string
  closeReason?: string | null
  expirationTime?: string | null // ISO string for pending orders
}

export interface CreatePositionRequest {
  accountId: string
  instrument: string
  side: 'BUY' | 'SELL'
  amountUnits: number
  openPrice: number
  takeProfit?: number
  stopLoss?: number
  openReason?: string
  expirationTime?: string // For pending orders
}

export interface NewPositionInput {
  instrument: string;
  side: 'BUY'|'SELL';
  amountUnits: number;
  openPrice?: number; // market/instant orders may not have this
  // Existing:
  takeProfit?: number | null;  // price
  stopLoss?: number | null;    // price
  // New (optional, internal-first):
  takeProfitAmount?: number | null; // cash P&L (+)
  stopLossAmount?: number | null;   // cash P&L (+)
  // UI-only (don't send to API unless BE supports):
  tpMode?: 'price'|'amount';
  slMode?: 'price'|'amount';
}

export interface UpdatePositionRequest {
  takeProfit?: number
  stopLoss?: number
  openReason?: string
}

export interface ClosePositionRequest {
  closePrice: number
  closeReason?: string
}

export interface CancelPositionRequest {
  reason?: string
}

export interface ReopenPositionRequest {
  openPrice: number
  openReason?: string
}