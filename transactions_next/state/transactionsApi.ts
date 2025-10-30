/**
 * RTK Query API for transactions management
 * Following the same pattern as positionsApi
 */

import { baseApi } from '@/integration/baseApi'
import { TransactionDTO, CreateTransactionRequest, UpdateTransactionRequest } from '../types/transaction'
import { parseTransactions, parseTransaction } from '../types/transaction.schema'

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * List transactions with pagination and filters
     */
    listTransactions: builder.query<
      { data: TransactionDTO[], pagination: { page: number, pageSize: number, total: number, totalPages: number } },
      { page?: number, pageSize?: number, sort?: string, filter?: Record<string, any> }
    >({
      query: ({ page = 1, pageSize = 10, sort, filter }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        })
        
        if (sort) params.append('sort', sort)
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, String(value))
            }
          })
        }
        
        return {
          url: `/transactions?${params.toString()}`,
          method: 'GET',
        }
      },
      transformResponse: (response: any) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] List response:', response)
        }
        
        // Handle both array format and object with data property
        const data = Array.isArray(response) ? response : response.data || []
        const transactions = parseTransactions(data)
        
        return {
          data: transactions,
          pagination: response.pagination || {
            page: 1,
            pageSize: transactions.length,
            total: transactions.length,
            totalPages: 1
          }
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    /**
     * Get single transaction by ID
     */
    getTransactionById: builder.query<TransactionDTO, { id: string }>({
      query: ({ id }) => ({
        url: `/transactions/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: unknown) => {
        if (import.meta.env.DEV) {
          console.log('[TransactionsAPI] Get by ID response:', response)
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
      { id: string; updates: UpdateTransactionRequest }
    >({
      query: ({ id, updates }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
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
    removeTransaction: builder.mutation<{ ok: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ ok: true }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Transaction', id: arg.id },
        { type: 'Transaction', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for components
export const {
  useListTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useRemoveTransactionMutation,
  useLazyListTransactionsQuery,
  useLazyGetTransactionByIdQuery,
} = transactionsApi