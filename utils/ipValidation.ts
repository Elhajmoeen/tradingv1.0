// IP validation utility for IPv4 and IPv6 addresses

/**
 * Validates if a string is a valid IPv4 address
 * @param ip - The IP string to validate
 * @returns boolean - True if valid IPv4
 */
export const isValidIPv4 = (ip: string): boolean => {
  // IPv4 regex: 4 octets, each 0-255
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

/**
 * Validates if a string is a valid IPv6 address
 * @param ip - The IP string to validate  
 * @returns boolean - True if valid IPv6
 */
export const isValidIPv6 = (ip: string): boolean => {
  // IPv6 regex: supports full form, compressed form with ::, mixed IPv4 notation
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:(?:[0-9a-fA-F]{1,4}:)*::|:(?::[0-9a-fA-F]{1,4})*|(?:[0-9a-fA-F]{1,4}:)+:(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4})$|^(?:(?:[0-9a-fA-F]{1,4}:){6}|::(?:[0-9a-fA-F]{1,4}:){5}|(?:[0-9a-fA-F]{1,4})?::(?:[0-9a-fA-F]{1,4}:){4}|(?:(?:[0-9a-fA-F]{1,4}:){0,1}[0-9a-fA-F]{1,4})?::(?:[0-9a-fA-F]{1,4}:){3}|(?:(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4})?::(?:[0-9a-fA-F]{1,4}:){2}|(?:(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4})?::[0-9a-fA-F]{1,4}:|(?:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4})?::)(?:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$|^(?:(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})?::[0-9a-fA-F]{1,4}$|^(?:(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::$/
  
  // Simplified but more practical IPv6 validation
  // Supports common IPv6 formats without being overly complex
  const practicalIPv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  return practicalIPv6Regex.test(ip)
}

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 * @param ip - The IP string to validate
 * @returns boolean - True if valid IPv4 or IPv6
 */
export const isValidIp = (ip: string): boolean => {
  if (!ip || typeof ip !== 'string') return false
  
  // Remove whitespace
  const trimmedIp = ip.trim()
  if (!trimmedIp) return false
  
  // Check for netmask notation (not allowed for now)
  if (trimmedIp.includes('/')) return false
  
  return isValidIPv4(trimmedIp) || isValidIPv6(trimmedIp)
}

/**
 * Gets the IP version (4 or 6) for a valid IP address
 * @param ip - The IP string to check
 * @returns number | null - 4 for IPv4, 6 for IPv6, null if invalid
 */
export const getIpVersion = (ip: string): 4 | 6 | null => {
  if (!isValidIp(ip)) return null
  
  const trimmedIp = ip.trim()
  if (isValidIPv4(trimmedIp)) return 4
  if (isValidIPv6(trimmedIp)) return 6
  
  return null
}

/**
 * Formats an IP address for consistent display
 * @param ip - The IP string to format
 * @returns string - Formatted IP or original if invalid
 */
export const formatIpAddress = (ip: string): string => {
  if (!ip) return ''
  
  const trimmedIp = ip.trim()
  if (!isValidIp(trimmedIp)) return ip
  
  // For IPv4, just return trimmed version
  if (isValidIPv4(trimmedIp)) {
    return trimmedIp
  }
  
  // For IPv6, could add compression logic here if needed
  // For now, just return as-is
  return trimmedIp
}

// Test cases for validation (exported for testing purposes)
export const IP_TEST_CASES = {
  validIPv4: [
    '192.168.1.1',
    '10.0.0.1', 
    '172.16.0.1',
    '203.0.113.1',
    '0.0.0.0',
    '255.255.255.255'
  ],
  validIPv6: [
    '2001:db8::1',
    '::1',
    '::',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    '2001:db8:85a3::8a2e:370:7334',
    'fe80::1'
  ],
  invalid: [
    '256.1.1.1',        // Invalid IPv4 octet
    '192.168.1',        // Incomplete IPv4
    '192.168.1.1.1',    // Too many octets
    '192.168.1.1/24',   // CIDR notation (not allowed)
    'invalid',          // Not an IP
    '',                 // Empty string
    '   ',              // Whitespace only
    'gggg::1',          // Invalid IPv6 characters
    '2001:db8::1::2'    // Double compression
  ]
}