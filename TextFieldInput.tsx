import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TextFieldInputProps {
  clientId: string
  fieldKey: string
  placeholder?: string
  type?: 'text' | 'email' | 'phone'
}

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function TextFieldInput({ clientId, fieldKey, placeholder, type = 'text' }: TextFieldInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  
  // Handle nested keys like 'address.city'
  const currentValue = fieldKey.includes('.') ? getNestedValue(entity, fieldKey) || '' : (entity as any)?.[fieldKey] || ''
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Apply basic formatting/validation based on field type
    if (type === 'email') {
      value = value.trim() || ''
    } else if (type === 'phone') {
      // Keep only digits for phone fields
      value = value.replace(/\D+/g, '')
    }
    
    dispatch(updateEntityField({ id: clientId, key: fieldKey as any, value }))
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
          {currentValue || placeholder || 'Not Set'}
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
      <input
        type={type === 'phone' ? 'tel' : type}
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm"
        style={{ 
          fontWeight: 400,
          fontFamily: 'Poppins, sans-serif'
        }}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus
      />
      
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