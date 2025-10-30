/**
 * Network utility functions for IP address validation and normalization
 */

/**
 * Validate IPv4 address format
 */
export const isIPv4 = (s?: string): boolean => {
  if (!s) return false
  
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
  return ipv4Regex.test(s.trim())
}

/**
 * Validate IPv6 address format (supports various shorthand notations)
 */
export const isIPv6 = (s?: string): boolean => {
  if (!s) return false
  
  const trimmed = s.trim()
  
  // IPv6 regex patterns for different formats
  const ipv6Patterns = [
    // Full format: 8 groups of 4 hex digits
    /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    
    // Compressed format with ::
    /^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/,
    
    // :: alone (all zeros)
    /^::$/,
    
    // Loopback
    /^::1$/,
    
    // Leading zeros compressed
    /^([0-9a-fA-F]{1,4}:)*::$/,
    
    // Trailing compressed
    /^::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/,
    
    // IPv4-mapped IPv6
    /^::ffff:(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/i,
  ]
  
  return ipv6Patterns.some(pattern => pattern.test(trimmed))
}

/**
 * Check if string is a valid IP address (IPv4 or IPv6)
 */
export const isValidIP = (s?: string): boolean => {
  return isIPv4(s) || isIPv6(s)
}

/**
 * Normalize IP address input
 */
export const normalizeIp = (s: any): string | undefined => {
  const value = String(s ?? '').trim()
  return value.length ? value : undefined
}

/**
 * Get IP address type
 */
export const getIPType = (s?: string): 'ipv4' | 'ipv6' | 'invalid' => {
  if (isIPv4(s)) return 'ipv4'
  if (isIPv6(s)) return 'ipv6'
  return 'invalid'
}

/**
 * Validate and provide user-friendly error message for IP input
 */
export const validateIPInput = (s?: string): { isValid: boolean; message?: string } => {
  if (!s || !s.trim()) {
    return { isValid: true } // Empty is valid (optional field)
  }
  
  const trimmed = s.trim()
  
  if (isIPv4(trimmed)) {
    return { isValid: true }
  }
  
  if (isIPv6(trimmed)) {
    return { isValid: true }
  }
  
  // Provide helpful error messages
  if (trimmed.includes('.')) {
    return {
      isValid: false,
      message: 'Invalid IPv4 format. Expected: 192.168.1.1'
    }
  }
  
  if (trimmed.includes(':')) {
    return {
      isValid: false,
      message: 'Invalid IPv6 format. Expected: 2001:db8::1'
    }
  }
  
  return {
    isValid: false,
    message: 'Invalid IP address format'
  }
}