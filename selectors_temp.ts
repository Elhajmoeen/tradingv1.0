import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/state/store';
import type { Entity } from '@/state/entitiesSlice';
import { selectAllEntities } from '@/state/entitiesSlice';
import { 
  sum, 
  count,
  totalOpenPnl,
  realizedPnl,
  totalClosedPnl,
  requiredMargin,
  requiredMarginAtOpen,
  accountEquity,
  freeMargin,
  marginLevelPct,
  roundTo
} from './lib';
import type { Side, InstrumentMeta, AccountMeta, Quote } from './types';

// Mock instruments data - replace with real data source
const mockInstruments = [
  { 
    id: 'EURUSD', 
    symbol: 'EURUSD', 
    name: 'Euro / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'GBPUSD', 
    symbol: 'GBPUSD', 
    name: 'British Pound / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'USDJPY', 
    symbol: 'USDJPY', 
    name: 'US Dollar / Japanese Yen',
    precision: 2,
    tickSize: 0.01,
    contractSize: 100000,
  },
  { 
    id: 'AUDUSD', 
    symbol: 'AUDUSD', 
    name: 'Australian Dollar / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'USDCAD', 
    symbol: 'USDCAD', 
    name: 'US Dollar / Canadian Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'NZDUSD', 
    symbol: 'NZDUSD', 
    name: 'New Zealand Dollar / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'USDCHF', 
    symbol: 'USDCHF', 
    name: 'US Dollar / Swiss Franc',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'EURJPY', 
    symbol: 'EURJPY', 
    name: 'Euro / Japanese Yen',
    precision: 2,
    tickSize: 0.01,
    contractSize: 100000,
  },
];

// Mock market quotes - replace with real market data source
const generateMockQuotes = () => {
  const baseQuotes: Record<string, { bid: number; ask: number; timestamp: string }> = {
    'EURUSD': { bid: 1.0845, ask: 1.0847, timestamp: new Date().toISOString() },
    'GBPUSD': { bid: 1.2648, ask: 1.2650, timestamp: new Date().toISOString() },
    'USDJPY': { bid: 149.48, ask: 149.52, timestamp: new Date().toISOString() },
    'AUDUSD': { bid: 0.6748, ask: 0.6750, timestamp: new Date().toISOString() },
    'USDCAD': { bid: 1.3425, ask: 1.3427, timestamp: new Date().toISOString() },
    'NZDUSD': { bid: 0.6125, ask: 0.6127, timestamp: new Date().toISOString() },
    'USDCHF': { bid: 0.8848, ask: 0.8850, timestamp: new Date().toISOString() },
    'EURJPY': { bid: 162.25, ask: 162.29, timestamp: new Date().toISOString() },
  };

  // Add small random fluctuations to simulate live market
  Object.keys(baseQuotes).forEach(symbol => {
    const quote = baseQuotes[symbol];
    const spread = quote.ask - quote.bid;
    const midPrice = quote.bid + spread / 2;
    const fluctuation = (Math.random() - 0.5) * 0.001; // Small random change
    
    const newMid = midPrice + fluctuation;
    quote.bid = Math.round((newMid - spread / 2) * 10000) / 10000;
    quote.ask = Math.round((newMid + spread / 2) * 10000) / 10000;
    quote.timestamp = new Date().toISOString();
  });

  return baseQuotes;
};

// Positions state selectors
export const selectPositionsState = (state: RootState) => state.positions;

export const selectOpenPositions = createSelector(
  [selectPositionsState],
  (positions) => {
    console.log('🔍 selectOpenPositions Debug:', {
      'positions state': positions,
      'open positions': positions?.open || []
    })
    return positions?.open || []
  }
);

export const selectClosedPositions = createSelector(
  [selectPositionsState],
  (positions) => positions?.closed || []
);

export const selectPendingPositions = createSelector(
  [selectPositionsState],
  (positions) => positions?.pending || []
);

export const selectPositionsLoading = createSelector(
  [selectPositionsState],
  (positions) => positions?.loading || false
);

