import { baseApi } from '@/integration/baseApi'
import { handleApiError } from '@/api/client'
import type { LeadDTO, CreateLeadRequest, UpdateLeadRequest } from "../types/lead"
import type { LeadsFilters, LeadsFacetsResponse } from "../types/leadFilters"
import { parseLeadsListResponse, parseLeadDTO } from "../types/lead.schema"

interface LeadsListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: string
  owner?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  filters?: LeadsFilters
}

interface LeadsListResponse {
  leads: LeadDTO[]
  total: number
  page: number
  limit: number
}

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<LeadsListResponse, LeadsListParams>({
      query: (params) => ({
        url: "/leads",
        params: {
          ...params,
          filters: params.filters ? JSON.stringify(params.filters) : undefined
        },
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseLeadsListResponse(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid leads response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'getLeads'),
      providesTags: (result) =>
        result
          ? [
              ...result.leads.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Lead", id: "LIST" },
              { type: "LeadsFacets", id: "LIST" },
            ]
          : [{ type: "Lead", id: "LIST" }, { type: "LeadsFacets", id: "LIST" }],
    }),

    getLeadsFacets: builder.query<LeadsFacetsResponse, { fields: string[]; filters: LeadsFilters; search?: string }>({
      query: ({ fields, filters, search }) => ({
        url: "/leads/facets",
        method: "GET",
        params: {
          fields: fields.join(","),
          filters: JSON.stringify(filters ?? []),
          search: search ?? "",
        },
      }),
      transformResponse: (response: unknown) => {
        // Ensure response is a valid facets object
        if (typeof response === 'object' && response !== null) {
          return response as LeadsFacetsResponse
        }
        return {} as LeadsFacetsResponse
      },
      transformErrorResponse: (response) => handleApiError(response, 'getLeadsFacets'),
      providesTags: ["LeadsFacets", "Lead"], // tie to Lead so invalidations refresh both
    }),

    getLeadById: builder.query<LeadDTO, string>({
      query: (id) => `/leads/${id}`,
      transformResponse: (response: unknown) => {
        const parsed = parseLeadDTO(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid lead response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'getLeadById'),
      providesTags: (result, error, id) => [{ type: "Lead", id }],
    }),

    createLead: builder.mutation<LeadDTO, CreateLeadRequest>({
      query: (lead) => ({
        url: "/leads",
        method: "POST",
        body: lead,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseLeadDTO(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid lead response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'createLead'),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "LeadsFacets"],
    }),

    updateLead: builder.mutation<LeadDTO, { id: string; data: UpdateLeadRequest }>({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const parsed = parseLeadDTO(response)
        if (parsed.success) {
          return parsed.data
        }
        throw new Error("Invalid lead response format")
      },
      transformErrorResponse: (response) => handleApiError(response, 'updateLead'),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        "LeadsFacets",
      ],
    }),

    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (response) => handleApiError(response, 'deleteLead'),
      invalidatesTags: (result, error, id) => [
        { type: "Lead", id },
        { type: "Lead", id: "LIST" },
        "LeadsFacets",
      ],
    }),

    importLeads: builder.mutation<{ imported: number; errors: string[] }, FormData>({
      query: (formData) => ({
        url: "/leads/import",
        method: "POST",
        body: formData,
      }),
      transformErrorResponse: (response) => handleApiError(response, 'importLeads'),
      invalidatesTags: [{ type: "Lead", id: "LIST" }, "LeadsFacets"],
    }),
  }),
})

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useImportLeadsMutation,
  useGetLeadsFacetsQuery,
} = leadsApi