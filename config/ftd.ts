export const FTD_OPTIONS = [
  'Yes',
  'No'
] as const

export type FTDOption = typeof FTD_OPTIONS[number]

export const normalizeFTD = (value: string | boolean | number): string => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (typeof value === 'number') {
    return value > 0 ? 'Yes' : 'No'
  }
  
  if (!value || typeof value !== 'string') return 'No'
  
  const normalized = value.trim().toLowerCase()
  
  // Handle various representations
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return 'Yes'
  }
  
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return 'No'
  }
  
  // Default fallback
  return normalized === 'yes' ? 'Yes' : 'No'
}

// Logic: FTD should automatically be set to "Yes" when client makes first deposit
export const shouldAutoSetFTD = (entity: any): boolean => {
  // Check if totalFtd exists and is greater than 0
  return entity?.totalFtd && entity.totalFtd > 0
}

// Logic: FTD Self indicates if deposit was made via platform (Yes) or CRM (No)
export const getFTDSelfValue = (depositSource: 'platform' | 'crm'): string => {
  return depositSource === 'platform' ? 'Yes' : 'No'
}