export const selectPositionsError = createSelector(
  [selectPositionsState],
  (positions) => positions?.error || null
);

// Instruments selector - using mock data until real instruments slice is available
export const selectAllInstruments = createSelector(
  [(state: RootState) => (state as any).instruments?.items],
  (instruments) => instruments || mockInstruments
);

export const selectInstrumentById = createSelector(
  [selectAllInstruments, (_: RootState, instrumentId: string) => instrumentId],
  (instruments, instrumentId) => instruments.find(i => i.id === instrumentId)
);

export const selectOpenPositionById = createSelector(
  [selectOpenPositions, (_: RootState, id: string) => id],
  (openPositions, id) => openPositions.find(p => p.id === id)
);

export const selectAgents = (state: RootState) => 
  (state as any).entities?.items?.filter((entity: any) => entity.type === 'agent') || [];

// Market quotes selectors - using mock data until real market slice is available
export const selectAllQuotes = createSelector(
  [(state: RootState) => (state as any).market?.quotes],
  (quotes) => quotes || generateMockQuotes()
);

export const selectQuoteByInstrument = createSelector(
  [selectAllQuotes, (_: RootState, instrumentId: string) => instrumentId],
  (quotes, instrumentId) => quotes[instrumentId] || null
);

// KPI selectors for different views
export const selectOpenPositionsKPIs = createSelector(
  [selectOpenPositions],
  (openPositions) => ({
    openPnL: sum(openPositions, 'openPnL'),
    totalPnL: sum(openPositions, 'totalPnL'), 
    openVolume: sum(openPositions, 'amount'),
    openCount: count(openPositions),
  })
);

export const selectClosedPositionsKPIs = createSelector(
  [selectClosedPositions],
  (closedPositions) => ({
    pnl: sum(closedPositions, 'openPnL'),
    totalPnL: sum(closedPositions, 'totalPnL'),
    closedVolume: sum(closedPositions, 'closedVolume'), 
    closedCount: count(closedPositions),
  })
);

export const selectPendingPositionsKPIs = createSelector(
  [selectPendingPositions],
  (pendingPositions) => ({
    pendingCount: count(pendingPositions),
  })
);

// ============================================================================
// SINGLE SOURCE OF TRUTH SELECTORS - Required for sync between Profile and Pages
// ============================================================================

// Entity by AccountId map selector for joins
export const selectEntityByAccountIdMap = createSelector(
  [selectAllEntities],
  (entities) => entities.reduce((acc, entity) => {
    if (entity.accountId) {
      acc[entity.accountId] = entity;
    }
    return acc;
  }, {} as Record<string, Entity>)
);

// A: All open positions (single source)
export const selectAllOpenPositions = createSelector(
  [selectOpenPositions],
  (positions) => positions
);

// B: Open positions by accountId (for profile page)
export const makeSelectOpenPositionsByAccountId = (accountId: string) => createSelector(
  [selectAllOpenPositions],
  (rows) => rows.filter(p => p.accountId === accountId)
);

