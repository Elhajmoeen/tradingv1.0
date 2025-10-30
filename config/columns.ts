import { ColumnDefinition } from '@/components/ColumnsDrawer'
import { LEAD_STATUS } from './leadStatus'
import { KYC_STATUS } from './kycStatus'
import { PAYMENT_GATEWAY_OPTIONS } from './paymentGateway'
import { FTD_OPTIONS } from './ftd'
import { CITIZEN_STATUS } from './citizen'
import { ACCOUNT_TYPE_OPTIONS } from './accountType'
import { SWAP_TYPE_OPTIONS } from './swapType'
import { LEAD_SOURCE_OPTIONS } from './leadSource'
import { DOCUMENT_STATUS_OPTIONS } from './documentStatus'
import { GENDER_OPTIONS } from './gender'
import { optionsByKey } from '@/fieldkit/options'
import { store } from '@/state/store'

// Get dynamic options from fieldkit for consistent data
const getFieldkitOptionsForColumn = (columnId: string): { label: string; value: any }[] => {
  try {
    const state = store.getState();
    return optionsByKey(state, columnId as any);
  } catch (error) {
    console.warn(`Failed to get fieldkit options for column ${columnId}:`, error);
    return [];
  }
};

// Filter function to remove legacy MKT fields from any column list
export const isLegacyMkt = (f: any): boolean => {
  if (typeof f?.header === 'string' && /^MKT\s/i.test(f.header)) return true
  if (typeof f?.label === 'string' && /^MKT\s/i.test(f.label)) return true
  if (typeof f?.id === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.id)) return true
  if (typeof f?.key === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.key)) return true
  if (typeof f?.path === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.path)) return true
  return false
}

// Helper function to filter legacy MKT fields from column arrays
export const filterLegacyMktColumns = <T>(columns: T[]): T[] => {
  return columns.filter(f => !isLegacyMkt(f))
}

// Function to generate column definitions for custom documents
export const generateCustomDocumentColumns = (customDocuments: Array<{id: string, label: string}>): ColumnDefinition[] => {
  return customDocuments.map(doc => ({
    id: doc.id,
    header: doc.label,
    path: doc.id,
    type: 'boolean' as const,
    defaultVisible: true,
    isCustomDocument: true
  }))
}

