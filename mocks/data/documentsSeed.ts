/**
 * Mock data for documents
 * Realistic seed data for document management
 */

import { generateId, randomDateWithinDays, randomItem } from '@/mocks/utils'

export interface DocumentDTO {
  id: string
  clientId: string
  name: string
  type: 'ID' | 'PASSPORT' | 'UTILITY_BILL' | 'BANK_STATEMENT' | 'PROOF_OF_ADDRESS' | 'OTHER'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  reviewedAt?: string
  reviewedBy?: string
  fileUrl?: string
  fileName: string
  fileSize: number
  mimeType: string
  notes?: string
}

// Use same client IDs as other seeds
const mockClientIds = [
  'client_001', 'client_002', 'client_003', 'client_004', 'client_005',
  'client_006', 'client_007', 'client_008', 'client_009', 'client_010'
]

const documentTypes: DocumentDTO['type'][] = ['ID', 'PASSPORT', 'UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS', 'OTHER']
const reviewers = ['John Admin', 'Jane Compliance', 'Bob Reviewer', 'Alice Supervisor']
const mimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/gif']
const fileExtensions = ['jpg', 'png', 'pdf', 'gif']

/**
 * Generate mock document data
 */
function createMockDocument(overrides: Partial<DocumentDTO> = {}): DocumentDTO {
  const clientId = randomItem(mockClientIds)
  const type = randomItem(documentTypes)
  const status = randomItem(['PENDING', 'APPROVED', 'REJECTED'] as const)
  const uploadedAt = randomDateWithinDays(60)
  const extension = randomItem(fileExtensions)
  const fileName = `${type.toLowerCase()}_${clientId}_${Date.now()}.${extension}`
  
  return {
    id: generateId(),
    clientId,
    name: `${type.replace('_', ' ')} Document`,
    type,
    status,
    uploadedAt,
    reviewedAt: status !== 'PENDING' ? randomDateWithinDays(30) : undefined,
    reviewedBy: status !== 'PENDING' ? randomItem(reviewers) : undefined,
    fileUrl: `/uploads/documents/${fileName}`,
    fileName,
    fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
    mimeType: randomItem(mimeTypes),
    notes: status === 'REJECTED' ? 'Document quality insufficient, please resubmit' : undefined,
    ...overrides
  }
}

// Generate seed data with realistic status distribution
export const documentsSeed: DocumentDTO[] = [
  // Approved documents (60%)
  ...Array.from({ length: 36 }, () => createMockDocument({ status: 'APPROVED' })),
  
  // Pending documents (30%)
  ...Array.from({ length: 18 }, () => createMockDocument({ status: 'PENDING' })),
  
  // Rejected documents (10%)
  ...Array.from({ length: 6 }, () => createMockDocument({ status: 'REJECTED' })),
]

// Ensure each client has at least one document of each main type
const mainTypes: DocumentDTO['type'][] = ['ID', 'PROOF_OF_ADDRESS', 'BANK_STATEMENT']
mockClientIds.slice(0, 5).forEach(clientId => {
  mainTypes.forEach(type => {
    if (!documentsSeed.find(d => d.clientId === clientId && d.type === type)) {
      documentsSeed.push(createMockDocument({ 
        clientId, 
        type, 
        status: 'APPROVED' 
      }))
    }
  })
})

export default documentsSeed