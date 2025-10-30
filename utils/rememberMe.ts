/**
 * Remember Me Session Management Utility
 * Handles localStorage persistence for user sessions
 */

export interface SessionData {
  userId: string
  t: number // timestamp when session was created
}

export const SESSION_KEY = 'crm.session'
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Save user session to localStorage
 */
export function saveSession(userId: string): void {
  const sessionData: SessionData = {
    userId,
    t: Date.now()
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
}

/**
 * Get saved session from localStorage
 */
export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY)
    if (!sessionStr) return null
    
    const session: SessionData = JSON.parse(sessionStr)
    return session
  } catch (error) {
    console.warn('Failed to parse session data:', error)
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

/**
 * Check if a session is valid (not expired)
 */
export function isSessionValid(session: SessionData): boolean {
  const now = Date.now()
  const ageMs = now - session.t
  return ageMs <= SESSION_DURATION_MS
}

/**
 * Clear saved session from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Get valid session if it exists and hasn't expired
 */
export function getValidSession(): SessionData | null {
  const session = getSession()
  if (!session) return null
  
  if (!isSessionValid(session)) {
    clearSession()
    return null
  }
  
  return session
}