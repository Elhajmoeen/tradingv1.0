import { ColumnDefinition } from '@/components/ColumnsDrawer'
import { KYC_STATUS } from '@/config/kycStatus'
import { ACCOUNT_TYPE_OPTIONS } from '@/config/accountType'
import { CITIZEN_STATUS } from '@/config/citizen'
import { GENDER_OPTIONS } from '@/config/gender'
import { LEAD_SOURCE_OPTIONS } from '@/config/leadSource'
import { DOCUMENT_STATUS_OPTIONS } from '@/config/documentStatus'
import { PAYMENT_GATEWAY_OPTIONS } from '@/config/paymentGateway'

// Compliance column definitions using the same system as leads/clients
export const complianceColumnDefinitions: ColumnDefinition[] = [
  // Core Account Information
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'text', defaultVisible: true },
  { id: 'createdAt', header: 'Created At', path: 'createdAt', type: 'datetime', defaultVisible: true },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'select', defaultVisible: true },
  { id: 'salesManager', header: 'Sales Manager', path: 'salesManager', type: 'select', defaultVisible: true },
  { id: 'conversationOwner', header: 'Conversation Owner', path: 'conversationOwner', type: 'select', defaultVisible: true },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'select', defaultVisible: false },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'select', defaultVisible: false },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'select', defaultVisible: true, options: ACCOUNT_TYPE_OPTIONS.map(opt => ({ label: opt, value: opt })) },

  // Personal Information
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'email', defaultVisible: true },
  { id: 'phone', header: 'Phone', path: 'phone', type: 'phone', defaultVisible: true },
  { id: 'phone2', header: 'Phone 2', path: 'phone2', type: 'phone', defaultVisible: false },
  { id: 'country', header: 'Country', path: 'country', type: 'select', defaultVisible: true },
  { id: 'dob', header: 'Date of Birth', path: 'dob', type: 'date', defaultVisible: false },
  { id: 'gender', header: 'Gender', path: 'gender', type: 'select', defaultVisible: false, options: GENDER_OPTIONS },
  { id: 'citizen', header: 'Citizen', path: 'citizen', type: 'select', defaultVisible: false, options: CITIZEN_STATUS.map(opt => ({ label: opt, value: opt })) },
  { id: 'language', header: 'Language', path: 'language', type: 'select', defaultVisible: false },

  // Trading Information
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: false },
  { id: 'dateConverted', header: 'Date Converted', path: 'dateConverted', type: 'datetime', defaultVisible: false },

  // Compliance Information
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'select', defaultVisible: true, options: KYC_STATUS.map(status => ({ label: status, value: status })) },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'text', defaultVisible: true },

  // Address Information
  { id: 'address', header: 'Address', path: 'address', type: 'text', defaultVisible: false },
  { id: 'address1', header: 'Address 1', path: 'address1', type: 'text', defaultVisible: false },
  { id: 'zip', header: 'ZIP', path: 'zip', type: 'text', defaultVisible: false },
  { id: 'city', header: 'City', path: 'city', type: 'text', defaultVisible: false },
  { id: 'state', header: 'State', path: 'state', type: 'text', defaultVisible: false },
  { id: 'nationality', header: 'Nationality', path: 'nationality', type: 'text', defaultVisible: false },

  // Document Information
  { id: 'idPassportNumber', header: 'ID/Passport #', path: 'idPassportNumber', type: 'text', defaultVisible: false },
  { id: 'proofOfAddressRef', header: 'POA Reference', path: 'proofOfAddressRef', type: 'text', defaultVisible: false },
  { id: 'ccFrontRef', header: 'CC Front #', path: 'ccFrontRef', type: 'text', defaultVisible: false },
  { id: 'ccBackRef', header: 'CC Back #', path: 'ccBackRef', type: 'text', defaultVisible: false },
  { id: 'dod', header: 'DOD', path: 'dod', type: 'text', defaultVisible: false },

  // Document Uploads (these will show upload status)
  { id: 'idPassportUpload', header: 'ID/Passport Upload', path: 'documents.idPassport', type: 'document', defaultVisible: true },
  { id: 'proofOfAddressUpload', header: 'POA Upload', path: 'documents.proofOfAddress', type: 'document', defaultVisible: true },
  { id: 'creditCardFrontUpload', header: 'CC Front Upload', path: 'documents.creditCardFront', type: 'document', defaultVisible: true },
  { id: 'creditCardBackUpload', header: 'CC Back Upload', path: 'documents.creditCardBack', type: 'document', defaultVisible: true },

  // Financial Information
  { id: 'totalFtd', header: 'Total FTD', path: 'totalFtd', type: 'currency', defaultVisible: false },
  { id: 'ftdDate', header: 'FTD Date', path: 'ftdDate', type: 'date', defaultVisible: false },
  { id: 'ftdAmount', header: 'FTD Amount', path: 'ftdAmount', type: 'currency', defaultVisible: false },
  { id: 'paymentGateway', header: 'Payment Gateway', path: 'paymentGateway', type: 'select', defaultVisible: false, options: PAYMENT_GATEWAY_OPTIONS.map(opt => ({ label: opt, value: opt })) },

  // Additional Fields
  { id: 'leadSource', header: 'Lead Source', path: 'leadSource', type: 'select', defaultVisible: false, options: LEAD_SOURCE_OPTIONS.map(opt => ({ label: opt, value: opt })) },
  { id: 'comments', header: 'Comments', path: 'comments', type: 'text', defaultVisible: false },
]

// Helper function to get filtered column definitions (same pattern as other pages)
export const getFilteredComplianceColumnDefinitions = (): ColumnDefinition[] => {
  // Filter out any unwanted columns if needed
  return complianceColumnDefinitions
}