/**
 * Transaction DTO types for the "next" transactions feature
 * These align with API responses and table display requirements
 */

export type TransactionActionType = "DEPOSIT" | "WITHDRAW" | "CREDIT" | "DEBIT"
export type TransactionSubType = "APPROVED" | "PENDING" | "DECLINED"

export interface TransactionDTO {
  id: string
  accountId: string
  actionType: TransactionActionType   // maps to "ACTION TYPE"
  subType: TransactionSubType         // maps to "SUB TYPE" (status)
  amount: number                      // number, not string
  currency: string                    // "USD", "SAR", etc.
  createdAt: string                   // ISO datetime, maps to "DATE/TIME"
  createdById?: string | null
  createdByName?: string | null       // maps to "ACTION BY"
  comment?: string | null
  paymentMethod?: string | null
  reference?: string | null
  ftd?: boolean | null               // First Time Deposit flag
  ftw?: boolean | null               // First Time Withdrawal flag
}

export interface CreateTransactionRequest {
  accountId: string
  actionType: TransactionActionType
  subType: TransactionSubType
  amount: number
  currency: string
  comment?: string
  paymentMethod?: string
  reference?: string
  ftd?: boolean
  ftw?: boolean
}

export interface UpdateTransactionRequest {
  subType?: TransactionSubType
  amount?: number
  comment?: string
  paymentMethod?: string
  reference?: string
}

export interface DeleteTransactionResponse {
  ok: boolean
}