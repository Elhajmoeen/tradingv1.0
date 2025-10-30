export type AssetCategory = 'Forex'|'Indices'|'Stocks'|'Commodities'|'Crypto';

export interface AccountTypeAssetRuleDTO {
  id: string;                 // rule id
  accountTypeId: string;      // FK
  assetId: string;            // FK to master asset
  assetName: string;
  category: AssetCategory;

  leverage: number;           // e.g., 50
  spread: number;             // points/pips
  defaultLot: number;         // "Default"
  jump: number;               // step
  minDeal: number;            // "Mini Deal"
  maxDeal: number;            // "Max Deal"
  commission: number;         // currency or per lot
  swapLong: number;
  swapShort: number;
  status: 'ACTIVE'|'DISABLED';

  createdAt?: string;
  updatedAt?: string;
}