import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from '@phosphor-icons/react'
import { AllowIp, CreateAllowIpRequest, UpdateAllowIpRequest, CreateAllowIpSchema, UpdateAllowIpSchema } from './types/allowIp.schema'
import { useCreateAllowIpMutation, useUpdateAllowIpMutation } from './api/allowIpApi'

interface AllowIpFormProps {
  isOpen: boolean
  onClose: () => void
  allowIp?: AllowIp | null // null for add, allowIp object for edit
}

interface AllowIpFormData {
  ip: string
  description?: string | null
  status: 'active' | 'disabled'
  createdBy?: string
}

export default function AllowIpForm({ isOpen, onClose, allowIp }: AllowIpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [createAllowIp] = useCreateAllowIpMutation()
  const [updateAllowIp] = useUpdateAllowIpMutation()
  
  const isEditMode = !!allowIp

  // Form configuration without Zod resolver for now to avoid type issues
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<AllowIpFormData>({
    defaultValues: {
      ip: '',
      description: '',
      status: 'active'
    }
  })

  // Reset form when modal opens/closes or allowIp changes
  useEffect(() => {
    if (isOpen) {
      if (allowIp) {
        // Edit mode
        reset({
          ip: allowIp.ip || '',
          description: allowIp.description || '',
          status: allowIp.status || 'active',
        })
      } else {
        // Add mode
        reset({
          ip: '',
          description: '',
          status: 'active',
        })
      }
    }
  }, [isOpen, allowIp, reset])

  const onSubmit = async (data: AllowIpFormData) => {
    setIsSubmitting(true)

    try {
      if (isEditMode && allowIp) {
        // Edit mode - update existing allow IP
        const updates: UpdateAllowIpRequest = {
          ip: data.ip.trim(),
          description: data.description?.trim() || null,
          status: data.status,
          updatedAt: new Date().toISOString()
        }

        await updateAllowIp({
          id: allowIp.id,
          updates
        }).unwrap()
        
        toast.success('IP address updated successfully')
      } else {
        // Add mode - create new allow IP
        const createData: CreateAllowIpRequest = {
          ip: data.ip.trim(),
          description: data.description?.trim() || null,
          status: data.status,
          createdBy: 'Current User' // TODO: Get from auth context
        }

        await createAllowIp(createData).unwrap()
        
        toast.success('IP address added successfully')
      }
      
      onClose()
    } catch (error: any) {
      console.error('Failed to save allow IP:', error)
      const errorMessage = error?.data?.message || error?.message || 'Failed to save IP address. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit IP Address' : 'Add IP Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address *
            </label>
            <Controller
              name="ip"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.100 or 10.0.0.0/24"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ip ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                  {...field}
                />
              )}
            />
            {errors.ip && (
              <p className="mt-1 text-sm text-red-600">{errors.ip.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a single IP address (IPv4/IPv6) or CIDR notation (e.g., 192.168.1.0/24)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  placeholder="Optional description for this IP address..."
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="active"
                      checked={field.value === 'active'}
                      onChange={() => field.onChange('active')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="disabled"
                      checked={field.value === 'disabled'}
                      onChange={() => field.onChange('disabled')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-700">Disabled</span>
                  </label>
                </div>
              )}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update IP' : 'Add IP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}