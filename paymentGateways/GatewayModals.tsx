import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { X } from '@phosphor-icons/react'
import { Gateway, isUniqueGatewayName } from '@/state/paymentGatewaysSlice'
import { isValidUrl, getUrlValidationError, normalizeUrl } from '@/utils/urlValidation'
import type { RootState } from '@/state/store'

interface AddGatewayModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: {
    name: string
    provider?: string
    currency?: string
    links?: Partial<Gateway['links']>
  }) => void
  isLoading?: boolean
}

export function AddGatewayModal({ isOpen, onClose, onSubmit, isLoading }: AddGatewayModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    currency: '',
    links: {
      a500: '',
      a1000: '',
      a2500: '',
      a3000: '',
      a5000: '',
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        provider: '',
        currency: '',
        links: {
          a500: '',
          a1000: '',
          a2500: '',
          a3000: '',
          a5000: '',
        }
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Gateway name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Gateway name must be at least 2 characters'
    }

    // Validate URLs
    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && value.trim()) {
        const urlError = getUrlValidationError(value.trim())
        if (urlError) {
          newErrors[key] = urlError
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Normalize URLs and filter out empty ones
    const normalizedLinks: Partial<Gateway['links']> = {}
    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && value.trim()) {
        normalizedLinks[key as keyof Gateway['links']] = normalizeUrl(value)
      }
    })

    onSubmit({
      name: formData.name.trim(),
      provider: formData.provider.trim() || undefined,
      currency: formData.currency.trim() || undefined,
      links: normalizedLinks,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Payment Gateway</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gateway Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Checkout.com USD"
                  required
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Checkout.com"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., USD, EUR, AED"
                />
              </div>
            </div>

            {/* Payment Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Links</h3>
              <div className="space-y-3">
                {Object.entries(formData.links).map(([key, value]) => {
                  const amount = key.replace('a', '')
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {amount} Link
                      </label>
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          links: { ...prev.links, [key]: e.target.value }
                        }))}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                      {errors[key] && (
                        <p className="text-xs text-red-600 mt-1">{errors[key]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Gateway'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditGatewayModalProps {
  isOpen: boolean
  gateway: Gateway | null
  onClose: () => void
  onSubmit: (values: {
    name: string
    provider?: string
    currency?: string
    links?: Partial<Gateway['links']>
  }) => void
  isLoading?: boolean
}

export function EditGatewayModal({ isOpen, gateway, onClose, onSubmit, isLoading }: EditGatewayModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    currency: '',
    links: {
      a500: '',
      a1000: '',
      a2500: '',
      a3000: '',
      a5000: '',
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or gateway changes
  useEffect(() => {
    if (isOpen && gateway) {
      setFormData({
        name: gateway.name || '',
        provider: gateway.provider || '',
        currency: gateway.currency || '',
        links: {
          a500: gateway.links.a500 || '',
          a1000: gateway.links.a1000 || '',
          a2500: gateway.links.a2500 || '',
          a3000: gateway.links.a3000 || '',
          a5000: gateway.links.a5000 || '',
        }
      })
      setErrors({})
    }
  }, [isOpen, gateway])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Gateway name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Gateway name must be at least 2 characters'
    }

    // Validate URLs
    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && value.trim()) {
        const urlError = getUrlValidationError(value.trim())
        if (urlError) {
          newErrors[key] = urlError
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Normalize URLs and filter out empty ones
    const normalizedLinks: Partial<Gateway['links']> = {}
    Object.entries(formData.links).forEach(([key, value]) => {
      if (value && value.trim()) {
        normalizedLinks[key as keyof Gateway['links']] = normalizeUrl(value)
      } else {
        // Include undefined to clear the link
        normalizedLinks[key as keyof Gateway['links']] = undefined
      }
    })

    onSubmit({
      name: formData.name.trim(),
      provider: formData.provider.trim() || undefined,
      currency: formData.currency.trim() || undefined,
      links: normalizedLinks,
    })
  }

  if (!isOpen || !gateway) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Payment Gateway</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gateway Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Checkout.com USD"
                  required
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Checkout.com"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., USD, EUR, AED"
                />
              </div>
            </div>

            {/* Payment Links */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Links</h3>
              <div className="space-y-3">
                {Object.entries(formData.links).map(([key, value]) => {
                  const amount = key.replace('a', '')
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {amount} Link
                      </label>
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          links: { ...prev.links, [key]: e.target.value }
                        }))}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                      {errors[key] && (
                        <p className="text-xs text-red-600 mt-1">{errors[key]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}