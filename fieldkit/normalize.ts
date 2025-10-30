// Normalization pipeline - Reuses and extends existing utilities
// Provides consistent data transformation across all field inputs

import type { EntityFieldKey } from './types'
// Reuse existing normalization utilities
import { toDigits, normalizePhone } from '@/config/phone'

// Light normalization on input change (fast, minimal processing) - PHASE A: ALL FIELDS
export function normalizeOnChange(key: EntityFieldKey, value: any): any {
  switch (key) {
    // Text fields - basic trimming and cleanup (Phase A expanded)
    case 'firstName':
    case 'lastName':
    case 'salesManager':
    case 'conversationOwner':
    case 'retentionOwner':
    case 'firstConversationOwner':
    case 'desk':
    case 'campaignId':
    case 'tag':
    case 'gclid':
    case 'platform':
    case 'avatarUrl':
    case 'registeredIp':
    case 'address.line1':
    case 'address.line2':
    case 'address.zip':
    case 'address.city':
    case 'address.state':
      return typeof value === 'string' ? value.trim() : value

    // Email - basic cleanup
    case 'email':
      return typeof value === 'string' ? value.trim().toLowerCase() : value

    // Phone numbers - digits only (reuse existing utility)
    case 'phoneNumber':
    case 'phoneNumber2':
      return toDigits(value)

    // Number fields - ensure numeric (Phase A)
    case 'age':
    case 'noAnswerCount':
    case 'callAttempts':
    case 'loginCount':
    case 'totalFtd':
    case 'ftd':
    case 'daysToFtd':
    case 'depositLimit':
    case 'withdrawLimit':
    case 'marginCall':
    case 'miniDeposit':
    case 'stopOut':
    case 'balance':
    case 'marginLevel':
    case 'openPnl':
    case 'totalPnl':
    case 'freeMargin':
    case 'margin':
    case 'totalMargin':
    case 'equity':
    case 'openVolume':
      return typeof value === 'string' ? (parseFloat(value) || 0) : (typeof value === 'number' ? value : 0)

    // Boolean fields - ensure boolean (Phase A)
    case 'regulation':
    case 'ftdSelf':
    case 'salesSecondHand':
    case 'ftdFirstConversation':
    case 'enableLogin':
    case 'blockNotifications':
    case 'allowedToTrade':
    case 'withdrawLimitAllowed':
    case 'twoFAEnabled':
    case 'allowed2fa':
    case 'allowDeposit':
    case 'allowWithdraw':
    case 'idPassport':
    case 'proofOfAddress':
    case 'ccFront':
    case 'ccBack':
    case 'dod':
      return Boolean(value)

    // Star ratings - ensure 1-5 range (Phase A)
    case 'salesReview':
    case 'retentionReview':
      const rating = typeof value === 'string' ? parseInt(value) : value
      return typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : undefined

    // Date fields - basic string handling (Phase A)
    case 'dateOfBirth':
    case 'createdAt':
    case 'lastContactAt':
    case 'lastCommentAt':
    case 'firstLoginAt':
    case 'lastLoginAt':
    case 'lastActivityAt':
    case 'followUpAt':
    case 'ftdDate':
    case 'conversationAssignedAt':
    case 'retentionAssignedAt':
    case 'convertedAt':
    case 'firstTradedAt':
    case 'lastTradedAt':
      return typeof value === 'string' ? value : (value ? String(value) : '')

    // Country code - digits only with + prefix handling
    case 'countryCode':
      const digits = toDigits(value)
      return digits ? `+${digits}` : digits

    // Numbers - ensure numeric type
    case 'age':
    case 'totalFtd':
    case 'salesReview':
    case 'retentionReview':
      const num = Number(value)
      return isNaN(num) ? 0 : num

    // Booleans - coerce to boolean
    case 'regulation':
    case 'ftdSelf':
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const lower = value.toLowerCase().trim()
        return lower === 'true' || lower === 'yes' || lower === '1'
      }
      return Boolean(value)

    // Dates - basic ISO string handling
    case 'dateOfBirth':
    case 'createdAt':
    case 'updatedAt':
    case 'lastLoginAt':
    case 'lastContactAt':
    case 'ftdDate':
      if (value instanceof Date) return value.toISOString()
      return typeof value === 'string' ? value.trim() : value

    // Default - return as-is
    default:
      return value
  }
}

