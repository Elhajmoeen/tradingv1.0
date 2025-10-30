import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { selectEntityById, updateDesk } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { optionsByKey } from '@/fieldkit'

interface DeskFieldProps {
  clientId: string
}

export function DeskField({ clientId }: DeskFieldProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const current = entity?.desk || ''
  const [isEditing, setIsEditing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Use unified options system - fallback to static for desk since it's dynamic
  const unifiedOptions = useSelector((state: RootState) => optionsByKey(state, 'desk'))
  const staticDeskOptions = [
    { value: 'arabic desk', label: 'Arabic Desk' },
    { value: 'english desk', label: 'English Desk' },
    { value: 'french desk', label: 'French Desk' },
    { value: 'sales desk a', label: 'Sales Desk A' },
    { value: 'sales desk b', label: 'Sales Desk B' },
    { value: 'sales desk c', label: 'Sales Desk C' }
  ]
  const DESK_OPTIONS = [
    { value: '', label: 'Not Set' },
    ...(unifiedOptions.length > 0 ? unifiedOptions.map(opt => ({ value: String(opt.value), label: opt.label })) : staticDeskOptions)
  ]

  const handleOptionSelect = (value: string) => {
    dispatch(updateDesk({ id: clientId, value }))
    setIsEditing(false)
    setIsDropdownOpen(false)
  }

  const getCurrentDisplayValue = () => {
    const option = DESK_OPTIONS.find(opt => opt.value === current)
    return option ? option.label : 'Not Set'
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
              {DESK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-gray-600 ${
                    current === option.value ? 'bg-blue-50' : ''
                  }`}
                  style={{ 
                    fontWeight: 400,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px'
                  }}
                >
                  <div className="flex items-center justify-between">
                    {option.label}
                    {current === option.value && (
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
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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