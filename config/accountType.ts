export const ACCOUNT_TYPE_OPTIONS = [
  'Micro',
  'Mini', 
  'MiNI',
  'Standard',
  'Gold',
  'VIP'
] as const

export type AccountType = typeof ACCOUNT_TYPE_OPTIONS[number]

export const normalizeAccountType = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = ACCOUNT_TYPE_OPTIONS.find(type => 
    type.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}