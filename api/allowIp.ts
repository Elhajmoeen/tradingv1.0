// Allow IP API stub - Future backend integration
// This module provides type-safe API interfaces that can be easily replaced with real HTTP calls

import { AllowIp } from '@/state/allowIpSlice'

// API request/response types
export interface CreateAllowIpRequest {
  ip: string
  description?: string
}

export interface UpdateAllowIpRequest {
  id: string
  ip?: string
  description?: string
}

export interface SetAllowIpActiveRequest {
  id: string
  isActive: boolean
}

export interface ListAllowIpsResponse {
  data: AllowIp[]
  total: number
  page: number
  pageSize: number
}

export interface AllowIpApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Mock API functions (to be replaced with real HTTP calls)
export const allowIpApi = {
  /**
   * Fetch all allowed IPs with optional filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to list of allowed IPs
   */
  async list(params?: {
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
  }): Promise<ListAllowIpsResponse> {
    // TODO: Replace with real API call
    // return fetch('/api/admin/allow-ips', { ... })
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate network delay
    
    console.log('AllowIp API: list() called with params:', params)
    
    // This would typically return data from the server
    // For now, return empty response as Redux state manages local data
    return {
      data: [],
      total: 0,
      page: params?.page || 1,
      pageSize: params?.pageSize || 25,
    }
  },

  /**
   * Create a new allowed IP entry
   * @param request - IP address and optional description
   * @returns Promise resolving to created AllowIp
   */
  async create(request: CreateAllowIpRequest): Promise<AllowIp> {
    // TODO: Replace with real API call
    // return fetch('/api/admin/allow-ips', { method: 'POST', body: JSON.stringify(request) })
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('AllowIp API: create() called with:', request)
    
    // Mock response - in real implementation, server would generate ID and timestamps
    const mockResponse: AllowIp = {
      id: `api_${Date.now()}`,
      ip: request.ip,
      description: request.description,
      createdOn: new Date().toISOString(),
      createdBy: 'API User', // Would come from auth context
      updatedOn: new Date().toISOString(),
      isActive: true,
    }
    
    return mockResponse
  },

  /**
   * Update an existing allowed IP entry
   * @param request - ID and fields to update
   * @returns Promise resolving to updated AllowIp
   */
  async update(request: UpdateAllowIpRequest): Promise<AllowIp> {
    // TODO: Replace with real API call
    // return fetch(`/api/admin/allow-ips/${request.id}`, { method: 'PATCH', body: JSON.stringify(request) })
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    console.log('AllowIp API: update() called with:', request)
    
    // Mock response - server would return updated record
    throw new Error('Update API not implemented - using optimistic Redux updates')
  },

  /**
   * Set active/inactive status for an allowed IP
   * @param request - ID and new active status
   * @returns Promise resolving to updated AllowIp
   */
  async setActive(request: SetAllowIpActiveRequest): Promise<AllowIp> {
    // TODO: Replace with real API call
    // return fetch(`/api/admin/allow-ips/${request.id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive: request.isActive }) })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('AllowIp API: setActive() called with:', request)
    
    // Mock response
    throw new Error('SetActive API not implemented - using optimistic Redux updates')
  },

  /**
   * Delete an allowed IP entry
   * @param id - ID of the IP to delete
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    // TODO: Replace with real API call
    // return fetch(`/api/admin/allow-ips/${id}`, { method: 'DELETE' })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('AllowIp API: delete() called with ID:', id)
    
    // Mock implementation
    return
  },

  /**
   * Bulk operations on multiple IPs
   * @param operation - Type of bulk operation
   * @param ids - Array of IP IDs to operate on
   * @returns Promise resolving to operation results
   */
  async bulkOperation(
    operation: 'enable' | 'disable' | 'delete',
    ids: string[]
  ): Promise<{ success: string[], failed: string[] }> {
    // TODO: Replace with real API call
    // return fetch('/api/admin/allow-ips/bulk', { method: 'POST', body: JSON.stringify({ operation, ids }) })
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('AllowIp API: bulkOperation() called with:', { operation, ids })
    
    // Mock response - assume all succeed for now
    return {
      success: ids,
      failed: []
    }
  },
}

// Error handling utilities
export const isAllowIpApiError = (error: any): error is AllowIpApiError => {
  return error && typeof error === 'object' && 'code' in error && 'message' in error
}

export const handleAllowIpApiError = (error: unknown): string => {
  if (isAllowIpApiError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unknown error occurred'
}

// Future integration notes:
// 1. Replace mock functions with real HTTP calls using fetch/axios
// 2. Add proper error handling for network failures, validation errors
// 3. Implement authentication headers from user context
// 4. Add request/response logging for debugging
// 5. Consider adding request caching and retry logic
// 6. Add TypeScript types for server response formats
// 7. Integrate with Redux Toolkit Query for advanced caching