import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { X, Eye, EyeSlash } from '@phosphor-icons/react'
import { addUser, updateUser, selectIsEmailAvailable, type CrmUser, type UserPermission } from '../state/usersSlice'
import { generatePassword, validatePassword } from '../services/authStub'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  user?: CrmUser | null // null for add, user object for edit
}

interface UserFormData {
  fullName: string
  email: string
  startDate: string
  phone: string
  permission: UserPermission
  password?: string
}

const PERMISSIONS: UserPermission[] = ['Admin', 'Manager', 'Agent', 'Viewer']

export default function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    startDate: '',
    phone: '',
    permission: 'Agent',
    password: '',
  })
  
  const [errors, setErrors] = useState<Partial<UserFormData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          startDate: user.startDate || '',
          phone: user.phone || '',
          permission: user.permission || 'Agent',
          // Don't set password for edit mode
        })
      } else {
        // Add mode
        setFormData({
          fullName: '',
          email: '',
          startDate: new Date().toISOString().split('T')[0], // Today's date
          phone: '',
          permission: 'Agent',
          password: '',
        })
      }
      setErrors({})
      setShowPassword(false)
    }
  }, [isOpen, user])

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    // Note: Email availability will be checked during submission

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    // Phone validation (optional but format check)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Password validation (only for new users)
    if (!user && formData.password) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message
      }
    } else if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
    toast.success('Password generated successfully')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (user) {
        // Edit mode - update existing user
        await dispatch(updateUser({
          id: user.id,
          updates: {
            fullName: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            startDate: formData.startDate,
            phone: formData.phone.trim() || undefined,
            permission: formData.permission,
          }
        })).unwrap()
        
        toast.success('User updated successfully')
      } else {
        // Add mode - create new user
        await dispatch(addUser({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          startDate: formData.startDate,
          phone: formData.phone.trim() || undefined,
          permission: formData.permission,
          password: formData.password!,
        })).unwrap()
        
        toast.success('User created successfully')
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user. Please try again.')
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
            {user ? 'Edit User' : 'Add User'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission *
            </label>
            <select
              value={formData.permission}
              onChange={(e) => handleInputChange('permission', e.target.value as UserPermission)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {PERMISSIONS.map(permission => (
                <option key={permission} value={permission}>
                  {permission}
                </option>
              ))}
            </select>
          </div>

          {/* Password (only for new users) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                disabled={isSubmitting}
              >
                Generate secure password
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}