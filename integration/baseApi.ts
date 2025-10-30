/**
 * RTK Query base API configuration
 * Provides centralized API setup with auth and error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { selectAuthToken } from './auth'
import { isAuthReauthEnabled } from '@/lib/flags'
import { readAuthToken, writeAuthToken } from '@/integration/auth'

// PATCH: begin baseApi scope propagation
// Helper – choose which endpoints get scoped (KPIs, clients, positions, activities, etc.)
function urlShouldBeScoped(url: string) {
  return [
    "/clients",
    "/leads", 
    "/kpis",
    "/positions",
    "/activities",
    "/transactions",
  ].some(path => url.includes(path));
}
// PATCH: end baseApi scope propagation

// Base query with auth headers
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    // Get auth token from state or localStorage fallback
    const state = getState() as any
    const token = selectAuthToken(state) || 
                  (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
    
    if (token) {
      // Support different auth schemes via environment
      const authScheme = import.meta.env.VITE_AUTH_SCHEME || 'Bearer'
      switch (authScheme.toLowerCase()) {
        case 'bearer':
          headers.set('authorization', `Bearer ${token}`)
          break
        case 'token':
          headers.set('authorization', `Token ${token}`)
          break
        case 'cookie':
          // For cookie-based auth, token would be set via httpOnly cookies
          break
        default:
          headers.set('authorization', `Bearer ${token}`)
      }
    }
    
    // Set standard headers
    headers.set('content-type', 'application/json')
    headers.set('x-client', 'crm-frontend')
    
    // Add request ID for tracing (if crypto.randomUUID available)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      headers.set('x-request-id', crypto.randomUUID())
    }
    
    return headers
  },
})

const rawBaseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extra) => {
    let result = await rawBaseQuery(args, api, extra);
    if (result.error?.status === 401 && isAuthReauthEnabled()) {
      const refreshPath = import.meta.env.VITE_AUTH_REFRESH_PATH || '/auth/refresh';
      const refresh = await rawBaseQuery({ url: refreshPath, method: 'POST' }, api, extra);
      const newToken = (refresh.data as any)?.token as string | undefined;

      if (newToken) {
        writeAuthToken(newToken);         // keep prepareHeaders compatible
        // retry original
        result = await rawBaseQuery(args, api, extra);
      }
      // If refresh fails, let the original 401 bubble up unchanged.
    }
    return result;
  };

// PATCH: begin baseApi scope propagation wrapper
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extra) => {
    const state = api.getState() as any;
    const role = state?.auth?.user?.role;
    const scopeAgentIds: string[] = state?.auth?.user?.scopeAgentIds ?? [];



    return rawBaseQueryWithReauth(args, api, extra);
  };
// PATCH: end baseApi scope propagation wrapper

// Base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,   // <— swap is internal, tagTypes/endpoints unchanged
  tagTypes: [
    'Lead',
    'LeadsFacets',
    'Client', 
    'Position',
    'Transaction',
    'Document',
    'User',
    'AccountType',
    'Asset',
    'AccountTypeAssetRule',
    'AllowIp',
    // PATCH: begin baseApi Lookup tagType
    'Lookup'
    // PATCH: end baseApi Lookup tagType
  ],
  endpoints: () => ({}),
})

export default baseApi