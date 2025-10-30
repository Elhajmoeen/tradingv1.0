import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'sonner'
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Check as CheckIcon
} from '@mui/icons-material'
import { X } from 'lucide-react'
import { changePassword } from '../api/client'
import type { RootState } from '../state/store'
import { updateOne } from '../state/entitiesSlice'

interface ChangePasswordDrawerProps {
  open: boolean
  onClose: () => void
  clientId: string
}

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ShowFlags {
  currentPassword: boolean
  newPassword: boolean
  confirmPassword: boolean
}

interface ValidationErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordDrawer({ open, onClose, clientId }: ChangePasswordDrawerProps) {
  const dispatch = useDispatch()
  
  // Get the entity data from Redux to pre-populate current password
  const entity = useSelector((state: RootState) => 
    state.entities.entities.find(e => e.id === clientId || e.accountId === clientId)
  )

  // Drag functionality
  const dragRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showFlags, setShowFlags] = useState<ShowFlags>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when drawer opens/closes and pre-populate current password
  useEffect(() => {
    if (open) {
      setFormData({
        currentPassword: entity?.password || '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      setShowFlags({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      })
    }
  }, [open, entity?.password])

  // Validation logic
  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    } else {
      const hasLetter = /[a-zA-Z]/.test(formData.newPassword)
      const hasNumber = /\d/.test(formData.newPassword)
      if (!hasLetter || !hasNumber) {
        newErrors.newPassword = 'Password must include at least 1 letter and 1 number'
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    return newErrors
  }

  // Check if form is valid
  const isFormValid = () => {
    const validationErrors = validateForm()
    return Object.keys(validationErrors).length === 0 && formData.newPassword && formData.confirmPassword
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Toggle password visibility
  const toggleShowPassword = (field: keyof ShowFlags) => {
    setShowFlags(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      await changePassword(clientId, {
        currentPassword: formData.currentPassword, // Keep for API compatibility
        newPassword: formData.newPassword
      })
      
      // Update the entity's password in the store
      if (entity) {
        dispatch(updateOne({
          id: entity.id,
          changes: { password: formData.newPassword }
        }))
      }
      
      toast.success('Password updated successfully!')
      
      // Reset form and close drawer
      setFormData({
        currentPassword: formData.newPassword, // Update to show new password as current
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    onClose()
  }

  // Drag handlers
  const onDown = (e: React.MouseEvent) => {
    setDragging(true)
    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      setStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const onMove = (e: MouseEvent) => {
    if (!dragging) return
    setPos({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    })
  }

  const onUp = () => {
    setDragging(false)
  }

  React.useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      return () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
    }
  }, [dragging, startPos])

  const handleClose = () => {
    setPos({ x: 0, y: 0 })
    handleCancel()
  }

  if (!open) return null

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={handleClose} 
      />
      
      <div
        ref={dragRef}
        style={{ 
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          ['--crm-header']: '#ffffff',
          ['--accent']: '#F0B90B',
        } as React.CSSProperties}
        className="relative w-[min(500px,96vw)] rounded-2xl shadow-2xl bg-white border border-gray-200 text-gray-900 max-h-[90vh] overflow-hidden"
      >
        {/* Draggable Header */}
        <div
          onMouseDown={onDown}
          className="flex items-center justify-between px-6 min-h-[60px] border-b border-gray-200 cursor-move select-none bg-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-xl">
              <LockIcon sx={{ width: 20, height: 20, color: '#6b7280' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
        <form 
          onSubmit={handleSubmit}
          className="px-6 py-6 bg-white space-y-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {/* Current Password - Display Only */}
          <Box>
            <Box className="flex items-center gap-2 mb-2">
              <Typography 
                variant="body2" 
                className="font-medium text-gray-800"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                Current Password
              </Typography>
              <Chip
                label="Read Only"
                size="small"
                sx={{ 
                  height: '22px',
                  fontSize: '11px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0'
                }}
              />
            </Box>
            <TextField
              fullWidth
              type={showFlags.currentPassword ? 'text' : 'password'}
              value={formData.currentPassword || 'No password set'}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('currentPassword')}
                      edge="end"
                      size="small"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showFlags.currentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { 
                  fontFamily: 'Inter, monospace, sans-serif',
                  fontSize: '14px'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  borderStyle: 'dashed',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderStyle: 'dashed',
                    borderWidth: '1px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1'
                  }
                }
              }}
            />
            <Typography 
              variant="caption" 
              className="text-gray-500 mt-2 block"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
            >
              This is the account's current password. Click the eye icon to reveal it.
            </Typography>
          </Box>

          {/* New Password */}
          <Box>
            <Typography 
              variant="body2" 
              className="font-medium text-gray-800 mb-2"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
            >
              New Password
            </Typography>
            <TextField
              fullWidth
              type={showFlags.newPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('newPassword')}
                      edge="end"
                      size="small"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showFlags.newPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: errors.newPassword ? '#ef4444' : '#e2e8f0',
                    borderWidth: '1px'
                  },
                  '&:hover fieldset': {
                    borderColor: errors.newPassword ? '#dc2626' : '#cbd5e1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.newPassword ? '#dc2626' : '#2563eb',
                    borderWidth: '2px'
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                }
              }}
            />
          </Box>

          {/* Confirm Password */}
          <Box>
            <Typography 
              variant="body2" 
              className="font-medium text-gray-800 mb-2"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
            >
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              type={showFlags.confirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('confirmPassword')}
                      edge="end"
                      size="small"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showFlags.confirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                style: { 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: errors.confirmPassword ? '#ef4444' : '#e2e8f0',
                    borderWidth: '1px'
                  },
                  '&:hover fieldset': {
                    borderColor: errors.confirmPassword ? '#dc2626' : '#cbd5e1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.confirmPassword ? '#dc2626' : '#2563eb',
                    borderWidth: '2px'
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                }
              }}
            />
          </Box>

          {/* Password Requirements */}
          {formData.newPassword && (
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                '& .MuiAlert-icon': {
                  color: '#2563eb'
                }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#1e40af',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                }}
              >
                Password must be at least 8 characters with letters and numbers
              </Typography>
            </Alert>
          )}
        
        </form>
        
        </div>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        {/* Footer */}
        <div 
          className="flex gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            fullWidth
            sx={{
              borderColor: '#e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              padding: '10px 20px',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !isFormValid()}
            fullWidth
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
            sx={{
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              padding: '10px 20px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#1d4ed8',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              },
              '&:disabled': {
                backgroundColor: '#e2e8f0',
                color: '#94a3b8',
                boxShadow: 'none'
              }
            }}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </div>
    </div>
    </>
  )
}