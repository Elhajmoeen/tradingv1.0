/**
 * Adapters for backward compatibility with existing position components
 * Transforms RTK Query data to existing component interface formats
 */

import { isPositionsNextEnabled } from '@/lib/flags'
import { store } from '@/state/store'
import { positionsApi } from '../state/positionsApi'
import type { PositionDTO } from '../types/position'
import type { Position } from '@/state/positionsSlice'

// Transform PositionDTO to existing Position interface
const transformPositionDTOToPosition = (dto: PositionDTO): Position => ({
  id: dto.id,
  clientId: dto.clientId,
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
  commission: dto.commission ?? undefined,
  swap: dto.swap ?? undefined,
  status: dto.status.toLowerCase() as 'open' | 'closed' | 'pending',
  openedAt: dto.openTime,
  closedAt: dto.closeTime ?? undefined,
  expirationDate: dto.expirationTime ?? undefined,
  // Calculate derived fields
  openPnL: dto.currentPrice && dto.openPrice 
    ? (dto.side === 'BUY' ? dto.currentPrice - dto.openPrice : dto.openPrice - dto.currentPrice) * dto.amountUnits
    : undefined,
  pnlWithout: dto.currentPrice && dto.openPrice 
    ? (dto.side === 'BUY' ? dto.currentPrice - dto.openPrice : dto.openPrice - dto.currentPrice) * dto.amountUnits
    : undefined,
  totalPnL: dto.currentPrice && dto.openPrice 
    ? ((dto.side === 'BUY' ? dto.currentPrice - dto.openPrice : dto.openPrice - dto.currentPrice) * dto.amountUnits) 
      + (dto.commission ?? 0) + (dto.swap ?? 0)
    : undefined,
})

// Transform array of DTOs to existing Position array
const transformPositionDTOs = (dtos: PositionDTO[]): Position[] => {
  return dtos.map(transformPositionDTOToPosition)
}

/**
 * Table adapter - provides data for existing position tables
 */
export const createTableAdapter = () => {
  const enabled = isPositionsNextEnabled()
  
  return {
    // Get open positions
    getOpenPositions: async (clientId?: string): Promise<Position[]> => {
      if (!enabled) {
        // Fallback to existing Redux selector or API call
        return []
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.listOpen.initiate(
            clientId ? { clientId } : undefined
          )
        ).unwrap()
        
        return transformPositionDTOs(result)
      } catch (error) {
        console.error('Failed to fetch open positions:', error)
        return []
      }
    },

    // Get pending positions
    getPendingPositions: async (clientId?: string): Promise<Position[]> => {
      if (!enabled) {
        return []
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.listPending.initiate(
            clientId ? { clientId } : undefined
          )
        ).unwrap()
        
        return transformPositionDTOs(result)
      } catch (error) {
        console.error('Failed to fetch pending positions:', error)
        return []
      }
    },

    // Get closed positions
    getClosedPositions: async (clientId?: string): Promise<Position[]> => {
      if (!enabled) {
        return []
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.listClosed.initiate(
            clientId ? { clientId } : undefined
          )
        ).unwrap()
        
        return transformPositionDTOs(result)
      } catch (error) {
        console.error('Failed to fetch closed positions:', error)
        return []
      }
    },

    // Get position by ID
    getPositionById: async (id: string): Promise<Position | null> => {
      if (!enabled) {
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.getById.initiate(id)
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to fetch position by ID:', error)
        return null
      }
    },
  }
}

/**
 * Modal adapter - provides mutations for existing position modals
 */
export const createModalAdapter = () => {
  const enabled = isPositionsNextEnabled()
  
  return {
    // Create new position
    createPosition: async (data: any): Promise<Position | null> => {
      if (!enabled) {
        // Fallback to existing Redux action
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.create.initiate(data)
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to create position:', error)
        throw error
      }
    },

    // Update position
    updatePosition: async (id: string, data: any): Promise<Position | null> => {
      if (!enabled) {
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.update.initiate({ id, body: data })
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to update position:', error)
        throw error
      }
    },

    // Close position
    closePosition: async (id: string, data: any): Promise<Position | null> => {
      if (!enabled) {
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.close.initiate({ id, body: data })
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to close position:', error)
        throw error
      }
    },

    // Cancel position
    cancelPosition: async (id: string, data?: any): Promise<Position | null> => {
      if (!enabled) {
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.cancel.initiate({ id, body: data })
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to cancel position:', error)
        throw error
      }
    },

    // Reopen position
    reopenPosition: async (id: string, data: any): Promise<Position | null> => {
      if (!enabled) {
        return null
      }

      try {
        const result = await store.dispatch(
          positionsApi.endpoints.reopen.initiate({ id, body: data })
        ).unwrap()
        
        return transformPositionDTOToPosition(result)
      } catch (error) {
        console.error('Failed to reopen position:', error)
        throw error
      }
    },
  }
}

// Export adapter instances
export const tableAdapter = createTableAdapter()
export const modalAdapter = createModalAdapter()