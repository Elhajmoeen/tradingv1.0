import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import type { RootState } from './store'

export type PositionStatus = 'open' | 'closed' | 'pending'

export interface Position {
  id: string               // Position ID
  clientId: string         // links to the profile owner
  instrument: string
  type: 'Buy' | 'Sell'
  amount: number
  openVolume?: number
  openPrice: number
  currentPrice?: number
  closedPrice?: number     // For closed positions
  takeProfit?: number
  stopLoss?: number
  openReason?: string
  closeReason?: string     // For closed positions
  openPnL?: number         // excl. commissions & swaps (same as pnlWithout)
  pnlWithout?: number      // PnL without commissions and swaps
  openIp?: string
  closeIp?: string         // For closed positions
  closeVolume?: number     // For closed positions
  commission?: number
  swap?: number
  totalPnL?: number        // incl. commissions & swaps
  status: PositionStatus
  openedAt?: string
  closedAt?: string
  expirationDate?: string  // For pending positions
}

export interface PositionsState {
  open: Position[]
  closed: Position[]
  pending: Position[]
}

const initialState: PositionsState = {
  open: [
    {
      id: 'POS-001',
      clientId: 'ACC9001',
      instrument: 'EUR/USD',
      type: 'Buy',
      amount: 10000,
      openVolume: 10875.00,
      openPrice: 1.0875,
      currentPrice: 1.0890,
      takeProfit: 1.0950,
      stopLoss: 1.0800,
      openReason: 'Technical Analysis',
      openPnL: 135.50,
      openIp: '192.168.1.100',
      commission: 15.00,
      swap: -2.45,
      totalPnL: 148.05,
      status: 'open',
      openedAt: '2025-10-12T09:15:00Z'
    },
    {
      id: 'POS-002',
      clientId: 'ACC9001',
      instrument: 'GBP/USD',
      type: 'Sell',
      amount: 5000,
      openVolume: 6262.50,
      openPrice: 1.2525,
      currentPrice: 1.2510,
      takeProfit: 1.2450,
      stopLoss: 1.2600,
      openReason: 'News Event',
      openPnL: 67.50,
      openIp: '192.168.1.101',
      commission: 7.50,
      swap: 1.20,
      totalPnL: 76.20,
      status: 'open',
      openedAt: '2025-10-12T10:30:00Z'
    },
    {
      id: 'POS-003',
      clientId: 'ACC9001',
      instrument: 'USD/JPY',
      type: 'Buy',
      amount: 15000,
      openVolume: 15000.00,
      openPrice: 149.25,
      currentPrice: 149.88,
      stopLoss: 148.50,
      openReason: 'Scalping',
      openPnL: 632.25,
      openIp: '192.168.1.102',
      commission: 22.50,
      swap: 0.75,
      totalPnL: 655.50,
      status: 'open',
      openedAt: '2025-10-12T11:45:00Z'
    }
  ],
  closed: [
    {
      id: 'POS-004',
      clientId: 'ACC9001',
      instrument: 'XAU/USD',
      type: 'Sell',
      amount: 2000,
      openVolume: 3925000.00,
      openPrice: 1962.50,
      currentPrice: 1958.25,
      closedPrice: 1958.25,
      takeProfit: 1945.00,
      stopLoss: 1980.00,
      openReason: 'Hedge',
      closeReason: 'Take Profit Hit',
      openIp: '192.168.1.105',
      closeIp: '192.168.1.105',
      closeVolume: 3916500.00,
      commission: 30.00,
      swap: -5.80,
      pnlWithout: 85.00, // (1962.50 - 1958.25) * 2000 for Sell position  
      totalPnL: 49.20, // 85.00 - 30.00 + (-5.80) = 49.20
      status: 'closed',
      openedAt: '2025-10-11T14:20:00Z',
      closedAt: '2025-10-12T09:45:00Z'
    },
    {
      id: 'POS-006',
      clientId: 'ACC9001',
      instrument: 'EUR/USD',
      type: 'Buy',
      amount: 25000,
      openVolume: 27500.00,
      openPrice: 1.1000,
      currentPrice: 1.1025,
      closedPrice: 1.1025,
      takeProfit: 1.1100,
      stopLoss: 1.0950,
      openReason: 'Manual',
      closeReason: 'Manual Close',
      openIp: '192.168.1.103',
      closeIp: '192.168.1.103',
      closeVolume: 27562.50,
      commission: 15.50,
      swap: 2.25,
      pnlWithout: 62.50, // (1.1025 - 1.1000) * 25000 for Buy position
      totalPnL: 49.25, // 62.50 - 15.50 + 2.25 = 49.25
      status: 'closed',
      openedAt: '2025-10-10T08:30:00Z',
      closedAt: '2025-10-11T16:20:00Z'
    }
  ],
  pending: [
    {
      id: 'POS-005',
      clientId: 'ACC9001',
      instrument: 'BTC/USD',
      type: 'Buy',
      amount: 1000,
      openPrice: 42500.00,
      currentPrice: 41800.00,
      takeProfit: 45000.00,
      stopLoss: 40000.00,
      openReason: 'Manual',
      status: 'pending',
      openedAt: '2025-10-12T15:05:00Z',
      expirationDate: '2025-10-15T23:59:59Z'
    },
    {
      id: 'POS-006',
      clientId: 'ACC9002',
      instrument: 'EUR/USD',
      type: 'Sell',
      amount: 5000,
      openPrice: 1.0950,
      currentPrice: 1.0923,
      takeProfit: 1.0900,
      stopLoss: 1.1000,
      openReason: 'Technical Analysis',
      status: 'pending',
      openedAt: '2025-10-13T09:15:00Z',
      expirationDate: '2025-10-16T18:00:00Z'
    },
    {
      id: 'POS-007',
      clientId: 'ACC9001',
      instrument: 'GBP/USD',
      type: 'Buy',
      amount: 2500,
      openPrice: 1.2750,
      currentPrice: 1.2698,
      takeProfit: 1.2850,
      stopLoss: 1.2650,
      openReason: 'System',
      status: 'pending',
      openedAt: '2025-10-13T14:30:00Z',
      expirationDate: '2025-10-17T12:00:00Z'
    }
  ]
}

