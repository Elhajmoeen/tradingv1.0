/**
 * Auth integration - provides centralized auth token access
 * Reuses existing auth selectors where possible
 */

import type { RootState } from '@/state/store'

// Try to use existing auth token if available
// Fallback to localStorage or empty string
export const selectAuthToken = (state: RootState): string => {
  // Check if auth state has a token field
  const auth = state?.auth as any
  if (auth?.token) {
    return auth.token
  }
  
  // Check if current user has token info
  if (auth?.currentUser?.token) {
    return auth.currentUser.token
  }
  
  // Fallback to localStorage
  return localStorage.getItem("auth_token") ?? ""
}

// Re-export existing auth selectors for convenience
export { selectCurrentUser, selectAuthLoading } from '@/state/authSlice'

export const AUTH_TOKEN_KEY = 'auth_token';

// Read token from Redux if present; otherwise localStorage.
export function readAuthToken(state?: any): string | null {
  return (state?.auth?.token as string | undefined) ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

// Persist token (localStorage fallback keeps existing prepareHeaders working).
export function writeAuthToken(token: string | null) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Try common places for roles; fallback empty array.
export function readUserRoles(state?: any): string[] {
  return state?.auth?.roles
      ?? state?.auth?.user?.roles
      ?? [];
}