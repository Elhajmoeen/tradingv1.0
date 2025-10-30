import { RootState } from '@/state/store'
import { selectRule, AccountTypeAssetRule } from '@/state/accountTypeAssetRulesSlice'
import { selectAccountTypes, AccountType } from '@/state/accountTypesSlice'

/**
 * Get the active rule for a specific account type and asset combination
 * This is the authoritative source for trading constraints and pricing
 */
export function getActiveRule(
  state: RootState, 
  accountTypeId: string, 
  assetId: string
): AccountTypeAssetRule | undefined {
  const rule = selectRule(state, accountTypeId, assetId)
  
  // Only return enabled rules
  if (rule && rule.enabled) {
    return rule
  }
  
  return undefined
}

/**
 * Validation result for trading amounts
 */
export interface ValidationResult {
  ok: boolean
  error?: string
}

/**
 * Validate a trading amount against the rule constraints
 */
export function validateAmount(
  rule: AccountTypeAssetRule, 
  value: number
): ValidationResult {
  if (value < 0) {
    return { ok: false, error: 'Amount must be positive' }
  }
  
  if (value < rule.minSize) {
    return { ok: false, error: `Minimum amount is ${rule.minSize}` }
  }
  
  if (value > rule.maxSize) {
    return { ok: false, error: `Maximum amount is ${rule.maxSize}` }
  }
  
  // Check step size alignment
  if (rule.stepSize > 0) {
    const remainder = (value - rule.minSize) % rule.stepSize
    if (Math.abs(remainder) > 0.0001) { // Allow for floating point precision
      return { 
        ok: false, 
        error: `Amount must be in steps of ${rule.stepSize} from ${rule.minSize}` 
      }
    }
  }
  
  return { ok: true }
}

/**
 * Validate rule configuration itself
 */
export function validateRule(rule: Partial<AccountTypeAssetRule>): ValidationResult {
  if (!rule.minSize || rule.minSize <= 0) {
    return { ok: false, error: 'Minimum size must be greater than 0' }
  }
  
  if (!rule.maxSize || rule.maxSize <= 0) {
    return { ok: false, error: 'Maximum size must be greater than 0' }
  }
  
  if (rule.minSize >= rule.maxSize) {
    return { ok: false, error: 'Minimum size must be less than maximum size' }
  }
  
  if (!rule.stepSize || rule.stepSize <= 0) {
    return { ok: false, error: 'Step size must be greater than 0' }
  }
  
  if (!rule.defaultSize || rule.defaultSize < rule.minSize || rule.defaultSize > rule.maxSize) {
    return { ok: false, error: 'Default size must be between minimum and maximum size' }
  }
  
  // Validate step alignment for default size
  if (rule.stepSize > 0 && rule.minSize && rule.defaultSize) {
    const remainder = (rule.defaultSize - rule.minSize) % rule.stepSize
    if (Math.abs(remainder) > 0.0001) {
      return { 
        ok: false, 
        error: 'Default size must align with step size from minimum size' 
      }
    }
  }
  
  if (!rule.leverage || rule.leverage <= 0) {
    return { ok: false, error: 'Leverage must be greater than 0' }
  }
  
  if (rule.spread === undefined || rule.spread < 0) {
    return { ok: false, error: 'Spread must be 0 or greater' }
  }
  
  if (rule.commissionValue === undefined || rule.commissionValue < 0) {
    return { ok: false, error: 'Commission value must be 0 or greater' }
  }
  
  return { ok: true }
}

/**
 * Calculate margin requirement for a position
 */
export function calculateMarginRequirement(
  rule: AccountTypeAssetRule,
  amount: number,
  assetPrice: number
): number {
  if (rule.leverage <= 0) return 0
  
  const notional = amount * assetPrice
  return notional / rule.leverage
}

/**
 * Calculate commission for a trade
 */
export function calculateCommission(
  rule: AccountTypeAssetRule,
  amount: number,
  assetPrice: number
): number {
  if (rule.commissionValue <= 0) return 0
  
  switch (rule.commissionType) {
    case 'perLot':
      return rule.commissionValue * amount
    case 'perNotional':
      return rule.commissionValue * (amount * assetPrice)
    default:
      return 0
  }
}

/**
 * Calculate spread cost for a position
 */
export function calculateSpreadCost(
  rule: AccountTypeAssetRule,
  amount: number,
  assetPrice: number
): number {
  if (rule.spread <= 0) return 0
  
  // For now, treat spread as a simple multiplier
  // In a real implementation, this would be category-aware (pips vs points vs basis points)
  return rule.spread * amount * assetPrice * 0.0001 // Assuming 4-decimal point spread
}

/**
 * Get trading constraints summary for UI display
 */
export function getTradingConstraints(rule: AccountTypeAssetRule) {
  return {
    minAmount: rule.minSize,
    maxAmount: rule.maxSize,
    stepSize: rule.stepSize,
    defaultAmount: rule.defaultSize,
    leverage: rule.leverage,
    spread: rule.spread,
    commission: {
      type: rule.commissionType,
      value: rule.commissionValue,
    },
    swaps: {
      long: rule.swapLong,
      short: rule.swapShort,
    },
  }
}

/**
 * Check if a rule can be safely removed (placeholder for position checks)
 * TODO: Integrate with actual position data when available
 */
export function canRemoveRule(
  state: RootState,
  accountTypeId: string,
  assetId: string
): boolean {
  // Placeholder implementation
  // In the real system, this would check if there are any open positions
  // that reference this rule
  return true
}

/**
 * Get effective account flag with client override precedence
 * effective = clientOverride ?? accountTypeDefault
 */
export function getEffectiveAccountFlag<K extends keyof AccountType['defaults']>(
  state: RootState,
  clientId: string,
  key: K
): AccountType['defaults'][K] | undefined {
  // TODO: Implement client selection when client state is available
  // const client = selectClientById(state, clientId)
  // const clientOverride = client?.settings?.overrides?.[key]
  
  // For now, we'll assume no client override and return account type default
  // In the real implementation:
  // if (clientOverride !== undefined) return clientOverride
  
  // Get account type (placeholder - would normally get from client.accountTypeId)
  const accountTypes = selectAccountTypes(state)
  const accountType = accountTypes[0] // Placeholder - use first account type
  
  return accountType?.defaults?.[key]
}

/**
 * Get effective account settings for a client
 * This combines account type defaults with client-specific overrides
 */
export function getEffectiveAccountSettings(
  state: RootState,
  clientId: string
): AccountType['defaults'] | undefined {
  // TODO: Implement when client state is available
  // const client = selectClientById(state, clientId)
  // const accountType = selectAccountTypeById(state, client?.accountTypeId)
  
  // For now, return first account type defaults
  const accountTypes = selectAccountTypes(state)
  const accountType = accountTypes[0]
  
  if (!accountType?.defaults) return undefined
  
  // TODO: Apply client overrides
  // return {
  //   ...accountType.defaults,
  //   ...client?.settings?.overrides
  // }
  
  return accountType.defaults
}