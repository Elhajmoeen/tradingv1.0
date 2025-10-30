export type FieldType = 'text' | 'email' | 'phone' | 'select' | 'date' | 'datetime' | 'number' | 'boolean' | 'textarea' | 'rating' | 'calculated' | 'file' | 'verification-checkbox' | 'percentage'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: { label: string; value: any }[]
  description?: string
  defaultValue?: any
  compute?: (entity: any) => any
}

export interface SectionConfig {
  title: string
  fields: FieldConfig[]
}

export type TabId = 'general' | 'finance' | 'documents' | 'marketing' | 'settings' | 'positions'

export interface TabConfig {
  id: TabId
  title: string
  sections: SectionConfig[]
}

// Filter function to remove legacy MKT fields from any field list
export const isLegacyMkt = (f: any): boolean => {
  if (typeof f?.label === 'string' && /^MKT\s/i.test(f.label)) return true
  if (typeof f?.id === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.id)) return true
  if (typeof f?.key === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.key)) return true
  if (typeof f?.path === 'string' && /^(mkt|mktUtm|marketingUtm)/i.test(f.path)) return true
  return false
}

// Helper function to filter legacy MKT fields from field arrays
export const filterLegacyMktFields = <T>(fields: T[]): T[] => {
  return fields.filter(f => !isLegacyMkt(f))
}

