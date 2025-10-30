/**
 * URL validation utilities for Payment Gateway links
 */

// Validate URL format (only http/https allowed)
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return true // Empty is allowed (means not configured)
  }

  try {
    const urlObj = new URL(url.trim())
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Shared helper for HTTP/HTTPS URL validation
export function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { 
    return false 
  }
}

// Normalize URL (trim and add https if missing protocol)
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''
  
  // Add https:// if no protocol provided
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  
  return trimmed
}

// Get URL validation error message
export const getUrlValidationError = (url: string): string | null => {
  if (!url || url.trim() === '') {
    return null // Empty is allowed
  }

  if (!isValidUrl(url)) {
    return 'Please enter a valid URL (http:// or https://)'
  }

  return null
}

// Validate all gateway links at once
export const validateGatewayLinks = (links: Record<string, string | undefined>): Record<string, string | null> => {
  const errors: Record<string, string | null> = {}
  
  Object.entries(links).forEach(([key, url]) => {
    if (url) {
      errors[key] = getUrlValidationError(url)
    }
  })
  
  return errors
}

// Check if gateway has any valid links
export const hasValidLinks = (links: Record<string, string | undefined>): boolean => {
  return Object.values(links).some(url => url && isValidUrl(url))
}