/**
 * Zod validation schemas for transaction data
 */

import { z } from 'zod'
import type { TransactionDTO } from './transaction'
import { normalizeMany } from '@/integration/idMap'

// Zod schema for TransactionDTO with ID normalization
export const transactionDTOSchema = z.object({
  id: z.string(),
  accountId: z.string().optional(),
  clientId: z.string().optional(),
  actionType: z.enum(['DEPOSIT', 'WITHDRAW', 'CREDIT', 'DEBIT']),
  subType: z.enum(['APPROVED', 'PENDING', 'DECLINED']),
  amount: z.coerce.number(),  // Safe number coercion
  currency: z.string(),
  createdAt: z.string(),     // ISO datetime string
  createdById: z.string().nullable().optional(),
  createdByName: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
}).transform(v => ({ ...v, accountId: v.accountId ?? v.clientId ?? "" }))

// Base schema without transform for array use
const baseTransactionSchema = z.object({
  id: z.string(),
  accountId: z.string().optional(),
  clientId: z.string().optional(),
  actionType: z.enum(['DEPOSIT', 'WITHDRAW', 'CREDIT', 'DEBIT']),
  subType: z.enum(['APPROVED', 'PENDING', 'DECLINED']),
  amount: z.coerce.number(),
  currency: z.string(),
  createdAt: z.string(),
  createdById: z.string().nullable().optional(),
  createdByName: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
})

// Array schema
const transactionsArraySchema = z.array(baseTransactionSchema)

/**
 * Parse array of transaction data with Zod validation
 */
export function parseTransactions(data: unknown): TransactionDTO[] {
  try {
    const parsed = transactionsArraySchema.parse(data)
    return normalizeMany<TransactionDTO>(parsed)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to parse transactions array:', error)
    }
    return []
  }
}

/**
 * Parse single transaction data with Zod validation
 */
export function parseTransaction(data: unknown): TransactionDTO {
  try {
    return transactionDTOSchema.parse(data)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to parse transaction:', error)
    }
    throw new Error('Invalid transaction data received')
  }
}