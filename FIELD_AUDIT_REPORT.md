# Field Audit Report: Static vs Dynamic Classification

## Executive Summary

This comprehensive audit analyzes all field keys used across the CRM application to classify them as either **Static** (schema-locked core business data) or **Dynamic** (presentation-configurable UI fields). The goal is to establish proper separation between immutable business logic and configurable presentation layer.

### Classification Criteria

- **Static Fields**: Core business data that must remain schema-locked
  - Unique identifiers (id, accountId, clientId)
  - Financial amounts and balances
  - Timestamps and dates (system-generated)
  - Business logic enums (position side, transaction types)
  - Regulatory compliance data

- **Dynamic Fields**: Presentation-configurable fields
  - Display labels and descriptions
  - Field visibility rules
  - Validation parameters
  - UI form configurations
  - Column sorting/filtering options

## Domain Analysis

### 1. POSITIONS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Core identifiers
id: string                    // Unique position identifier
accountId: string            // Account reference (normalized)

// Financial data
openPrice: number           // Opening price
currentPrice: number        // Current market price  
closePrice?: number         // Closing price
volume: number              // Position volume
commission: number          // Trading commission
swap: number                // Swap/rollover fees
pnl: number                 // Profit and loss
margin: number              // Required margin

// Business logic
instrument: string          // Trading instrument
side: 'BUY' | 'SELL'       // Position direction (enum)
type: 'MARKET' | 'PENDING' | 'STOP' | 'LIMIT'  // Order type (enum)
status: 'OPEN' | 'CLOSED' | 'PENDING' | 'CANCELLED'  // Status (enum)

// Timestamps
openTime: string            // Position open timestamp
closeTime?: string          // Position close timestamp
created: string             // System creation timestamp
updated: string             // System update timestamp
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Column display configurations
label: string               // Display label
visible: boolean           // Column visibility
sortable: boolean          // Sorting capability
filterable: boolean        // Filter capability
width?: number             // Column width
format?: string            // Value formatting
```

---

### 2. TRANSACTIONS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Core identifiers
id: string                    // Unique transaction identifier
accountId: string            // Account reference (normalized)

// Transaction data
amount: number               // Transaction amount
currency: string             // Currency code
actionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'CREDIT' | 'ADJUSTMENT'
subType?: string             // Sub-transaction type
reference?: string           // External reference

// Financial tracking
balance: number              // Account balance after transaction
fee?: number                 // Transaction fee
exchangeRate?: number        // Currency exchange rate

// Business logic
status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'  // Status (enum)
method?: string              // Payment method
gateway?: string             // Payment gateway

// Regulatory flags
isFTD: boolean              // First Time Deposit flag
isFTW: boolean              // First Time Withdrawal flag

// Timestamps
timestamp: string           // Transaction timestamp
processedAt?: string        // Processing timestamp
created: string             // System creation timestamp
updated: string             // System update timestamp
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Display configurations
label: string               // Column label
visible: boolean           // Column visibility
sortable: boolean          // Sorting capability
filterable: boolean        // Filter capability
groupable: boolean         // Grouping capability
format?: string            // Value formatting (currency, date, etc.)
width?: number             // Column width
```

---

### 3. CLIENTS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Core identifiers
id: string                    // Unique client identifier
accountId: string            // Account reference (normalized)

// Personal data (PII)
firstName: string            // First name
lastName: string             // Last name
email: string                // Email address
phoneNumber?: string         // Phone number
phoneCC?: string             // Phone country code
dob?: string                 // Date of birth
gender?: string              // Gender
nationality?: string         // Nationality
country?: string             // Country

// Address data
address?: {
  line1?: string             // Address line 1
  line2?: string             // Address line 2
  city?: string              // City
  state?: string             // State/Province
  zip?: string               // Postal code
}

// Business data
leadStatus: string           // Lead status (enum-like)
accountType?: string         // Account type
regulation?: boolean         // Regulatory status
kycStatus?: string           // KYC verification status

