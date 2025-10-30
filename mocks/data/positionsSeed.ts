/**
 * Mock data for positions
 * Realistic seed data matching PositionDTO interface
 */

import type { PositionDTO } from '@/features/positions_next/types/position'
import { generateId, randomDateWithinDays, randomItem, randomNumber } from '@/mocks/utils'

// Mock clients for positions (normalized to accountId)
const mockAccountIds = [
  'ACC001', 'ACC002', 'ACC003', 'ACC004', 'ACC005',
  'ACC006', 'ACC007', 'ACC008', 'ACC009', 'ACC010'
]

// Legacy client IDs for backward compatibility
const mockClientIds = [
  'client_001', 'client_002', 'client_003', 'client_004', 'client_005',
  'client_006', 'client_007', 'client_008', 'client_009', 'client_010'
]

const instruments = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY']
const openReasons = ['MANUAL', 'SIGNAL', 'AUTO_TRADE', 'COPY_TRADE']
const closeReasons = ['MANUAL', 'STOP_LOSS', 'TAKE_PROFIT', 'MARGIN_CALL', 'SYSTEM']

/**
 * Generate mock position data
 */
function createMockPosition(overrides: Partial<PositionDTO> = {}): PositionDTO {
  const isOpen = overrides.status === 'OPEN' || (!overrides.status && Math.random() > 0.4)
  const isPending = overrides.status === 'PENDING' || (!overrides.status && !isOpen && Math.random() > 0.5)
  const status = overrides.status || (isOpen ? 'OPEN' : isPending ? 'PENDING' : 'CLOSED')
  
  const openTime = randomDateWithinDays(30)
  const closeTime = status === 'CLOSED' ? randomDateWithinDays(15) : null
  
  const amountUnits = randomNumber(1, 100) / 10 // 0.1 to 10.0
  const openPrice = randomNumber(10000, 200000) / 10000 // 1.0000 to 20.0000
  const currentPrice = status === 'OPEN' ? openPrice + (Math.random() - 0.5) * 0.1 : openPrice
  const closePrice = status === 'CLOSED' ? currentPrice : null
  
  const side = randomItem(['BUY', 'SELL'] as const)

  return {
    id: generateId(),
    accountId: randomItem(mockAccountIds),
    instrument: randomItem(instruments),
    side,
    amountUnits,
    openPrice,
    currentPrice,
    closePrice,
    stopLoss: Math.random() > 0.7 ? openPrice - (side === 'BUY' ? 0.05 : -0.05) : null,
    takeProfit: Math.random() > 0.6 ? openPrice + (side === 'BUY' ? 0.1 : -0.1) : null,
    commission: randomNumber(50, 500) / 100, // 0.50 to 5.00
    swap: randomNumber(-100, 50) / 100, // -1.00 to 0.50
    openTime,
    closeTime,
    status,
    openReason: randomItem(openReasons),
    closeReason: status === 'CLOSED' ? randomItem(closeReasons) : null,
    expirationTime: status === 'PENDING' ? randomDateWithinDays(7) : null,
    ...overrides
  }
}

// Generate seed data with specific distributions
export const positionsSeed: PositionDTO[] = [
  // Open positions (60%)
  ...Array.from({ length: 18 }, () => createMockPosition({ status: 'OPEN' })),
  
  // Pending positions (20%)
  ...Array.from({ length: 6 }, () => createMockPosition({ status: 'PENDING' })),
  
  // Closed positions (20%)
  ...Array.from({ length: 6 }, () => createMockPosition({ status: 'CLOSED' })),
]

// Ensure we have at least one position per status for testing
if (!positionsSeed.find(p => p.status === 'OPEN')) {
  positionsSeed[0] = createMockPosition({ status: 'OPEN' })
}
if (!positionsSeed.find(p => p.status === 'PENDING')) {
  positionsSeed[1] = createMockPosition({ status: 'PENDING' })
}
if (!positionsSeed.find(p => p.status === 'CLOSED')) {
  positionsSeed[2] = createMockPosition({ status: 'CLOSED' })
}

export default positionsSeed