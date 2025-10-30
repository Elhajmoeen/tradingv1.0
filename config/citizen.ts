export const CITIZEN_STATUS = [
  'Yes',
  'No',
  'InProcess'
] as const

export type CitizenStatus = typeof CITIZEN_STATUS[number]

export const normalizeCitizenStatus = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = CITIZEN_STATUS.find(status => 
    status.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}