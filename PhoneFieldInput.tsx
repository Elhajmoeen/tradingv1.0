import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toDigits, formatPhoneDisplay } from '@/config/phone'

interface PhoneFieldInputProps {
  clientId: string
  fieldKey: string // 'phoneNumber' or 'phoneNumber2'
}

export function PhoneFieldInput({ clientId, fieldKey }: PhoneFieldInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  const [countryCode, setCountryCode] = useState('')
  const [number, setNumber] = useState('')
  
  // Get phone data - support both new object format and legacy string format
  const phoneData = (entity as any)?.[fieldKey]
  const phoneField = fieldKey === 'phoneNumber' ? 'phone' : 'phone2'
  const phoneObject = (entity as any)?.[phoneField]
  
  // Initialize local state from entity data
  useEffect(() => {
    if (phoneObject && typeof phoneObject === 'object') {
      // New object format
      setCountryCode(phoneObject.countryCode || '')
      setNumber(phoneObject.number || '')
    } else if (phoneData && typeof phoneData === 'string') {
      // Legacy string format - try to parse
      const digits = toDigits(phoneData)
      if (digits) {
        // Simple heuristic: if starts with common codes, split them
        if (digits.startsWith('971') && digits.length > 3) {
          setCountryCode('971')
          setNumber(digits.slice(3))
        } else if (digits.startsWith('1') && digits.length === 11) {
          setCountryCode('1')
          setNumber(digits.slice(1))
        } else {
          setCountryCode('')
          setNumber(digits)
        }
      } else {
        setCountryCode('')
        setNumber('')
      }
    } else {
      setCountryCode('')
      setNumber('')
    }
  }, [phoneData, phoneObject])

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = toDigits(e.target.value)
    setCountryCode(code)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = toDigits(e.target.value)
    setNumber(num)
  }

  const handleSave = () => {
    // Save as new phone object format with manual override flag if country code was edited
    const phoneObj = {
      countryCode: countryCode,
      number: number,
      manualCC: true // Mark as manually edited to prevent auto-fill override
    }
    
    dispatch(updateEntityField({ 
      id: clientId, 
      key: phoneField as any, 
      value: phoneObj 
    }))
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset to original values
    if (phoneObject && typeof phoneObject === 'object') {
      setCountryCode(phoneObject.countryCode || '')
      setNumber(phoneObject.number || '')
    } else if (phoneData && typeof phoneData === 'string') {
      const digits = toDigits(phoneData)
      setCountryCode('')
      setNumber(digits)
    } else {
      setCountryCode('')
      setNumber('')
    }
    setIsEditing(false)
  }

  const getDisplayValue = () => {
    if (phoneObject && typeof phoneObject === 'object') {
      return formatPhoneDisplay(phoneObject)
    } else if (phoneData && typeof phoneData === 'string') {
      return phoneData
    }
    return 'Not Set'
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
          {getDisplayValue()}
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
        type="tel"
        className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm"
        style={{ 
          fontWeight: 400,
          fontFamily: 'Poppins, sans-serif'
        }}
        value={countryCode}
        onChange={handleCountryCodeChange}
        placeholder="Code"
      />
      <input
        type="tel"
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white shadow-sm"
        style={{ 
          fontWeight: 400,
          fontFamily: 'Poppins, sans-serif'
        }}
        value={number}
        onChange={handleNumberChange}
        placeholder="Phone number"
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