// C: Joined rows for Open Positions page (position + entity + computed)
export const selectJoinedOpenPositions = createSelector(
  [selectAllOpenPositions, selectEntityByAccountIdMap, selectAllQuotes],
  (positions, entityByAccountId, quotes) => {
    console.log('� selectJoinedOpenPositions CALLED!');
    console.log('�🔍 selectJoinedOpenPositions Debug:', {
      'raw positions count': positions.length,
      'first raw position': positions[0],
      'first position accountId': positions[0]?.accountId,
      'entityByAccountId keys': Object.keys(entityByAccountId),
      'entityByAccountId': entityByAccountId,
      'entity lookup for ACC9001': entityByAccountId['ACC9001']
    })
    
    const result = positions.map(p => {
      const entity = entityByAccountId[p.accountId || ''] ?? null;
      
      console.log('🔍 Processing position:', {
        'position': p,
        'position.accountId': p.accountId,
        'entity found': entity,
        'entity firstName': entity?.firstName
      })
      
      // Calculate computed fields
      const currentQuote = quotes[p.instrument || ''];
      const positionType = (p.type === 'Buy' || p.type === 'Sell') ? p.type : 'Buy';
      const currentPrice = positionType === 'Buy' ? currentQuote?.bid : currentQuote?.ask;
      
      return {
        // Nested objects for column accessor paths (position.*, entity.*, computed.*)
        position: {
          ...p,
          currentPrice: p.currentPrice || currentPrice,
        },
        entity,
        computed: {
          unrealizedPnL: currentPrice ? 
            (positionType === 'Buy' ? 1 : -1) * (currentPrice - (p.openPrice || 0)) * (p.amount || 0) : 0,
          positionMargin: p.initialMargin || requiredMarginAtOpen({
            openPrice: p.openPrice || 0,
            amount: p.amount || 0,
          }),
          openCommission: p.commission || 0,
          openSwaps: p.swap || 0,
        },
        
        // Flat fields for entity table compatibility (direct access)
        id: `${p.accountId || 'unknown'}-${p.id}`,
        type: 'client' as const,
        accountId: p.accountId,
        firstName: entity?.firstName,
        lastName: entity?.lastName,
        phoneNumber: entity?.phoneNumber,
      };
    })
    
    console.log('🔍 selectJoinedOpenPositions Final Result:', {
      'result count': result.length,
      'first result': result[0],
      'first result keys': result[0] ? Object.keys(result[0]) : 'no data'
    })
    
    return result;
  }
);// ============================================================================
// FINANCE CALCULATION SELECTORS
// ============================================================================

// Mock account data - replace with real account state
const mockAccount: AccountMeta = {
  currency: 'USD',
  balance: 10000,
  leverage: 100
};

// Mock FX rates - replace with real market data
const mockFxRates = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.26,
  JPY: 0.0067,
  AUD: 0.65,
  CAD: 0.74,
  CHF: 1.10
};

// Enhanced position selectors with finance calculations
export const selectOpenPositionsWithCalculations = createSelector(
  [selectOpenPositions, selectAllInstruments, selectAllQuotes],
  (openPositions, instruments, quotes) => {
    return openPositions.map(position => {
      const instrument = instruments.find(i => i.id === position.instrumentId);
      const quote = quotes[position.instrumentId || ''];
      
      if (!position.type || !position.openPrice || !position.amount) {
        return { ...position, calculatedPnL: 0, calculatedMargin: 0 };
      }

      const side = position.type as Side;
      const units = position.amount;
      
      // Calculate unrealized PnL using finance module
      const unrealized = unrealizedPnl({
        side,
        openPrice: position.openPrice,
        units,
        quote,
        currentPriceOverride: position.currentPrice
      });

      // Calculate total PnL with commission and swap
      const calculatedPnL = totalOpenPnl(
        unrealized,
        position.commission || 0,
        position.swap || 0
      );

      // Calculate required margin
      const calculatedMargin = requiredMargin(
        position.openPrice,
        units,
        instrument as InstrumentMeta,
        mockAccount
      );

      return {
        ...position,
        calculatedPnL: roundTo(calculatedPnL, instrument?.precision || 2),
        calculatedMargin: roundTo(calculatedMargin, 2),
        unrealizedPnL: roundTo(unrealized, instrument?.precision || 2)
      };
    });
  }
);

export const selectClosedPositionsWithCalculations = createSelector(
  [selectClosedPositions, selectAllInstruments],
  (closedPositions, instruments) => {
    return closedPositions.map(position => {
      const instrument = instruments.find(i => i.id === position.instrumentId);
      
      if (!position.type || !position.openPrice || !position.closePrice || !position.amount) {
        return { ...position, calculatedPnL: 0 };
      }

      const side = position.type as Side;
      const units = position.closedVolume || position.amount;
      
      // Calculate realized PnL using finance module
      const realized = realizedPnl({
        side,
        openPrice: position.openPrice,
        closePrice: position.closePrice,
        units
      });

      // Calculate total closed PnL with commission and swap
      const calculatedPnL = totalClosedPnl(
        realized,
        position.commission || 0,
        position.swap || 0
      );

      return {
        ...position,
        calculatedPnL: roundTo(calculatedPnL, instrument?.precision || 2),
        realizedPnL: roundTo(realized, instrument?.precision || 2)
      };
    });
  }
);

