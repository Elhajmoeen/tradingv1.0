import type { ZodTypeAny, ZodFirstPartyTypeKind } from 'zod';
import { RELATION_CATALOG } from './relationCatalog';
import type { NormalizedFilter } from './types';

export type ColumnFilterMeta =
  | { kind:'text'; ops: Array<'contains'|'eq'|'startsWith'|'endsWith'> }
  | { kind:'number'; ops: Array<'eq'|'gte'|'lte'|'between'> }
  | { kind:'date'; ops: Array<'eq'|'gte'|'lte'|'between'> }
  | { kind:'boolean'; ops: Array<'eq'> }
  | { kind:'enum'; options: { value: string; label: string }[]; multi: boolean; ops: Array<'in'|'eq'> }
  | { kind:'relation'; relationKey: string; multi: boolean; ops: Array<'in'|'eq'> };

const isDateishKey = (k: string) => /(?:At|Date)$/i.test(k);
const isIdKey      = (k: string) => /Id$/i.test(k);

export function inferFilterMeta(fieldKey: string, zod?: ZodTypeAny): ColumnFilterMeta | undefined {
  // relations by name first
  if (isIdKey(fieldKey) && fieldKey in RELATION_CATALOG) {
    return { kind: 'relation', relationKey: fieldKey, multi: true, ops: ['in','eq'] };
  }

  // If we have zod schema, use it for precise detection
  if (zod) {
    const t = (zod._def?.typeName ?? '') as ZodFirstPartyTypeKind;

    if (t === 'ZodString') {
      if (isDateishKey(fieldKey) || (zod as any).isDatetime?.()) {
        return { kind: 'date', ops: ['eq','gte','lte','between'] };
      }
      return { kind: 'text', ops: ['contains','eq','startsWith','endsWith'] };
    }
    if (t === 'ZodNumber') return { kind: 'number', ops: ['eq','gte','lte','between'] };
    if (t === 'ZodBoolean') return { kind: 'boolean', ops: ['eq'] };

    // enums/unions of literals
    if (t === 'ZodEnum' || t === 'ZodNativeEnum') {
      const values = (zod as any)._def.values ?? Object.values((zod as any)._def.valuesMap ?? {});
      return {
        kind: 'enum',
        options: values.map((v: string) => ({ value: String(v), label: String(v) })),
        multi: true,
        ops: ['in','eq'],
      };
    }
  }

  // Fallback inference based on field names (without zod schema)
  const fieldLower = fieldKey.toLowerCase();
  
  // Date fields
  if (isDateishKey(fieldKey)) {
    return { kind: 'date', ops: ['eq','gte','lte','between'] };
  }
  
  // Number fields by common naming patterns
  if (/^(age|count|amount|price|balance|total|sum|quantity|qty|num|number)$/i.test(fieldLower) ||
      /(?:count|amount|price|balance|total|sum|quantity|qty|num|number|size|length|width|height|weight)$/i.test(fieldLower)) {
    return { kind: 'number', ops: ['eq','gte','lte','between'] };
  }
  
  // Boolean fields by common naming patterns
  if (/^(is|has|can|should|will|enable|active|visible|public|private|verified|confirmed)/.test(fieldLower) ||
      /(?:enabled|disabled|active|inactive|visible|hidden|public|private|verified|confirmed|approved|rejected)$/i.test(fieldLower)) {
    return { kind: 'boolean', ops: ['eq'] };
  }
  
  // Email fields
  if (/email/i.test(fieldLower)) {
    return { kind: 'text', ops: ['contains','eq','startsWith','endsWith'] };
  }
  
  // Status/type fields that are likely enums
  if (/(?:status|type|category|role|level|priority|state)$/i.test(fieldLower)) {
    // Return basic enum with common options - can be overridden with real data
    return {
      kind: 'enum',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ],
      multi: true,
      ops: ['in','eq'],
    };
  }
  
  // Default to text for unknown fields
  return { kind: 'text', ops: ['contains','eq','startsWith','endsWith'] };
}

// (Optional) helper to convert a NormalizedFilter into a plain params object
export function toServerFilterParam(columnId: string, nf: NormalizedFilter): Record<string, any> {
  // Keep in sync with your existing request builder; defaults below are generic
  switch (nf.kind) {
    case 'text':
      if (nf.op === 'contains')   return { [`${columnId}.like`]: `%${nf.value}%` };
      if (nf.op === 'startsWith') return { [`${columnId}.like`]: `${nf.value}%` };
      if (nf.op === 'endsWith')   return { [`${columnId}.like`]: `%${nf.value}` };
      return { [`${columnId}.eq`]: nf.value };
    case 'number':
      if (nf.op === 'between') return { [`${columnId}.gte`]: nf.value[0], [`${columnId}.lte`]: nf.value[1] };
      return { [`${columnId}.${nf.op}`]: nf.value };
    case 'date':
      if (nf.op === 'between') return { [`${columnId}.gte`]: nf.value[0], [`${columnId}.lte`]: nf.value[1] };
      return { [`${columnId}.${nf.op}`]: nf.value };
    case 'boolean':
      return { [`${columnId}.eq`]: nf.value ? 1 : 0 };
    case 'enum':
    case 'relation':
      if (Array.isArray(nf.value)) return { [`${columnId}.in`]: nf.value.join(',') };
      return { [`${columnId}.eq`]: nf.value };
  }
}