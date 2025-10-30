/**
 * RTK Query API slice for Allow IP Management
 * Following the same pattern as User Management
 */

import { baseApi } from '@/integration/baseApi'
import { AllowIp, CreateAllowIpRequest, UpdateAllowIpRequest } from '../types/allowIp.schema'

// Error response transformation (reuse existing pattern)
const transformErrorResponse = (error: any) => {
  if (error?.data?.message) {
    return error.data.message
  }
  if (typeof error?.data === 'string') {
    return error.data
  }
  return error?.message || 'An unexpected error occurred'
}

// API response types
interface AllowIpListResponse {
  data: AllowIp[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface AllowIpQueryParams {
  q?: string
  status?: string | string[]
  page?: number
  limit?: number
  sort?: string
}

interface BulkActionRequest {
  ids: string[]
  action: 'enable' | 'disable' | 'delete'
}

export const allowIpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * List allow IPs with pagination and filters
     */
    listAllowIps: builder.query<AllowIpListResponse, AllowIpQueryParams>({
      query: ({ page = 1, limit = 25, sort, q, status }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        
        if (sort) params.append('sort', sort)
        if (q?.trim()) params.append('q', q.trim())
        if (status) {
          const statusValues = Array.isArray(status) ? status : [status]
          statusValues.forEach(s => params.append('status', s))
        }
        
        return {
          url: `/allow-ip?${params.toString()}`,
          method: 'GET',
        }
      },
      providesTags: (result) => [
        'AllowIp',
        ...(result?.data?.map(({ id }) => ({ type: 'AllowIp' as const, id })) ?? []),
      ],
      transformErrorResponse,
    }),

    /**
     * Get single allow IP by ID
     */
    getAllowIpById: builder.query<AllowIp, string>({
      query: (id) => ({
        url: `/allow-ip/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'AllowIp', id }],
      transformErrorResponse,
    }),

    /**
     * Create new allow IP
     */
    createAllowIp: builder.mutation<AllowIp, CreateAllowIpRequest>({
      query: (body) => ({
        url: '/allow-ip',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AllowIp'],
      transformErrorResponse,
    }),

    /**
     * Update allow IP
     */
    updateAllowIp: builder.mutation<AllowIp, { id: string; updates: UpdateAllowIpRequest }>({
      query: ({ id, updates }) => ({
        url: `/allow-ip/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        'AllowIp',
        { type: 'AllowIp', id },
      ],
      transformErrorResponse,
    }),

    /**
     * Delete allow IP
     */
    deleteAllowIp: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/allow-ip/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'AllowIp',
        { type: 'AllowIp', id },
      ],
      transformErrorResponse,
    }),

    /**
     * Bulk actions (optional - fallback to individual calls if backend doesn't support)
     */
    bulkAllowIpAction: builder.mutation<{ success: boolean; processed: number }, BulkActionRequest>({
      query: (body) => ({
        url: '/allow-ip/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AllowIp'],
      transformErrorResponse,
    }),
  }),
  overrideExisting: false,
})

export const {
  useListAllowIpsQuery,
  useGetAllowIpByIdQuery,
  useCreateAllowIpMutation,
  useUpdateAllowIpMutation,
  useDeleteAllowIpMutation,
  useBulkAllowIpActionMutation,
} = allowIpApi