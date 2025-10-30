export const KYC_STATUS = [
  'Approved',
  'Pending', 
  'Declined'
] as const

export type KYCStatus = typeof KYC_STATUS[number]

export const normalizeKYCStatus = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = KYC_STATUS.find(status => 
    status.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}