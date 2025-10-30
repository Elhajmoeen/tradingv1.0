/**
 * Shared mapper for normalizing identifiers across NEXT layers
 * Ensures backward compatibility while standardizing on accountId
 */

export function normalizeAccountId<T extends Record<string, any>>(o: T): T & { accountId: string } {
  const accountId = o.accountId ?? o.clientId ?? "";
  return { ...o, accountId };
}

export function normalizeMany<T extends Record<string, any>>(arr: unknown): Array<T & { accountId: string }> {
  if (!Array.isArray(arr)) return [];
  return (arr as T[]).map(normalizeAccountId);
}