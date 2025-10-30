# Field Classification List

## Core Identifiers
- **id** - Static (Locked) - Unique record identifier, never changes
- **accountId** - Static (Locked) - Account reference identifier, business critical
- **clientId** - Static (Locked) - Legacy client identifier, backward compatibility

## Personal Information
- **firstName** - Static (Locked) - Legal first name, compliance requirement
- **lastName** - Static (Locked) - Legal last name, compliance requirement  
- **email** - Static (Locked) - Primary email address, account access
- **phoneNumber** - Static (Locked) - Primary phone number, contact method
- **phoneCC** - Static (Locked) - Phone country code, contact routing
- **dob** - Static (Locked) - Date of birth, KYC requirement
- **gender** - Static (Locked) - Gender, regulatory reporting
- **nationality** - Static (Locked) - Nationality, compliance requirement
- **country** - Static (Locked) - Country of residence, regulatory jurisdiction

## Account Status & Lifecycle  
- **leadStatus** - Static (Locked) - Lead progression status, business logic
- **accountType** - Static (Locked) - Account classification, trading rules
- **kycStatus** - Static (Locked) - KYC verification status, compliance
- **regulation** - Static (Locked) - Regulatory status, legal requirement
- **createdAt** - Static (Locked) - Account creation timestamp, audit trail
- **updatedAt** - Static (Locked) - Last update timestamp, audit trail
- **firstLoginAt** - Static (Locked) - First login timestamp, tracking
- **lastLoginAt** - Static (Locked) - Last login timestamp, activity tracking
- **lastActivityAt** - Static (Locked) - Last activity timestamp, engagement

## Financial Data - FTD (First Time Deposit)
- **finance.ftd.totalFTD** - Static (Locked) - Total FTD amount, business metric
- **finance.ftd.ftdDateISO** - Static (Locked) - FTD date, compliance tracking
- **finance.ftd.isFTD** - Static (Locked) - FTD flag, business logic
- **finance.ftd.ftdSelf** - Static (Locked) - Self-funded FTD flag, compliance
- **finance.ftd.paymentMethod** - Static (Locked) - Payment method used, audit trail
- **finance.ftd.daysToFTD** - Static (Locked) - Days to FTD, performance metric

## Financial Data - Deposits
- **finance.deposit.totalDeposit** - Static (Locked) - Total deposits, financial tracking
- **finance.deposit.netDeposit** - Static (Locked) - Net deposits, financial calculation
- **finance.deposit.firstDepositDateISO** - Static (Locked) - First deposit date, tracking
- **finance.deposit.lastDepositDateISO** - Static (Locked) - Last deposit date, tracking

## Financial Data - Withdrawals  
- **finance.withdrawal.totalWithdrawal** - Static (Locked) - Total withdrawals, financial tracking
- **finance.withdrawal.netWithdrawal** - Static (Locked) - Net withdrawals, financial calculation
- **finance.ftw.totalFTW** - Static (Locked) - Total FTW amount, business metric
- **finance.ftw.ftwDateISO** - Static (Locked) - FTW date, compliance tracking
- **finance.ftw.ftwSelf** - Static (Locked) - Self-initiated FTW, compliance

## Financial Data - Credits
- **finance.credit.totalCredit** - Static (Locked) - Total credits, financial tracking
- **finance.credit.totalCreditOut** - Static (Locked) - Credits out, financial tracking
- **finance.credit.netCredit** - Static (Locked) - Net credits, financial calculation

## Financial Data - Other
- **totalFTD** - Static (Locked) - Legacy total FTD, business metric
- **netDeposits** - Static (Locked) - Legacy net deposits, financial tracking
- **totalWithdrawals** - Static (Locked) - Legacy total withdrawals, financial tracking
- **totalChargebacks** - Static (Locked) - Total chargebacks, risk metric
- **withdrawFromDeposit** - Static (Locked) - Withdraw from deposit amount, tracking

## Position Trading Data
- **openPrice** - Static (Locked) - Position open price, trading record
- **currentPrice** - Static (Locked) - Current market price, real-time data
- **closePrice** - Static (Locked) - Position close price, trading record
- **volume** - Static (Locked) - Position volume, trading data
- **commission** - Static (Locked) - Trading commission, financial calculation
- **swap** - Static (Locked) - Swap fees, financial calculation
- **pnl** - Static (Locked) - Profit and loss, financial calculation
- **margin** - Static (Locked) - Required margin, risk calculation
- **instrument** - Static (Locked) - Trading instrument, trading data
- **side** - Static (Locked) - Position direction (BUY/SELL), trading logic
- **type** - Static (Locked) - Order type (MARKET/PENDING/etc), trading logic
- **status** - Static (Locked) - Position status (OPEN/CLOSED/etc), business logic
- **openTime** - Static (Locked) - Position open timestamp, trading record
- **closeTime** - Static (Locked) - Position close timestamp, trading record

