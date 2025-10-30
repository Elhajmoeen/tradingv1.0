import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Eye, EyeOff, User, Mail, Phone, Lock, Globe, BarChart3, TrendingUp, Users } from 'lucide-react'
import { coerceBoolean } from '@/lib/utils'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  Button as MUIButton,
  Grid,
  InputAdornment,
  FormHelperText,
  Divider,
  Stack
} from '@mui/material'
import { addEntity, selectAllEntities, createLead } from '@/state/entitiesSlice'
import type { AppDispatch } from '@/state/store'
import { getCountriesForSelect, getCountryCode } from '@/utils/countryPhone'
import { LEAD_STATUS } from '@/config/leadStatus'
import { LEAD_SOURCE_OPTIONS } from '@/config/leadSource'
import StarRating from '@/components/inputs/StarRating'
import { FieldRenderer } from '@/fieldkit'

// Form validation schema
const newLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  leadStatus: z.string().min(1, 'Lead status is required'),
  salesReview: z.number().min(1).max(5).optional(),
  leadSource: z.string().min(1, 'Lead source is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type NewLeadFormData = z.infer<typeof newLeadSchema>

interface NewLeadDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewLeadDrawer({ open, onOpenChange }: NewLeadDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const entities = useSelector(selectAllEntities)
  
  // Get unique values from entities data for dynamic options
  const getUniqueValues = (fieldPath: string): string[] => {
    const values = new Set<string>();
    entities.forEach(entity => {
      const value = entity[fieldPath as keyof typeof entity];
      if (value && String(value).trim() !== '') {
        values.add(String(value).trim());
      }
    });
    return Array.from(values).sort();
  };

  // Note: Field options now handled by FieldRenderer via unified fieldkit system
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countryCode, setCountryCode] = useState('+1')

  // Get countries and entities data
  const countries = getCountriesForSelect()
  const allEntities = useSelector(selectAllEntities)

  // Enhanced drawer style for form inputs - matching reference design
  const financeInputStyle = {
    fontFamily: 'Poppins, sans-serif',
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      fontSize: '0.875rem',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db',
        borderWidth: '1px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#2563eb',
          borderWidth: '1px',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 12px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '0.875rem',
      color: '#111827',
      '&::placeholder': {
        color: '#6b7280',
        opacity: 1,
      },
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '0.875rem',
      color: '#374151',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#2563eb',
      },
    },
    '& .MuiFormHelperText-root': {
      fontFamily: 'Poppins, sans-serif',
      fontSize: '0.75rem',
      marginTop: '4px',
      marginLeft: '0px',
    },
  }

  // Enhanced drawer style for select inputs
  const financeSelectStyle = {
    ...financeInputStyle,
    '& .MuiSelect-select': {
      fontFamily: 'Poppins, sans-serif',
      padding: '10px 12px',
    }
  }

  // Enhanced menu props for dropdown styling
  const selectMenuProps = {
    PaperProps: {
      sx: {
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        marginTop: '4px',
        '& .MuiMenuItem-root': {
          fontSize: '0.875rem',
          padding: '10px 12px',
          color: '#111827',
          fontFamily: 'Poppins, sans-serif',
          '&:hover': {
            backgroundColor: '#f3f4f6',
          },
          '&.Mui-selected': {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          },
        },
      },
    },
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<NewLeadFormData>({
    resolver: zodResolver(newLeadSchema),
    mode: 'onChange',
    defaultValues: {
      leadStatus: 'New',
      leadSource: 'Organic',
      password: '',
      confirmPassword: ''
    }
  })

  const selectedCountry = watch('country')

  // Update country code when country changes
  useEffect(() => {
    if (selectedCountry) {
      const code = getCountryCode(selectedCountry)
      setCountryCode(code)
    }
  }, [selectedCountry])

  // Generate unique account ID
  const generateAccountId = (): string => {
    const generateId = () => 'ACC' + Math.floor(1000 + Math.random() * 9000).toString()
    
    let newId = generateId()
    // Ensure no collision with existing entities
    while (allEntities.some(entity => entity.accountId === newId || entity.id === newId)) {
      newId = generateId()
    }
    
    return newId
  }

  const onSubmit = async (data: NewLeadFormData) => {
    try {
      const accountId = generateAccountId()
      const localPhoneNumber = data.phoneNumber
      
      // Compose full phone number as country code + local number
      const fullPhoneNumber = `${countryCode} ${localPhoneNumber}`
      
      const leadPayload = {
        id: accountId,
        accountId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        country: data.country,
        countryCode,
        phoneNumber: fullPhoneNumber,
        leadStatus: data.leadStatus,
        salesReview: data.salesReview,
        leadSource: data.leadSource,
        password: data.password, // Store encrypted in real app
      }

      const result = await dispatch(createLead(leadPayload)).unwrap()
      
      // Close drawer and navigate to profile
      onOpenChange(false)
      reset()
      navigate(`/profile/${result.accountId}`)
    } catch (error) {
      console.error('Failed to create lead:', error)
      // In a real app, show toast notification to user
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Focus first input when opened
      setTimeout(() => {
        const firstInput = document.querySelector('[data-focus-first]') as HTMLElement
        firstInput?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', md: '50%' },
          maxWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      {/* Enhanced Header with Dark Theme */}
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 3,
          backgroundColor: '#374151',
          borderBottom: '1px solid #4b5563',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#60a5fa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={20} color="white" />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                fontWeight: 600, 
                mb: 0.5,
                fontFamily: 'Poppins, sans-serif',
                color: '#ffffff',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                letterSpacing: '0.05em'
              }}
            >
              New Lead
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small"
          sx={{
            color: '#9ca3af',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: '#4b5563',
              color: '#ffffff'
            },
            borderRadius: '6px',
            width: 32,
            height: 32
          }}
        >
          <X size={16} />
        </IconButton>
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit)} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          px: 4, 
          py: 4,
          backgroundColor: '#ffffff'
        }}>
          <Stack spacing={3}>
            {/* Row 1: First Name & Last Name */}
                          {/* Row 1: First Name and Last Name */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 2, color: '#111827', fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem' }}>
                    First Name *
                  </Typography>
                  <FieldRenderer
                    fieldKey="firstName"
                    value={watch('firstName')}
                    onChange={(value) => setValue('firstName', value)}
                    placeholder="Enter first name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    fullWidth
                    variant="outlined"
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                    }}
                    label=""
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Last Name *
                  </Typography>
                  <FieldRenderer
                    fieldKey="lastName"
                    value={watch('lastName')}
                    onChange={(value) => setValue('lastName', value)}
                    placeholder="Enter last name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    fullWidth
                    variant="outlined"
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                    }}
                    label=""
                  />
                </Box>
              </Box>

            {/* Row 2: Email & Country */}
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Email Address *
                </Typography>
                <FieldRenderer
                  fieldKey="email"
                  value={watch('email')}
                  onChange={(value) => setValue('email', value)}
                  placeholder="Enter email address"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  variant="outlined"
                  sx={financeInputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} color="#6b7280" />
                      </InputAdornment>
                    ),
                  }}
                  label=""
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Country *
                </Typography>
                <FieldRenderer
                  fieldKey="country"
                  value={watch('country')}
                  onChange={(value) => setValue('country', value)}
                  placeholder="Country"
                  error={!!errors.country}
                  helperText={errors.country?.message}
                  fullWidth
                  variant="outlined"
                  sx={financeSelectStyle}
                  MenuProps={selectMenuProps}
                  startAdornment={
                    <InputAdornment position="start">
                      <Globe size={16} color="#6b7280" />
                    </InputAdornment>
                  }
                  label=""
                />
              </Box>
            </Box>

              {/* Row 3: Phone Number and Lead Status */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Phone Number *
                  </Typography>
                  <FieldRenderer
                    fieldKey="phoneNumber"
                    value={watch('phoneNumber')}
                    onChange={(value) => setValue('phoneNumber', value)}
                    placeholder="Enter phone number"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    fullWidth
                    variant="outlined"
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                    }}
                    label=""
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Lead Status *
                  </Typography>
                  <FieldRenderer
                    fieldKey="leadStatus"
                    value={watch('leadStatus')}
                    onChange={(value) => setValue('leadStatus', value)}
                    placeholder="Select lead status"
                    error={!!errors.leadStatus}
                    helperText={errors.leadStatus?.message}
                    fullWidth
                    variant="outlined"
                    sx={financeSelectStyle}
                    MenuProps={selectMenuProps}
                    startAdornment={
                      <InputAdornment position="start">
                        <BarChart3 size={16} color="#6b7280" />
                      </InputAdornment>
                    }
                    label=""
                  />
                </Box>
              </Box>

              {/* Row 4: Sales Review and Lead Source */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Sales Review
                  </Typography>
                  <FieldRenderer
                    fieldKey="salesReview"
                    value={watch('salesReview')}
                    onChange={(value) => setValue('salesReview', value)}
                    placeholder="Rate sales review (1-5 stars)"
                    error={!!errors.salesReview}
                    helperText={errors.salesReview?.message}
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TrendingUp size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                    }}
                    label=""
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Lead Source *
                  </Typography>
                  <FieldRenderer
                    fieldKey="leadSource"
                    value={watch('leadSource')}
                    onChange={(value) => setValue('leadSource', value)}
                    placeholder="Select lead source"
                    error={!!errors.leadSource}
                    helperText={errors.leadSource?.message}
                    fullWidth
                    variant="outlined"
                    sx={financeSelectStyle}
                    MenuProps={selectMenuProps}
                    startAdornment={
                      <InputAdornment position="start">
                        <Users size={16} color="#6b7280" />
                      </InputAdornment>
                    }
                    label=""
                  />
                </Box>
              </Box>

              {/* Row 5: Password & Confirm Password */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Password *
                  </Typography>
                  <TextField
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    fullWidth
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                    Confirm Password *
                  </Typography>
                  <TextField
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    fullWidth
                    variant="outlined"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={financeInputStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} color="#6b7280" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Stack>
        </Box>

        {/* Enhanced Footer */}
        <Box 
          sx={{
            px: 4,
            py: 3,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e7eb'
          }}
        >
          <MUIButton 
            type="submit"
            variant="contained" 
            disabled={!isValid}
            sx={{
              height: '48px',
              px: 4,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              backgroundColor: '#2563eb',
              textTransform: 'none',
              borderRadius: '8px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: '#1d4ed8'
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              }
            }}
          >
            <User size={16} />
            Create Lead
          </MUIButton>
        </Box>
      </Box>
    </Drawer>
  )
}