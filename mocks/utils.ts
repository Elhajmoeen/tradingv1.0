/**
 * Mock utilities for MSW handlers
 * Provides helpers for query parsing, pagination, sorting, and filtering
 */

export interface QueryParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  filter?: Record<string, any>
  accountId?: string  // Preferred identifier
  clientId?: string   // Backward compatibility
  [key: string]: any
}

/**
 * Parse query parameters from URL search params
 */
export function parseQuery(url: URL): QueryParams {
  const params: QueryParams = {}
  
  // Parse basic pagination
  const page = url.searchParams.get('page')
  const pageSize = url.searchParams.get('pageSize')
  const sort = url.searchParams.get('sort')
  const order = url.searchParams.get('order')
  const accountId = url.searchParams.get('accountId')
  const clientId = url.searchParams.get('clientId')
  
  if (page) params.page = parseInt(page, 10)
  if (pageSize) params.pageSize = parseInt(pageSize, 10)
  if (sort) params.sort = sort
  if (order && (order === 'asc' || order === 'desc')) params.order = order
  if (accountId) params.accountId = accountId
  if (clientId) params.clientId = clientId
  
  // Parse filter parameters (anything else becomes a filter)
  for (const [key, value] of url.searchParams.entries()) {
    if (!['page', 'pageSize', 'sort', 'order', 'accountId', 'clientId'].includes(key)) {
      if (!params.filter) params.filter = {}
      // Try to parse as number, boolean, or keep as string
      if (value === 'true') params.filter[key] = true
      else if (value === 'false') params.filter[key] = false
      else if (!isNaN(Number(value))) params.filter[key] = Number(value)
      else params.filter[key] = value
    }
  }
  
  return params
}

/**
 * Filter array based on filter object
 */
export function filterArray<T extends Record<string, any>>(
  items: T[], 
  filter?: Record<string, any>
): T[] {
  if (!filter || Object.keys(filter).length === 0) return items
  
  return items.filter(item => {
    return Object.entries(filter).every(([key, value]) => {
      const itemValue = item[key]
      
      // Exact match for booleans and numbers
      if (typeof value === 'boolean' || typeof value === 'number') {
        return itemValue === value
      }
      
      // String contains match (case insensitive)
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      // Array includes match
      if (Array.isArray(itemValue)) {
        return itemValue.includes(value)
      }
      
      return itemValue === value
    })
  })
}

/**
 * Sort array based on sort field and order
 */
export function sortArray<T extends Record<string, any>>(
  items: T[], 
  sort?: string, 
  order: 'asc' | 'desc' = 'asc'
): T[] {
  if (!sort) return items
  
  return [...items].sort((a, b) => {
    const aValue = a[sort]
    const bValue = b[sort]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return order === 'asc' ? -1 : 1
    if (bValue == null) return order === 'asc' ? 1 : -1
    
    // Handle different types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return order === 'asc' ? comparison : -comparison
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue
      return order === 'asc' ? comparison : -comparison
    }
    
    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      const comparison = aValue.getTime() - bValue.getTime()
      return order === 'asc' ? comparison : -comparison
    }
    
    // Handle ISO date strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = new Date(aValue).getTime()
      const bDate = new Date(bValue).getTime()
      if (!isNaN(aDate) && !isNaN(bDate)) {
        const comparison = aDate - bDate
        return order === 'asc' ? comparison : -comparison
      }
    }
    
    // Fallback to string comparison
    const comparison = String(aValue).localeCompare(String(bValue))
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * Paginate array
 */
export function paginateArray<T>(
  items: T[], 
  page: number = 1, 
  pageSize: number = 10
): T[] {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return items.slice(startIndex, endIndex)
}

/**
 * Apply all query operations: filter, sort, paginate
 */
export function processQuery<T extends Record<string, any>>(
  items: T[], 
  query: QueryParams
): { data: T[], total: number, page: number, pageSize: number } {
  let processed = items
  
  // Apply filters
  if (query.filter) {
    processed = filterArray(processed, query.filter)
  }
  
  // Filter by accountId/clientId if provided (prefer accountId)
  if (query.accountId && 'accountId' in processed[0]) {
    processed = processed.filter(item => item.accountId === query.accountId)
  } else if (query.clientId) {
    // Check both accountId and clientId fields for backward compatibility
    processed = processed.filter(item => 
      item.accountId === query.clientId || item.clientId === query.clientId
    )
  }
  
  const total = processed.length
  
  // Apply sorting
  if (query.sort) {
    processed = sortArray(processed, query.sort, query.order)
  }
  
  // Apply pagination
  const page = query.page || 1
  const pageSize = query.pageSize || 10
  processed = paginateArray(processed, page, pageSize)
  
  return {
    data: processed,
    total,
    page,
    pageSize
  }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Generate a random date within the last N days
 */
export function randomDateWithinDays(days: number): string {
  const now = new Date()
  const pastDate = new Date(now.getTime() - (Math.random() * days * 24 * 60 * 60 * 1000))
  return pastDate.toISOString()
}

/**
 * Pick random item from array
 */
export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * Generate random number between min and max
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}