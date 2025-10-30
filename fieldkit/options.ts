// Options registry - Single source of truth for all field options
// Reuses existing config files and provides dynamic options from entity data

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/state/store'
import type { Entity } from '@/state/entitiesSlice'
import type { Option, EntityFieldKey, StaticOptions, DynamicOptions } from './types'

// Import existing static configs
import { LEAD_SOURCE_OPTIONS } from '@/config/leadSource'
import { selectActivePaymentGatewayOptions } from '@/selectors/paymentGatewayOptions'
import { CITIZEN_STATUS } from '@/config/citizen'
import { FTD_OPTIONS } from '@/config/ftd'
import { getCountriesForSelect } from '@/utils/countryPhone'
// PATCH: begin integrate status store with fieldkit
import { useStatusStore } from '@/features/lookups/state/useStatusStore'
// PATCH: end integrate status store with fieldkit

// Language options from LanguageField.tsx component
const LANGUAGE_OPTIONS = ['', 'arabic', 'english', 'french', 'spanish'] as const

// Helper function to get status options from Zustand store
function getStatusOptions(category: 'kycStatus' | 'leadStatus' | 'retentionStatus'): Option[] {
  try {
    const store = useStatusStore.getState()
    return store.getOptions(category, false) // exclude deprecated
  } catch (error) {
    console.warn(`Failed to get ${category} options from store:`, error)
    return []
  }
}

// Static option mappings - PHASE A: ALL SELECT FIELDS
const staticOptionsMap: Partial<Record<EntityFieldKey, StaticOptions>> = {
  // Lead Management - Now dynamic from status store
  leadSource: [...LEAD_SOURCE_OPTIONS].map(source => ({ label: source, value: source })),
  
  // KYC & Compliance - Now dynamic from status store
  citizen: CITIZEN_STATUS.map(status => ({ label: status, value: status })),
  
  // Payment & Finance
  // paymentGateway: Dynamic - loaded from state
  ftd: FTD_OPTIONS.map(option => ({ label: option, value: option })),
  
  // Geographic
  country: getCountriesForSelect(),
  
  // Personal Information
  gender: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ],
  
  // Language & Localization  
  language: LANGUAGE_OPTIONS.map(lang => ({ 
    label: lang === '' ? 'Not Set' : lang.charAt(0).toUpperCase() + lang.slice(1), 
    value: lang 
  })),
  
  // Account Configuration
  accountType: [
    { label: 'Micro Mini', value: 'micro-mini' },
    { label: 'Mini', value: 'mini' },
    { label: 'Standard', value: 'standard' },
    { label: 'Gold', value: 'gold' },
    { label: 'Diamond', value: 'diamond' },
    { label: 'VIP', value: 'vip' }
  ],

  // Trading Instruments (Phase A)
  swapType: [
    { label: 'Standard', value: 'standard' },
    { label: 'Islamic', value: 'islamic' }
  ],
  
  forex: [
    { label: 'Enabled', value: 'enabled' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Restricted', value: 'restricted' }
  ],
  
  crypto: [
    { label: 'Enabled', value: 'enabled' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Restricted', value: 'restricted' }
  ],
  
  commodities: [
    { label: 'Enabled', value: 'enabled' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Restricted', value: 'restricted' }
  ],
  
  indices: [
    { label: 'Enabled', value: 'enabled' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Restricted', value: 'restricted' }
  ],
  
  stocks: [
    { label: 'Enabled', value: 'enabled' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Restricted', value: 'restricted' }
  ],

  // Platform Configuration
  platform: [
    { label: 'Web', value: 'Web' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Desktop', value: 'Desktop' }
  ],

  // Boolean fields (Phase A)
  regulation: [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ],

  // Conversation Owner Management
  conversationOwnerStatus: [
    { label: 'Active', value: 'active' },
    { label: 'On Leave', value: 'on_leave' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Available', value: 'available' },
    { label: 'Busy', value: 'busy' }
  ],
  
  conversationOwnerTeam: [
    { label: 'Sales Team', value: 'sales' },
    { label: 'Retention Team', value: 'retention' },
    { label: 'Support Team', value: 'support' },
    { label: 'VIP Team', value: 'vip' },
    { label: 'Management', value: 'management' }
  ],
  
  conversationOwnerRole: [
    { label: 'Senior Agent', value: 'senior_agent' },
    { label: 'Junior Agent', value: 'junior_agent' },
    { label: 'Team Lead', value: 'team_lead' },
    { label: 'Manager', value: 'manager' },
    { label: 'Specialist', value: 'specialist' }
  ],
  
  conversationOwnerWorkload: [
    { label: 'Light (1-10)', value: 'light' },
    { label: 'Medium (11-25)', value: 'medium' },
    { label: 'Heavy (26-50)', value: 'heavy' },
    { label: 'Full (50+)', value: 'full' }
  ],
  
  ftdSelf: [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ],
  
  salesSecondHand: [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ],
  
  ftdFirstConversation: [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ],
  
  enableLogin: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false }
  ],
  
  blockNotifications: [
    { label: 'Blocked', value: true },
    { label: 'Allowed', value: false }
  ],
  
  allowedToTrade: [
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false }
  ],
  
  withdrawLimitAllowed: [
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false }
  ],
  
  twoFAEnabled: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false }
  ],
  
  allowed2fa: [
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false }
  ],
  
  allowDeposit: [
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false }
  ],
  
  allowWithdraw: [
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false }
  ],

  // Document Verification Flags (now pure checkboxes)
  

  
  dod: [
    { label: 'Verified', value: true },
    { label: 'Not Verified', value: false }
  ]
}

