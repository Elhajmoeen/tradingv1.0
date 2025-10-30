/**
 * Mock data for leads
 * Realistic seed data for lead management
 */

import { generateId, randomDateWithinDays, randomItem, randomNumber } from '@/mocks/utils'

export interface LeadDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  source?: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  notes?: string
  score?: number
  campaign?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Skyler', 'Cameron', 'Dakota', 'Finley']
const lastNames = ['Adams', 'Baker', 'Clark', 'Davis', 'Evans', 'Fisher', 'Green', 'Harris', 'Irving', 'Jackson', 'King', 'Lewis', 'Miller', 'Nelson', 'Oliver']
const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Canada', 'Australia', 'Netherlands', 'Sweden']
const sources = ['Website', 'Google Ads', 'Facebook', 'Referral', 'Email Campaign', 'Webinar', 'Trade Show', 'Cold Call', 'LinkedIn', 'YouTube']
const salesReps = ['Alice Johnson', 'Bob Wilson', 'Carol Smith', 'David Brown', 'Eve Davis', 'Frank Miller']
const campaigns = ['Q4 2024 Campaign', 'Holiday Special', 'New Year Promo', 'Spring Launch', 'Summer Boost', 'Fall Drive']
const utmSources = ['google', 'facebook', 'linkedin', 'email', 'direct', 'referral']
const utmMediums = ['cpc', 'social', 'email', 'organic', 'referral', 'display']

/**
 * Generate mock lead data
 */
function createMockLead(overrides: Partial<LeadDTO> = {}): LeadDTO {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)
  const createdAt = randomDateWithinDays(90)
  const updatedAt = randomDateWithinDays(30)
  
  return {
    id: generateId(),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@example.com`,
    phone: Math.random() > 0.3 ? `+1${randomNumber(2000000000, 9999999999)}` : undefined,
    country: randomItem(countries),
    source: randomItem(sources),
    status: randomItem(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const),
    assignedTo: Math.random() > 0.2 ? randomItem(salesReps) : undefined, // 80% are assigned
    createdAt,
    updatedAt,
    notes: Math.random() > 0.5 ? 'Follow up scheduled for next week' : undefined,
    score: randomNumber(1, 100),
    campaign: Math.random() > 0.4 ? randomItem(campaigns) : undefined,
    utm_source: Math.random() > 0.3 ? randomItem(utmSources) : undefined,
    utm_medium: Math.random() > 0.3 ? randomItem(utmMediums) : undefined,
    utm_campaign: Math.random() > 0.4 ? randomItem(campaigns) : undefined,
    ...overrides
  }
}

// Generate seed data with realistic status distribution
export const leadsSeed: LeadDTO[] = [
  // New leads (30%)
  ...Array.from({ length: 18 }, () => createMockLead({ status: 'NEW' })),
  
  // Contacted leads (25%)
  ...Array.from({ length: 15 }, () => createMockLead({ status: 'CONTACTED' })),
  
  // Qualified leads (20%)
  ...Array.from({ length: 12 }, () => createMockLead({ status: 'QUALIFIED' })),
  
  // Converted leads (15%)
  ...Array.from({ length: 9 }, () => createMockLead({ status: 'CONVERTED' })),
  
  // Lost leads (10%)
  ...Array.from({ length: 6 }, () => createMockLead({ status: 'LOST' })),
]

// Ensure we have at least one lead per status for testing
const statuses: LeadDTO['status'][] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
statuses.forEach((status, index) => {
  if (!leadsSeed.find(l => l.status === status)) {
    leadsSeed[index] = createMockLead({ status })
  }
})

export default leadsSeed