export const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    setOpenPositions: (state, action) => {
      state.open = action.payload
    },
    addPosition: (state, action) => {
      const newPosition = action.payload
      switch (newPosition.status) {
        case 'open':
          state.open.push(newPosition)
          break
        case 'closed':
          state.closed.push(newPosition)
          break
        case 'pending':
          state.pending.push(newPosition)
          break
      }
    },
    updatePosition: (state, action) => {
      const { id, updates } = action.payload
      const lists = [state.open, state.closed, state.pending]
      
      for (const list of lists) {
        const index = list.findIndex(pos => pos.id === id)
        if (index !== -1) {
          list[index] = { ...list[index], ...updates }
          break
        }
      }
    },
    removePosition: (state, action) => {
      const positionId = action.payload
      state.open = state.open.filter(pos => pos.id !== positionId)
      state.closed = state.closed.filter(pos => pos.id !== positionId)
      state.pending = state.pending.filter(pos => pos.id !== positionId)
    },
    clearAllPositions: (state) => {
      state.open = []
      state.closed = []
      state.pending = []
    },
    bulkUpdatePositions: (state, action) => {
      const { ids, patch } = action.payload
      const lists = [state.open, state.closed, state.pending]
      
      ids.forEach((id: string) => {
        for (const list of lists) {
          const item = list.find(pos => pos.id === id)
          if (!item) continue
          
          // Only apply defined fields
          if (patch.openPrice !== undefined) item.openPrice = patch.openPrice
          if (patch.takeProfit !== undefined) item.takeProfit = patch.takeProfit
          if (patch.stopLoss !== undefined) item.stopLoss = patch.stopLoss
          if (patch.openReason !== undefined) item.openReason = patch.openReason
          if (patch.commission !== undefined) item.commission = patch.commission
          if (patch.swap !== undefined) item.swap = patch.swap
          if (patch.openPnL !== undefined) item.openPnL = patch.openPnL

          // Recompute derived fields if needed
          if (item.currentPrice && item.openPrice) {
            const gross = (item.type === 'Buy'
              ? (item.currentPrice - item.openPrice)
              : (item.openPrice - item.currentPrice)) * (item.amount || 0)
            const total = gross - (item.commission || 0) + (item.swap || 0)
            item.totalPnL = Number.isFinite(total) ? total : item.totalPnL
          }
          break
        }
      })
    },
    updateClosedPositionFields: (state, action) => {
      const { id, accountId, patch } = action.payload
      const position = state.closed.find(pos => pos.id === id && pos.clientId === accountId)
      if (position) {
        // Merge patch with existing position, allowing manual override of calculated fields
        Object.assign(position, patch)
      }
    }
  }
})

export const { setOpenPositions, addPosition, updatePosition, removePosition, clearAllPositions, bulkUpdatePositions, updateClosedPositionFields } = positionsSlice.actions
// Selector to get a specific closed position by ID and account ID
export const selectClosedPositionById = createSelector(
  [
    (state: RootState) => state.positions.closed,
    (_: RootState, accountId: string) => accountId,
    (_: RootState, accountId: string, positionId: string) => positionId,
  ],
  (closedPositions, accountId, positionId) => {
    return closedPositions.find(pos => pos.id === positionId && pos.clientId === accountId)
  }
)

export default positionsSlice.reducer

