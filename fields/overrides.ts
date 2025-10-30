/**
 * Field Registry Overrides
 * 
 * Manual overrides for field classifications.
 * Static overrides take precedence over dynamic ones.
 */

import type { Domain } from './__generated__/registry'

export const STATIC_OVERRIDES: Partial<Record<Domain, string[]>> = {
  // Example: Force specific fields to be static
  // positions: ['customField1', 'customField2'],
  // clients: ['specialField'],
}

export const DYNAMIC_OVERRIDES: Partial<Record<Domain, string[]>> = {
  // Example: Force specific fields to be dynamic
  // positions: ['displayOnlyField'],
  // transactions: ['uiConfigField'],
}