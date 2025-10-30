export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
] as const

export type GenderOption = typeof GENDER_OPTIONS[number]['value']

export const normalizeGender = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim().toLowerCase()
  const found = GENDER_OPTIONS.find(option => 
    option.value === normalized || option.label.toLowerCase() === normalized
  )
  
  return found ? found.value : normalized
}