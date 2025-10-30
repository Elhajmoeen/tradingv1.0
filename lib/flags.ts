/**
 * Feature flags for gradual rollout of new features
 */

export function isPositionsNextEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_POSITIONS_NEXT === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_positions_next') === '1') {
    return true
  }
  
  // In DEV, if URL has ?ff_positions_next=1, set localStorage once
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_positions_next') === '1') {
      localStorage.setItem('ff_positions_next', '1')
      return true
    }
  }
  
  return false
}

export function isTransactionsNextEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_TRANSACTIONS_NEXT === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_transactions_next') === '1') {
    return true
  }
  
  // In DEV, if URL has ?ff_transactions_next=1, set localStorage once
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_transactions_next') === '1') {
      localStorage.setItem('ff_transactions_next', '1')
      return true
    }
  }
  
  return false
}

export function isAccountTypeUsageEnabled() {
  return import.meta.env.VITE_FF_ACCOUNT_TYPES_USAGE === '1' ||
         localStorage.getItem('ff_account_types_usage') === '1';
}

export function isAccountTypeAssetRulesEnabled(): boolean {
  return import.meta.env.VITE_FF_ACCOUNT_TYPE_ASSET_RULES === '1'
      || localStorage.getItem('ff_account_type_asset_rules') === '1';
}

/**
 * Helper to check if any "next" features are enabled
 */
export function hasNextFeaturesEnabled(): boolean {
  return isPositionsNextEnabled() || isTransactionsNextEnabled() || isLeadsNextEnabled() || isProfileNextEnabled()
}

export function isFieldsAutowireEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_FIELDS_AUTOWIRE === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_fields_autowire') === '1') {
    return true
  }
  
  // In DEV, if URL has ?ff_fields_autowire=1, set localStorage once
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_fields_autowire') === '1') {
      localStorage.setItem('ff_fields_autowire', '1')
      return true
    }
  }
  
  return false
}

export function isLeadsNextEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_LEADS_NEXT === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_leads_next') === '1') {
    return true
  }
  
  // In DEV, if URL has ?ff_leads_next=1, set localStorage once
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_leads_next') === '1') {
      localStorage.setItem('ff_leads_next', '1')
      return true
    }
  }
  
  return false
}

export function isProfileNextEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_PROFILE_NEXT === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_profile_next') === '1') {
    return true
  }
  
  // In DEV, if URL has ?ff_profile_next=1, set localStorage once
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_profile_next') === '1') {
      localStorage.setItem('ff_profile_next', '1')
      return true
    }
  }
  
  return false
}

export function isAuthReauthEnabled(): boolean {
  return import.meta.env.VITE_FF_AUTH_REAUTH === '1'
      || localStorage.getItem('ff_auth_reauth') === '1';
}

export function isAllowIpSkinEnabled(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_FF_ALLOWIP_SKIN === '1') {
    return true
  }
  
  // Check localStorage
  if (localStorage.getItem('ff_allowip_skin') === '1') {
    return true
  }
  
  // In DEV, auto-enable for testing
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ff_allowip_skin') === '1') {
      localStorage.setItem('ff_allowip_skin', '1')
      return true
    }
    // Auto-enable in DEV mode for easier testing
    return true
  }
  
  return false
}

export function isTpSlAmountEnabled(): boolean {
  return import.meta.env.VITE_FF_TPSL_AMOUNT === '1'
      || localStorage.getItem('ff_tp_sl_amount') === '1';
}

// Dev helper (?ff_tp_sl_amount=1)
if (import.meta.env.DEV) {
  const u = new URL(location.href);
  if (u.searchParams.get('ff_tp_sl_amount') === '1') {
    localStorage.setItem('ff_tp_sl_amount', '1');
  }
}