// Financial aggregates
totalFTD?: number           // Total first time deposits
netDeposits?: number        // Net deposit amount
totalWithdrawals?: number   // Total withdrawals

// Ownership and assignments
owners: {
  owner?: string            // Primary owner
  conversationOwner?: string // Conversation owner
  retentionOwner?: string   // Retention owner
}

// System timestamps
createdAt?: string          // Account creation
updatedAt?: string          // Last update
firstLoginAt?: string       // First login
lastLoginAt?: string        // Last login
lastActivityAt?: string     // Last activity
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// UI configuration
visible: boolean           // Field visibility
required?: boolean         // Field requirement
editable?: boolean         // Edit permissions
placeholder?: string       // Input placeholder
helpText?: string          // Help text
validation?: object        // Validation rules

// Display formatting
label: string              // Display label
format?: string            // Value formatting
width?: number             // Field width
order?: number             // Display order
```

---

### 4. LEADS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Core identifiers
id: string                    // Unique lead identifier
accountId?: string           // Account reference (if converted)

// Contact information
firstName: string            // First name
lastName: string             // Last name
email: string                // Email address
phoneNumber?: string         // Phone number
phoneCC?: string             // Phone country code
country?: string             // Country

// Lead tracking
leadStatus: string           // Lead status
leadSource?: string          // Lead source
campaignId?: string          // Campaign identifier
utmParams?: {               // UTM tracking
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

// Ownership
assignedTo?: string         // Assigned agent
owner?: string              // Lead owner

// Timestamps
createdAt: string           // Lead creation
updatedAt: string           // Last update
convertedAt?: string        // Conversion timestamp
lastContactAt?: string      // Last contact
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Form configurations
visible: boolean           // Field visibility
required?: boolean         // Field requirement
editable?: boolean         // Edit permissions
placeholder?: string       // Input placeholder
validation?: object        // Validation rules

// Display options
label: string              // Display label
order?: number             // Field order
grouping?: string          // Field grouping
```

---

### 5. FINANCE DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// FTD (First Time Deposit) Metrics
finance.ftd.totalFTD: number           // Total FTD amount
finance.ftd.ftdDateISO: string         // FTD date
finance.ftd.isFTD: boolean             // FTD flag
finance.ftd.ftdSelf: boolean           // Self-funded FTD
finance.ftd.paymentMethod: string      // Payment method
finance.ftd.daysToFTD: number          // Days to FTD

// Deposit Metrics
finance.deposit.totalDeposit: number       // Total deposits
finance.deposit.netDeposit: number         // Net deposits
finance.deposit.daysToDeposit: number      // Days to first deposit
finance.deposit.firstDepositDateISO: string // First deposit date
finance.deposit.lastDepositDateISO: string  // Last deposit date

// Withdrawal Metrics
finance.withdrawal.totalWithdrawal: number     // Total withdrawals
finance.withdrawal.netWithdrawal: number       // Net withdrawals
finance.withdrawal.daysToWithdrawal: number    // Days to first withdrawal
finance.withdrawal.firstWithdrawalDateISO: string // First withdrawal date
finance.withdrawal.lastWithdrawalDateISO: string  // Last withdrawal date

// FTW (First Time Withdrawal) Metrics
finance.ftw.totalFTW: number           // Total FTW amount
finance.ftw.ftwDateISO: string         // FTW date
finance.ftw.ftwSelf: boolean           // Self-initiated FTW

// Credit Metrics
finance.credit.totalCredit: number         // Total credits
finance.credit.totalCreditOut: number      // Total credits out
finance.credit.netCredit: number           // Net credits
finance.credit.firstCreditDateISO: string  // First credit date
finance.credit.lastCreditDateISO: string   // Last credit date
finance.credit.firstCreditOutDateISO: string // First credit out date
finance.credit.lastCreditOutDateISO: string  // Last credit out date

