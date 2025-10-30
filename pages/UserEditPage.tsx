import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { ArrowLeft, Eye, EyeSlash, Copy, Camera, User } from '@phosphor-icons/react'
import { 
  selectUserById, 
  selectIsEmailAvailable, 
  updateUser, 
  addUser,
  resetPassword,
  type CrmUser, 
  type UserPermission 
} from '../state/usersSlice'
import { generatePassword, validatePassword } from '../services/authStub'
// PATCH: begin UserEditPage (team leader imports - removed drawer)
// Navigation-based visibility management - no drawer import needed
// PATCH: end UserEditPage (team leader imports - removed drawer)
import type { RootState } from '../state/store'

interface UserFormData {
  fullName: string
  email: string
  startDate: string
  phone: string
  permission: UserPermission
  avatar?: string
}

interface PasswordFormData {
  password: string
  confirmPassword: string
}

const PERMISSIONS: UserPermission[] = ['Admin', 'Manager', 'Agent', 'Viewer']

export type UserEditMode = 'admin' | 'self'

export interface UserEditPageProps {
  mode?: UserEditMode
  userId?: string
}

export default function UserEditPage({ mode = 'admin', userId: propUserId }: UserEditPageProps = {}) {
  const { id: paramId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Use propUserId if provided (for self mode), otherwise use URL param
  const id = propUserId || paramId
  const isSelfMode = mode === 'self'
  
  const user = useSelector((state: RootState) => 
    id && id !== 'new' ? selectUserById(state, id) : null
  )
  
  const isNewUser = id === 'new'
  
  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    startDate: '',
    phone: '',
    permission: 'Agent',
    avatar: '',
  })
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<Partial<UserFormData & PasswordFormData>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  


  // Initialize form data
  useEffect(() => {
    if (isNewUser) {
      setFormData({
        fullName: '',
        email: '',
        startDate: new Date().toISOString().split('T')[0],
        phone: '',
        permission: 'Agent',
        avatar: '',
      })
      setAvatarPreview('')
    } else if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        startDate: user.startDate || '',
        phone: user.phone || '',
        permission: user.permission || 'Agent',
        avatar: user.avatar || '',
      })
      setAvatarPreview(user.avatar || '')
    } else if (id && id !== 'new') {
      // User not found, redirect back
      toast.error('User not found')
      navigate('/settings/administration/users')
    }
  }, [user, isNewUser, id, navigate])

  const isEmailAvailable = useSelector((state: RootState) => 
    selectIsEmailAvailable(state, formData.email, user?.id)
  )

  const validateProfileForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (!isEmailAvailable) {
      newErrors.email = 'Email is already in use'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {}

    if (!passwordData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePassword(passwordData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || 'Invalid password'
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password'
    } else if (passwordData.password !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setPasswordData({
      password: newPassword,
      confirmPassword: newPassword,
    })
    setShowPassword(true)
    setShowConfirmPassword(true)
    toast.success('Password generated successfully')
  }

  const handleCopyPassword = async () => {
    if (passwordData.password) {
      try {
        await navigator.clipboard.writeText(passwordData.password)
        toast.success('Password copied to clipboard')
      } catch (error) {
        console.error('Failed to copy password:', error)
        toast.error('Failed to copy password')
      }
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar file size must be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview('')
    setFormData(prev => ({ ...prev, avatar: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return

    setIsSubmitting(true)
    try {
      if (isNewUser) {
        if (!passwordData.password) {
          toast.error('Password is required for new users')
          setIsSubmitting(false)
          return
        }
        
        if (!validatePasswordForm()) {
          setIsSubmitting(false)
          return
        }

        await dispatch(addUser({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          startDate: formData.startDate,
          phone: formData.phone.trim() || undefined,
          permission: formData.permission,
          avatar: formData.avatar,
          password: passwordData.password,
        })).unwrap()
        
        toast.success('User created successfully')
        navigate('/settings/administration/users')
      } else {
        dispatch(updateUser({
          id: user!.id,
          patch: {
            fullName: formData.fullName.trim(),
            email: formData.email.toLowerCase().trim(),
            startDate: formData.startDate,
            phone: formData.phone.trim() || undefined,
            permission: formData.permission,
            avatar: formData.avatar,
          }
        }))
        
        toast.success('User updated successfully')
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user || !validatePasswordForm()) return

    setIsSubmitting(true)
    try {
      await dispatch(resetPassword({
        id: user.id,
        newPasswordPlain: passwordData.password,
      })).unwrap()
      
      toast.success(`Password reset successfully for ${user.fullName}`)
      setPasswordData({ password: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to reset password:', error)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(isSelfMode ? '/' : '/settings/administration/users')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                {isSelfMode ? 'Back to Dashboard' : 'Back to Users'}
              </button>
              <div className="h-6 border-l border-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isSelfMode ? 'Profile Settings' : (isNewUser ? 'Add New User' : 'Edit User')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - No Cards, Full Width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-12">
          {/* Avatar Section - Left Side */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center">
              {/* Avatar Display */}
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-4xl font-semibold">
                      {formData.fullName ? getInitials(formData.fullName) : <User size={48} />}
                    </div>
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors text-lg font-bold"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-xs"
                disabled={isSubmitting}
              >
                <Camera size={18} className="mr-2" />
                {avatarPreview ? 'Change Picture' : 'Upload Picture'}
              </button>
              <p className="mt-3 text-sm text-gray-500 text-center">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>

          {/* Form Section - Right Side */}
          <div className="flex-1">
            <form className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                    errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  } ${isSelfMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter full name"
                  disabled={isSubmitting || isSelfMode}
                  readOnly={isSelfMode}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                      errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    } ${isSelfMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="name@company.com"
                    disabled={isSubmitting || isSelfMode}
                    readOnly={isSelfMode}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                      errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    } ${isSelfMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting || isSelfMode}
                    readOnly={isSelfMode}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                      errors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    } ${isSelfMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting || isSelfMode}
                    readOnly={isSelfMode}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                {/* Permission - Hidden in self mode */}
                {!isSelfMode && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Permission Level *
                    </label>
                    <select
                      value={formData.permission}
                      onChange={(e) => handleInputChange('permission', e.target.value as UserPermission)}
                      className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      disabled={isSubmitting}
                    >
                      {PERMISSIONS.map(permission => (
                        <option key={permission} value={permission}>
                          {permission}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Password Section - Hidden in self mode */}
              {!isSelfMode && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {isNewUser ? 'Set Password' : 'Reset Password'}
                  </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      {isNewUser ? 'Password' : 'New Password'} *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.password}
                        onChange={(e) => handlePasswordChange('password', e.target.value)}
                        className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-20 ${
                          errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter password"
                        disabled={isSubmitting}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                        {passwordData.password && (
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isSubmitting}
                            title="Copy password"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Generate secure password
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className={`shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 ${
                          errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Warning for existing users */}
                {!isNewUser && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm text-amber-800">
                      <strong>Important:</strong> The user will need to use this new password to log in. 
                      Make sure to securely share the password with them.
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  {isSelfMode ? (
                    // Self mode: Only avatar save button
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Avatar'}
                    </button>
                  ) : isNewUser ? (
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSubmitting || !formData.fullName || !formData.email || !passwordData.password}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating User...' : 'Create New User'}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isSubmitting || !passwordData.password || !passwordData.confirmPassword}
                        className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => navigate(isSelfMode ? '/dashboard' : '/settings/administration/users')}
                    className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    disabled={isSubmitting}
                  >
                    {isSelfMode ? 'Back to Dashboard' : 'Cancel'}
                  </button>
                </div>

                {/* User Info Summary - Hidden in self mode */}
                {!isSelfMode && !isNewUser && user && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">User ID:</span> {user.id}</div>
                      <div><span className="font-medium">Status:</span> {user.isActive ? 'Active' : 'Inactive'}</div>
                      <div><span className="font-medium">Created:</span> {new Date(user.createdOn).toLocaleDateString()}</div>
                      {user.updatedOn && (
                        <div><span className="font-medium">Updated:</span> {new Date(user.updatedOn).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* PATCH: begin UserEditPage (navigation-based visibility management) */}
      {/* Visibility management now uses full-page navigation - no drawer needed */}
      {/* PATCH: end UserEditPage (navigation-based visibility management) */}
    </div>
  )
}