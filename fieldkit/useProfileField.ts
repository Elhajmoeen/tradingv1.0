import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../state/store'
import { selectEntityById, updateEntityField } from '../state/entitiesSlice'
import type { EntityFieldKey } from './types'
import { normalizeOnCommit } from './normalize'

/**
 * Hook for managing field values in Profile forms
 * Provides unified interface for field updates with normalization
 * 
 * @param clientId - The entity ID to update
 * @param fieldKey - The field key to manage
 * @returns Object with current value and update functions
 */
export function useProfileField(clientId: string, fieldKey: EntityFieldKey) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector((state: RootState) => selectEntityById(clientId)(state))
  
  // Get current field value
  const value = entity?.[fieldKey] || ''
  
  // Update field value in Redux store
  const updateField = useCallback((newValue: any) => {
    // Apply commit-level normalization before saving to store
    const normalizedValue = normalizeOnCommit(fieldKey, newValue)
    
    dispatch(updateEntityField({
      id: clientId,
      key: fieldKey,
      value: normalizedValue
    }))
  }, [dispatch, clientId, fieldKey])
  
  // Optimistic update for UI responsiveness
  const updateFieldOptimistic = useCallback((newValue: any) => {
    // For immediate UI updates, use the raw value
    // The normalized value will be applied on blur/submit
    dispatch(updateEntityField({
      id: clientId,
      key: fieldKey,
      value: newValue
    }))
  }, [dispatch, clientId, fieldKey])
  
  return {
    value,
    updateField,
    updateFieldOptimistic,
    // For compatibility with existing field components
    setValue: updateField,
    setValueOptimistic: updateFieldOptimistic
  }
}

export default useProfileField