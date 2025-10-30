/**
 * Field Registry - Central exports
 * 
 * Re-exports all generated field registries and utilities.
 */

// Core registry
export * from './__generated__/registry'
export * from './__generated__/version'

// Domain-specific key constants (will be available after generation)
export * from './__generated__/keys.positions'
export * from './__generated__/keys.transactions'
export * from './__generated__/keys.leads'
export * from './__generated__/keys.clients'
export * from './__generated__/keys.users'
export * from './__generated__/keys.emailTemplates'
export * from './__generated__/keys.gateways'
export * from './__generated__/keys.allowIp'
export * from './__generated__/keys.misc'

// Overrides
export * from './overrides'

// Utilities
import type { Domain } from './__generated__/registry'

/**
 * Get domain from path hint
 */
export function getDomainByPathHint(hint: string): Domain {
  const normalized = hint.toLowerCase()
  
  if (normalized.includes('position')) return 'positions'
  if (normalized.includes('transaction')) return 'transactions'
  if (normalized.includes('lead')) return 'leads'
  if (normalized.includes('client') || normalized.includes('profile')) return 'clients'
  if (normalized.includes('user')) return 'users'
  if (normalized.includes('email')) return 'emailTemplates'
  if (normalized.includes('gateway')) return 'gateways'
  if (normalized.includes('allowip') || normalized.includes('allow-ip')) return 'allowIp'
  
  return 'misc'
}