// Account-level KPI selectors using finance calculations
export const selectAccountFinanceKPIs = createSelector(
  [selectOpenPositionsWithCalculations],
  (openPositionsWithCalc) => {
    const openTotals = openPositionsWithCalc.map(p => p.calculatedPnL || 0);
    const margins = openPositionsWithCalc.map(p => p.calculatedMargin || 0);
    
    const marginSum = margins.reduce((sum, margin) => sum + margin, 0);
    const equity = accountEquity(mockAccount.balance, openTotals);
    const freeMar = freeMargin(equity, marginSum);
    const margLevel = marginLevelPct(equity, marginSum);

    return {
      balance: roundTo(mockAccount.balance, 2),
      equity: roundTo(equity, 2),
      freeMargin: roundTo(freeMar, 2),
      margin: roundTo(marginSum, 2),
      marginLevel: roundTo(margLevel, 2),
      openPnL: roundTo(openTotals.reduce((sum, pnl) => sum + pnl, 0), 2),
      openVolume: roundTo(openPositionsWithCalc.reduce((sum, p) => sum + (p.amount || 0), 0), 2)
    };
  }
);

// Enhanced KPI selectors using finance calculations
export const selectOpenPositionsFinanceKPIs = createSelector(
  [selectOpenPositionsWithCalculations],
  (openPositionsWithCalc) => ({
    openPnL: roundTo(sum(openPositionsWithCalc, 'calculatedPnL'), 2),
    totalPnL: roundTo(sum(openPositionsWithCalc, 'calculatedPnL'), 2),
    openVolume: roundTo(sum(openPositionsWithCalc, 'amount'), 2),
    openCount: count(openPositionsWithCalc)
  })
);

export const selectClosedPositionsFinanceKPIs = createSelector(
  [selectClosedPositionsWithCalculations],
  (closedPositionsWithCalc) => ({
    pnl: roundTo(sum(closedPositionsWithCalc, 'realizedPnL'), 2),
    totalPnL: roundTo(sum(closedPositionsWithCalc, 'calculatedPnL'), 2),
    closedVolume: roundTo(sum(closedPositionsWithCalc, 'closedVolume'), 2),
    closedCount: count(closedPositionsWithCalc)
  })
);

// Position counts selector
export const selectPositionCounts = createSelector(
  [selectOpenPositions, selectClosedPositions, selectPendingPositions],
  (open, closed, pending) => ({
    openCount: open.length,
    closedCount: closed.length,
    pendingCount: pending.length
  })
);

// Closed positions aggregates for additional metrics
export const selectClosedAggregates = createSelector(
  [selectClosedPositions],
  (closed) => {
    let totalCommission = 0;
    let totalSwap = 0;
    let closedVolume = 0;
    
    for (const position of closed) {
      totalCommission += Number(position.commission || 0);
      totalSwap += Number(position.swap || 0);
      closedVolume += Number(position.closedVolume ?? position.amount ?? 0);
    }
    
    return {
      totalCommission: roundTo(totalCommission, 2),
      totalSwap: roundTo(totalSwap, 2),
      closedVolume: roundTo(closedVolume, 2)
    };
  }
);

// Open positions aggregates for additional metrics  
export const selectOpenAggregates = createSelector(
  [selectOpenPositions],
  (open) => {
    let openCommission = 0;
    let openSwap = 0;
    
    for (const position of open) {
      openCommission += Number(position.commission || 0);
      openSwap += Number(position.swap || 0);
    }
    
    return {
      openCommission: roundTo(openCommission, 2),
      openSwap: roundTo(openSwap, 2)
    };
  }
);

// ============================================================================
// MARGIN CALCULATION SELECTORS
// ============================================================================

