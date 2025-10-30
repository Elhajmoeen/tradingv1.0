import { baseApi } from '@/integration/baseApi';
import type { AccountTypeDTO, AccountTypeUsageDTO } from '@/features/accountTypes_next/types/accountType';

// Input type for creating new account types
export interface CreateAccountTypeInput {
  name: string;
  status?: 'ACTIVE' | 'DISABLED';
  // extend with your current settings shape:
  settings?: {
    blockNotifications?: boolean;
    allowedToTrade?: boolean;
    allowDeposit?: boolean;
    allowWithdraw?: boolean;
    tradeOut?: boolean;
    marginCall?: number;
  };
}

export const accountTypesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // list with optional counts (preferred)
    listWithCounts: b.query<AccountTypeDTO[], void>({
      query: () => ({ url: '/account-types?include=counts', method: 'GET' }),
      transformResponse: (data: any) => data as AccountTypeDTO[],
      providesTags: ['AccountType','Client','Lead'],
    }),

    // fallback: fetch account types only
    listPlain: b.query<AccountTypeDTO[], void>({
      query: () => ({ url: '/account-types', method: 'GET' }),
      transformResponse: (data: any) => data as AccountTypeDTO[],
      providesTags: ['AccountType'],
    }),

    // optional aggregated usage if backend exposes it
    usage: b.query<AccountTypeUsageDTO[], string[]>({
      // ids in query string; backend can also accept none → all
      query: (ids) => ({ url: `/account-types/usage`, params: { ids: ids?.join(',') } }),
      transformResponse: (data: any) => data as AccountTypeUsageDTO[],
      providesTags: ['Client','Lead','AccountType'],
    }),

    // Get account type by ID
    getById: b.query<AccountTypeDTO, string>({
      query: (id) => ({ url: `/account-types/${id}`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'AccountType', id }],
    }),

    // Create new account type
    create: b.mutation<AccountTypeDTO, CreateAccountTypeInput>({
      query: (body) => ({ url: '/account-types', method: 'POST', body }),
      invalidatesTags: ['AccountType'], // list refetch
    }),
  }),
  overrideExisting: false,
});

export const {
  useListWithCountsQuery,
  useListPlainQuery,
  useUsageQuery,
  useGetByIdQuery,
  useCreateMutation,
} = accountTypesApi;