// PATCH: begin lookups hooks
import { useMemo, useEffect, useState } from "react";
import { LookupCategoryKey } from "./types";
import { useListLookupValuesQuery } from "./state/lookupsApi";
// PATCH: begin local status source check
import { useLocalLookupOptions } from "./state/useStatusStore";
// PATCH: end local status source check

export function useLookupOptions(category: LookupCategoryKey, includeDeprecated = false) {
  // PATCH: begin local status source check
  const { options: localOptions } = useLocalLookupOptions(category, includeDeprecated);
  console.debug("[useLookupOptions local]", category, localOptions);
  
  // Force re-render when status updates
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const refetch = () => forceUpdate(x => x + 1);
    window.addEventListener("status-updated", refetch);
    return () => window.removeEventListener("status-updated", refetch);
  }, []);

  // fallback to RTK if local empty
  const { data, isLoading } = useListLookupValuesQuery 
    ? useListLookupValuesQuery({ category }, { skip: localOptions.length > 0 })
    : { data: undefined, isLoading: false };

  const options = useMemo(() => {
    if (localOptions.length) {
      // Local options are already filtered and formatted correctly
      return localOptions;
    }
    
    // Format API data if no local options available
    const apiItems = data?.items ?? [];
    const filtered = includeDeprecated ? apiItems : apiItems.filter((v: any) => v.active && !v.deprecatedAt);
    return filtered.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((v: any) => ({ value: v.key, label: v.label, color: v.color ?? undefined }));
  }, [localOptions, data, includeDeprecated]);
  
  return { options, isLoading: localOptions.length > 0 ? false : isLoading };
  // PATCH: end local status source check
}
// PATCH: end lookups hooks