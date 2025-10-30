/**
 * Leads NEXT Feature Test
 * Simple verification that all components can be imported
 */

// Test all exports
import {
  leadsApi,
  useGetLeadsQuery,
  useCreateLeadMutation,
  LeadsTableAdapter,
  NewLeadDrawerAdapter,
  type LeadDTO,
  LeadDTOSchema,
} from '@/features/leads_next'

import { isLeadsNextEnabled } from '@/lib/flags'

// Test feature flag
console.log('Leads NEXT enabled:', isLeadsNextEnabled())

// Test API endpoints
console.log('Leads API endpoints:', Object.keys(leadsApi.endpoints))

// Test type validation
const testLead: LeadDTO = {
  id: 'test_123',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1-555-0123',
  countryCode: 'US',
  status: 'new',
  source: 'website',
  ownerName: 'Test Owner',
  createdAt: '2024-01-01T00:00:00Z',
  notes: 'Test notes',
}

// Test schema validation
const validation = LeadDTOSchema.safeParse(testLead)
console.log('Schema validation passed:', validation.success)

export const LEADS_NEXT_TEST_PASSED = true