## Transaction Data
- **amount** - Static (Locked) - Transaction amount, financial record
- **currency** - Static (Locked) - Transaction currency, financial data
- **actionType** - Static (Locked) - Transaction type (DEPOSIT/WITHDRAWAL/etc), business logic
- **subType** - Static (Locked) - Transaction subtype, classification
- **reference** - Static (Locked) - External reference, audit trail
- **balance** - Static (Locked) - Account balance after transaction, financial state
- **fee** - Static (Locked) - Transaction fee, financial calculation
- **exchangeRate** - Static (Locked) - Currency exchange rate, financial data
- **method** - Static (Locked) - Payment method, transaction data
- **gateway** - Static (Locked) - Payment gateway, transaction routing
- **isFTD** - Static (Locked) - First time deposit flag, business logic
- **isFTW** - Static (Locked) - First time withdrawal flag, business logic
- **timestamp** - Static (Locked) - Transaction timestamp, audit trail
- **processedAt** - Static (Locked) - Processing timestamp, system tracking

## Ownership & Assignment
- **owners.owner** - Static (Locked) - Primary owner, business assignment
- **owners.conversationOwner** - Static (Locked) - Conversation owner, business assignment  
- **owners.retentionOwner** - Static (Locked) - Retention owner, business assignment
- **assignedTo** - Static (Locked) - Assigned agent, business logic
- **owner** - Static (Locked) - Lead owner, business assignment

## Address Information
- **address.line1** - Static (Locked) - Address line 1, compliance requirement
- **address.line2** - Static (Locked) - Address line 2, compliance requirement
- **address.city** - Static (Locked) - City, compliance requirement
- **address.state** - Static (Locked) - State/Province, compliance requirement
- **address.zip** - Static (Locked) - Postal code, compliance requirement

## Document Verification
- **idPassport** - Static (Locked) - ID/Passport verified flag, compliance
- **proofOfAddress** - Static (Locked) - Proof of address verified flag, compliance
- **ccFront** - Static (Locked) - Credit card front verified flag, compliance
- **ccBack** - Static (Locked) - Credit card back verified flag, compliance
- **dod** - Static (Locked) - Declaration of deposit flag, compliance
- **idPassportStatus** - Static (Locked) - ID/Passport status (approved/declined/pending), compliance
- **proofOfAddressStatus** - Static (Locked) - Proof of address status, compliance
- **ccFrontStatus** - Static (Locked) - Credit card front status, compliance
- **ccBackStatus** - Static (Locked) - Credit card back status, compliance

## Document Storage
- **idPassportUpload** - Static (Locked) - Uploaded ID/passport files, compliance storage
- **proofOfAddressUpload** - Static (Locked) - Uploaded address proof files, compliance storage
- **creditCardFront** - Static (Locked) - Uploaded CC front files, compliance storage
- **creditCardBack** - Static (Locked) - Uploaded CC back files, compliance storage
- **customDocuments** - Static (Locked) - Custom document definitions, compliance

## Marketing & Tracking
- **campaignId** - Static (Locked) - Campaign identifier, marketing tracking
- **tag** - Static (Locked) - Marketing tag, campaign classification
- **leadSource** - Static (Locked) - Lead source, attribution tracking
- **gclid** - Static (Locked) - Google Click ID, marketing attribution
- **platform** - Static (Locked) - Marketing platform, attribution

## UTM Parameters (All Static - Marketing Attribution)
- **utm.keyword** - Static (Locked) - UTM keyword, marketing tracking
- **utm.term** - Static (Locked) - UTM term, marketing tracking
- **utm.creative** - Static (Locked) - UTM creative, marketing tracking
- **utm.source** - Static (Locked) - UTM source, marketing tracking
- **utm.medium** - Static (Locked) - UTM medium, marketing tracking
- **utm.adGroupId** - Static (Locked) - UTM ad group ID, marketing tracking
- **utm.adPosition** - Static (Locked) - UTM ad position, marketing tracking
- **utm.country** - Static (Locked) - UTM country, marketing tracking
- **utm.feedItemId** - Static (Locked) - UTM feed item ID, marketing tracking
- **utm.landingPage** - Static (Locked) - UTM landing page, marketing tracking
- **utm.language** - Static (Locked) - UTM language, marketing tracking
- **utm.matchType** - Static (Locked) - UTM match type, marketing tracking
- **utm.targetId** - Static (Locked) - UTM target ID, marketing tracking
- **utm.content** - Static (Locked) - UTM content, marketing tracking
- **utm.account** - Static (Locked) - UTM account, marketing tracking
- **utm.accountId** - Static (Locked) - UTM account ID, marketing tracking
- **utm.campaignId** - Static (Locked) - UTM campaign ID, marketing tracking
- **utm.adGroupName** - Static (Locked) - UTM ad group name, marketing tracking
- **utm.campaign** - Static (Locked) - UTM campaign, marketing tracking
- **utm.device** - Static (Locked) - UTM device, marketing tracking

