export type FilterOp =
  | 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith'
  | 'gte' | 'lte' | 'between' | 'in';

export type NormalizedFilter =
  | { kind: 'text';    op: 'contains'|'eq'|'startsWith'|'endsWith'; value: string }
  | { kind: 'number';  op: 'eq'|'gte'|'lte'|'between';              value: number | [number, number] }
  | { kind: 'date';    op: 'eq'|'gte'|'lte'|'between';              value: string | [string, string] } // ISO strings
  | { kind: 'boolean'; op: 'eq';                                    value: boolean }
  | { kind: 'enum';    op: 'in'|'eq';                               value: string[] | string }
  | { kind: 'relation';op: 'in'|'eq';                               value: string[] | string; labelKey?: string };