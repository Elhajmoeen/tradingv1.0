import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Coerce any value to a boolean or undefined for consistent regulation field handling
 * Handles legacy string values and normalizes them to boolean
 */
export const coerceBoolean = (v: any): boolean | undefined => {
  if (v === true || v === false) return v
  if (v == null || v === '') return undefined
  const s = String(v).trim().toLowerCase()
  if (['yes','true','1','y','t'].includes(s)) return true
  if (['no','false','0','n','f'].includes(s)) return false
  return undefined
}

/**
 * Convert boolean to string for UI display (Yes/No/empty)
 */
export const boolToStr = (v?: boolean): string => {
  return v === true ? 'yes' : v === false ? 'no' : ''
}

/**
 * Convert string from UI back to boolean
 */
export const strToBool = (v: string): boolean | undefined => {
  return coerceBoolean(v)
}