// Helper function to compute age from date of birth
export const computeAge = (dobISO: string): number => {
  if (!dobISO) return 0
  const birthDate = new Date(dobISO)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Profile tabs registry
export const profileTabs: TabConfig[] = [
  {
    id: 'general',
    title: 'General',
    sections: [
      {
        title: 'Account',
        fields: [
          { key: 'accountId', label: 'Account ID', type: 'text', required: true },
          { key: 'createdAt', label: 'Created At', type: 'datetime' },
          { key: 'desk', label: 'Desk', type: 'text' },
          { key: 'salesManager', label: 'Sales Manager', type: 'text' },
          { key: 'conversationOwner', label: 'Conversation Owner', type: 'text' },
          { key: 'firstConversationOwner', label: 'First Conversation Owner', type: 'text' },
          { key: 'retentionOwner', label: 'Retention Owner', type: 'text' },
          { key: 'retentionManager', label: 'Retention Manager', type: 'text' },
          { key: 'accountType', label: 'Account Type', type: 'text' },
          { key: 'regulation', label: 'Regulation', type: 'boolean' },
          { 
            key: 'registeredIp', 
            label: 'Registered IP', 
            type: 'text',
            description: 'First IP address used to register the account',
            defaultValue: undefined
          }
        ]
      },
      {
        title: 'Identity & Contact',
        fields: [
          { key: 'firstName', label: 'First Name', type: 'text', required: true },
          { key: 'lastName', label: 'Last Name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'phoneNumber', label: 'Phone Number', type: 'phone' },
          { key: 'phoneNumber2', label: 'Phone Number 2', type: 'phone' },
          { key: 'country', label: 'Country', type: 'text' },
          { key: 'countryCode', label: 'Country Code', type: 'text' },
          { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          { 
            key: 'age', 
            label: 'Age', 
            type: 'calculated',
            compute: (entity: any) => computeAge(entity.dateOfBirth)
          },
          { 
            key: 'gender', 
            label: 'Gender', 
            type: 'select',
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]
          },
          { key: 'citizen', label: 'Citizen', type: 'text' },
          { key: 'language', label: 'Language', type: 'text' }
        ]
      },
      {
        title: 'Activity & Timeline',
        fields: [
          { key: 'lastContactAt', label: 'Last Contact At', type: 'datetime' },
          { key: 'lastCommentAt', label: 'Last Comment At', type: 'datetime' },
          { key: 'firstLoginAt', label: 'First Login At', type: 'datetime' },
          { key: 'lastLoginAt', label: 'Last Login At', type: 'datetime' },
          { key: 'lastActivityAt', label: 'Last Activity At', type: 'datetime' },
          { key: 'followUpAt', label: 'Follow Up At', type: 'datetime' },
          { key: 'firstTradedAt', label: 'First Traded At', type: 'datetime' },
          { key: 'lastTradedAt', label: 'Last Traded At', type: 'datetime' }
        ]
      },
      {
        title: 'Engagement Counters',
        fields: [
          { key: 'noAnswerCount', label: 'No Answer Count', type: 'number', defaultValue: 0 },
          { key: 'callAttempts', label: 'Call Attempts', type: 'number', defaultValue: 0 },
          { key: 'loginCount', label: 'Login Count', type: 'number', defaultValue: 0 }
        ]
      },
      {
        title: 'Lifecycle & Ownership',
        fields: [
          { key: 'dateConverted', label: 'Date Converted', type: 'datetime' },
          { key: 'conversationAssignedAt', label: 'Conversation Assigned At', type: 'datetime' },
          { key: 'retentionAssignedAt', label: 'Retention Assigned At', type: 'datetime' },
          { key: 'retentionStatus', label: 'Retention Status', type: 'text' },
          { 
            key: 'retentionReview', 
            label: 'Retention Review', 
            type: 'rating', 
            description: 'Retention team evaluation (1–5)' 
          },
          { key: 'secondHandRetention', label: 'Second Hand Retention', type: 'boolean' }
        ]
      },
      {
        title: 'Compliance & Sales',
        fields: [
          { key: 'kycStatus', label: 'KYC Status', type: 'select' },
          { key: 'leadStatus', label: 'Lead Status', type: 'select' },
          { 
            key: 'salesReview', 
            label: 'Sales Review', 
            type: 'rating', 
            description: 'Sales team evaluation (1–5)' 
          },
          { key: 'salesSecondHand', label: 'Sales Second Hand', type: 'boolean' }
        ]
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance',
    sections: [
      {
        title: 'First Time Deposit (FTD)',
        fields: [
          { key: 'finance.ftd.totalFTD', label: 'Total FTD', type: 'number' },
          { key: 'finance.ftd.ftdDateISO', label: 'FTD Date', type: 'date' },
          { key: 'finance.ftd.isFTD', label: 'FTD', type: 'text', compute: (entity: any) => entity.finance?.ftd?.isFTD ? 'Yes' : 'No' },
          { key: 'ftdSelf', label: 'FTD Self', type: 'text', compute: (entity: any) => entity.finance?.ftd?.ftdSelf ? 'Yes' : 'No' },
          { key: 'finance.ftd.paymentMethod', label: 'Payment Gateway', type: 'text' },
          { key: 'ftdFirstConversation', label: 'FTD First Conversation', type: 'number' },
          { key: 'finance.ftd.daysToFTD', label: 'Days to FTD', type: 'number' }
        ]
      },
      {
        title: 'Deposits',
        fields: [
          { key: 'finance.deposit.totalDeposit', label: 'Total Deposits', type: 'number', defaultValue: 0 },
          { key: 'finance.deposit.netDeposit', label: 'Net Deposits', type: 'number', defaultValue: 0 },
          { key: 'finance.deposit.daysToDeposit', label: 'Days to Deposit', type: 'number', defaultValue: 0 },
          { key: 'finance.deposit.firstDepositDateISO', label: 'First Deposit Date', type: 'datetime' },
          { key: 'finance.deposit.lastDepositDateISO', label: 'Last Deposit Date', type: 'datetime' }
        ]
      },
      {
        title: 'Withdrawals',
        fields: [
          { key: 'finance.withdrawal.totalWithdrawal', label: 'Total Withdrawals', type: 'number', defaultValue: 0 },
          { key: 'finance.withdrawal.netWithdrawal', label: 'Net Withdrawals', type: 'number', defaultValue: 0 },
          { key: 'finance.withdrawal.daysToWithdrawal', label: 'Days to Withdrawal', type: 'number', defaultValue: 0 },
          { key: 'finance.withdrawal.firstWithdrawalDateISO', label: 'First Withdrawal Date', type: 'datetime' },
          { key: 'finance.withdrawal.lastWithdrawalDateISO', label: 'Last Withdrawal Date', type: 'datetime' },
          { key: 'finance.ftw.totalFTW', label: 'Total FTW', type: 'number', defaultValue: 0 },
          { key: 'finance.ftw.ftwDateISO', label: 'FTW Date', type: 'date' },
          { key: 'finance.ftw.ftwSelf', label: 'FTW Self', type: 'text', compute: (entity: any) => entity.finance?.ftw?.ftwSelf ? 'Yes' : 'No' }
        ]
      },
      {
        title: 'Credits',
        fields: [
          { key: 'finance.credit.totalCredit', label: 'Total Credits', type: 'number', defaultValue: 0 },
          { key: 'finance.credit.totalCreditOut', label: 'Credits Out', type: 'number', defaultValue: 0 },
          { key: 'finance.credit.netCredit', label: 'Net Credits', type: 'number', defaultValue: 0 },
          { key: 'finance.credit.firstCreditDateISO', label: 'First Credit Date', type: 'datetime' },
          { key: 'finance.credit.lastCreditDateISO', label: 'Last Credit Date', type: 'datetime' },
          { key: 'finance.credit.firstCreditOutDateISO', label: 'First Credit Out Date', type: 'datetime' },
          { key: 'finance.credit.lastCreditOutDateISO', label: 'Last Credit Out Date', type: 'datetime' }
        ]
      },
      {
        title: 'Other Financial Data',
        fields: [
          { key: 'totalChargebacks', label: 'Total Chargebacks', type: 'number', defaultValue: 0 },
          { key: 'withdrawFromDeposit', label: 'Withdraw from Deposit', type: 'number', defaultValue: 0 }
        ]
      }
    ]
  },
  {
    id: 'documents',
    title: 'Documents',
    sections: [
      {
        title: 'Client Details',
        fields: [
          { key: 'address.line1', label: 'Address', type: 'text' },
          { key: 'address.line2', label: 'Address 1', type: 'text' },
          { key: 'address.zip', label: 'Zip Code', type: 'text' },
          { key: 'address.city', label: 'City', type: 'text' },
          { key: 'address.state', label: 'State', type: 'text' },
          { key: 'country', label: 'Country', type: 'text' },
          { key: 'nationality', label: 'Nationality', type: 'text' },
          { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          { key: 'dod', label: 'DOD', type: 'boolean' }
        ]
      },
      {
        title: 'Documents Verification',
        fields: [
          { key: 'idPassport', label: 'ID/Passport', type: 'verification-checkbox' },
          { key: 'proofOfAddress', label: 'Proof of Address', type: 'verification-checkbox' },
          { key: 'ccFront', label: 'Credit Card Front', type: 'verification-checkbox' },
          { key: 'ccBack', label: 'Credit Card Back', type: 'verification-checkbox' }
        ]
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    sections: [
      {
        title: 'Campaign Information',
        fields: [
          { key: 'campaignId', label: 'Campaign ID', type: 'text' },
          { key: 'tag', label: 'Tag', type: 'text' },
          { key: 'leadSource', label: 'Lead Source', type: 'text' },
          { key: 'utmKeyword', label: 'UTM Keyword', type: 'text' },
          { key: 'utmTerm', label: 'UTM Term', type: 'text' },
          { key: 'utmCreative', label: 'UTM Creative', type: 'text' },
          { key: 'campaignSource', label: 'Campaign Source', type: 'text' },
          { key: 'utmMedium', label: 'UTM Medium', type: 'text' }
        ]
      },
      {
        title: 'Advanced UTM Parameters',
        fields: [
          { key: 'utmAdGroupId', label: 'UTM Ad Group ID', type: 'text' },
          { key: 'utmAdPosition', label: 'UTM Ad Position', type: 'text' },
          { key: 'utmCountry', label: 'UTM Country', type: 'text' },
          { key: 'utmFeedItemId', label: 'UTM Feed Item ID', type: 'text' },
          { key: 'utmLandingPage', label: 'UTM Landing Page', type: 'text' },
          { key: 'utmLanguage', label: 'UTM Language', type: 'text' },
          { key: 'utmMatchType', label: 'UTM Match Type', type: 'text' },
          { key: 'utmTargetId', label: 'UTM Target ID', type: 'text' },
          { key: 'gclid', label: 'GCLID', type: 'text' }
        ]
      },
      {
        title: 'Additional Marketing Data',
        fields: [
          { key: 'utmContent', label: 'UTM Content', type: 'text' },
          { key: 'utmSource', label: 'UTM Source', type: 'text' },
          { key: 'utmAccount', label: 'UTM Account', type: 'text' },
          { key: 'utmAccountId', label: 'UTM Account ID', type: 'text' },
          { key: 'utmCampaign', label: 'UTM Campaign', type: 'text' },
          { key: 'utmCampaignId', label: 'UTM Campaign ID', type: 'text' },
          { key: 'utmAdGroupName', label: 'UTM Ad Group Name', type: 'text' },
          { key: 'platform', label: 'Platform', type: 'text' },
          { key: 'utmDevice', label: 'UTM Device', type: 'text' }
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    sections: [
      {
        title: 'Advanced',
        fields: [
          { key: 'enableLogin', label: 'Enable Login', type: 'boolean', defaultValue: false },
          { key: 'blockNotifications', label: 'Block Notifications', type: 'boolean', defaultValue: false },
          { key: 'allowedToTrade', label: 'Allowed To Trade', type: 'boolean', defaultValue: false },
          { key: 'withdrawLimit', label: 'Withdraw Limit', type: 'number', defaultValue: 0 },
          { key: 'allowed2fa', label: 'Allowed 2FA', type: 'boolean', defaultValue: false },
          { key: 'allowDeposit', label: 'Allow Deposit', type: 'boolean', defaultValue: false },
          { key: 'depositLimit', label: 'Deposit Limit', type: 'number', defaultValue: 0 },
          { key: 'allowWithdraw', label: 'Allow Withdraw', type: 'boolean', defaultValue: false },
          { key: 'marginCall', label: 'Margin Call', type: 'percentage', description: 'Percent', defaultValue: 80 },
          { key: 'miniDeposit', label: 'Mini Deposit', type: 'number', defaultValue: 250 },
          { key: 'stopOut', label: 'Stop Out', type: 'percentage', description: 'Percent', defaultValue: 50 },
          { key: 'swapType', label: 'Swap Type', type: 'select', 
            options: [
              { label: 'Islamic', value: 'islamic' }, 
              { label: 'Triple', value: 'triple' }, 
              { label: 'Standard', value: 'standard' },
              { label: 'Free', value: 'free' }
            ], 
            defaultValue: 'standard' 
          }
        ]
      },
      {
        title: 'Leverage Settings',
        fields: [
          { key: 'forex', label: 'Forex', type: 'text', defaultValue: '1:400' },
          { key: 'crypto', label: 'Crypto', type: 'text', defaultValue: '1:2' },
          { key: 'commodities', label: 'Commodities', type: 'text', defaultValue: '1:400' },
          { key: 'indices', label: 'Indices', type: 'text', defaultValue: '1:10' },
          { key: 'stocks', label: 'Stocks', type: 'text', defaultValue: '1:10' }
        ]
      }
    ]
  }
]

// Helper function to get field label from registry
export const labelFromRegistry = (key: string): string => {
  for (const tab of profileTabs) {
    for (const section of tab.sections) {
      const field = section.fields.find(f => f.key === key)
      if (field) {
        return field.label
      }
    }
  }
  return key // fallback to key if not found
}

// Helper function to flatten all field keys from the registry
export const flattenRegistry = (): string[] => {
  const allKeys: string[] = []
  
  for (const tab of profileTabs) {
    for (const section of tab.sections) {
      for (const field of section.fields) {
        allKeys.push(field.key)
      }
    }
  }
  
  return allKeys
}

// Helper function to get field config by key
export const getFieldConfigByKey = (key: string): FieldConfig | null => {
  for (const tab of profileTabs) {
    for (const section of tab.sections) {
      const field = section.fields.find(f => f.key === key)
      if (field) return field
    }
  }
  return null
}

// Safe dotted-path accessor for nested object properties
export const get = (obj: any, path: string): any => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Conversation Owner Management Configuration
export const conversationOwnerFields: FieldConfig[] = [
  {
    key: 'conversationOwnerStatus',
    label: 'Conversation Owner Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'On Leave', value: 'on_leave' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Available', value: 'available' },
      { label: 'Busy', value: 'busy' }
    ],
    defaultValue: 'active'
  },
  {
    key: 'conversationOwnerEmail',
    label: 'Owner Email',
    type: 'email',
    required: true,
    description: 'Email address of the conversation owner'
  },
  {
    key: 'conversationOwnerTeam',
    label: 'Owner Team',
    type: 'select',
    options: [
      { label: 'Sales Team', value: 'sales' },
      { label: 'Retention Team', value: 'retention' },
      { label: 'Support Team', value: 'support' },
      { label: 'VIP Team', value: 'vip' },
      { label: 'Management', value: 'management' }
    ]
  },
  {
    key: 'conversationOwnerRole',
    label: 'Owner Role',
    type: 'select',
    options: [
      { label: 'Senior Agent', value: 'senior_agent' },
      { label: 'Junior Agent', value: 'junior_agent' },
      { label: 'Team Lead', value: 'team_lead' },
      { label: 'Manager', value: 'manager' },
      { label: 'Specialist', value: 'specialist' }
    ]
  },
  {
    key: 'conversationOwnerWorkload',
    label: 'Current Workload',
    type: 'select',
    options: [
      { label: 'Light (1-10)', value: 'light' },
      { label: 'Medium (11-25)', value: 'medium' },
      { label: 'Heavy (26-50)', value: 'heavy' },
      { label: 'Full (50+)', value: 'full' }
    ]
  },
  {
    key: 'conversationOwnerLastActive',
    label: 'Last Active',
    type: 'datetime',
    description: 'Last time the owner was active in the system'
  },
  {
    key: 'conversationOwnerAssignedAt',
    label: 'Assigned At',
    type: 'datetime',
    description: 'When this owner was assigned to the conversation'
  },
  {
    key: 'conversationOwnerNotes',
    label: 'Assignment Notes',
    type: 'textarea',
    description: 'Notes about this owner assignment'
  }
]

// Retention Owner Management Configuration
export const retentionOwnerFields: FieldConfig[] = [
  {
    key: 'retentionOwnerStatus',
    label: 'Retention Owner Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'On Leave', value: 'on_leave' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Available', value: 'available' },
      { label: 'Busy', value: 'busy' }
    ],
    defaultValue: 'active'
  },
  {
    key: 'retentionOwnerEmail',
    label: 'Retention Owner Email',
    type: 'email',
    required: true,
    description: 'Email address of the retention owner'
  },
  {
    key: 'retentionOwnerTier',
    label: 'Retention Tier',
    type: 'select',
    options: [
      { label: 'Tier A', value: 'A' },
      { label: 'Tier B', value: 'B' },
      { label: 'Tier C', value: 'C' },
      { label: 'Tier D', value: 'D' }
    ],
    defaultValue: 'B'
  },
  {
    key: 'retentionOwnerTeam',
    label: 'Retention Team',
    type: 'select',
    options: [
      { label: 'Retention Team A', value: 'retention_a' },
      { label: 'Retention Team B', value: 'retention_b' },
      { label: 'VIP Retention', value: 'vip_retention' },
      { label: 'Senior Retention', value: 'senior_retention' },
      { label: 'Junior Retention', value: 'junior_retention' }
    ]
  },
  {
    key: 'retentionOwnerRole',
    label: 'Retention Role',
    type: 'select',
    options: [
      { label: 'Senior Retention Agent', value: 'senior_retention_agent' },
      { label: 'Junior Retention Agent', value: 'junior_retention_agent' },
      { label: 'Retention Team Lead', value: 'retention_team_lead' },
      { label: 'Retention Manager', value: 'retention_manager' },
      { label: 'VIP Specialist', value: 'vip_specialist' }
    ]
  },
  {
    key: 'retentionOwnerWorkload',
    label: 'Current Client Load',
    type: 'select',
    options: [
      { label: 'Light (1-15)', value: 'light' },
      { label: 'Medium (16-30)', value: 'medium' },
      { label: 'Heavy (31-50)', value: 'heavy' },
      { label: 'Full (50+)', value: 'full' }
    ]
  },
  {
    key: 'retentionOwnerLastActive',
    label: 'Last Active',
    type: 'datetime',
    description: 'Last time the retention owner was active in the system'
  },
  {
    key: 'retentionOwnerAssignedAt',
    label: 'Assigned At',
    type: 'datetime',
    description: 'When this retention owner was assigned'
  },
  {
    key: 'retentionOwnerNotes',
    label: 'Retention Notes',
    type: 'textarea',
    description: 'Notes about retention strategy and client management'
  }
]

// Table column keys for list views (deprecated - use flattenRegistry instead)
export const tableColumnKeys = [
  'accountId',
  'firstName', 
  'lastName',
  'email',
  'phoneNumber',
  'country',
  'leadStatus',
  'kycStatus',
  'retentionStatus',
  'totalFtd',
  'netDeposits',
  'campaignId',
  'leadSource',
  'utmMedium',
  'utmCampaign'
]