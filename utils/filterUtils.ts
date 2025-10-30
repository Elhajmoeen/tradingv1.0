import { Rule, Operator, RuleValue, SavedView } from '@/types/filter'
import { ColumnDefinition } from '@/components/ColumnsDrawer'

// Helper function to get nested values from objects (already exists in LeadsPage, reusing here)
export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Safe type coercion helpers
export const coerceToNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

export const coerceToDate = (value: any): Date | null => {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

export const coerceToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === 'yes' || lower === '1'
  }
  return !!value
}

// Apply a single rule to a value
export const applyRule = (rawValue: any, rule: Rule): boolean => {
  const { operator, value: ruleValue } = rule

  // Handle isEmpty and isNotEmpty for any type
  if (operator === 'isEmpty') {
    return rawValue === null || rawValue === undefined || rawValue === ''
  }
  if (operator === 'isNotEmpty') {
    return rawValue !== null && rawValue !== undefined && rawValue !== ''
  }

  // If value is empty and we're not checking for emptiness, return false
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return false
  }

  // Text operations
  if (operator === 'contains') {
    return String(rawValue).toLowerCase().includes(String(ruleValue).toLowerCase())
  }
  if (operator === 'equals') {
    return String(rawValue).toLowerCase() === String(ruleValue).toLowerCase()
  }
  if (operator === 'startsWith') {
    return String(rawValue).toLowerCase().startsWith(String(ruleValue).toLowerCase())
  }
  if (operator === 'endsWith') {
    return String(rawValue).toLowerCase().endsWith(String(ruleValue).toLowerCase())
  }

  // Number operations
  if (['eq', 'ne', 'gt', 'lt', 'between'].includes(operator)) {
    const numValue = coerceToNumber(rawValue)
    if (numValue === null) return false

    if (operator === 'eq') {
      const targetNum = coerceToNumber(ruleValue)
      return targetNum !== null && numValue === targetNum
    }
    if (operator === 'ne') {
      const targetNum = coerceToNumber(ruleValue)
      return targetNum !== null && numValue !== targetNum
    }
    if (operator === 'gt') {
      const targetNum = coerceToNumber(ruleValue)
      return targetNum !== null && numValue > targetNum
    }
    if (operator === 'lt') {
      const targetNum = coerceToNumber(ruleValue)
      return targetNum !== null && numValue < targetNum
    }
    if (operator === 'between' && typeof ruleValue === 'object' && ruleValue !== null && 'from' in ruleValue) {
      const fromNum = coerceToNumber(ruleValue.from)
      const toNum = coerceToNumber(ruleValue.to)
      if (fromNum === null || toNum === null) return false
      return numValue >= fromNum && numValue <= toNum
    }
  }

  // Date operations
  if (['on', 'before', 'after', 'between'].includes(operator)) {
    const dateValue = coerceToDate(rawValue)
    if (dateValue === null) return false

    if (operator === 'on') {
      const targetDate = coerceToDate(ruleValue)
      if (targetDate === null) return false
      // Compare dates without time (same day)
      return dateValue.toDateString() === targetDate.toDateString()
    }
    if (operator === 'before') {
      const targetDate = coerceToDate(ruleValue)
      return targetDate !== null && dateValue < targetDate
    }
    if (operator === 'after') {
      const targetDate = coerceToDate(ruleValue)
      return targetDate !== null && dateValue > targetDate
    }
    if (operator === 'between' && typeof ruleValue === 'object' && ruleValue !== null && 'from' in ruleValue) {
      const fromDate = coerceToDate(ruleValue.from)
      const toDate = coerceToDate(ruleValue.to)
      if (fromDate === null || toDate === null) return false
      return dateValue >= fromDate && dateValue <= toDate
    }
  }

  // Boolean operations
  if (operator === 'is') {
    const boolValue = coerceToBoolean(rawValue)
    const targetBool = coerceToBoolean(ruleValue)
    return boolValue === targetBool
  }

  return false
}

// Apply all rules to a single row (AND logic)
export const applyRulesToRow = (row: any, rules: Rule[], columnDefs: ColumnDefinition[]): boolean => {
  if (rules.length === 0) return true

  return rules.every(rule => {
    const column = columnDefs.find(col => col.id === rule.columnId)
    if (!column) return true // Skip invalid rules

    const rawValue = getNestedValue(row, column.path)
    return applyRule(rawValue, rule)
  })
}

// Get distinct values for select-type columns
export const getDistinctValues = (data: any[], columnPath: string): string[] => {
  const values = new Set<string>()
  
  data.forEach(row => {
    const value = getNestedValue(row, columnPath)
    if (value !== null && value !== undefined && value !== '') {
      values.add(String(value))
    }
  })
  
  return Array.from(values).sort()
}

// Storage utilities for saved views
const VIEWS_STORAGE_KEY = 'leads.views.v1'
const LAST_VIEW_STORAGE_KEY = 'leads.views.last'

export const loadSavedViews = (): SavedView[] => {
  try {
    const saved = localStorage.getItem(VIEWS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const saveSavedViews = (views: SavedView[]): void => {
  localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views))
}

export const getLastAppliedViewId = (): string | null => {
  return localStorage.getItem(LAST_VIEW_STORAGE_KEY)
}

export const setLastAppliedViewId = (viewId: string | null): void => {
  if (viewId) {
    localStorage.setItem(LAST_VIEW_STORAGE_KEY, viewId)
  } else {
    localStorage.removeItem(LAST_VIEW_STORAGE_KEY)
  }
}

// Generate a unique ID for views
export const generateViewId = (): string => {
  return `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}