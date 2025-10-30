/**
 * Column Merge Utilities
 * 
 * Provides functionality to auto-wire missing dynamic fields into column configurations
 * when the fields autowire feature flag is enabled.
 */

import { isFieldsAutowireEnabled } from '@/lib/flags'

export type Column = {
  key: string
  label: string
  visible?: boolean
} & Record<string, unknown>

export type Domain = 'positions' | 'transactions' | 'leads' | 'clients' | 'users' | 'emailTemplates' | 'gateways' | 'allowIp' | 'misc'

/**
 * Get dynamic fields for a domain from the registry
 * Returns empty array if registry is not available (graceful degradation)
 */
function getDynamicFields(domain: Domain): string[] {
  try {
    // Dynamic import to avoid build errors if registry doesn't exist yet
    const { listDynamic } = require('@/fields')
    return listDynamic(domain)
  } catch {
    // Registry not available - return empty array
    return []
  }
}

/**
 * Ensure all dynamic fields from the registry are present in the columns array.
 * If the fields autowire flag is disabled, returns columns unchanged.
 * 
 * @param domain - The domain to check fields for
 * @param cols - Existing column configuration
 * @returns Augmented columns with missing dynamic fields as hidden columns
 */
export function ensureAllColumns(domain: Domain, cols: Column[]): Column[] {
  // If flag is off, return columns untouched
  if (!isFieldsAutowireEnabled()) {
    return cols
  }
  
  try {
    const dynamicFields = getDynamicFields(domain)
    const existingKeys = new Set(cols.map(c => c.key))
    
    // Find missing dynamic fields
    const missingFields = dynamicFields.filter(key => !existingKeys.has(key))
    
    if (missingFields.length === 0) {
      return cols
    }
    
    // Create hidden columns for missing fields
    const missingColumns: Column[] = missingFields.map(key => ({
      key,
      label: key, // Use key as label by default
      visible: false, // Hidden by default
      // Add any other default properties your column system expects
      type: 'text',
      defaultVisible: false,
    }))
    
    // Return original columns plus missing ones
    return [...cols, ...missingColumns]
    
  } catch (error) {
    // If anything fails, return original columns
    console.warn(`Failed to auto-wire fields for domain ${domain}:`, error)
    return cols
  }
}

/**
 * Check if a field should be static (non-configurable) for a given domain
 */
export function isStaticField(domain: Domain, key: string): boolean {
  try {
    const { isStatic } = require('@/fields')
    return isStatic(domain, key)
  } catch {
    // Default to false if registry not available
    return false
  }
}

/**
 * Check if a field should be dynamic (configurable) for a given domain
 */
export function isDynamicField(domain: Domain, key: string): boolean {
  try {
    const { isDynamic } = require('@/fields')
    return isDynamic(domain, key)
  } catch {
    // Default to true if registry not available (assume configurable)
    return true
  }
}