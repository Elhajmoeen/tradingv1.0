// PATCH: begin lookups types
export type LookupCategoryKey = "kycStatus" | "leadStatus" | "retentionStatus";

export interface LookupValue {
  id: string;
  key: string;           // machine key, unique per category
  label: string;         // human label
  color?: string | null; // e.g. hex or token
  order: number;         // sorting
  active: boolean;
  deprecatedAt?: string | null;
  usageCount?: number;   // optional, read-only
}

export interface LookupListResponse {
  items: LookupValue[];
  meta?: { total?: number };
}

export interface UpsertLookupValueInput {
  key: string;
  label: string;
  color?: string | null;
  order?: number;
  active?: boolean;
}
// PATCH: end lookups types