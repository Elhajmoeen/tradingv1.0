export type TransactionKind = 'Deposit' | 'Withdraw' | 'Credit' | 'Credit Out'

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Crypto' | 'Other'

export interface TransactionRecord {
  id: string
  clientId: string
  kind: TransactionKind
  amount: number
  description?: string
  paymentMethod?: PaymentMethod
  ftd?: boolean // Whether THIS transaction is marked as FTD
  ftw?: boolean // Whether THIS transaction is marked as FTW
  createdBy: 'CRM' | 'Client'
  createdByName?: string // agent name when createdBy = CRM
  createdAtISO: string    // ISO datetime
}

export interface FTDFields {
  isFTD: boolean           // true if the client has an FTD on record
  totalFTD: number         // amount of the FIRST TIME DEPOSIT
  ftdDateISO?: string      // ISO datetime of the first deposit
  ftdSelf?: boolean        // true if client did it themselves, false if CRM manual
  daysToFTD?: number       // difference in days from client.createdAt -> ftdDate
  paymentMethod?: string   // Payment gateway used for the FTD
}

export interface DepositMetrics {
  totalDeposit: number        // Sum of all NON-FTD deposits
  netDeposit: number          // For now: += amount; (will subtract Withdraw/Credit Out later)
  firstDepositDateISO?: string
  lastDepositDateISO?: string
  daysToDeposit?: number      // Days from client.createdAt -> firstDepositDateISO
}

export interface FTWFields {
  isFTW: boolean           // true if the client has an FTW on record
  totalFTW: number         // amount of the FIRST TIME WITHDRAWAL
  ftwDateISO?: string      // ISO datetime of the first withdrawal
  ftwSelf?: boolean        // true if client did it themselves, false if CRM manual
  daysToFTW?: number       // difference in days from client.createdAt -> ftwDate
}

export interface WithdrawalMetrics {
  totalWithdrawal: number     // Sum of all NON-FTW withdrawals
  netWithdrawal: number       // For now: += amount; (may adjust with other calculations later)
  firstWithdrawalDateISO?: string
  lastWithdrawalDateISO?: string
  daysToWithdrawal?: number   // Days from client.createdAt -> firstWithdrawalDateISO
}

export interface CreditMetrics {
  totalCredit: number         // Sum of all Credit transactions
  totalCreditOut: number      // Sum of all Credit Out transactions
  netCredit: number           // Total Credit - Total Credit Out
  firstCreditDateISO?: string
  lastCreditDateISO?: string
  firstCreditOutDateISO?: string
  lastCreditOutDateISO?: string
}