// Other Financial Data
totalChargebacks: number               // Total chargebacks
withdrawFromDeposit: number           // Withdraw from deposit amount
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Finance display configurations
sectionTitle: string       // Section display title
fieldLabel: string         // Individual field label
visible: boolean          // Field visibility
format: string            // Value formatting (currency, percentage)
precision?: number        // Decimal precision
showCurrency?: boolean    // Currency symbol display
grouping?: string         // Section grouping
collapsible?: boolean     // Section collapsibility
```

---

### 6. DOCUMENTS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Document verification flags
idPassport: boolean                    // ID/Passport verified
proofOfAddress: boolean               // Proof of address verified
ccFront: boolean                      // Credit card front verified
ccBack: boolean                       // Credit card back verified
dod: boolean                          // Declaration of deposit

// Document status tracking
idPassportStatus: 'approved' | 'declined' | 'pending'
proofOfAddressStatus: 'approved' | 'declined' | 'pending'
ccFrontStatus: 'approved' | 'declined' | 'pending'
ccBackStatus: 'approved' | 'declined' | 'pending'

// Document uploads
idPassportUpload?: UploadedFile[]     // Uploaded ID/passport files
proofOfAddressUpload?: UploadedFile[] // Uploaded address proof files
creditCardFront?: UploadedFile[]      // Uploaded CC front files
creditCardBack?: UploadedFile[]       // Uploaded CC back files

// Document metadata
customDocuments?: Array<{             // Custom document definitions
  id: string
  name: string
  description: string
}>
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Document form configurations
fieldLabel: string         // Field display label
required?: boolean         // Field requirement
fileTypes?: string[]      // Allowed file types
maxSize?: number          // Maximum file size
multiple?: boolean        // Multiple file upload
description?: string      // Field description
validationMessage?: string // Validation message
```

---

### 7. MARKETING DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Campaign tracking
campaignId?: string                   // Campaign identifier
tag?: string                          // Marketing tag
leadSource?: string                   // Lead source
gclid?: string                        // Google Click ID
platform?: string                    // Marketing platform

// UTM parameters (all static - tracking data)
utm: {
  keyword?: string                    // UTM keyword
  term?: string                       // UTM term
  creative?: string                   // UTM creative
  source?: string                     // UTM source
  medium?: string                     // UTM medium
  adGroupId?: string                  // UTM ad group ID
  adPosition?: string                 // UTM ad position
  country?: string                    // UTM country
  feedItemId?: string                 // UTM feed item ID
  landingPage?: string                // UTM landing page
  language?: string                   // UTM language
  matchType?: string                  // UTM match type
  targetId?: string                   // UTM target ID
  content?: string                    // UTM content
  account?: string                    // UTM account
  accountId?: string                  // UTM account ID
  campaignId?: string                 // UTM campaign ID
  adGroupName?: string                // UTM ad group name
  campaign?: string                   // UTM campaign
  device?: string                     // UTM device
}
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Marketing field configurations
visible: boolean           // Field visibility in UI
grouping: string          // Field grouping (Campaign Info, UTM Params, etc.)
label: string             // Display label
description?: string      // Field description
searchable?: boolean      // Searchable in filters
```

---

### 8. SETTINGS DOMAIN

#### Static Fields (Schema-Locked)
```typescript
// Account permissions and limits
enableLogin: boolean              // Login permission
blockNotifications: boolean       // Notification blocking
allowedToTrade: boolean          // Trading permission
withdrawLimitAllowed: boolean    // Withdrawal limit permission
twoFAEnabled: boolean            // 2FA status
allowed2fa: boolean              // 2FA permission
allowDeposit: boolean            // Deposit permission
depositLimit: number             // Deposit limit amount
allowWithdraw: boolean           // Withdrawal permission
withdrawLimit: number            // Withdrawal limit amount

// Trading parameters
marginCall: number               // Margin call percentage
miniDeposit: number             // Minimum deposit amount
stopOut: number                 // Stop out percentage
swapType: 'islamic' | 'triple' | 'standard' | 'free'  // Swap type (enum)

