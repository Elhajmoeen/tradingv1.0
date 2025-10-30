export const RELATION_CATALOG = {
  conversationOwnerId: { url: '/users',          label: 'fullName',   query: 'q' },
  accountTypeId:       { url: '/account-types',  label: 'name',       query: 'q' },
  // add more relations here incrementally
} as const;

export type RelationKey = keyof typeof RELATION_CATALOG;