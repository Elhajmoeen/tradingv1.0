export const LEAD_SOURCE_OPTIONS = [
  'Website',
  'Social Media',
  'Google Ads',
  'Facebook Ads',
  'Email Campaign',
  'Referral',
  'Cold Call',
  'Webinar',
  'Trade Show',
  'Partner',
  'Other'
] as const

export type LeadSource = typeof LEAD_SOURCE_OPTIONS[number]

export const normalizeLeadSource = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = LEAD_SOURCE_OPTIONS.find(source => 
    source.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}