// Selectors
export const selectAllPositions = (state: RootState): Position[] => {
  return [
    ...state.positions.open,
    ...state.positions.closed,
    ...state.positions.pending
  ]
}

export const selectPositionsByStatus = createSelector(
  [selectAllPositions, (state: RootState, status: PositionStatus) => status],
  (positions, status) => positions.filter(position => position.status === status)
)

export const selectPositionsByClientAndStatus = createSelector(
  [
    selectAllPositions, 
    (state: RootState, clientId: string) => clientId,
    (state: RootState, clientId: string, status: PositionStatus) => status
  ],
  (positions, clientId, status) => 
    positions.filter(position => position.clientId === clientId && position.status === status)
)

// Convenience hooks for Profile tab
export const useOpenPositionsByClient = (clientId: string): Position[] => {
  return useSelector((state: RootState) => {
    console.log('useOpenPositionsByClient - clientId:', clientId)
    console.log('useOpenPositionsByClient - positions state:', state.positions)
    const result = selectPositionsByClientAndStatus(state, clientId, 'open')
    console.log('useOpenPositionsByClient - filtered result:', result)
    return result
  })
}

export const useClosedPositionsByClient = (clientId: string): Position[] => {
  return useSelector((state: RootState) => {
    const closedPositions = selectPositionsByClientAndStatus(state, clientId, 'closed')
    
    // Calculate derived PnL fields for closed positions
    return closedPositions.map((position) => {
      const amount = Number(position.amount ?? 0)
      const openPrice = Number(position.openPrice ?? 0)
      const closedPrice = Number(position.closedPrice ?? position.currentPrice ?? 0)

      // Calculate volumes if not present
      const openVolume = position.openVolume ?? (amount && openPrice ? amount * openPrice : null)
      const closeVolume = position.closeVolume ?? (amount && closedPrice ? amount * closedPrice : null)

      // Calculate PnL without commissions and swaps (gross price movement)
      // Buy: (closed - open) * amount
      // Sell: (open - closed) * amount
      const priceDiff = position.type === 'Buy'
        ? (closedPrice - openPrice)
        : (openPrice - closedPrice)

      const pnlWithout = Number.isFinite(priceDiff * amount)
        ? priceDiff * amount
        : 0

      // Fees and carry
      const commission = Number(position.commission ?? 0)   // cost we subtract
      const swap = Number(position.swap ?? 0)               // add as-is (can be +/-)

      // Total PnL (with fees/swaps)
      const totalPnL = pnlWithout - commission + swap

      return {
        ...position,
        openVolume: openVolume ?? undefined,
        closeVolume: closeVolume ?? undefined,
        closedPrice,
        pnlWithout,
        totalPnL,
        commission,
        swap,
      }
    })
  })
}

export const usePendingPositionsByClient = (clientId: string): Position[] => {
  return useSelector((state: RootState) => 
    selectPositionsByClientAndStatus(state, clientId, 'pending')
  )
}