export const selectAccountMeta = () => mockAccount;
export const selectFxRates = () => mockFxRates;
export const selectInstrumentBySymbol = (symbol: string) => mockInstruments.find(i => i.symbol === symbol);

export const makeSelectRowMargin = () =>
  createSelector(
    [
      (_: any, row: any) => row,
      selectAccountMeta,
      selectFxRates,
      selectAllInstruments
    ],
    (row, account, fxRates, instrumentsById) => {
      const instr = instrumentsById.find(i => i.symbol === row.instrument);
      const fx = instr?.quoteCurrency ? (fxRates[instr.quoteCurrency] ?? 1) : 1;

      if (row.type && ['Buy', 'Sell'].includes(row.type)) {
        // For open positions - use current openPrice
        if (row.openPrice && row.amount) {
          return requiredMarginAtOpen({
            openPrice: row.openPrice,
            amount: row.amount,
            instrument: instr,
            account,
            fxRate: fx,
          });
        }
        
        // For closed positions - prefer stored initialMargin; else compute fallback
        if (row.closePrice !== undefined) {
          const stored = Number(row.initialMargin || 0);
          if (stored) return stored;
          
          return requiredMarginAtOpen({
            openPrice: row.openPrice,
            amount: row.closedVolume ?? row.amount,
            instrument: instr,
            account,
            fxRate: fx,
          });
        }
      }

      return 0;
    }
  );

// ============================================================================
// ENTITY-POSITION AGGREGATION SELECTORS
// ============================================================================

// Selector to get open positions by account ID
export const selectOpenPositionsByAccountId = createSelector(
  [selectOpenPositions, (_: RootState, accountId: string) => accountId],
  (openPositions, accountId) => 
    openPositions.filter(position => position.accountId === accountId || position.clientId === accountId)
);

// Selector to get total commission for open positions by account ID
export const selectOpenCommissionsByAccountId = createSelector(
  [selectOpenPositions, (_: RootState, accountId: string) => accountId],
  (openPositions, accountId) => {
    const accountPositions = openPositions.filter(
      position => position.accountId === accountId || position.clientId === accountId
    );
    
    return accountPositions.reduce((total, position) => {
      return total + (position.commission || 0);
    }, 0);
  }
);

// Selector to get total swaps for open positions by account ID
export const selectOpenSwapsByAccountId = createSelector(
  [selectOpenPositions, (_: RootState, accountId: string) => accountId],
  (openPositions, accountId) => {
    const accountPositions = openPositions.filter(
      position => position.accountId === accountId || position.clientId === accountId
    );
    
    return accountPositions.reduce((total, position) => {
      return total + (position.swap || 0);
    }, 0);
  }
);

// Selector to get count of open positions by account ID
export const selectOpenPositionsCountByAccountId = createSelector(
  [selectOpenPositions, (_: RootState, accountId: string) => accountId],
  (openPositions, accountId) => {
    return openPositions.filter(
      position => position.accountId === accountId || position.clientId === accountId
    ).length;
  }
);

// ============================================================================
// OPEN POSITIONS ENTITY TABLE DATA SELECTOR
// ============================================================================

