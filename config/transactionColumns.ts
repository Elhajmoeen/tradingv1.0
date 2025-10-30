import type { EntityColumnDefinition } from '@/components/EntityTable'

// Comprehensive transaction columns with exact labels and order as specified
export const transactionsEntityColumns: EntityColumnDefinition[] = [
  // ——— Profile / CRM Context ———
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'clickable-accountId', defaultVisible: true },
  { id: 'profileCreatedAt', header: 'Created At', path: 'profileCreatedAt', type: 'datetime', defaultVisible: false },
  { id: 'status', header: 'Status', path: 'status', type: 'status', defaultVisible: true },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'text', defaultVisible: false },
  { id: 'salesManager', header: 'Sales Manager', path: 'salesManager', type: 'text', defaultVisible: false },
  { id: 'conversationOwner', header: 'Conversation Owner', path: 'conversationOwner', type: 'text', defaultVisible: false },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: false },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: false },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'text', defaultVisible: true },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'boolean', defaultVisible: false },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'text', defaultVisible: true },
  { id: 'phoneNumber', header: 'Phone Number', path: 'phoneNumber', type: 'text', defaultVisible: false },
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: false },
  { id: 'lastCommentAt', header: 'Last Comment At', path: 'lastCommentAt', type: 'datetime', defaultVisible: false },
  { id: 'firstLoginAt', header: 'First Login At', path: 'firstLoginAt', type: 'datetime', defaultVisible: false },
  { id: 'lastLoginAt', header: 'Last Login At', path: 'lastLoginAt', type: 'datetime', defaultVisible: false },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: false },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: false },
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'dateConverted', header: 'Date Converted', path: 'dateConverted', type: 'datetime', defaultVisible: false },
  { id: 'conversationAssignedAt', header: 'Conversation Assigned At', path: 'conversationAssignedAt', type: 'datetime', defaultVisible: false },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'text', defaultVisible: false },
  { id: 'retentionStatus', header: 'Retention Status', path: 'retentionStatus', type: 'text', defaultVisible: true },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'text', defaultVisible: false },
  { id: 'leadStatus', header: 'Lead Status', path: 'leadStatus', type: 'text', defaultVisible: false },
  { id: 'salesReview', header: 'Sales Review', path: 'salesReview', type: 'text', defaultVisible: false },

  // ——— Finance KPIs (aggregated per account up to the transaction time) ———
  { id: 'totalFtd', header: 'Total FTD', path: 'totalFtd', type: 'money', defaultVisible: false },
  { id: 'ftdDate', header: 'FTD Date', path: 'ftdDate', type: 'datetime', defaultVisible: false },
  { id: 'ftd', header: 'FTD', path: 'ftd', type: 'boolean', defaultVisible: false },
  { id: 'ftdSelf', header: 'FTD Self', path: 'ftdSelf', type: 'boolean', defaultVisible: false },
  { id: 'daysToFtd', header: 'Days to FTD', path: 'daysToFtd', type: 'number', defaultVisible: false },
  { id: 'ftdFirstConversation', header: 'FTD First Conversation', path: 'ftdFirstConversation', type: 'boolean', defaultVisible: false },
  { id: 'totalDeposits', header: 'Total Deposits', path: 'totalDeposits', type: 'money', defaultVisible: false },
  { id: 'netDeposits', header: 'Net Deposits', path: 'netDeposits', type: 'money', defaultVisible: false },
  { id: 'firstDepositDate', header: 'First Deposit Date', path: 'firstDepositDate', type: 'datetime', defaultVisible: false },
  { id: 'lastDepositDate', header: 'Last Deposit Date', path: 'lastDepositDate', type: 'datetime', defaultVisible: false },
  { id: 'daysToDeposit', header: 'Days to Deposit', path: 'daysToDeposit', type: 'number', defaultVisible: false },
  { id: 'paymentGateway', header: 'Payment Gateway', path: 'paymentGateway', type: 'text', defaultVisible: false },
  { id: 'totalWithdrawals', header: 'Total Withdrawals', path: 'totalWithdrawals', type: 'money', defaultVisible: false },
  { id: 'netWithdrawals', header: 'Net Withdrawals', path: 'netWithdrawals', type: 'money', defaultVisible: false },
  { id: 'firstWithdrawalDate', header: 'First Withdrawal Date', path: 'firstWithdrawalDate', type: 'datetime', defaultVisible: false },
  { id: 'lastWithdrawalDate', header: 'Last Withdrawal Date', path: 'lastWithdrawalDate', type: 'datetime', defaultVisible: false },
  { id: 'daysToWithdrawal', header: 'Days to Withdrawal', path: 'daysToWithdrawal', type: 'number', defaultVisible: false },
  { id: 'withdrawFromDeposit', header: 'Withdraw from Deposit', path: 'withdrawFromDeposit', type: 'boolean', defaultVisible: false },
  { id: 'ftwDate', header: 'FTW Date', path: 'ftwDate', type: 'datetime', defaultVisible: false },
  { id: 'ftwSelf', header: 'FTW Self', path: 'ftwSelf', type: 'boolean', defaultVisible: false },
  { id: 'totalCredits', header: 'Total Credits', path: 'totalCredits', type: 'money', defaultVisible: false },
  { id: 'netCredits', header: 'Net Credits', path: 'netCredits', type: 'money', defaultVisible: false },
  { id: 'creditsOut', header: 'Credits Out', path: 'creditsOut', type: 'money', defaultVisible: false },
  { id: 'totalChargebacks', header: 'Total Chargebacks', path: 'totalChargebacks', type: 'money', defaultVisible: false },

  // ——— Compliance / Limits ———
  { id: 'allowDeposit', header: 'Allow Deposit', path: 'allowDeposit', type: 'boolean', defaultVisible: false },
  { id: 'depositLimit', header: 'Deposit Limit', path: 'depositLimit', type: 'money', defaultVisible: false },
  { id: 'allowWithdraw', header: 'Allow Withdraw', path: 'allowWithdraw', type: 'boolean', defaultVisible: false },
  { id: 'miniDeposit', header: 'Mini Deposit', path: 'miniDeposit', type: 'money', defaultVisible: false },
  { id: 'withdrawLimit', header: 'Withdraw Limit', path: 'withdrawLimit', type: 'money', defaultVisible: false },

  // ——— Transaction Fields (per row) ———
  { id: 'transactionType', header: 'Transaction Type', path: 'transactionType', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'money', defaultVisible: true },
  { id: 'txDate', header: 'Transaction Date', path: 'txDate', type: 'datetime', defaultVisible: true },
  { id: 'description', header: 'Description', path: 'description', type: 'text', defaultVisible: true },
  { id: 'paymentMethod', header: 'Payment Method', path: 'paymentMethod', type: 'text', defaultVisible: false },
  { id: 'createdBy', header: 'Created By', path: 'createdBy', type: 'text', defaultVisible: false },
  { id: 'action', header: 'Action', path: 'action', type: 'text', defaultVisible: false },

  // ——— KYC / Document Fields ———
  { id: 'docIdPassport', header: 'ID/Passport', path: 'docIdPassport', type: 'boolean', defaultVisible: false },
  { id: 'docProofOfAddress', header: 'Proof of Address', path: 'docProofOfAddress', type: 'boolean', defaultVisible: false },
  { id: 'docCardFront', header: 'Credit Card Front', path: 'docCardFront', type: 'boolean', defaultVisible: false },
  { id: 'docCardBack', header: 'Credit Card Back', path: 'docCardBack', type: 'boolean', defaultVisible: false },
]

// Helper functions for column management
export const getDefaultVisibleTransactionColumns = (): Record<string, boolean> => {
  const result: Record<string, boolean> = {}
  transactionsEntityColumns.forEach(col => {
    result[col.id] = col.defaultVisible
  })
  return result
}

export const getAllTransactionColumnsVisible = (): Record<string, boolean> => {
  const result: Record<string, boolean> = {}
  transactionsEntityColumns.forEach(col => {
    result[col.id] = true
  })
  return result
}

export const getAllTransactionColumnsHidden = (): Record<string, boolean> => {
  const result: Record<string, boolean> = {}
  transactionsEntityColumns.forEach(col => {
    result[col.id] = false
  })
  return result
}

export const getFilteredTransactionColumnDefinitions = (customDocuments: Array<{id: string, label: string}> = []) => {
  return [
    ...transactionsEntityColumns,
    ...customDocuments.map(doc => ({
      id: `custom_${doc.id}`,
      header: doc.label,
      path: `customDocuments.${doc.id}`,
      type: 'text' as const,
      defaultVisible: false
    }))
  ]
}