## Account Settings & Permissions
- **enableLogin** - Static (Locked) - Login permission, account security
- **blockNotifications** - Static (Locked) - Notification blocking, user preference
- **allowedToTrade** - Static (Locked) - Trading permission, risk management
- **withdrawLimitAllowed** - Static (Locked) - Withdrawal limit permission, risk management
- **twoFAEnabled** - Static (Locked) - 2FA status, security setting
- **allowed2fa** - Static (Locked) - 2FA permission, security policy
- **allowDeposit** - Static (Locked) - Deposit permission, account setting
- **depositLimit** - Static (Locked) - Deposit limit amount, risk management
- **allowWithdraw** - Static (Locked) - Withdrawal permission, account setting
- **withdrawLimit** - Static (Locked) - Withdrawal limit amount, risk management
- **password** - Static (Locked) - Encrypted password, security

## Trading Parameters
- **marginCall** - Static (Locked) - Margin call percentage, risk parameter
- **miniDeposit** - Static (Locked) - Minimum deposit amount, account requirement
- **stopOut** - Static (Locked) - Stop out percentage, risk parameter
- **swapType** - Static (Locked) - Swap type (islamic/triple/standard/free), trading setting

## Leverage Settings
- **forex** - Static (Locked) - Forex leverage (e.g., "1:400"), trading parameter
- **crypto** - Static (Locked) - Crypto leverage (e.g., "1:2"), trading parameter
- **commodities** - Static (Locked) - Commodities leverage, trading parameter
- **indices** - Static (Locked) - Indices leverage, trading parameter
- **stocks** - Static (Locked) - Stocks leverage, trading parameter

## Timestamps - Additional
- **created** - Static (Locked) - System creation timestamp, audit trail
- **updated** - Static (Locked) - System update timestamp, audit trail
- **convertedAt** - Static (Locked) - Lead conversion timestamp, business tracking
- **lastContactAt** - Static (Locked) - Last contact timestamp, engagement tracking

---

# DYNAMIC FIELDS (Presentation-Configurable)

## Display & UI Configuration
- **label** - Dynamic - Display label text, customizable per user/role
- **visible** - Dynamic - Field/column visibility, user preference
- **required** - Dynamic - Field requirement flag, form configuration
- **editable** - Dynamic - Edit permission flag, role-based access
- **placeholder** - Dynamic - Input placeholder text, UI enhancement
- **helpText** - Dynamic - Help text content, user guidance

## Table & Column Configuration
- **sortable** - Dynamic - Column sorting capability, table configuration
- **filterable** - Dynamic - Column filtering capability, table configuration
- **groupable** - Dynamic - Column grouping capability, table configuration
- **width** - Dynamic - Column width setting, layout preference
- **format** - Dynamic - Value formatting (currency/date/etc), display preference
- **order** - Dynamic - Field/column display order, layout configuration

## Form & Validation Configuration
- **validation** - Dynamic - Validation rules configuration, form behavior
- **validationMessage** - Dynamic - Custom validation messages, user experience
- **defaultValue** - Dynamic - Default field values, form configuration
- **inputType** - Dynamic - Input type specification, form behavior

## File Upload Configuration
- **fileTypes** - Dynamic - Allowed file types for uploads, form constraint
- **maxSize** - Dynamic - Maximum file size limit, form constraint
- **multiple** - Dynamic - Multiple file upload permission, form behavior

## Section & Layout Configuration
- **sectionTitle** - Dynamic - Section display titles, layout organization
- **fieldLabel** - Dynamic - Individual field labels, display customization
- **grouping** - Dynamic - Field grouping organization, layout structure
- **collapsible** - Dynamic - Section collapsibility, layout behavior
- **description** - Dynamic - Field descriptions, user guidance

## Financial Display Configuration
- **precision** - Dynamic - Decimal precision for numbers, display formatting
- **showCurrency** - Dynamic - Currency symbol display, formatting preference

## Search & Filter Configuration  
- **searchable** - Dynamic - Field searchability in filters, search configuration

---

## Summary
- **Total Static Fields**: 127 (Core business data, locked from UI modification)
- **Total Dynamic Fields**: 30 (Presentation configuration, user customizable)
- **Domains Covered**: 8 (Positions, Transactions, Clients, Leads, Finance, Documents, Marketing, Settings)