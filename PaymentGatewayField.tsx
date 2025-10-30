import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { selectActivePaymentGatewayOptions, selectGatewayById } from '@/selectors/paymentGatewayOptions'
import { PencilIcon, CheckIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface PaymentGatewayFieldProps {
  clientId: string
}

export function PaymentGatewayField({ clientId }: PaymentGatewayFieldProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const paymentGatewayOptions = useSelector(selectActivePaymentGatewayOptions)
  const current = entity?.finance?.ftd?.paymentMethod || ''
  const currentGateway = useSelector(selectGatewayById(current))
  const [isEditing, setIsEditing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const PAYMENT_GATEWAY_OPTIONS_WITH_DEFAULT = [
    { value: '', label: 'Not Set' },
    ...paymentGatewayOptions.map(gateway => ({ 
      value: gateway.value, 
      label: gateway.label 
    }))
  ]

  // Get all gateways for status checking
  const allGateways = useSelector((state: RootState) => state.paymentGateways.items)

  const handleOptionSelect = (value: string) => {
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'finance.ftd.paymentMethod', 
      value: value 
    }))
    setIsEditing(false)
    setIsDropdownOpen(false)
  }

  const getCurrentDisplayValue = () => {
    if (!current) return 'Not Set'
    
    const option = PAYMENT_GATEWAY_OPTIONS_WITH_DEFAULT.find(opt => opt.value === current)
    if (option && option.value === '') return 'Not Set'
    
    const isDisabled = currentGateway && !currentGateway.isActive
    const isDeleted = current && !currentGateway // Gateway was deleted from admin
    
    if (isDeleted) return `${current} (DELETED)`
    if (isDisabled) return `${current} (DISABLED)`
    
    return option ? option.label : current
  }

  if (!isEditing) {
    const isDisabled = currentGateway && !currentGateway.isActive
    const isDeleted = current && !currentGateway

    return (
      <div className="flex items-center justify-between w-full group">
        <div className="flex items-center gap-2 truncate flex-1">
          <span 
            className={`text-sm truncate ${isDeleted || isDisabled ? 'text-gray-500' : 'text-gray-600'}`}
            style={{ 
              fontWeight: 400,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {current || 'Not Set'}
          </span>
          {isDeleted && (
            <span className="inline-flex items-center px-1 py-0 text-[10px] font-medium bg-red-100 text-red-700 rounded border border-red-200">
              DELETED
            </span>
          )}
          {isDisabled && !isDeleted && (
            <span className="inline-flex items-center px-1 py-0 text-[10px] font-medium bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
              DISABLED
            </span>
          )}
        </div>
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
              {PAYMENT_GATEWAY_OPTIONS_WITH_DEFAULT.map((option) => {
                const gateway = option.value ? allGateways.find(g => g.id === option.value) : null
                const isDisabled = gateway && !gateway.isActive
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      current === option.value ? 'bg-blue-50' : ''
                    } ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}
                    style={{ 
                      fontWeight: 400,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{option.label}</span>
                        {isDisabled && (
                          <span className="inline-flex items-center px-1 py-0 text-[9px] font-medium bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                            DISABLED
                          </span>
                        )}
                      </div>
                      {current === option.value && (
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                )
              })}
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