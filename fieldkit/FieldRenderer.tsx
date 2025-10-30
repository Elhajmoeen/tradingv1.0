import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../state/store'
import { TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material'
import StarRating from '../components/inputs/StarRating'
import type { EntityFieldKey } from './types'
import { optionsByKey } from './options'
import { normalizeOnChange, normalizeOnCommit } from './normalize'

interface FieldRendererProps {
  fieldKey: EntityFieldKey
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  // Material UI props
  variant?: 'outlined' | 'filled' | 'standard'
  size?: 'small' | 'medium'
  fullWidth?: boolean
  error?: boolean
  helperText?: string
  label?: string
  sx?: any
  InputProps?: any
  MenuProps?: any
  startAdornment?: React.ReactNode
}

/**
 * Simplified unified field renderer using basic Material UI components
 * Provides consistent data flow and normalization across all fields
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder,
  className,
  variant = 'outlined',
  size = 'small',
  fullWidth = true,
  error = false,
  helperText,
  label,
  sx,
  InputProps,
  MenuProps,
  startAdornment,
}) => {
  const options = useSelector((state: RootState) => optionsByKey(state, fieldKey))
  
  // Normalize value on change (light processing)
  const handleChange = (newValue: any) => {
    const normalized = normalizeOnChange(fieldKey, newValue)
    onChange(normalized)
  }
  
  // Normalize value on blur/commit (heavy validation)
  const handleBlur = () => {
    if (onBlur) {
      const normalized = normalizeOnCommit(fieldKey, value)
      if (normalized !== value) {
        onChange(normalized)
      }
      onBlur()
    }
  }

  // Star rating fields (Phase A)
  if (fieldKey === 'salesReview' || fieldKey === 'retentionReview') {
    return (
      <div className={className}>
        {label && <InputLabel shrink>{label}</InputLabel>}
        <StarRating
          value={typeof value === 'number' ? value : 0}
          onChange={(rating) => handleChange(rating)}
          readOnly={disabled}
        />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </div>
    )
  }

  // Boolean fields with enhanced UI (Phase A)
  const booleanFields = [
    'regulation', 'ftdSelf', 'salesSecondHand', 'ftdFirstConversation',
    'enableLogin', 'blockNotifications', 'allowedToTrade', 'withdrawLimitAllowed',
    'twoFAEnabled', 'allowed2fa', 'allowDeposit', 'allowWithdraw',
    'idPassport', 'proofOfAddress', 'ccFront', 'ccBack', 'dod'
  ]
  
  if (booleanFields.includes(String(fieldKey))) {
    return (
      <FormControl 
        variant={variant} 
        size={size} 
        fullWidth={fullWidth} 
        error={error}
        className={className}
        disabled={disabled}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value === true ? 'true' : 'false'}
          onChange={(e) => handleChange(e.target.value === 'true')}
          onBlur={handleBlur}
        >
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }

  // Number fields (Phase A)
  const numberFields = [
    'age', 'noAnswerCount', 'callAttempts', 'loginCount', 'totalFtd', 'ftd',
    'daysToFtd', 'depositLimit', 'withdrawLimit', 'marginCall', 'miniDeposit',
    'stopOut', 'balance', 'marginLevel', 'openPnl', 'totalPnl', 'freeMargin',
    'margin', 'equity', 'openVolume'
  ]
  
  if (numberFields.includes(String(fieldKey))) {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        label={label}
        className={className}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
        type="number"
        inputProps={{ step: String(fieldKey).includes('margin') || String(fieldKey).includes('Pnl') ? '0.01' : '1' }}
        sx={sx}
        InputProps={InputProps}
      />
    )
  }

  // Date fields (Phase A)
  const dateFields = [
    'dateOfBirth', 'createdAt', 'lastContactAt', 'lastCommentAt',
    'firstLoginAt', 'lastLoginAt', 'lastActivityAt', 'followUpAt',
    'ftdDate', 'conversationAssignedAt', 'retentionAssignedAt', 'dateConverted'
  ]
  
  if (dateFields.includes(String(fieldKey))) {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        label={label}
        className={className}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
        type={fieldKey === 'dateOfBirth' ? 'date' : 'datetime-local'}
        sx={sx}
        InputProps={InputProps}
      />
    )
  }

  // Phone fields with special handling (Phase A)
  if (fieldKey === 'phoneNumber' || fieldKey === 'phoneNumber2') {
    return (
      <TextField
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder || 'Enter phone number'}
        label={label}
        className={className}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
        type="tel"
        inputProps={{ pattern: '[0-9+\\-\\s]*' }}
        sx={sx}
        InputProps={InputProps}
      />
    )
  }

  // Select fields (fields with options)
  if (options && options.length > 0) {
    return (
      <FormControl 
        variant={variant} 
        size={size} 
        fullWidth={fullWidth} 
        error={error}
        className={className}
        disabled={disabled}
        sx={sx}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          displayEmpty
          startAdornment={startAdornment}
          MenuProps={MenuProps}
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#999' }}>{placeholder}</span>
            }
            const option = options.find(opt => opt.value === selected)
            return option ? option.label : String(selected)
          }}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }

  // Default: Text input for all other fields
  return (
    <TextField
      value={value || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      label={label}
      className={className}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      sx={sx}
      InputProps={InputProps}
      // Special handling for different field types
      type={
        fieldKey === 'email' ? 'email' :
        fieldKey === 'dateOfBirth' ? 'date' :
        (String(fieldKey).includes('phone') || fieldKey === 'phoneNumber' || fieldKey === 'phoneNumber2') ? 'tel' :
        'text'
      }
    />
  )
}

export default FieldRenderer