import type { ColumnDefinition } from '@/components/ColumnsDrawer'

// Sample smart filter options
const ACCOUNT_TYPE_OPTIONS = [
  { value: 'VIP', label: 'VIP' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Bronze', label: 'Bronze' },
  { value: 'Standard', label: 'Standard' }
]

const DESK_OPTIONS = [
  { value: 'USD', label: 'USD Desk' },
  { value: 'EUR', label: 'EUR Desk' },
  { value: 'GBP', label: 'GBP Desk' },
  { value: 'AUD', label: 'AUD Desk' }
]

const REGULATION_OPTIONS = [
  { value: 'true', label: 'Regulated' },
  { value: 'false', label: 'Unregulated' }
]

// Helper to search users (mock implementation)
const searchUsersByName = async (query: string) => {
  // In real implementation, this would call your API
  const mockUsers = [
    { value: 'user1', label: 'John Smith' },
    { value: 'user2', label: 'Jane Doe' },
    { value: 'user3', label: 'Mike Johnson' },
    { value: 'user4', label: 'Sarah Wilson' }
  ]
  
  return mockUsers.filter(user => 
    user.label.toLowerCase().includes(query.toLowerCase())
  )
}

// Client-specific column definitions for Active Clients page
export const clientColumnDefinitions: ColumnDefinition[] = [
  // Account & Core Information
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
    type: 'text', 
    defaultVisible: true
  },
  { id: 'salesManager', header: 'Sales Manager', path: 'salesManager', type: 'text', defaultVisible: true },
  { 
    id: 'conversationOwner', 
    header: 'Conversation Owner', 
    path: 'conversationOwner', 
    type: 'text', 
    defaultVisible: true
  },
  { id: 'firstConversationOwner', header: 'First Conversation Owner', path: 'firstConversationOwner', type: 'text', defaultVisible: false },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: false },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: false },
  { 
    id: 'accountType', 
    header: 'Account Type', 
    path: 'accountType', 
    type: 'select', 
    defaultVisible: true
  },
  { id: 'status', header: 'Status', path: 'status', type: 'status', defaultVisible: true },
  { 
    id: 'regulation', 
    header: 'Regulation', 
    path: 'regulation', 
    type: 'boolean', 
    defaultVisible: false
  },
  { id: 'registeredIp', header: 'REegiserted IP', path: 'registeredIp', type: 'text', defaultVisible: false },

  // Personal Information
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'email', defaultVisible: true },
  { id: 'phoneNumber', header: 'Phone Number', path: 'phoneNumber', type: 'phone', defaultVisible: true },
  { id: 'phoneNumber2', header: 'Phone Number 2', path: 'phoneNumber2', type: 'phone', defaultVisible: false },
  { id: 'country', header: 'Country', path: 'country', type: 'text', defaultVisible: false },
  { id: 'countryCode', header: 'Country Code', path: 'countryCode', type: 'text', defaultVisible: false },
  { id: 'dateOfBirth', header: 'Date of Birth', path: 'dateOfBirth', type: 'date', defaultVisible: false },
  { 
    id: 'age', 
    header: 'Age', 
    path: 'age', 
    type: 'number', 
    defaultVisible: false
  },
  { id: 'gender', header: 'Gender', path: 'gender', type: 'select', defaultVisible: false },
  { id: 'citizen', header: 'Citizen', path: 'citizen', type: 'select', defaultVisible: false },
  { id: 'language', header: 'Lanague', path: 'language', type: 'text', defaultVisible: false },

  // Activity & Dates
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: false },
  { id: 'firstLoginAt', header: 'First Login At', path: 'firstLoginAt', type: 'datetime', defaultVisible: false },
  { id: 'lastLoginAt', header: 'Last Login At', path: 'lastLoginAt', type: 'datetime', defaultVisible: false },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: false },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: false },
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: false },

  // Contact & Activity Metrics
  { id: 'noAnswerCount', header: 'No Answer Count', path: 'noAnswerCount', type: 'number', defaultVisible: false },
  { id: 'callAttempts', header: 'Call Attempts', path: 'callAttempts', type: 'number', defaultVisible: false },
  { id: 'loginCount', header: 'Login Count', path: 'loginCount', type: 'number', defaultVisible: false },
  { id: 'dateConverted', header: 'Date Converted', path: 'dateConverted', type: 'datetime', defaultVisible: false },
  { id: 'conversationAssignedAt', header: 'Conversation Assigned At', path: 'conversationAssignedAt', type: 'datetime', defaultVisible: false },
  { id: 'retentionAssignedAt', header: 'Retention Assigned At', path: 'retentionAssignedAt', type: 'datetime', defaultVisible: false },

  // Status & Reviews
  { id: 'retentionStatus', header: 'Reterntion Status', path: 'retentionStatus', type: 'select', defaultVisible: false },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'rating', defaultVisible: false },
  { id: 'secondHandRetention', header: 'Second Hand Retention', path: 'secondHandRetention', type: 'text', defaultVisible: false },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'select', defaultVisible: false },
  { id: 'leadStatus', header: 'Lead Status', path: 'leadStatus', type: 'select', defaultVisible: false },
  { id: 'salesReview', header: 'Sales Review', path: 'salesReview', type: 'rating', defaultVisible: false },
  { id: 'salesSecondHand', header: 'Sales Second Hand', path: 'salesSecondHand', type: 'text', defaultVisible: false },

  // FTD Information
  { id: 'totalFtd', header: 'Total FTD', path: 'totalFtd', type: 'money', defaultVisible: false },
  { id: 'ftdDate', header: 'FTD Date', path: 'ftdDate', type: 'date', defaultVisible: false },
  { id: 'ftd', header: 'FTD', path: 'ftd', type: 'number', defaultVisible: false },
  { id: 'ftdSelf', header: 'FTD Self', path: 'ftdSelf', type: 'boolean', defaultVisible: false },
  { id: 'daysToFtd', header: 'Days to FTD', path: 'daysToFtd', type: 'number', defaultVisible: false },
  { id: 'ftdFirstConversation', header: 'FTD First Conversation', path: 'ftdFirstConversation', type: 'boolean', defaultVisible: false },

  // Deposit Information
  { id: 'totalDeposits', header: 'Total Deposits', path: 'finance.deposit.totalDeposit', type: 'money', defaultVisible: true },
  { id: 'netDeposits', header: 'Net Deposits', path: 'finance.deposit.netDeposit', type: 'money', defaultVisible: false },
  { id: 'firstDepositDate', header: 'First Deposit Date', path: 'finance.deposit.firstDepositDateISO', type: 'date', defaultVisible: false },
  { id: 'lastDepositDate', header: 'Last Deposit Date', path: 'finance.deposit.lastDepositDateISO', type: 'date', defaultVisible: false },
  { id: 'daysToDeposit', header: 'Days to Deposit', path: 'finance.deposit.daysToDeposit', type: 'number', defaultVisible: false },
  { id: 'paymentGateway', header: 'Payment Gateway', path: 'paymentGateway', type: 'select', defaultVisible: false },

  // Withdrawal Information
  { id: 'totalWithdrawals', header: 'Total Withdrawals', path: 'finance.withdrawal.totalWithdrawal', type: 'money', defaultVisible: false },
  { id: 'netWithdrawals', header: 'Net Withdrawals', path: 'finance.withdrawal.netWithdrawal', type: 'money', defaultVisible: false },
  { id: 'firstWithdrawalDate', header: 'First Withdrawal date', path: 'finance.withdrawal.firstWithdrawalDateISO', type: 'date', defaultVisible: false },
  { id: 'lastWithdrawalDate', header: 'Last Withdrawal Date', path: 'finance.withdrawal.lastWithdrawalDateISO', type: 'date', defaultVisible: false },
  { id: 'daysToWithdrawal', header: 'Days to Withdrawal', path: 'finance.withdrawal.daysToWithdrawal', type: 'number', defaultVisible: false },
  { id: 'withdrawFromDeposit', header: 'Withdraw from Deposit', path: 'withdrawFromDeposit', type: 'money', defaultVisible: false },
  { id: 'ftwDate', header: 'FTW Date', path: 'finance.ftw.ftwDateISO', type: 'date', defaultVisible: false },
  { id: 'ftwSelf', header: 'FTW Self', path: 'finance.ftw.ftwSelf', type: 'boolean', defaultVisible: false },

  // Credits Information
  { id: 'totalCredits', header: 'Total Credits', path: 'finance.credit.totalCredit', type: 'money', defaultVisible: false },
  { id: 'netCredits', header: 'Net Credits', path: 'finance.credit.netCredit', type: 'money', defaultVisible: false },
  { id: 'creditsOut', header: 'Credits Out', path: 'finance.credit.creditsOut', type: 'money', defaultVisible: false },
  { id: 'totalChargebacks', header: 'Total Chargebacks', path: 'totalChargebacks', type: 'money', defaultVisible: false },

  // Address Information
  { id: 'address', header: 'Address', path: 'address', type: 'text', defaultVisible: false },
  { id: 'address1', header: 'Address 1', path: 'address1', type: 'text', defaultVisible: false },
  { id: 'zipCode', header: 'Zip Code', path: 'zipCode', type: 'text', defaultVisible: false },
  { id: 'city', header: 'City', path: 'city', type: 'text', defaultVisible: false },
  { id: 'state', header: 'State', path: 'state', type: 'text', defaultVisible: false },
  { id: 'countryAddress', header: 'Country', path: 'country', type: 'text', defaultVisible: false },
  { id: 'nationality', header: 'Nationality', path: 'nationality', type: 'text', defaultVisible: false },
  { id: 'dateOfBirthDuplicate', header: 'Date of Birth', path: 'dateOfBirth', type: 'date', defaultVisible: false },
  { id: 'dod', header: 'DOD', path: 'dod', type: 'text', defaultVisible: false },

  // Documents
  { id: 'idPassport', header: 'ID/Passport', path: 'idDoc', type: 'verification-checkbox', defaultVisible: false },
  { id: 'proofOfAddress', header: 'Proof of Address', path: 'proofOfAddress', type: 'verification-checkbox', defaultVisible: false },
  { id: 'creditCardFront', header: 'Credit Card Front', path: 'ccFront', type: 'verification-checkbox', defaultVisible: false },
  { id: 'creditCardBack', header: 'Credit Card Back', path: 'ccBack', type: 'verification-checkbox', defaultVisible: false },

  // Marketing & UTM
  { id: 'campaignId', header: 'Campaign ID', path: 'campaignId', type: 'text', defaultVisible: false },
  { id: 'tag', header: 'Tag', path: 'tag', type: 'text', defaultVisible: false },
  { id: 'leadSource', header: 'Lead Source', path: 'leadSource', type: 'text', defaultVisible: false },
  { id: 'utmKeyword', header: 'UTM Keyword', path: 'utm.keyword', type: 'text', defaultVisible: false },
  { id: 'utmMedium', header: 'UTM Medium', path: 'utm.medium', type: 'text', defaultVisible: false },
  { id: 'campaignSource', header: 'Campaign Source', path: 'utm.source', type: 'text', defaultVisible: false },
  { id: 'utmCreative', header: 'UTM Creative', path: 'utm.creative', type: 'text', defaultVisible: false },
  { id: 'utmTerm', header: 'UTM Term', path: 'utm.term', type: 'text', defaultVisible: false },
  { id: 'utmAdGroupId', header: 'UTM Ad Group ID', path: 'utm.adGroupId', type: 'text', defaultVisible: false },
  { id: 'utmAdPosition', header: 'UTM Ad Position', path: 'utm.adPosition', type: 'text', defaultVisible: false },
  { id: 'utmCountry', header: 'UTM Country', path: 'utm.country', type: 'text', defaultVisible: false },
  { id: 'utmFeedItemId', header: 'UTM Feed Item ID', path: 'utm.feedItemId', type: 'text', defaultVisible: false },
  { id: 'utmTargetId', header: 'UTM Target ID', path: 'utm.targetId', type: 'text', defaultVisible: false },
  { id: 'gclid', header: 'GCLID', path: 'utm.gclid', type: 'text', defaultVisible: false },
  { id: 'utmMatchType', header: 'UTM Match Type', path: 'utm.matchType', type: 'text', defaultVisible: false },
  { id: 'utmLanguage', header: 'UTM Language', path: 'utm.language', type: 'text', defaultVisible: false },
  { id: 'utmLandingPage', header: 'UTM Landing Page', path: 'utm.landingPage', type: 'text', defaultVisible: false },
  { id: 'utmContent', header: 'UTM Content', path: 'utm.content', type: 'text', defaultVisible: false },
  { id: 'utmSource', header: 'UTM Source', path: 'utm.source', type: 'text', defaultVisible: false },
  { id: 'utmAccount', header: 'UTM Account', path: 'utm.account', type: 'text', defaultVisible: false },
  { id: 'utmAccountId', header: 'UTM Account ID', path: 'utm.accountId', type: 'text', defaultVisible: false },
  { id: 'utmCampaign', header: 'UTM Campaign', path: 'utm.campaign', type: 'text', defaultVisible: false },
  { id: 'utmCampaignId', header: 'UTM Campaign ID', path: 'utm.campaignId', type: 'text', defaultVisible: false },
  { id: 'utmAdGroupName', header: 'UTM Ad Group Name', path: 'utm.adGroupName', type: 'text', defaultVisible: false },
  { id: 'platform', header: 'Platform', path: 'platform', type: 'select', defaultVisible: false },
  { id: 'utmDevice', header: 'UTM Device', path: 'utm.device', type: 'text', defaultVisible: false },

  // Account Settings
  { id: 'enableLogin', header: 'Enable Login', path: 'enableLogin', type: 'boolean', defaultVisible: false },
  { id: 'blockNotifications', header: 'Block Notifications', path: 'blockNotifications', type: 'boolean', defaultVisible: false },
  { id: 'allowedToTrade', header: 'Allowed To Trade', path: 'allowedToTrade', type: 'boolean', defaultVisible: false },
  { id: 'withdrawLimit', header: 'Withdraw Limit', path: 'withdrawLimit', type: 'money', defaultVisible: false },
  { id: 'allowWithdraw', header: 'Allow Withdraw', path: 'allowWithdraw', type: 'boolean', defaultVisible: false },
  { id: 'depositLimit', header: 'Deposit Limit', path: 'depositLimit', type: 'money', defaultVisible: false },
  { id: 'allowDeposit', header: 'Allow Deposit', path: 'allowDeposit', type: 'boolean', defaultVisible: false },
  { id: 'allowed2fa', header: 'Allowed 2FA', path: 'allowed2FA', type: 'boolean', defaultVisible: false },
  { id: 'marginCall', header: 'Margin Call', path: 'marginCall', type: 'number', defaultVisible: false },
  { id: 'miniDeposit', header: 'Mini Deposit', path: 'miniDeposit', type: 'money', defaultVisible: false },
  { id: 'stopOut', header: 'Stop Out', path: 'stopOut', type: 'number', defaultVisible: false },
  { id: 'swapType', header: 'Swap Type', path: 'swapType', type: 'select', defaultVisible: false },

  // Trading Instruments
  { id: 'forex', header: 'Forex', path: 'forex', type: 'text', defaultVisible: false },
  { id: 'crypto', header: 'Crypto', path: 'crypto', type: 'text', defaultVisible: false },
  { id: 'commodities', header: 'Commodities', path: 'commodities', type: 'text', defaultVisible: false },
  { id: 'indices', header: 'Indices', path: 'indices', type: 'text', defaultVisible: false },
  { id: 'stocks', header: 'Stocks', path: 'stocks', type: 'text', defaultVisible: false },

  // Financial Metrics
  { id: 'balance', header: 'Balance', path: 'balance', type: 'money', defaultVisible: true },
  { id: 'marginLevel', header: 'Margin Level', path: 'marginLevel', type: 'number', defaultVisible: false },
  { id: 'openPnl', header: 'Open PnL', path: 'openPnl', type: 'money', defaultVisible: false },
  { id: 'totalPnl', header: 'Total PnL', path: 'totalPnl', type: 'money', defaultVisible: false },
  { id: 'freeMargin', header: 'Free Margin', path: 'freeMargin', type: 'money', defaultVisible: false },
  { id: 'margin', header: 'Margin', path: 'margin', type: 'money', defaultVisible: false },
  { id: 'equity', header: 'Equity', path: 'equity', type: 'money', defaultVisible: false },

  // Position Counts
  { id: 'openPositionsCount', header: '#Open Positions', path: 'openPositionsCount', type: 'number', defaultVisible: false },
  { id: 'closedPositionsCount', header: '#Closed Positions', path: 'closedPositionsCount', type: 'number', defaultVisible: false },
  { id: 'closedVolumeCount', header: '#Closed Volume', path: 'closedVolumeCount', type: 'number', defaultVisible: false },
  { id: 'closedVolume', header: 'Closed Volume', path: 'closedVolume', type: 'money', defaultVisible: false },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: false },
]

// Filter out any system fields we don't want
export const getFilteredClientColumnDefinitions = (): ColumnDefinition[] => {
  return clientColumnDefinitions.filter(col => 
    // Remove calculated fields and system fields from mass editing
    !['age'].includes(col.id)
  )
}