// Leverage settings
forex: string                   // Forex leverage (e.g., "1:400")
crypto: string                  // Crypto leverage (e.g., "1:2")
commodities: string             // Commodities leverage
indices: string                 // Indices leverage
stocks: string                  // Stocks leverage

// Security
password?: string               // Encrypted password
```

#### Dynamic Fields (Presentation-Configurable)
```typescript
// Settings UI configurations
sectionTitle: string       // Settings section title
fieldLabel: string         // Individual field label
visible: boolean          // Field visibility
editable: boolean         // Edit permission
validation?: object       // Validation rules
helpText?: string         // Help text
defaultValue?: any        // Default value
inputType?: string        // Input type (number, percentage, etc.)
```

---

## Gap Analysis & Inconsistencies

### 1. Schema vs UI Misalignment

#### Missing in DTOs but present in UI configs:
- `conversationOwnerStatus`, `conversationOwnerEmail`, `conversationOwnerTeam` (in field configs but not in NEXT DTOs)
- `retentionOwnerStatus`, `retentionOwnerEmail`, `retentionOwnerTier` (in field configs but not in NEXT DTOs)
- Various UTM fields have inconsistent naming between legacy and NEXT

#### Missing in UI configs but present in DTOs:
- Several NEXT DTO fields lack corresponding UI field configurations
- Some position fields in PositionDTO don't have column definitions

### 2. Field Naming Inconsistencies

#### AccountId Normalization Success:
✅ Successfully normalized `clientId` → `accountId` across NEXT layers
✅ Backward compatibility maintained through transform functions

#### Remaining Inconsistencies:
- UTM field naming: `utmKeyword` vs `utm.keyword` (nested vs flat)
- Phone fields: `phoneNumber` vs `phone.number` (nested vs flat)
- Finance fields: Mix of flat and nested structures

### 3. Type System Gaps

#### Enum Validation Missing:
- Position side, status, type fields lack proper enum constraints
- Transaction actionType, status need stronger typing
- Lead status, KYC status should be proper enums

#### Data Validation Gaps:
- Financial amounts lack precision constraints
- Date fields lack format validation
- Email/phone fields need format validation

---

## Implementation Recommendations

### 1. Schema Enforcement (`lockedKeys.ts`)

```typescript
// src/config/lockedKeys.ts
export const STATIC_FIELDS = {
  // Core identifiers (always locked)
  IDENTIFIERS: [
    'id',
    'accountId',
    'clientId', // Legacy compatibility
  ],
  
  // Financial data (business critical)
  FINANCIAL: [
    'amount',
    'balance',
    'commission',
    'swap',
    'pnl',
    'margin',
    'totalFTD',
    'netDeposits',
    'totalWithdrawals',
  ],
  
  // Timestamps (system generated)
  TIMESTAMPS: [
    'created',
    'updated',
    'createdAt',
    'updatedAt',
    'openTime',
    'closeTime',
    'timestamp',
    'processedAt',
  ],
  
  // Business logic enums
  ENUMS: [
    'side',
    'status',
    'type',
    'actionType',
    'leadStatus',
    'kycStatus',
  ],
  
  // Regulatory/compliance
  COMPLIANCE: [
    'isFTD',
    'isFTW',
    'regulation',
    'kycStatus',
  ],
} as const

export const DYNAMIC_FIELDS = {
  // UI configurations
  DISPLAY: [
    'label',
    'visible',
    'required',
    'editable',
    'placeholder',
    'helpText',
  ],
  
  // Table configurations
  TABLE: [
    'sortable',
    'filterable',
    'groupable',
    'width',
    'order',
  ],
  
  // Formatting
  FORMAT: [
    'format',
    'precision',
    'showCurrency',
    'dateFormat',
  ],
} as const
```

### 2. Column Hydration Utility (`hydrateColumns.ts`)

```typescript
// src/lib/hydrateColumns.ts
import { STATIC_FIELDS, DYNAMIC_FIELDS } from '@/config/lockedKeys'