// Base column definitions for the leads table (without custom documents)
// Based on the user requirements and existing field configuration
export const baseLeadColumnDefinitions: ColumnDefinition[] = [
  // Core Account Information
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'text', defaultVisible: true },
  { 
    id: 'createdAt', 
    header: 'Created At', 
    path: 'createdAt', 
    type: 'datetime', 
    defaultVisible: true
  },
  { 
    id: 'desk', 
    header: 'Desk', 
    path: 'desk', 
    type: 'select', 
    defaultVisible: true
  },
  { 
    id: 'conversationOwner', 
    header: 'Conversation Owner', 
    path: 'conversationOwner', 
    type: 'select', 
    defaultVisible: true
  },
  { 
    id: 'accountType', 
    header: 'Account Type', 
    path: 'accountType', 
    type: 'select', 
    defaultVisible: true,
    options: getFieldkitOptionsForColumn('accountType')
  },
  { id: 'status', header: 'Status', path: 'status', type: 'status', defaultVisible: true },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'boolean', defaultVisible: true },
  { id: 'registeredIp', header: 'Registered IP', path: 'registeredIp', type: 'text', defaultVisible: false },

  // Personal Information
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'email', defaultVisible: true },
  { id: 'phoneNumber', header: 'Phone Number', path: 'phoneNumber', type: 'phone', defaultVisible: true },
  { id: 'phoneNumber2', header: 'Phone Number 2', path: 'phoneNumber2', type: 'phone', defaultVisible: true },
  { id: 'country', header: 'Country', path: 'country', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('country') },
  { id: 'countryCode', header: 'Country Code', path: 'countryCode', type: 'text', defaultVisible: true },
  { id: 'dateOfBirth', header: 'Date of Birth', path: 'dateOfBirth', type: 'date', defaultVisible: true },
  { id: 'age', header: 'Age', path: 'age', type: 'calculated', defaultVisible: true },
  { id: 'gender', header: 'Gender', path: 'gender', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('gender') },
  { id: 'citizen', header: 'Citizen', path: 'citizen', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('citizen') },
  { id: 'language', header: 'Language', path: 'language', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('language') },

  // Activity Timeline
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: true },
  { id: 'firstLoginAt', header: 'First Login At', path: 'firstLoginAt', type: 'datetime', defaultVisible: true },
  { id: 'lastLoginAt', header: 'Last Login At', path: 'lastLoginAt', type: 'datetime', defaultVisible: true },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: true },
  { id: 'followUpAt', header: 'Follow up At', path: 'followUpAt', type: 'datetime', defaultVisible: true },

  // Engagement Counters
  { id: 'noAnswerCount', header: 'No Answer Count', path: 'noAnswerCount', type: 'number', defaultVisible: true },
  { id: 'callAttempts', header: 'Call Attempts', path: 'callAttempts', type: 'number', defaultVisible: true },
  { id: 'loginCount', header: 'Login Count', path: 'loginCount', type: 'number', defaultVisible: true },

  // Lifecycle Management
  { id: 'firstConversationOwner', header: 'First Conversation Owner', path: 'firstConversationOwner', type: 'text', defaultVisible: true },
  { id: 'conversationAssignedAt', header: 'Conversation assigned at', path: 'conversationAssignedAt', type: 'datetime', defaultVisible: true },
  // PATCH: begin dynamic status options in columns
  { id: 'leadStatus', header: 'Lead Status', path: 'leadStatus', type: 'select', defaultVisible: true, options: [] }, // Dynamic from Status Manager
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'select', defaultVisible: true, options: [] }, // Dynamic from Status Manager
  // PATCH: end dynamic status options in columns
  { id: 'salesReview', header: 'Sales Review', path: 'salesReview', type: 'rating', defaultVisible: true },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'rating', defaultVisible: true },
  { id: 'salesSecondHand', header: 'Sales Second Hand', path: 'salesSecondHand', type: 'boolean', defaultVisible: true },

  // Financial Information
  { id: 'totalFtd', header: 'Total FTD', path: 'totalFtd', type: 'number', defaultVisible: true },
  { id: 'ftdDate', header: 'FTD Date', path: 'ftdDate', type: 'date', defaultVisible: true },
  { id: 'ftd', header: 'FTD', path: 'ftd', type: 'text', defaultVisible: true },
  { id: 'ftdSelf', header: 'FTD Self', path: 'ftdSelf', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('ftdSelf') },
  { id: 'paymentGateway', header: 'Payment Gateway', path: 'finance.ftd.paymentMethod', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('paymentGateway') },
  { id: 'ftdFirstConversation', header: 'FTD First Conversation', path: 'ftdFirstConversation', type: 'number', defaultVisible: true },
  { id: 'daysToFtd', header: 'Days to FTD', path: 'daysToFtd', type: 'number', defaultVisible: true },
  { id: 'totalCredits', header: 'Total Credits', path: 'finance.credit.totalCredit', type: 'number', defaultVisible: true },

  // Document Information
  { id: 'idPassport', header: 'ID/Passport', path: 'idPassport', type: 'verification-checkbox', defaultVisible: true },
  { id: 'proofOfAddress', header: 'Proof of Address', path: 'proofOfAddress', type: 'verification-checkbox', defaultVisible: true },
  { id: 'ccFront', header: 'Credit Card Front', path: 'ccFront', type: 'verification-checkbox', defaultVisible: true },
  { id: 'ccBack', header: 'Credit Card Back', path: 'ccBack', type: 'verification-checkbox', defaultVisible: true },
  { id: 'dod', header: 'DOD', path: 'dod', type: 'boolean', defaultVisible: true },

  // Marketing & Campaign Data
  { id: 'campaignId', header: 'Campaign ID', path: 'campaignId', type: 'text', defaultVisible: true },
  { id: 'tag', header: 'Tag', path: 'tag', type: 'text', defaultVisible: true },
  { id: 'leadSource', header: 'Lead Source', path: 'leadSource', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('leadSource') },
  { id: 'utmKeyword', header: 'UTM Keyword', path: 'utmKeyword', type: 'text', defaultVisible: true },
  { id: 'utmTerm', header: 'UTM Term', path: 'utmTerm', type: 'text', defaultVisible: true },
  { id: 'utmCreative', header: 'UTM Creative', path: 'utmCreative', type: 'text', defaultVisible: true },
  { id: 'campaignSource', header: 'Campaign Source', path: 'campaignSource', type: 'text', defaultVisible: true },
  { id: 'utmMedium', header: 'UTM Medium', path: 'utmMedium', type: 'text', defaultVisible: true },
  { id: 'utmAdGroupId', header: 'UTM Ad Group ID', path: 'utmAdGroupId', type: 'text', defaultVisible: true },
  { id: 'utmAdPosition', header: 'UTM ad Position', path: 'utmAdPosition', type: 'text', defaultVisible: true },
  { id: 'utmCountry', header: 'UTM Country', path: 'utmCountry', type: 'text', defaultVisible: true },
  { id: 'utmFeedItemId', header: 'UTM Feed Item ID', path: 'utmFeedItemId', type: 'text', defaultVisible: true },
  { id: 'utmLandingPage', header: 'UTM Landing Page', path: 'utmLandingPage', type: 'text', defaultVisible: true },
  { id: 'utmLanguage', header: 'UTM Language', path: 'utmLanguage', type: 'text', defaultVisible: true },
  { id: 'utmMatchType', header: 'UTM Match Type', path: 'utmMatchType', type: 'text', defaultVisible: true },
  { id: 'utmTargetId', header: 'UTM Target ID', path: 'utmTargetId', type: 'text', defaultVisible: true },
  { id: 'gclid', header: 'GCLID', path: 'gclid', type: 'text', defaultVisible: true },
  { id: 'utmContent', header: 'UTM Content', path: 'utmContent', type: 'text', defaultVisible: true },
  { id: 'utmSource', header: 'UTM Source', path: 'utmSource', type: 'text', defaultVisible: true },
  { id: 'utmAccount', header: 'UTM Account', path: 'utmAccount', type: 'text', defaultVisible: true },
  { id: 'utmAccountId', header: 'UTM Account ID', path: 'utmAccountId', type: 'text', defaultVisible: true },
  { id: 'utmCampaignId', header: 'UTM Campaign ID', path: 'utmCampaignId', type: 'text', defaultVisible: true },
  { id: 'utmAdGroupName', header: 'UTM Ad Group Name', path: 'utmAdGroupName', type: 'text', defaultVisible: true },
  { id: 'platform', header: 'Platform', path: 'platform', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('platform') },
  { id: 'utmCampaign', header: 'UTM Campaign', path: 'utmCampaign', type: 'text', defaultVisible: true },
  { id: 'utmDevice', header: 'UTM Device', path: 'utmDevice', type: 'text', defaultVisible: true },

  // Account Settings
  { id: 'enableLogin', header: 'Enable Login', path: 'enableLogin', type: 'boolean', defaultVisible: true },
  { id: 'blockNotifications', header: 'Block Notifications', path: 'blockNotifications', type: 'boolean', defaultVisible: true },
  { id: 'allowedToTrade', header: 'Allowed To Trade', path: 'allowedToTrade', type: 'boolean', defaultVisible: true },
  { id: 'withdrawLimit', header: 'Withdraw Limit Allowed', path: 'withdrawLimit', type: 'number', defaultVisible: true },
  { id: 'allowed2fa', header: '2FA', path: 'allowed2fa', type: 'boolean', defaultVisible: true },
  { id: 'allowDeposit', header: 'Allow Deposit', path: 'allowDeposit', type: 'boolean', defaultVisible: true },
  { id: 'depositLimit', header: 'Deposit Limit', path: 'depositLimit', type: 'number', defaultVisible: true },
  { id: 'allowWithdraw', header: 'Allow Withdraw', path: 'allowWithdraw', type: 'boolean', defaultVisible: true },
  { id: 'marginCall', header: 'Margin Call', path: 'marginCall', type: 'number', defaultVisible: true },
  { id: 'miniDeposit', header: 'Mini Deposit', path: 'miniDeposit', type: 'number', defaultVisible: true },
  { id: 'stopOut', header: 'Stop out', path: 'stopOut', type: 'number', defaultVisible: true },
  { id: 'swapType', header: 'Swap Type', path: 'swapType', type: 'select', defaultVisible: true, options: getFieldkitOptionsForColumn('swapType') },

  // Trading Instruments
  { id: 'forex', header: 'Forex', path: 'forex', type: 'text', defaultVisible: true },
  { id: 'crypto', header: 'Crypto', path: 'crypto', type: 'text', defaultVisible: true },
  { id: 'commodities', header: 'Commodities', path: 'commodities', type: 'text', defaultVisible: true },
  { id: 'indices', header: 'Indices', path: 'indices', type: 'text', defaultVisible: true },
  { id: 'stocks', header: 'Stocks', path: 'stocks', type: 'text', defaultVisible: true },
]

