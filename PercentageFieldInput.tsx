import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PercentageFieldInputProps {
  clientId: string
  fieldKey: string
  placeholder?: string
}

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function PercentageFieldInput({ clientId, fieldKey, placeholder }: PercentageFieldInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  
  // Handle nested keys like 'address.city'
  const currentValue = fieldKey.includes('.') ? getNestedValue(entity, fieldKey) || '' : (entity as any)?.[fieldKey] || ''
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove any non-numeric characters except decimal points
    value = value.replace(/[^\d.]/g, '')
    
    // Convert to number for storage
    const numValue = parseFloat(value) || 0
    
    dispatch(updateEntityField({ id: clientId, key: fieldKey as any, value: numValue }))
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between w-full group">
        <span 
          className="text-sm text-gray-600 truncate flex-1"
          style={{ 
            fontWeight: 400,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {currentValue ? `${currentValue}%` : placeholder || '0%'}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 hover:bg-gray-100 rounded-md"
        >
          <PencilIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center flex-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
        <input
          type="text"
          className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
          style={{ 
            fontWeight: 400,
            fontFamily: 'Poppins, sans-serif'
          }}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus
        />
        <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 border-l border-gray-200">
          %
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <CheckIcon className="h-3 w-3 text-gray-600" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <XMarkIcon className="h-3 w-3 text-gray-600" />
        </button>
      </div>
    </div>
  )
}