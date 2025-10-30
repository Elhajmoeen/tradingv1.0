import { z } from 'zod';

export const accountTypeAssetRuleSchema = z.object({
  id: z.string(),
  accountTypeId: z.string(),
  assetId: z.string(),
  assetName: z.string(),
  category: z.string(),
  leverage: z.coerce.number(),
  spread: z.coerce.number(),
  defaultLot: z.coerce.number(),
  jump: z.coerce.number(),
  minDeal: z.coerce.number(),
  maxDeal: z.coerce.number(),
  commission: z.coerce.number(),
  swapLong: z.coerce.number(),
  swapShort: z.coerce.number(),
  status: z.enum(['ACTIVE','DISABLED']),
});

export const accountTypeAssetRuleArraySchema = z.array(accountTypeAssetRuleSchema);

export type AccountTypeAssetRule = z.infer<typeof accountTypeAssetRuleSchema>;