// Function to get complete column definitions including custom documents
export const getLeadColumnDefinitions = (customDocuments?: Array<{id: string, label: string}>): ColumnDefinition[] => {
  const customDocumentColumns = customDocuments ? generateCustomDocumentColumns(customDocuments) : []
  return [...baseLeadColumnDefinitions, ...customDocumentColumns]
}

// Backward compatibility - export as leadColumnDefinitions for existing code
export const leadColumnDefinitions = baseLeadColumnDefinitions

// Helper function to get default visible columns
export const getDefaultVisibleColumns = (customDocuments?: Array<{id: string, label: string}>): Record<string, boolean> => {
  const defaultColumns: Record<string, boolean> = {}
  const allColumns = getLeadColumnDefinitions(customDocuments)
  const filteredColumns = filterLegacyMktColumns(allColumns)
  filteredColumns.forEach((col: ColumnDefinition) => {
    defaultColumns[col.id] = col.defaultVisible
  })
  return defaultColumns
}

// Helper function to get all columns as visible
export const getAllColumnsVisible = (customDocuments?: Array<{id: string, label: string}>): Record<string, boolean> => {
  const allColumns: Record<string, boolean> = {}
  const columns = getLeadColumnDefinitions(customDocuments)
  const filteredColumns = filterLegacyMktColumns(columns)
  filteredColumns.forEach((col: ColumnDefinition) => {
    allColumns[col.id] = true
  })
  return allColumns
}

// Helper function to get all columns as hidden
export const getAllColumnsHidden = (customDocuments?: Array<{id: string, label: string}>): Record<string, boolean> => {
  const allColumns: Record<string, boolean> = {}
  const columns = getLeadColumnDefinitions(customDocuments)
  const filteredColumns = filterLegacyMktColumns(columns)
  filteredColumns.forEach((col: ColumnDefinition) => {
    allColumns[col.id] = false
  })
  return allColumns
}

// Helper function to get filtered column definitions (removes legacy MKT fields)
export const getFilteredLeadColumnDefinitions = (customDocuments?: Array<{id: string, label: string}>): ColumnDefinition[] => {
  return filterLegacyMktColumns(getLeadColumnDefinitions(customDocuments))
}