// Filter system types for dynamic filtering based on column definitions

export type Operator =
  | 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'
  | 'eq' | 'ne' | 'gt' | 'lt' | 'between'
  | 'on' | 'before' | 'after' // date
  | 'is' // bool

export type RuleValue = 
  | string 
  | number 
  | boolean 
  | { from?: string | number | Date; to?: string | number | Date } 
  | string[]

export interface Rule {
  columnId: string
  operator: Operator
  value?: RuleValue
}

export interface SavedView {
  id: string
  name: string
  filters: Rule[]
  visibleColumns: string[]
}

// Operators by column type
export const OPERATORS_BY_TYPE: Record<string, Operator[]> = {
  text: ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  email: ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  phone: ['contains', 'equals', 'isEmpty', 'isNotEmpty'],
  number: ['eq', 'ne', 'gt', 'lt', 'between', 'isEmpty', 'isNotEmpty'],
  money: ['eq', 'ne', 'gt', 'lt', 'between', 'isEmpty', 'isNotEmpty'],
  date: ['on', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  datetime: ['on', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  boolean: ['is'],
  select: ['equals', 'isEmpty', 'isNotEmpty'],
  rating: ['eq', 'ne', 'gt', 'lt', 'between', 'isEmpty', 'isNotEmpty'],
  calculated: ['eq', 'ne', 'gt', 'lt', 'between', 'isEmpty', 'isNotEmpty']
}

// Human-readable operator labels
export const OPERATOR_LABELS: Record<Operator, string> = {
  contains: 'Contains',
  equals: 'Equals',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  isEmpty: 'Is empty',
  isNotEmpty: 'Is not empty',
  eq: 'Equals',
  ne: 'Not equal',
  gt: 'Greater than',
  lt: 'Less than',
  between: 'Between',
  on: 'On',
  before: 'Before',
  after: 'After',
  is: 'Is'
}