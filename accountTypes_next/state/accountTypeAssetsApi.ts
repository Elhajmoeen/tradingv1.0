import { baseApi } from '@/integration/baseApi';
import { accountTypeAssetRuleArraySchema, AccountTypeAssetRule } from '../types/accountTypeAssetRule.schema';

export const accountTypeAssetsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // master assets to pick from
    listAssets: b.query<{id:string; name:string; category:string;}[], void>({
      query: () => ({ url: '/assets', method: 'GET' }),
      providesTags: ['Asset'],
    }),

    // rules for one account type
    listRules: b.query<AccountTypeAssetRule[], string>({
      query: (accountTypeId) => ({ url: `/account-types/${accountTypeId}/assets`, method: 'GET' }),
      transformResponse: (d) => accountTypeAssetRuleArraySchema.parse(d),
      providesTags: (res, _e, id) => [{ type: 'AccountTypeAssetRule', id }, 'AccountType'],
    }),

    // bulk upsert on create/edit
    upsertRules: b.mutation<{updated:number}, { accountTypeId:string; rules: AccountTypeAssetRule[] }>(
      {
        query: ({ accountTypeId, rules }) => ({
          url: `/account-types/${accountTypeId}/assets`,
          method: 'PUT',
          body: { rules },
        }),
        invalidatesTags: (res, _e, { accountTypeId }) => [
          { type: 'AccountTypeAssetRule', id: accountTypeId }, 'AccountType',
        ],
      }
    ),

    // remove one rule
    deleteRule: b.mutation<void, { accountTypeId:string; ruleId:string }>({
      query: ({ accountTypeId, ruleId }) => ({
        url: `/account-types/${accountTypeId}/assets/${ruleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (res, _e, { accountTypeId }) => [
        { type: 'AccountTypeAssetRule', id: accountTypeId }, 'AccountType',
      ],
    }),
  }),
});

export const {
  useListAssetsQuery,
  useListRulesQuery,
  useUpsertRulesMutation,
  useDeleteRuleMutation,
} = accountTypeAssetsApi;