// Heavy normalization on commit/blur/save (thorough processing)
export function normalizeOnCommit(key: EntityFieldKey, value: any): any {
  // First apply light normalization
  const lightNormalized = normalizeOnChange(key, value)
  
  switch (key) {
    // Email - full validation and formatting
    case 'email':
      if (typeof lightNormalized !== 'string' || !lightNormalized) return lightNormalized
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(lightNormalized) ? lightNormalized : value

    // Phone - full E.164 formatting (reuse existing utility)
    case 'phoneNumber':
      // Note: Full phone normalization should include country code
      // This is a simplified version - full implementation would use normalizePhone
      const digits = toDigits(lightNormalized)
      return digits.length >= 7 ? digits : lightNormalized

    // Country code - validate format
    case 'countryCode':
      const code = String(lightNormalized).replace(/\D/g, '')
      if (code.length >= 1 && code.length <= 4) {
        return `+${code}`
      }
      return lightNormalized

    // Rating fields - clamp to 1-5 range
    case 'salesReview':
    case 'retentionReview':
      const rating = Number(lightNormalized)
      if (isNaN(rating)) return undefined
      return Math.min(5, Math.max(1, Math.round(rating)))

    // Age - reasonable limits
    case 'age':
      const age = Number(lightNormalized)
      if (isNaN(age)) return 0
      return Math.min(120, Math.max(0, Math.round(age)))

    // Total FTD - ensure positive
    case 'totalFtd':
      const ftd = Number(lightNormalized)
      if (isNaN(ftd)) return 0
      return Math.max(0, ftd)

    // Dates - validate ISO format
    case 'dateOfBirth':
    case 'ftdDate':
      if (!lightNormalized) return lightNormalized
      try {
        const date = new Date(lightNormalized)
        return isNaN(date.getTime()) ? lightNormalized : date.toISOString().split('T')[0] // YYYY-MM-DD
      } catch {
        return lightNormalized
      }

    case 'createdAt':
    case 'updatedAt':
    case 'lastLoginAt':
    case 'lastContactAt':
      if (!lightNormalized) return lightNormalized
      try {
        const date = new Date(lightNormalized)
        return isNaN(date.getTime()) ? lightNormalized : date.toISOString()
      } catch {
        return lightNormalized
      }

    // Default - return light normalized value
    default:
      return lightNormalized
  }
}

// Main normalization function with dev warnings
export function normalizeFieldValue(
  key: EntityFieldKey, 
  value: any, 
  mode: 'onChange' | 'onCommit' = 'onChange'
): any {
  // Development warnings (simplified)
  if (typeof window !== 'undefined') {
    // Type mismatch warnings
    if (value !== null && value !== undefined) {
      const expectedType = getExpectedType(key)
      const actualType = typeof value
      
      if (expectedType && actualType !== expectedType && actualType !== 'string') {
        console.warn(
          `[FIELDKIT] Type mismatch for field "${key}": ` +
          `expected ${expectedType}, got ${actualType}`,
          { key, value, expectedType, actualType }
        )
      }
    }
  }

  try {
    return mode === 'onChange' 
      ? normalizeOnChange(key, value)
      : normalizeOnCommit(key, value)
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error(`[FIELDKIT] Normalization error for field "${key}":`, error)
    }
    return value // Return original value on error
  }
}

// Helper to get expected type for dev warnings
function getExpectedType(key: EntityFieldKey): string | null {
  const keyStr = String(key)
  
  // Number fields
  if (['age', 'totalFtd', 'salesReview', 'retentionReview'].includes(keyStr)) {
    return 'number'
  }
  
  // Boolean fields
  if (['regulation', 'ftdSelf'].includes(keyStr)) {
    return 'boolean'
  }
  
  // String fields (most common)
  return 'string'
}

// Phone and country specific normalization (reuse existing utilities)
export function normalizePhoneAndCountry(phone?: any, countryCode?: string) {
  return normalizePhone({
    countryCode: countryCode ? toDigits(countryCode) : '',
    number: phone ? toDigits(phone) : '',
    manualCC: false
  })
}