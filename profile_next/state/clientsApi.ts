import { baseApi } from '@/integration/baseApi'
import { handleApiError } from '@/api/client'
import type { ClientDTO, UpdateClientRequest, ClientDocument } from "../types/client"
import type { PositionDTO } from "@/features/positions_next/types/position"
import type { TransactionDTO } from "@/features/transactions_next/types/transaction"
import { parseClientDTO, parseUpdateClientRequest, parseClientDocument } from "../types/client.schema"
import { parsePositions } from "@/features/positions_next/types/position.schema"
import { parseTransactions } from "@/features/transactions_next/types/transaction.schema"

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClient: builder.query<ClientDTO, string>({
      query: (id) => `/clients/${id}`,
      transformResponse: (response: unknown) => {
        const parsed = parseClientDTO(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid client response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'getClient'),
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),

    updateClient: builder.mutation<ClientDTO, { id: string; data: UpdateClientRequest }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseClientDTO(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid client response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'updateClient'),
      invalidatesTags: (result, error, { id }) => [
        { type: "Client", id },
      ],
    }),

    getClientPositions: builder.query<PositionDTO[], string>({
      query: (clientId) => `/clients/${clientId}/positions`,
      transformResponse: (response: unknown) => parsePositions(response),
      transformErrorResponse: (response) => handleApiError(response, 'getClientPositions'),
      providesTags: (result, error, clientId) => [
        { type: "Position", id: `client-${clientId}` },
      ],
    }),

    getClientTransactions: builder.query<TransactionDTO[], string>({
      query: (clientId) => `/clients/${clientId}/transactions`,
      transformResponse: (response: unknown) => parseTransactions(response),
      transformErrorResponse: (response) => handleApiError(response, 'getClientTransactions'),
      providesTags: (result, error, clientId) => [
        { type: "Transaction", id: `client-${clientId}` },
      ],
    }),

    getClientDocuments: builder.query<ClientDocument[], string>({
      query: (clientId) => `/clients/${clientId}/documents`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) {
          const results = response.map(item => parseClientDocument(item))
          const validResults = results.filter(r => r.success).map(r => r.data!)
          return validResults
        }
        throw new Error("Invalid documents response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'getClientDocuments'),
      providesTags: (result, error, clientId) => [
        { type: "Document", id: `client-${clientId}` },
      ],
    }),

    requestDocument: builder.mutation<ClientDocument, { clientId: string; type: ClientDocument['type']; requirementText: string }>({
      query: ({ clientId, type, requirementText }) => ({
        url: `/clients/${clientId}/documents/request`,
        method: "POST",
        body: { type, requirementText },
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseClientDocument(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid document response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'requestDocument'),
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Document", id: `client-${clientId}` },
      ],
    }),

    uploadDocument: builder.mutation<ClientDocument, { clientId: string; file: File; type: ClientDocument['type'] }>({
      query: ({ clientId, file, type }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        
        return {
          url: `/clients/${clientId}/documents/upload`,
          method: "POST",
          body: formData,
        }
      },
      transformResponse: (response: unknown) => {
        const parsed = parseClientDocument(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid document response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'uploadDocument'),
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Document", id: `client-${clientId}` },
      ],
    }),

    updateDocumentStatus: builder.mutation<ClientDocument, { clientId: string; documentId: string; status: ClientDocument['status']; notes?: string }>({
      query: ({ clientId, documentId, status, notes }) => ({
        url: `/clients/${clientId}/documents/${documentId}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseClientDocument(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid document response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'updateDocumentStatus'),
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Document", id: `client-${clientId}` },
      ],
    }),
  }),
})

export const {
  useGetClientQuery,
  useUpdateClientMutation,
  useGetClientPositionsQuery,
  useGetClientTransactionsQuery,
  useGetClientDocumentsQuery,
  useRequestDocumentMutation,
  useUploadDocumentMutation,
  useUpdateDocumentStatusMutation,
} = clientsApi