// Main selector to join open positions with entities for EntityTable
export const selectOpenPositionsWithEntities = createSelector(
  [
    selectOpenPositions,
    (state: RootState) => state.entities?.entities || [],
    selectAllInstruments,
    selectAllQuotes,
    (state: RootState) => state // Pass full state for position counts calculation
  ],
  (positions, entities, instruments, quotes, state) => {
    // Create entity lookup map for better performance
    const entitiesById = entities.reduce((acc, entity) => {
      if (entity.accountId) {
        acc[entity.accountId] = entity;
      }
      return acc;
    }, {} as Record<string, Entity>);

    return positions
      .map(position => {
        // Find matching entity by accountId or clientId
        const accountId = position.accountId || position.clientId;
        const entity = accountId ? entitiesById[accountId] : null;
        
        // Use safe defaults if entity not found
        const safeEntity: Entity = entity || {
          id: accountId || position.id,
          accountId: accountId || position.id,
          type: 'client' as const,
          firstName: 'Unknown',
          lastName: 'Client',
        };

        // Calculate PnL values using the lib functions
        const positionType = (position.type === 'Buy' || position.type === 'Sell') ? position.type : 'Buy';
        
        // Calculate unrealized PnL for open position
        const instrumentSymbol = position.instrument || '';
        const currentQuote = instrumentSymbol ? quotes[instrumentSymbol] : null;
        const currentPrice = positionType === 'Buy' ? currentQuote?.bid : currentQuote?.ask;
        const unrealizedPnL = currentPrice ? calcRealizedPnl({
          type: positionType,
          openRate: position.openPrice || 0,
          closeRate: currentPrice,
          amount: position.amount || 0,
          pointValue: resolvePointValue(instrumentSymbol)
        }) : 0;
        
        // Calculate position margin
        const positionMargin = position.initialMargin || requiredMarginAtOpen({
          openPrice: position.openPrice || 0,
          amount: position.amount || 0,
        });

        // Get position counts for this account - needed for #Closed/#Open/#Pending columns
        const positionCounts = selectPositionCountsByAccountId(state, accountId || '');

        // Return the flattened entity structure that EntityTable expects
        return {
          // Flatten entity fields to top level (with entity. prefix handled by paths)
          ...safeEntity,
          
          // Flatten position fields to top level (with position. prefix handled by paths)  
          ...Object.fromEntries(
            Object.entries(position).map(([key, value]) => [`position.${key}`, value])
          ),
          
          // Use a unique ID that combines entity and position (override after flattening)
          id: `${safeEntity.accountId}-${position.id}`,
          type: 'client' as const,
          
          // Add computed fields (with computed. prefix)
          'computed.unrealizedPnL': unrealizedPnL,
          'computed.positionMargin': positionMargin,
          'computed.closedPositionsCount': positionCounts.closed,
          'computed.openPositionsCount': positionCounts.open,
          'computed.pendingPositionsCount': positionCounts.pending,
          
          // Also add computed object for easier access
          computed: {
            unrealizedPnL,
            positionMargin,
            closedPositionsCount: positionCounts.closed,
            openPositionsCount: positionCounts.open,
            pendingPositionsCount: positionCounts.pending,
          },
          
          // Store original data for access
          entity: safeEntity,
          position: position
        } as Entity;
      })
      .filter(row => row.position.id); // Filter out any invalid positions
  }
);

// ============================================================================
// OPEN POSITIONS PAGE KPI TOTALS SELECTOR
// ============================================================================

// Dynamic KPI totals for Open Positions Page header
export const selectOpenPositionsTotals = createSelector(
  [selectOpenPositionsWithEntities],
  (positions) => {
    const totalOpenPnL = positions.reduce((sum, p) => sum + (p.position?.openPnL || 0), 0);
    const totalPnL = positions.reduce((sum, p) => sum + (p.position?.totalPnL || 0), 0);
    const totalVolume = positions.reduce((sum, p) => sum + (p.position?.amount || 0), 0);
    const totalCount = positions.length;
    
    return {
      totalOpenPnL: roundTo(totalOpenPnL, 2),
      totalPnL: roundTo(totalPnL, 2), 
      totalVolume: roundTo(totalVolume, 0),
      totalCount
    };
  }
);

// ============================================================================
// CLOSED POSITIONS SELECTORS
// ============================================================================

import { 
  calcRealizedPnl, 
  calcTotalRealizedPnl, 
  resolvePointValue, 
  resolveSpreadCost,
  calcClosedVolume
} from './lib';

export const selectClosedPositionsByAccountId = createSelector(
  [selectClosedPositions, (_: RootState, accountId: string) => accountId],
  (closedPositions, accountId) => 
    closedPositions.filter(position => position.accountId === accountId || position.clientId === accountId)
);

export const selectPendingPositionsByAccountId = createSelector(
  [selectPendingPositions, (_: RootState, accountId: string) => accountId],
  (pendingPositions, accountId) => 
    pendingPositions.filter(position => position.accountId === accountId || position.clientId === accountId)
);