// Dynamic options generators - extract unique values from entity data
const dynamicOptionsMap: Partial<Record<EntityFieldKey, DynamicOptions>> = {
  // Conversation owners from actual data  
  conversationOwner: (entities: Entity[]) =>
    getUniqueStringOptions(entities, 'conversationOwner'),

  // Desk values from actual data
  desk: (entities: Entity[]) =>
    getUniqueStringOptions(entities, 'desk'),

  // Campaign IDs from actual data
  campaignId: (entities: Entity[]) =>
    getUniqueStringOptions(entities, 'campaignId'),

  // Tags from actual data
  tag: (entities: Entity[]) =>
    getUniqueStringOptions(entities, 'tag')
}

// Helper to extract unique string values from entities
function getUniqueStringOptions(entities: Entity[], fieldKey: EntityFieldKey): Option[] {
  const values = new Set<string>()
  
  entities.forEach(entity => {
    const value = entity[fieldKey]
    if (value && typeof value === 'string' && value.trim()) {
      values.add(value.trim())
    }
  })
  
  // Limit to 50 unique values to prevent performance issues
  const uniqueValues = Array.from(values).slice(0, 50).sort()
  return uniqueValues.map(value => ({ label: value, value }))
}

// Memoized selector to get all entities
const selectAllEntities = (state: RootState): Entity[] => state.entities.entities

// Main function to get options for any field
export function optionsByKey(state: RootState, key: EntityFieldKey): Option[] {
  // PATCH: begin dynamic status options integration
  // Special handling for status fields - use Zustand store
  if (key === 'kycStatus') {
    return getStatusOptions('kycStatus')
  }
  if (key === 'leadStatus') {
    return getStatusOptions('leadStatus')
  }
  if (key === 'retentionStatus') {
    return getStatusOptions('retentionStatus')
  }
  // PATCH: end dynamic status options integration

  // Special handling for payment gateway - use dynamic selector
  if (key === 'paymentGateway') {
    return selectActivePaymentGatewayOptions(state)
  }

  // Check for static options first
  const staticOptions = staticOptionsMap[key]
  if (staticOptions) {
    return staticOptions
  }

  // Check for dynamic options
  const dynamicGenerator = dynamicOptionsMap[key]
  if (dynamicGenerator) {
    const entities = selectAllEntities(state)
    return dynamicGenerator(entities)
  }

  // No options available for this field
  return []
}

// Memoized selector for better performance
export const selectOptionsByKey = createSelector(
  [selectAllEntities, (state: RootState, key: EntityFieldKey) => key],
  (entities, key) => {
    // PATCH: begin dynamic status options in selector
    // Special handling for status fields - use Zustand store
    if (key === 'kycStatus') {
      return getStatusOptions('kycStatus')
    }
    if (key === 'leadStatus') {
      return getStatusOptions('leadStatus')
    }
    if (key === 'retentionStatus') {
      return getStatusOptions('retentionStatus')
    }
    // PATCH: end dynamic status options in selector

    // Static options don't need memoization
    const staticOptions = staticOptionsMap[key]
    if (staticOptions) {
      return staticOptions
    }

    // Dynamic options are memoized per entities array
    const dynamicGenerator = dynamicOptionsMap[key]
    if (dynamicGenerator) {
      return dynamicGenerator(entities)
    }

    return []
  }
)

// Check if field has options (is a select field)
export function hasOptions(key: EntityFieldKey): boolean {
  // PATCH: begin status fields have options
  if (key === 'kycStatus' || key === 'leadStatus' || key === 'retentionStatus') {
    return true
  }
  // PATCH: end status fields have options
  return key in staticOptionsMap || key in dynamicOptionsMap
}

// Alias for consistency
export const getFieldOptions = optionsByKey

// Get option label for a value (for display purposes)
export function getOptionLabel(state: RootState, key: EntityFieldKey, value: any): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const options = optionsByKey(state, key)
  const option = options.find(opt => opt.value === value)
  return option ? option.label : String(value)
}