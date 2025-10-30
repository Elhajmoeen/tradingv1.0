import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface SelectFieldInputProps {
  clientId: string
  fieldKey: string
  options: { label: string; value: string }[]
  defaultValue?: string
}

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export function SelectFieldInput({ clientId, fieldKey, options, defaultValue }: SelectFieldInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Handle nested keys like 'address.city'
  const currentValue = fieldKey.includes('.') ? getNestedValue(entity, fieldKey) || '' : (entity as any)?.[fieldKey] || ''
  
  const handleOptionSelect = (value: string) => {
    dispatch(updateEntityField({ id: clientId, key: fieldKey as any, value }))
    setIsEditing(false)
    setIsDropdownOpen(false)
  }

  const getCurrentDisplayValue = () => {
    const option = options.find(opt => opt.value === currentValue)
    return option ? option.label : (options.find(opt => opt.value === defaultValue)?.label || 'Not Set')
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
          {getCurrentDisplayValue()}
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
      <div className="relative flex-1">
        <div 
          className="flex items-center justify-between w-full cursor-pointer bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span 
            className="text-sm text-gray-600"
            style={{ 
              fontWeight: 400,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {getCurrentDisplayValue()}
          </span>
          <ChevronDownIcon 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-gray-600 ${
                    currentValue === option.value ? 'bg-blue-50' : ''
                  }`}
                  style={{ 
                    fontWeight: 400,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px'
                  }}
                >
                  <div className="flex items-center justify-between">
                    {option.label}
                    {currentValue === option.value && (
                      <CheckIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            setIsEditing(false)
            setIsDropdownOpen(false)
          }}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <CheckIcon className="h-3 w-3 text-gray-600" />
        </button>
        <button
          onClick={() => {
            setIsEditing(false)
            setIsDropdownOpen(false)
          }}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <XMarkIcon className="h-3 w-3 text-gray-600" />
        </button>
      </div>
    </div>
  )
}