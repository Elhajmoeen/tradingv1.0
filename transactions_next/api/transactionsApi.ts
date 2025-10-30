/**
 * RTK Query API for transactions management
 * Following the same pattern as positionsApi with full CRUD operations
 */

import { baseApi } from '../../../integration/baseApi'
import { TransactionDTO, CreateTransactionRequest } from '../types/transaction'
import { parseTransactions, parseTransaction } from '../types/transaction.schema'

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all transactions for a client
     */
    getTransactions: builder.query<TransactionDTO[], { clientId: string }>({
      query: ({ clientId }) => ({
        url: `/transactions/${clientId}`,
        method: 'GET',
      }),
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Raw response:', response)
        }
        return parseTransactions(response)
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    /**
     * Get single transaction by ID
     */
    getTransaction: builder.query<TransactionDTO, { transactionId: string }>({
      query: ({ transactionId }) => ({
        url: `/transactions/single/${transactionId}`,
        method: 'GET',
      }),
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Single transaction response:', response)
        }
        return parseTransaction(response)
      },
      providesTags: (result, error, arg) =>
        result ? [{ type: 'Transaction', id: result.id }] : [],
    }),

    /**
     * Create new transaction
     */
    createTransaction: builder.mutation<TransactionDTO, CreateTransactionRequest>({
      query: (transaction) => ({
        url: '/transactions',
        method: 'POST',
        body: transaction,
      }),
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Create response:', response)
        }
        return parseTransaction(response)
      },
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    /**
     * Update transaction
     */
    updateTransaction: builder.mutation<
      TransactionDTO,
      { transactionId: string; updates: Partial<CreateTransactionRequest> }
    >({
      query: ({ transactionId, updates }) => ({
        url: `/transactions/${transactionId}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Update response:', response)
        }
        return parseTransaction(response)
      },
      invalidatesTags: (result, error, arg) =>
        result
          ? [
              { type: 'Transaction', id: result.id },
              { type: 'Transaction', id: 'LIST' },
            ]
          : [],
    }),

    /**
     * Delete transaction
     */
    deleteTransaction: builder.mutation<void, { transactionId: string }>({
      query: ({ transactionId }) => ({
        url: `/transactions/${transactionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Transaction', id: arg.transactionId },
        { type: 'Transaction', id: 'LIST' },
      ],
    }),

    /**
     * Get transactions with filters (for advanced search)
     */
    getTransactionsFiltered: builder.query<
      TransactionDTO[],
      {
        clientId?: string
        actionType?: string
        subType?: string
        fromDate?: string
        toDate?: string
        minAmount?: number
        maxAmount?: number
        currency?: string
        paymentMethod?: string
      }
    >({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })

        return {
          url: `/transactions/filter?${params.toString()}`,
          method: 'GET',
        }
      },
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Filtered response:', response)
        }
        return parseTransactions(response)
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'FILTERED' },
            ]
          : [{ type: 'Transaction', id: 'FILTERED' }],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for components
export const {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionsFilteredQuery,
  useLazyGetTransactionsQuery,
  useLazyGetTransactionQuery,
  useLazyGetTransactionsFilteredQuery,
} = transactionsApi