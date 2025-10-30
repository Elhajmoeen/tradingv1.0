// PATCH: begin lookupsApi
import baseApi from "@/integration/baseApi";
import type { LookupCategoryKey, LookupListResponse, LookupValue, UpsertLookupValueInput } from "../types";

export const lookupsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLookupValues: build.query<LookupListResponse, { category: LookupCategoryKey }>({
      query: ({ category }) => ({ url: `/lookups/${category}/values` }),
      providesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),

    createLookupValue: build.mutation<LookupValue, { category: LookupCategoryKey; body: UpsertLookupValueInput }>({
      query: ({ category, body }) => ({ url: `/lookups/${category}/values`, method: "POST", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),

    updateLookupValue: build.mutation<LookupValue, { category: LookupCategoryKey; id: string; body: UpsertLookupValueInput }>({
      query: ({ category, id, body }) => ({ url: `/lookups/${category}/values/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),

    reorderLookupValues: build.mutation<{ ok: true }, { category: LookupCategoryKey; idsInOrder: string[] }>({
      query: ({ category, idsInOrder }) => ({ url: `/lookups/${category}/reorder`, method: "PUT", body: { idsInOrder } }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),

    toggleActiveLookupValue: build.mutation<LookupValue, { category: LookupCategoryKey; id: string; active: boolean }>({
      query: ({ category, id, active }) => ({ url: `/lookups/${category}/values/${id}/active`, method: "PUT", body: { active } }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),

    deprecateLookupValue: build.mutation<LookupValue, { category: LookupCategoryKey; id: string }>({
      query: ({ category, id }) => ({ url: `/lookups/${category}/values/${id}/deprecate`, method: "PUT" }),
      invalidatesTags: (_r, _e, arg) => [{ type: "Lookup", id: arg.category }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListLookupValuesQuery,
  useCreateLookupValueMutation,
  useUpdateLookupValueMutation,
  useReorderLookupValuesMutation,
  useToggleActiveLookupValueMutation,
  useDeprecateLookupValueMutation,
} = lookupsApi;
// PATCH: end lookupsApi