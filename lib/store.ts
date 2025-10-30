import { useKV } from '../hooks/useKV'
import { useState, useEffect } from 'react'

// Entity structure
export interface Entity {
  id: string
  type: string
  lastUpdated?: string
  // Financial metrics
  balance?: number
  marginLevel?: number      // percent (e.g., 125.5)
  openPnl?: number
  totalPnl?: number
  freeMargin?: number
  margin?: number
  equity?: number
  openVolume?: number
  docs?: {
    idPassportFile?: string
    idPassportFileName?: string
    idPassportFileSize?: number
    idPassportStatus?: string
    idPassportVerified?: boolean
    proofOfAddressFile?: string
    proofOfAddressFileName?: string
    proofOfAddressFileSize?: number
    proofOfAddressStatus?: string
    proofOfAddressVerified?: boolean
    ccFrontFile?: string
    ccFrontFileName?: string
    ccFrontFileSize?: number
    ccFrontStatus?: string
    ccFrontVerified?: boolean
    ccBackFile?: string
    ccBackFileName?: string
    ccBackFileSize?: number
    ccBackStatus?: string
    ccBackVerified?: boolean
  }
  address?: {
    line1?: string
    line2?: string
    zip?: string
    city?: string
    state?: string
  }
  [key: string]: any
}

// Legacy field configuration - kept for compatibility
export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'textarea'
  options?: string[]
  required?: boolean
}

// Legacy profile sections configuration - kept for compatibility
export interface ProfileSection {
  title: string
  fields: FieldConfig[]
}

// Track dirty state for saving indicator
interface DirtyState {
  [entityId: string]: {
    [fieldKey: string]: boolean
  }
}

// Store hook
export function useEntityStore() {
  const [entities, setEntities] = useKV<Entity[]>('entities', [])
  const [dirtyState, setDirtyState] = useState<DirtyState>({})

  // Clear dirty state after a delay to simulate saving
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirtyState({})
    }, 1500)

    return () => clearTimeout(timer)
  }, [dirtyState])

  // Selectors
  const selectEntityById = (id: string): Entity | undefined => {
    return entities?.find(entity => entity.id === id)
  }

  const selectEntitiesByType = (type: string): Entity[] => {
    return entities?.filter(entity => entity.type === type) || []
  }

  const isDirty = (entityId: string): boolean => {
    return Object.keys(dirtyState[entityId] || {}).length > 0
  }

  // Actions
  const upsertMany = (newEntities: Entity[]) => {
    setEntities(currentEntities => {
      const current = currentEntities || []
      const entityMap = new Map(current.map(e => [e.id, e]))
      
      newEntities.forEach(entity => {
        entityMap.set(entity.id, { ...entityMap.get(entity.id), ...entity })
      })
      
      return Array.from(entityMap.values())
    })
  }

  const updateField = ({ id, key, value }: { id: string, key: string, value: any }) => {
    // Mark as dirty
    setDirtyState(current => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: true
      }
    }))

    setEntities(currentEntities => 
      (currentEntities || []).map(entity => 
        entity.id === id ? { 
          ...entity, 
          [key]: value,
          lastUpdated: new Date().toISOString()
        } : entity
      )
    )
  }

  const updateNested = ({ id, path, value }: { id: string, path: string, value: any }) => {
    // Mark as dirty
    setDirtyState(current => ({
      ...current,
      [id]: {
        ...current[id],
        [path]: true
      }
    }))

    setEntities(currentEntities => 
      (currentEntities || []).map(entity => {
        if (entity.id !== id) return entity
        
        const updatedEntity = { ...entity, lastUpdated: new Date().toISOString() }
        const keys = path.split('.')
        let current = updatedEntity
        
        // Navigate to the parent of the target property
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {}
          }
          current = current[keys[i]]
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value
        
        return updatedEntity
      })
    )
  }

  return {
    entities,
    selectEntityById,
    selectEntitiesByType,
    upsertMany,
    updateField,
    updateNested,
    isDirty
  }
}

// Helper function to get nested value
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}