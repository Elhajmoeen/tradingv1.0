// Auth Stub Service - Temporary client-side authentication
// Will be replaced with backend API calls later

export async function hash(passwordPlain: string): Promise<string> {
  try {
    // Simple base64 encoding for demo - replace with proper hashing in production
    return btoa(passwordPlain)
  } catch (error) {
    console.error('Password hashing failed:', error)
    throw new Error('Password hashing failed')
  }
}

export async function verify(passwordPlain: string, passwordHash: string): Promise<boolean> {
  try {
    // Simple base64 verification for demo - matches our demo users
    const encodedPassword = btoa(passwordPlain)
    return encodedPassword === passwordHash
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function generatePassword(): string {
  const length = 12
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return password
}
