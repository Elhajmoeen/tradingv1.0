import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './store'
import { selectAllEntities } from './entitiesSlice'

// Compliance row type - joined view model
export type ComplianceRow = {
  clientId: string
  accountId?: string
  createdAt?: string
  desk?: string
  conversationOwner?: string
  retentionOwner?: string
  accountType?: string
  regulation?: string

  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  phone2?: string
  country?: string
  dateOfBirth?: string
  age?: number
  gender?: 'Male' | 'Female' | 'Other' | ''

  citizen?: string
  language?: string

  firstTradedAt?: string
  lastTradedAt?: string
  followUpAt?: string
  dateConverted?: string

  kycStatus?: 'Pending' | 'Approved' | 'Rejected' | 'Expired' | ''
  address?: string
  address1?: string
  zip?: string
  city?: string
  state?: string
  nationality?: string
  dod?: string

  // Documents (presence + link)
  idPassport?: string
  proofOfAddress?: string
  creditCardFront?: string
  creditCardBack?: string
  idPassportUpload?: string
  proofOfAddressUpload?: string
  creditCardFrontUpload?: string
  creditCardBackUpload?: string

  totalFtd?: number
  ftdDate?: string
  ftd?: number
  paymentGateway?: string
}

// Helper to compute age from date of birth
const computeAge = (dob?: string): number | undefined => {
  if (!dob) return undefined
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Selector to join client data with trading stats and documents
export const selectComplianceRows = createSelector(
  [selectAllEntities],
  (entities): ComplianceRow[] => {
    // Filter for clients only
    const clients = entities.filter(e => e.type === 'client')
    
    return clients.map(client => {
      // Extract document info from custom fields or documents
      const documents = client.documents || {}
      
      return {
        clientId: client.id,
        accountId: client.accountId,
        createdAt: client.createdAt,
        desk: client.desk,
        conversationOwner: client.conversationOwner,
        retentionOwner: client.retentionOwner,
        accountType: client.accountType,
        regulation: client.regulation,

        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        phone2: client.phone2,
        country: client.country,
        dateOfBirth: client.dob,
        age: computeAge(client.dob),
        gender: client.gender as 'Male' | 'Female' | 'Other' | '',

        citizen: client.citizen,
        language: client.language,

        firstTradedAt: client.firstTradedAt,
        lastTradedAt: client.lastTradedAt,
        followUpAt: client.followUpAt,
        dateConverted: client.dateConverted,

        kycStatus: client.kycStatus as 'Pending' | 'Approved' | 'Rejected' | 'Expired' | '',
        address: client.address,
        address1: client.address1,
        zip: client.zip,
        city: client.city,
        state: client.state,
        nationality: client.nationality,
        dod: client.dod,

        // Document references (numbers or IDs)
        idPassport: client.idPassportNumber,
        proofOfAddress: client.proofOfAddressRef,
        creditCardFront: client.ccFrontRef,
        creditCardBack: client.ccBackRef,

        // Document uploads (file IDs from documents object)
        idPassportUpload: documents.idPassport?.fileId || documents.idPassport,
        proofOfAddressUpload: documents.proofOfAddress?.fileId || documents.proofOfAddress,
        creditCardFrontUpload: documents.creditCardFront?.fileId || documents.creditCardFront,
        creditCardBackUpload: documents.creditCardBack?.fileId || documents.creditCardBack,

        totalFtd: client.totalFtd || 0,
        ftdDate: client.ftdDate,
        ftd: client.ftdAmount,
        paymentGateway: client.paymentGateway,
      }
    })
  }
)

// Filter compliance rows based on search query
export const filterComplianceRows = (rows: ComplianceRow[], query: string): ComplianceRow[] => {
  if (!query.trim()) return rows
  
  const lowerQuery = query.toLowerCase()
  return rows.filter(row => {
    return (
      row.accountId?.toLowerCase().includes(lowerQuery) ||
      row.firstName?.toLowerCase().includes(lowerQuery) ||
      row.lastName?.toLowerCase().includes(lowerQuery) ||
      row.email?.toLowerCase().includes(lowerQuery) ||
      row.phone?.toLowerCase().includes(lowerQuery) ||
      row.phone2?.toLowerCase().includes(lowerQuery) ||
      row.conversationOwner?.toLowerCase().includes(lowerQuery) ||
      row.retentionOwner?.toLowerCase().includes(lowerQuery)
    )
  })
}
