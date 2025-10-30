/**
 * Mock data for clients
 * Realistic seed data for client profiles
 */

import { generateId, randomDateWithinDays, randomItem, randomNumber } from '@/mocks/utils'

export interface ClientDTO {
  id: string
  accountId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  city?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  accountType?: string
  registrationDate: string
  lastLoginDate?: string
  isActive: boolean
  totalDeposits?: number
  totalWithdrawals?: number
  balance?: number
  currency?: string
  salesManager?: string
  desk?: string
  ftd?: boolean
  regulation?: string
}

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Anna', 'Christopher', 'Elena', 'Daniel', 'Sofia', 'Matthew', 'Olivia', 'Andrew', 'Isabella']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Canada', 'Australia', 'Japan', 'Brazil']
const cities = ['New York', 'London', 'Berlin', 'Paris', 'Madrid', 'Rome', 'Toronto', 'Sydney', 'Tokyo', 'São Paulo']
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']
const salesManagers = ['Alice Cooper', 'Bob Smith', 'Carol Johnson', 'David Wilson', 'Eve Brown']
const desks = ['Desk A', 'Desk B', 'Desk C', 'VIP Desk', 'Premium Desk']
const accountTypes = ['Standard', 'Premium', 'VIP', 'Corporate']
const regulations = ['CYSEC', 'FCA', 'ASIC', 'ESMA', 'FINRA']

/**
 * Generate mock client data
 */
function createMockClient(overrides: Partial<ClientDTO> = {}): ClientDTO {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)
  const country = randomItem(countries)
  const currency = randomItem(currencies)
  
  const totalDeposits = randomNumber(100000, 10000000) / 100 // $1,000 to $100,000
  const totalWithdrawals = randomNumber(0, totalDeposits * 0.8) / 100
  const balance = totalDeposits - totalWithdrawals + randomNumber(-5000, 15000) / 100
  
  return {
    id: generateId(),
    accountId: `ACC${randomNumber(100000, 999999)}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+1${randomNumber(2000000000, 9999999999)}`,
    country,
    city: randomItem(cities),
    dateOfBirth: randomDateWithinDays(365 * 50), // Up to 50 years ago
    gender: randomItem(['male', 'female', 'other'] as const),
    kycStatus: randomItem(['PENDING', 'APPROVED', 'REJECTED'] as const),
    accountType: randomItem(accountTypes),
    registrationDate: randomDateWithinDays(365 * 2), // Up to 2 years ago
    lastLoginDate: Math.random() > 0.1 ? randomDateWithinDays(30) : undefined, // 90% have logged in recently
    isActive: Math.random() > 0.15, // 85% are active
    totalDeposits,
    totalWithdrawals,
    balance,
    currency,
    salesManager: randomItem(salesManagers),
    desk: randomItem(desks),
    ftd: Math.random() > 0.3, // 70% have made first deposit
    regulation: randomItem(regulations),
    ...overrides
  }
}

// Generate seed data
export const clientsSeed: ClientDTO[] = Array.from({ length: 50 }, () => createMockClient())

// Ensure we have specific test clients
const testClientIds = ['client_001', 'client_002', 'client_003', 'client_004', 'client_005']
testClientIds.forEach((id, index) => {
  clientsSeed[index] = createMockClient({ 
    id,
    accountId: `ACC${String(index + 1).padStart(6, '0')}`,
    isActive: true,
    kycStatus: 'APPROVED'
  })
})

export default clientsSeed