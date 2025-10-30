export const LEAD_STATUS = [
  'New',
  'Warm', 
  'Hot',
  'Nurture',
  'Qualified',
  'Cold',
  'Disqualified'
] as const

export type LeadStatus = typeof LEAD_STATUS[number]

export const normalizeLeadStatus = (value: any): LeadStatus | undefined => {
  if (!value || typeof value !== 'string') return undefined
  
  const normalizedValue = value.trim()
  return LEAD_STATUS.find(status => status === normalizedValue) || undefined
}