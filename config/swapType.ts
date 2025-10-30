export const SWAP_TYPE_OPTIONS = [
  'Buy',
  'Sell',
  'Transfer',
  'Conversion',
  'Rollover'
] as const

export type SwapType = typeof SWAP_TYPE_OPTIONS[number]

export const normalizeSwapType = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = SWAP_TYPE_OPTIONS.find(type => 
    type.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}