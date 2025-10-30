// Date of birth utility functions for validation, formatting, and age calculation

/**
 * Calculate age from a date of birth string
 */
export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0
  
  try {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    
    if (isNaN(birthDate.getTime())) return 0
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return Math.max(0, age) // Ensure non-negative age
  } catch {
    return 0
  }
}

/**
 * Format date string for display (e.g., "January 15, 1990")
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'Select date of birth'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format date string for HTML input (YYYY-MM-DD format)
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Validate if a date string represents a valid birth date
 */
export const isValidBirthDate = (dateString: string): boolean => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    const today = new Date()
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) return false
    
    // Check if it's not in the future
    if (date > today) return false
    
    // Check if it's not too far in the past (reasonable birth date range)
    const maxAge = 120
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate())
    if (date < minDate) return false
    
    return true
  } catch {
    return false
  }
}

/**
 * Normalize date string to ISO format
 */
export const normalizeDateString = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Get today's date in YYYY-MM-DD format (useful for max date validation)
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get minimum allowed birth date (120 years ago)
 */
export const getMinBirthDateString = (): string => {
  const today = new Date()
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
  return minDate.toISOString().split('T')[0]
}

/**
 * Format datetime for display (includes both date and time)
 */
export const formatDateTimeForDisplay = (value: any): string => {
  if (!value) return ''
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return ''
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return ''
  }
}

/**
 * Format date for display (date only)
 */
export const formatDateOnlyForDisplay = (value: any): string => {
  if (!value) return ''
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return ''
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}