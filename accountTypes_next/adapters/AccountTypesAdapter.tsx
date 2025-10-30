import React from 'react';
import { isAccountTypeUsageEnabled } from '@/lib/flags';
import { useListWithCountsQuery, useListPlainQuery, useUsageQuery } from '@/state/services/accountTypesApi';
import AccountTypesTable from '@/features/accountTypes/AccountTypesTable';

interface AccountTypesAdapterProps {
  searchQuery?: string;
}

export default function AccountTypesAdapter({ searchQuery }: AccountTypesAdapterProps) {
  const enabled = isAccountTypeUsageEnabled();

  // Legacy path untouched
  if (!enabled) return <AccountTypesTable searchQuery={searchQuery} />;

  // Preferred: single call that already includes counts
  const { data: withCounts, isSuccess: hasCounts } = useListWithCountsQuery();

  if (hasCounts && withCounts) {
    return <AccountTypesTable data={withCounts} searchQuery={searchQuery} />;
  }

  // Fallback path: stitch counts via aggregated usage
  const { data: plain } = useListPlainQuery();
  const ids = (plain ?? []).map(p => p.id);
  const { data: usage } = useUsageQuery(ids, { skip: !ids.length });

  const usageMap = new Map((usage ?? []).map(u => [u.accountTypeId, u]));
  const rows = (plain ?? []).map(p => ({
    ...p,
    clientsCount: usageMap.get(p.id)?.clients ?? 0,
    leadsCount: usageMap.get(p.id)?.leads ?? 0,
  }));

  return <AccountTypesTable data={rows} searchQuery={searchQuery} />;
}