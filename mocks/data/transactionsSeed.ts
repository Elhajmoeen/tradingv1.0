/**
 * Mock data for transactions
 * Realistic seed data matching TransactionDTO interface
 */

import type { TransactionDTO } from '@/features/transactions_next/types/transaction'
import { generateId, randomDateWithinDays, randomItem, randomNumber } from '@/mocks/utils'

// Mock clients for transactions (normalized to accountId)
const mockAccountIds = [
  'ACC001', 'ACC002', 'ACC003', 'ACC004', 'ACC005',
  'ACC006', 'ACC007', 'ACC008', 'ACC009', 'ACC010'
]

// Legacy client IDs for backward compatibility
const mockClientIds = [
  'client_001', 'client_002', 'client_003', 'client_004', 'client_005',
  'client_006', 'client_007', 'client_008', 'client_009', 'client_010'
]

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF']
const paymentMethods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Skrill', 'Neteller', 'Bitcoin', 'Wire Transfer']
const userNames = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Garcia', 'System']

/**
 * Generate mock transaction data
 */
function createMockTransaction(overrides: Partial<TransactionDTO> = {}): TransactionDTO {
  const actionType = overrides.actionType || randomItem(['DEPOSIT', 'WITHDRAW', 'CREDIT', 'DEBIT'] as const)
  const subType = overrides.subType || randomItem(['APPROVED', 'PENDING', 'DECLINED'] as const)
  
  const amount = randomNumber(10000, 500000) / 100 // 100.00 to 5000.00
  const currency = randomItem(currencies)
  const createdAt = randomDateWithinDays(60)
  
  const isFirstDeposit = Math.random() > 0.8 // 20% chance of being FTD
  const isFirstWithdrawal = actionType === 'WITHDRAW' && Math.random() > 0.9 // 10% chance of being FTW

  return {
    id: generateId(),
    accountId: randomItem(mockAccountIds),
    actionType,
    subType,
    amount,
    currency,
    createdAt,
    createdById: randomItem(['user_001', 'user_002', 'user_003', 'system']),
    createdByName: randomItem(userNames),
    comment: Math.random() > 0.6 ? 'Processed automatically' : null,
    paymentMethod: randomItem(paymentMethods),
    reference: `REF${randomNumber(100000, 999999)}`,
    ftd: actionType === 'DEPOSIT' ? isFirstDeposit : null,
    ftw: actionType === 'WITHDRAW' ? isFirstWithdrawal : null,
    ...overrides
  }
}

// Generate seed data with realistic distributions
export const transactionsSeed: TransactionDTO[] = [
  // Approved deposits (40%)
  ...Array.from({ length: 24 }, () => createMockTransaction({ 
    actionType: 'DEPOSIT', 
    subType: 'APPROVED' 
  })),
  
  // Approved withdrawals (20%)
  ...Array.from({ length: 12 }, () => createMockTransaction({ 
    actionType: 'WITHDRAW', 
    subType: 'APPROVED' 
  })),
  
  // Credits (15%)
  ...Array.from({ length: 9 }, () => createMockTransaction({ 
    actionType: 'CREDIT', 
    subType: 'APPROVED' 
  })),
  
  // Debits (10%)
  ...Array.from({ length: 6 }, () => createMockTransaction({ 
    actionType: 'DEBIT', 
    subType: 'APPROVED' 
  })),
  
  // Pending transactions (10%)
  ...Array.from({ length: 6 }, () => createMockTransaction({ 
    subType: 'PENDING' 
  })),
  
  // Declined transactions (5%)
  ...Array.from({ length: 3 }, () => createMockTransaction({ 
    subType: 'DECLINED' 
  })),
]

// Ensure we have at least one of each type for testing
const actionTypes: TransactionDTO['actionType'][] = ['DEPOSIT', 'WITHDRAW', 'CREDIT', 'DEBIT']
const subTypes: TransactionDTO['subType'][] = ['APPROVED', 'PENDING', 'DECLINED']

actionTypes.forEach((actionType, index) => {
  if (!transactionsSeed.find(t => t.actionType === actionType)) {
    transactionsSeed[index] = createMockTransaction({ actionType, subType: 'APPROVED' })
  }
})

subTypes.forEach((subType, index) => {
  if (!transactionsSeed.find(t => t.subType === subType)) {
    transactionsSeed[index + actionTypes.length] = createMockTransaction({ subType })
  }
})

export default transactionsSeed