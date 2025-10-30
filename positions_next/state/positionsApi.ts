import { baseApi } from '@/integration/baseApi'
import { parsePositions } from '../types/position.schema'
import { handleApiError } from '@/api/client'
import { toSearchParams, type ListQuery } from '@/integration/query'
import type { 
  PositionDTO, 
  CreatePositionRequest, 
  UpdatePositionRequest, 
  ClosePositionRequest,
  CancelPositionRequest,
  ReopenPositionRequest 
} from '../types/position'

// Query parameters interface
interface ListQueryParams {
  page?: number
  pageSize?: number
  sort?: string
  filter?: Record<string, string | number | boolean>
  accountId?: string
  clientId?: string  // Backward compatibility
}

export const positionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOpen: builder.query<PositionDTO[], ListQueryParams | ListQuery | string | void>({
      query: (args) => {
        // Handle search string format (from TanStack integration)
        if (typeof args === 'string') {
          return { url: `/positions/open${args}`, method: 'GET' };
        }
        // Handle new ListQuery format
        if (args && 'sorts' in args) {
          const qs = toSearchParams(args as ListQuery);
          const url = qs ? `/positions/open?${qs}` : `/positions/open`;
          return { url, method: 'GET' };
        }
        // Handle legacy ListQueryParams format
        return {
          url: '/positions/open',
          params: args || undefined,
        };
      },
      transformResponse: (response: unknown) => parsePositions(response),
      transformErrorResponse: (response) => handleApiError(response, 'listOpen'),
      providesTags: ['Position'],
    }),

    listPending: builder.query<PositionDTO[], ListQueryParams | void>({
      query: (params) => ({
        url: '/positions/pending',
        params: params || undefined,
      }),
      transformResponse: (response: unknown) => parsePositions(response),
      transformErrorResponse: (response) => handleApiError(response, 'listPending'),
      providesTags: ['Position'],
    }),

    listClosed: builder.query<PositionDTO[], ListQueryParams | void>({
      query: (params) => ({
        url: '/positions/closed',
        params: params || undefined,
      }),
      transformResponse: (response: unknown) => parsePositions(response),
      transformErrorResponse: (response) => handleApiError(response, 'listClosed'),
      providesTags: ['Position'],
    }),

    getById: builder.query<PositionDTO, string>({
      query: (id) => `/positions/${id}`,
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'getById'),
      providesTags: (result, error, id) => [{ type: 'Position', id }],
    }),

    create: builder.mutation<PositionDTO, CreatePositionRequest>({
      query: (body) => ({
        url: '/positions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'create'),
      invalidatesTags: ['Position'],
    }),

    update: builder.mutation<PositionDTO, { id: string; body: UpdatePositionRequest }>({
      query: ({ id, body }) => ({
        url: `/positions/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'update'),
      invalidatesTags: (result, error, { id }) => [{ type: 'Position', id }, 'Position'],
    }),

    close: builder.mutation<PositionDTO, { id: string; body: ClosePositionRequest }>({
      query: ({ id, body }) => ({
        url: `/positions/${id}/close`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'close'),
      invalidatesTags: ['Position'],
    }),

    cancel: builder.mutation<PositionDTO, { id: string; body?: CancelPositionRequest }>({
      query: ({ id, body }) => ({
        url: `/positions/${id}/cancel`,
        method: 'POST',
        body: body || {},
      }),
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'cancel'),
      invalidatesTags: ['Position'],
    }),

    reopen: builder.mutation<PositionDTO, { id: string; body: ReopenPositionRequest }>({
      query: ({ id, body }) => ({
        url: `/positions/${id}/reopen`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parsePositions([response])
        if (parsed.length === 0) {
          throw new Error('Invalid position data received')
        }
        return parsed[0]
      },
      transformErrorResponse: (response) => handleApiError(response, 'reopen'),
      invalidatesTags: ['Position'],
    }),
  }),
})

// Export hooks for use in components
export const {
  useListOpenQuery,
  useListPendingQuery,
  useListClosedQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useCloseMutation,
  useCancelMutation,
  useReopenMutation,
} = positionsApi