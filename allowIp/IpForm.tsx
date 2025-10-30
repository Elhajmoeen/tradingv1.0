import React, { useState, useEffect } from 'react'
import { AllowIp } from '@/state/allowIpSlice'
import { isValidIp } from '@/utils/ipValidation'

interface IpFormProps {
  initialValues?: Partial<AllowIp>
  onSubmit: (values: { ip: string; description?: string }) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

export default function IpForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save'
}: IpFormProps) {
  const [ip, setIp] = useState(initialValues?.ip || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [errors, setErrors] = useState<{ ip?: string; description?: string }>({})

  // Validate form
  const validateForm = () => {
    const newErrors: { ip?: string; description?: string } = {}

    // Validate IP address
    if (!ip.trim()) {
      newErrors.ip = 'IP address is required'
    } else if (!isValidIp(ip.trim())) {
      newErrors.ip = 'Please enter a valid IPv4 or IPv6 address'
    }

    // Validate description length
    if (description && description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit({
        ip: ip.trim(),
        description: description.trim() || undefined,
      })
    }
  }

  // Real-time IP validation
  const handleIpChange = (value: string) => {
    setIp(value)
    if (errors.ip && value.trim() && isValidIp(value.trim())) {
      setErrors(prev => ({ ...prev, ip: undefined }))
    }
  }

  // Real-time description validation
  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (errors.description && value.length <= 200) {
      setErrors(prev => ({ ...prev, description: undefined }))
    }
  }

  const isValid = !errors.ip && !errors.description && ip.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* IP Address Field */}
      <div>
        <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-2">
          IP Address *
        </label>
        <input
          id="ip"
          type="text"
          value={ip}
          onChange={(e) => handleIpChange(e.target.value)}
          onBlur={validateForm}
          className={`h-9 w-full rounded-lg border px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.ip 
              ? 'border-red-500 bg-red-50 focus:border-red-500' 
              : 'border-gray-300 bg-white focus:border-blue-500'
          }`}
          placeholder="e.g., 192.168.1.100 or 2001:db8::1"
          disabled={isLoading}
        />
        {errors.ip && (
          <p className="mt-1 text-xs text-red-600">{errors.ip}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter a valid IPv4 (e.g., 192.168.1.1) or IPv6 (e.g., 2001:db8::1) address
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          onBlur={validateForm}
          rows={3}
          maxLength={200}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description 
              ? 'border-red-500 bg-red-50 focus:border-red-500' 
              : 'border-gray-300 bg-white focus:border-blue-500'
          }`}
          placeholder="Optional description for this IP address (max 200 characters)"
          disabled={isLoading}
        />
        <div className="mt-1 flex justify-between items-center">
          <div>
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>
          <p className={`text-xs ${description.length > 180 ? 'text-orange-600' : 'text-gray-500'}`}>
            {description.length}/200
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}

// Modal wrapper components
interface AddIpModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: { ip: string; description?: string }) => void
  isLoading?: boolean
}

export function AddIpModal({ isOpen, onClose, onSubmit, isLoading }: AddIpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add IP Address</h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <IpForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            submitLabel="Add IP"
          />
        </div>
      </div>
    </div>
  )
}

interface EditIpModalProps {
  isOpen: boolean
  allowIp: AllowIp | null
  onClose: () => void
  onSubmit: (values: { ip: string; description?: string }) => void
  isLoading?: boolean
}

export function EditIpModal({ isOpen, allowIp, onClose, onSubmit, isLoading }: EditIpModalProps) {
  if (!isOpen || !allowIp) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit IP Address</h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <IpForm
            initialValues={allowIp}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            submitLabel="Update IP"
          />
        </div>
      </div>
    </div>
  )
}