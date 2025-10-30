export const DOCUMENT_STATUS_OPTIONS = [
  'Pending',
  'Approved',
  'Rejected',
  'Under Review',
  'Expired',
  'Not Submitted'
] as const

export type DocumentStatus = typeof DOCUMENT_STATUS_OPTIONS[number]

export const normalizeDocumentStatus = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = DOCUMENT_STATUS_OPTIONS.find(status => 
    status.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}