// Position counts per account - essential for #Closed/#Open/#Pending columns
export const selectPositionCountsByAccountId = createSelector(
  [
    selectOpenPositions,
    selectClosedPositions, 
    selectPendingPositions,
    (_: RootState, accountId: string) => accountId
  ],
  (openPositions, closedPositions, pendingPositions, accountId) => {
    // Filter positions by account/client ID for this specific account
    const openCount = openPositions.filter(
      pos => pos.accountId === accountId || pos.clientId === accountId
    ).length;
    
    const closedCount = closedPositions.filter(
      pos => pos.accountId === accountId || pos.clientId === accountId  
    ).length;
    
    const pendingCount = pendingPositions.filter(
      pos => pos.accountId === accountId || pos.clientId === accountId
    ).length;
    
    return {
      open: openCount,
      closed: closedCount, 
      pending: pendingCount
    };
  }
);

// Main selector to join closed positions with entities for EntityTable
export const selectClosedPositionsWithEntities = createSelector(
  [
    selectClosedPositions,
    (state: RootState) => state.entities?.entities || [],
    selectAllInstruments,
    selectAllQuotes,
    (state: RootState) => state // Pass full state for position counts calculation
  ],
  (positions, entities, instruments, quotes, state) => {
    // Create entity lookup map for better performance
    const entitiesById = entities.reduce((acc, entity) => {
      if (entity.accountId) {
        acc[entity.accountId] = entity;
      }
      return acc;
    }, {} as Record<string, Entity>);

    return positions
      .map(position => {
        // Find matching entity by accountId or clientId
        const accountId = position.accountId || position.clientId;
        const entity = accountId ? entitiesById[accountId] : null;
        
        // Use safe defaults if entity not found
        const safeEntity: Entity = entity || {
          id: accountId || position.id,
          accountId: accountId || position.id,
          type: 'client' as const,
          firstName: 'Unknown',
          lastName: 'Client',
        };

        // Calculate PnL values using the lib functions
        const positionType = (position.type === 'Buy' || position.type === 'Sell') ? position.type : 'Buy';
        const realizedPnL = calcRealizedPnl({
          type: positionType,
          openRate: position.openPrice || 0,
          closeRate: position.closePrice || 0,
          amount: position.amount || 0,
          pointValue: resolvePointValue(position.instrument)
        });

        const totalRealizedPnL = calcTotalRealizedPnl({
          type: positionType,
          openRate: position.openPrice || 0,
          closeRate: position.closePrice || 0,
          amount: position.amount || 0,
          pointValue: resolvePointValue(position.instrument),
          commission: position.commission || 0,
          swap: position.swap || 0,
          spreadCost: resolveSpreadCost(position)
        });

        const closedVolume = calcClosedVolume(position);
        
        // Calculate position margin at open (using stored value or calculating)
        const positionMargin = position.initialMargin || requiredMarginAtOpen({
          openPrice: position.openPrice || 0,
          amount: position.amount || 0,
          // Using basic calculation since we don't have full instrument metadata here
        });

        // Get position counts for this account - needed for #Closed/#Open/#Pending columns
        const positionCounts = selectPositionCountsByAccountId(state, accountId || '');

        // Return the flattened entity structure that EntityTable expects
        return {
          // Flatten entity fields to top level (with entity. prefix handled by paths)
          ...safeEntity,
          
          // Flatten position fields to top level (with position. prefix handled by paths)  
          ...Object.fromEntries(
            Object.entries(position).map(([key, value]) => [`position.${key}`, value])
          ),
          
          // Use a unique ID that combines entity and position (override after flattening)
          id: `${safeEntity.accountId}-${position.id}`,
          type: 'client' as const,
          
          // Add computed fields (with computed. prefix)
          'computed.realizedPnL': realizedPnL,
          'computed.totalRealizedPnL': totalRealizedPnL,
          'computed.closedVolume': closedVolume,
          'computed.positionMargin': positionMargin,
          'computed.closedPositionsCount': positionCounts.closed,
          'computed.openPositionsCount': positionCounts.open,
          'computed.pendingPositionsCount': positionCounts.pending,
          
          // Also add computed object for easier access
          computed: {
            realizedPnL,
            totalRealizedPnL,
            closedVolume,
            positionMargin,
            closedPositionsCount: positionCounts.closed,
            openPositionsCount: positionCounts.open,
            pendingPositionsCount: positionCounts.pending
          },
          
          // Store original data for access
          entity: safeEntity,
          position: position
        } as Entity;
      })
      .filter(row => row.position.id); // Filter out any invalid positions
  }
);