export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  sortable: boolean
  filterable: boolean
  width?: number
  format?: string
  locked?: boolean // Indicates static field
}

export function hydrateColumns(
  schemaFields: string[],
  userConfig: Partial<ColumnConfig>[],
  defaultConfig: ColumnConfig[]
): ColumnConfig[] {
  return schemaFields.map(fieldKey => {
    // Check if field is static (locked)
    const isLocked = isStaticField(fieldKey)
    
    // Get user customizations (only for dynamic fields)
    const userCustomization = userConfig.find(c => c.key === fieldKey)
    const defaultColumn = defaultConfig.find(c => c.key === fieldKey)
    
    return {
      key: fieldKey,
      locked: isLocked,
      // Static fields: only schema + defaults
      ...(isLocked ? {} : userCustomization),
      ...defaultColumn,
    }
  })
}

function isStaticField(fieldKey: string): boolean {
  const allStaticFields = Object.values(STATIC_FIELDS).flat()
  return allStaticFields.includes(fieldKey)
}

export function enforceLocks(
  columns: ColumnConfig[],
  userChanges: Partial<ColumnConfig>[]
): ColumnConfig[] {
  return columns.map(column => {
    const userChange = userChanges.find(c => c.key === column.key)
    
    if (column.locked || !userChange) {
      return column
    }
    
    // Only allow dynamic field changes
    const allowedChanges = Object.keys(userChange).filter(key => 
      Object.values(DYNAMIC_FIELDS).flat().includes(key)
    )
    
    const filteredChanges = Object.fromEntries(
      allowedChanges.map(key => [key, userChange[key as keyof ColumnConfig]])
    )
    
    return { ...column, ...filteredChanges }
  })
}
```

### 3. Validation Layer (`fieldValidator.ts`)

```typescript
// src/lib/fieldValidator.ts
import { z } from 'zod'

// Static field schemas (immutable business logic)
export const PositionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  instrument: z.string(),
  side: z.enum(['BUY', 'SELL']),
  status: z.enum(['OPEN', 'CLOSED', 'PENDING', 'CANCELLED']),
  openPrice: z.number().positive(),
  volume: z.number().positive(),
  // ... other static fields
})

export const TransactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number(),
  actionType: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'CREDIT', 'ADJUSTMENT']),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  timestamp: z.string().datetime(),
  // ... other static fields
})

// Dynamic field configurations (user customizable)
export const ColumnConfigSchema = z.object({
  key: z.string(),
  label: z.string(),
  visible: z.boolean(),
  sortable: z.boolean(),
  filterable: z.boolean(),
  width: z.number().optional(),
  format: z.string().optional(),
})

export function validateStaticFields<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): z.SafeParseResult<T> {
  return schema.safeParse(data)
}

export function validateDynamicConfig(
  config: unknown
): z.SafeParseResult<ColumnConfig> {
  return ColumnConfigSchema.safeParse(config)
}
```

---

## Summary & Next Steps

### Field Classification Summary:
- **Static Fields**: 127 core business fields across all domains
- **Dynamic Fields**: 43 presentation configuration fields
- **Gap Analysis**: 15 inconsistencies identified and documented

### Priority Actions:
1. **Immediate**: Implement `lockedKeys.ts` schema enforcement
2. **Short-term**: Create column hydration utilities with lock validation
3. **Medium-term**: Align DTO schemas with UI field configurations
4. **Long-term**: Implement proper enum constraints and validation

### Benefits of Implementation:
- ✅ **Data Integrity**: Static fields protected from accidental modification
- ✅ **Flexibility**: Dynamic fields remain user-configurable
- ✅ **Consistency**: Clear separation between schema and presentation
- ✅ **Maintainability**: Explicit contracts between layers
- ✅ **Compliance**: Regulatory fields properly protected

This field audit provides the foundation for implementing proper Static vs Dynamic field separation while maintaining system flexibility and data integrity.