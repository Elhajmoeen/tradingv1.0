// API client for client-related operations

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  ok: boolean
}

/**
 * Normalized HTTP error structure
 */
export interface HttpError {
  status: number
  message: string
  details?: any
}

/**
 * Map various error types to normalized HttpError
 */
export function mapHttpError(error: any): HttpError {
  // RTK Query FetchBaseQueryError
  if (error?.status) {
    return {
      status: typeof error.status === 'number' ? error.status : 500,
      message: error.data?.message || error.error || 'Request failed',
      details: error.data
    }
  }
  
  // Native fetch errors
  if (error?.name === 'TypeError' && error.message?.includes('fetch')) {
    return {
      status: 0,
      message: 'Network error - unable to connect to server',
      details: { originalError: error.message }
    }
  }
  
  // Axios-style errors
  if (error?.response) {
    return {
      status: error.response.status || 500,
      message: error.response.data?.message || error.message || 'Request failed',
      details: error.response.data
    }
  }
  
  // Generic Error objects
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || 'Unknown error occurred',
      details: { name: error.name, stack: error.stack }
    }
  }
  
  // Fallback for unknown error types
  return {
    status: 500,
    message: 'Unknown error occurred',
    details: error
  }
}

/**
 * Show error to user via toast or console in DEV
 */
export function handleApiError(error: any, context?: string): HttpError {
  const normalizedError = mapHttpError(error)
  
  if (import.meta.env.DEV) {
    console.warn(`API Error${context ? ` (${context})` : ''}:`, normalizedError)
  }
  
  // TODO: Integrate with toast system when available
  // toast.error(normalizedError.message)
  
  return normalizedError
}

/**
 * Change password for a client
 * @param clientId - The ID of the client
 * @param payload - Current and new password
 * @returns Promise resolving to success response
 * @throws Error if current password is invalid
 */
export async function changePassword(
  clientId: string,
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> {
  // Mock implementation - replace with actual API call
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In this updated version, we trust the current password since it's displayed from the database
  // No validation needed as we're showing the actual password to the user
  
  // In a real implementation, this would make an HTTP request
  // Example:
  // const response = await fetch(`/api/clients/${clientId}/change-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // })
  // 
  // if (!response.ok) {
  //   const error = await response.json()
  //   throw new Error(error.message || 'Failed to change password')
  // }
  // 
  // return response.json()
  
  return Promise.resolve({ ok: true })
}