// Main selector to join pending positions with entities for EntityTable
export const selectPendingPositionsWithEntities = createSelector(
  [
    selectPendingPositions,
    (state: RootState) => state.entities?.entities || [],
    selectAllInstruments,
    selectAllQuotes,
    (state: RootState) => state // Pass full state for position counts calculation
  ],
  (positions, entities, instruments, quotes, state) => {
    // Create entity lookup map for better performance
    const entitiesById = entities.reduce((acc, entity) => {
      if (entity.accountId) {
        acc[entity.accountId] = entity;
      }
      return acc;
    }, {} as Record<string, Entity>);

    return positions
      .map(position => {
        // Find matching entity by accountId or clientId
        const accountId = position.accountId || position.clientId;
        const entity = accountId ? entitiesById[accountId] : null;
        
        // Use safe defaults if entity not found
        const safeEntity: Entity = entity || {
          id: accountId || position.id,
          accountId: accountId || position.id,
          type: 'client' as const,
          firstName: 'Unknown',
          lastName: 'Client',
        };

        // Calculate required margin for pending order (basic calculation)
        const requiredMargin = position.amount ? (position.amount * (position.limitPrice || 0)) / 100 : 0;

        // Get position counts for this account - needed for #Closed/#Open/#Pending columns
        const positionCounts = selectPositionCountsByAccountId(state, accountId || '');

        // Return the flattened entity structure that EntityTable expects
        return {
          // Flatten entity fields to top level (with entity. prefix handled by paths)
          ...safeEntity,
          
          // Flatten position fields to top level (with position. prefix handled by paths)  
          ...Object.fromEntries(
            Object.entries(position).map(([key, value]) => [`position.${key}`, value])
          ),
          
          // Use a unique ID that combines entity and position (override after flattening)
          id: `${safeEntity.accountId}-${position.id}`,
          type: 'client' as const,
          
          // Add computed fields (with computed. prefix)
          'computed.requiredMargin': requiredMargin,
          'computed.closedPositionsCount': positionCounts.closed,
          'computed.openPositionsCount': positionCounts.open,
          'computed.pendingPositionsCount': positionCounts.pending,
          
          // Also add computed object for easier access
          computed: {
            requiredMargin,
            closedPositionsCount: positionCounts.closed,
            openPositionsCount: positionCounts.open,
            pendingPositionsCount: positionCounts.pending,
          },

          // Keep reference to original position data
          position: position
        } as Entity;
      })
      .filter(row => row.position.id); // Filter out any invalid positions
  }
);

// Closed positions totals selector for future Closed Positions page
export const selectClosedPositionsTotals = createSelector(
  [selectClosedPositionsWithEntities],
  (positions) => {
    const totalRealizedPnL = positions.reduce((sum, p) => sum + (p.computed?.realizedPnL || 0), 0);
    const totalNetPnL = positions.reduce((sum, p) => sum + (p.computed?.totalRealizedPnL || 0), 0);
    const totalVolume = positions.reduce((sum, p) => sum + (p.position?.amount || 0), 0);
    const totalCount = positions.length;
    
    return {
      totalRealizedPnL: roundTo(totalRealizedPnL, 2),
      totalNetPnL: roundTo(totalNetPnL, 2), 
      totalVolume: roundTo(totalVolume, 0),
      totalCount
    };
  }
);