// Selector for joining open positions with entity data for EntityTable
export const selectOpenPositionsEntityRows = createSelector(
  [
    (state: RootState) => state.positions.open,
    (state: RootState) => state.entities.entities,
    (_: RootState, accountId?: string) => accountId,
  ],
  (openPositions, entities, accountIdFilter) => {
    return openPositions
      .map(position => {
        const client = entities.find(e => e.id === position.clientId || e.accountId === position.clientId);
        if (!client) return null;

        const row = {
          // EntityTable requires id and type fields
          id: `${client.id}-${position.id}`,
          type: 'client' as const,
          
          // Profile fields (first 24)
          accountId: client.accountId,
          createdAt: client.createdAt,
          desk: client.desk,
          retentionManager: client.retentionOwner,
          accountType: client.accountType,
          regulation: client.regulation,
          retentionOwner: client.retentionOwner,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phoneNumber,
          lastContactAt: client.lastContactAt,
          firstTradedAt: client.firstTradedAt,
          lastTradedAt: client.lastTradedAt,
          lastActivityAt: client.lastActivityAt,
          followUpAt: client.followUpAt,
          kycStatus: client.kycStatus,
          retentionReview: client.retentionReview,
          retentionStatus: client.retentionStatus,
          balance: client.balance,
          marginLevel: client.marginLevel,
          freeMargin: client.freeMargin,
          totalMargin: client.margin,
          equity: client.equity,
          
          // Position fields (25-39)
          positionId: position.id,
          instrument: position.instrument,
          positionType: position.type,
          amount: position.amount,
          openVolume: position.openVolume,
          openPrice: position.openPrice,
          currentPrice: position.currentPrice,
          takeProfit: position.takeProfit,
          stopLoss: position.stopLoss,
          openReason: position.openReason,
          openPnL: position.openPnL,
          openIp: position.openIp,
          commission: position.commission,
          swap: position.swap,
          totalPnL: position.totalPnL,
        };
        return row;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter(row => accountIdFilter ? row.accountId === accountIdFilter : true);
  }
)

// Selector for joining closed positions with entity data for EntityTable
export const selectClosedPositionsEntityRows = createSelector(
  [
    (state: RootState) => state.positions.closed,
    (state: RootState) => state.entities.entities,
    (_: RootState, accountId?: string) => accountId,
  ],
  (closedPositions, entities, accountIdFilter) => {
    return closedPositions
      .map(position => {
        const client = entities.find(e => e.id === position.clientId || e.accountId === position.clientId);
        if (!client) return null;

        // Calculate derived fields
        const { pnlWithout, totalPnL } = (() => {
          if (!position.closedPrice) return { pnlWithout: 0, totalPnL: 0 };
          
          const basePnl = position.type === 'Buy'
            ? (position.closedPrice - position.openPrice) * position.amount
            : (position.openPrice - position.closedPrice) * position.amount;
          
          const pnlWithout = basePnl;
          const totalPnL = basePnl - (position.commission || 0) + (position.swap || 0);
          
          return { pnlWithout, totalPnL };
        })();

        const row = {
          // EntityTable requires id and type fields
          id: `${client.id}-${position.id}`,
          type: 'client' as const,
          
          // Profile fields (first 24)
          accountId: client.accountId,
          createdAt: client.createdAt,
          desk: client.desk,
          retentionManager: client.retentionOwner,
          accountType: client.accountType,
          regulation: client.regulation,
          retentionOwner: client.retentionOwner,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phoneNumber,
          lastContactAt: client.lastContactAt,
          firstTradedAt: client.firstTradedAt,
          lastTradedAt: client.lastTradedAt,
          lastActivityAt: client.lastActivityAt,
          followUpAt: client.followUpAt,
          kycStatus: client.kycStatus,
          retentionReview: client.retentionReview,
          retentionStatus: client.retentionStatus,
          balance: client.balance,
          marginLevel: client.marginLevel,
          freeMargin: client.freeMargin,
          totalMargin: client.margin,
          equity: client.equity,
          
          // Closed Position fields (25-42)
          closedId: position.id,
          instrument: position.instrument,
          positionType: position.type,
          amount: position.amount,
          openVolume: position.openVolume,
          openPrice: position.openPrice,
          closedPrice: position.closedPrice,
          closeVolume: position.closeVolume,
          pnlWithout,
          totalPnL,
          commission: position.commission,
          swap: position.swap,
          takeProfit: position.takeProfit,
          stopLoss: position.stopLoss,
          openReason: position.openReason,
          closeReason: position.closeReason,
          closedAt: position.closedAt,
          closeIp: position.closeIp,
        };
        return row;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter(row => accountIdFilter ? row.accountId === accountIdFilter : true);
  }
)

// Selector for joining pending positions with entity data for EntityTable
export const selectPendingPositionsEntityRows = createSelector(
  [
    (state: RootState) => state.positions.pending,
    (state: RootState) => state.entities.entities,
    (_: RootState, accountId?: string) => accountId,
  ],
  (pendingPositions, entities, accountIdFilter) => {
    return pendingPositions
      .map(position => {
        const client = entities.find(e => e.id === position.clientId || e.accountId === position.clientId);
        if (!client) return null;

        const row = {
          // EntityTable requires id and type fields
          id: `${client.id}-${position.id}`,
          type: 'client' as const,
          
          // Profile fields - complete set to match columns
          accountId: client.accountId,
          createdAt: client.createdAt,
          desk: client.desk,
          retentionManager: client.retentionManager,
          retentionOwner: client.retentionOwner,
          accountType: client.accountType,
          regulation: client.regulation,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone || (client.phoneNumber ? { number: client.phoneNumber } : undefined),
          lastContactAt: client.lastContactAt,
          lastCommentAt: client.lastCommentAt,
          lastActivityAt: client.lastActivityAt,
          followUpAt: client.followUpAt,
          firstTradedAt: client.firstTradedAt,
          lastTradedAt: client.lastTradedAt,
          retentionReview: client.retentionReview,
          retentionStatus: client.retentionStatus,
          kycStatus: client.kycStatus,
          
          // Pending Position fields (25-36)
          positionId: position.id,
          instrument: position.instrument,
          positionType: position.type,
          positionAmount: position.amount,
          positionOpenPrice: position.openPrice,
          positionCurrentPrice: position.currentPrice,
          positionTakeProfit: position.takeProfit,
          positionStopLoss: position.stopLoss,
          positionOpenReason: position.openReason,
          positionExpirationDate: position.expirationDate,
          positionOpenedAt: position.openedAt,
        };
        return row;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .filter(row => accountIdFilter ? row.accountId === accountIdFilter : true);
  }
)
