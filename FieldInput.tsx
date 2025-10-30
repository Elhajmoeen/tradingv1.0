import * as React from 'react'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { profileTabs } from '@/config/fields'
import { RegulationField } from '@/components/RegulationField'
import { AccountTypeField } from '@/components/AccountTypeField'
import { LeadStatusField } from '@/components/LeadStatusField'
import { KYCStatusField } from '@/components/KYCStatusField'
import { CitizenField } from '@/components/CitizenField'
import { FTDField } from '@/components/FTDField'
import { FTDSelfField } from '@/components/FTDSelfField'
import { PaymentGatewayField } from '@/components/PaymentGatewayField'
import { DeskField } from '@/components/DeskField'
import { LanguageField } from '@/components/LanguageField'
import { GenderField } from '@/components/GenderField'
import { TextFieldInput } from '@/components/TextFieldInput'
import { PhoneFieldInput } from '@/components/PhoneFieldInput'
import { PercentageFieldInput } from '@/components/PercentageFieldInput'
import { SelectFieldInput } from '@/components/SelectFieldInput'
import { CountrySelect } from '@/components/fields/CountrySelect'
import { CountryCodeField } from '@/components/CountryCodeField'
import { RegisteredIpField } from '@/components/RegisteredIpField'
import { DateOfBirthField } from '@/components/fields/DateOfBirthField'
import { SalesReviewField, RetentionReviewField } from '@/components/fields/RatingFields'

import { LeadStatusSelect } from '@/components/fields/LeadStatusSelect'
import { FieldRenderer, useProfileField } from '@/fieldkit'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Unified field wrapper that uses FieldRenderer with useProfileField hook
interface UnifiedFieldWrapperProps {
  entityId: string
  fieldKey: string
}

function UnifiedFieldWrapper({ entityId, fieldKey }: UnifiedFieldWrapperProps) {
  const { value, updateField } = useProfileField(entityId, fieldKey as any)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  
  // Update editValue when value changes
  React.useEffect(() => {
    setEditValue(value || '')
  }, [value])

  const handleSave = () => {
    updateField(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const getDisplayValue = () => {
    if (!value || value === '') return 'Not Set'
    
    // Check if this field should be formatted as datetime
    // Get field configuration to determine type
    const fieldConfig = profileTabs
      .flatMap(tab => tab.sections)
      .flatMap(section => section.fields)
      .find(field => field.key === fieldKey)
    
    if (fieldConfig?.type === 'datetime') {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit', 
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
        return String(value)
      } catch {
        return String(value)
      }
    } else if (fieldConfig?.type === 'date') {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit'
          })
        }
        return String(value)
      } catch {
        return String(value)
      }
    }
    
    return String(value)
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
      <FieldRenderer
        fieldKey={fieldKey as any}
        value={editValue}
        onChange={setEditValue}
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused': {
              borderColor: '#9ca3af',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
        }}
      />
      <button
        onClick={handleSave}
        className="p-1 hover:bg-green-100 rounded-md"
      >
        <CheckIcon className="h-3 w-3 text-green-600" />
      </button>
      <button
        onClick={handleCancel}
        className="p-1 hover:bg-red-100 rounded-md"
      >
        <XMarkIcon className="h-3 w-3 text-red-600" />
      </button>
    </div>
  )
}

interface FieldInputProps {
  entityId: string
  fieldKey: string
  fieldConfig?: {
    key: string
    label: string
    type: string
    description?: string
    [key: string]: any
  }
}

export function FieldInput({ entityId, fieldKey, fieldConfig: providedFieldConfig }: FieldInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(entityId))
  
  if (!entity) {
    return <div className="text-muted-foreground">Entity not found</div>
  }

  // Use provided field config or find from profile tabs
  const fieldConfig = providedFieldConfig || profileTabs
    .flatMap(tab => tab.sections)
    .flatMap(section => section.fields)
    .find(field => field.key === fieldKey)
  
  if (!fieldConfig) {
    return <div className="text-muted-foreground">Field configuration not found</div>
  }

  // Get current value (handle nested keys like 'address.city')
  let currentValue = getNestedValue(entity, fieldKey)
  
  // Handle calculated fields
  if (fieldConfig.type === 'calculated' && fieldConfig.compute) {
    currentValue = fieldConfig.compute(entity)
  }
  
  // Use default value if current value is undefined
  if (currentValue === undefined || currentValue === null) {
    currentValue = fieldConfig.defaultValue || ''
  }

  // Render appropriate input based on field type
  const renderField = () => {
    // Special handling for verification checkbox fields
    if ((fieldConfig.type as string) === 'verification-checkbox') {
      return (
        <Checkbox
          id={fieldKey}
          checked={Boolean(currentValue)}
          onCheckedChange={(checked) => {
            dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: checked }))
          }}
        />
      )
    }

    // Special handling for regulation field - editable dropdown
    if (fieldKey === 'regulation') {
      return <RegulationField clientId={entityId} />
    }
    
    // Special handling for account type field - editable dropdown
    if (fieldKey === 'accountType') {
      return <AccountTypeField clientId={entityId} />
    }

    if (fieldKey === 'leadStatus') {
      return <LeadStatusField clientId={entityId} />
    }
    
    // Special handling for desk field - editable dropdown
    if (fieldKey === 'desk') {
      return <DeskField clientId={entityId} />
    }
    
    // Special handling for language field - editable dropdown
    if (fieldKey === 'language') {
      return <LanguageField clientId={entityId} />
    }
    
    // Special handling for gender field - editable dropdown
    if (fieldKey === 'gender') {
      return <GenderField clientId={entityId} />
    }
    
    // Special handling for country field - searchable dropdown with auto-dial linking
    if (fieldKey === 'country') {
      return <CountrySelect clientId={entityId} />
    }
    
    // Special handling for countryCode field - editable input with dial code formatting
    if (fieldKey === 'countryCode') {
      return <CountryCodeField clientId={entityId} />
    }
    
    // Special handling for registeredIp field - editable input with IP validation
    if (fieldKey === 'registeredIp') {
      return <RegisteredIpField clientId={entityId} />
    }
    
    // Special handling for dateOfBirth field - editable date picker with auto age calculation
    if (fieldKey === 'dateOfBirth') {
      return <DateOfBirthField clientId={entityId} />
    }
    
    // PHASE A: All unified fields using FieldRenderer system
    const phaseAFields = [
      // Personal Information
      'firstName', 'lastName', 'email', 'phoneNumber', 'phoneNumber2',
      'country', 'countryCode', 'dateOfBirth', 'age', 'gender', 'citizen', 'language', 'registeredIp',
      
      // Lead Management  
      'salesReview', 'retentionReview', 'salesSecondHand', 'leadSource',
      
      // Account Configuration
      'accountType', 'desk', 'regulation',
      
      // Lifecycle Management
      'salesManager', 'conversationOwner', 'retentionOwner', 'firstConversationOwner',
      'conversationAssignedAt', 'retentionAssignedAt',
      
      // Financial Fields
      'totalFtd', 'ftd', 'ftdSelf', 'ftdFirstConversation', 'ftdDate', 'daysToFtd',
      
      // Activity Timeline
      'createdAt', 'lastContactAt', 'firstLoginAt', 'lastLoginAt',
      'lastActivityAt', 'followUpAt',
      
      // Engagement Counters
      'noAnswerCount', 'callAttempts', 'loginCount',
      
      // Document Flags (verification-checkbox fields handled separately)
      'dod',
      
      // Settings/Permissions
      'enableLogin', 'blockNotifications', 'allowedToTrade', 'withdrawLimitAllowed',
      'twoFAEnabled', 'allowed2fa', 'allowDeposit', 'allowWithdraw',
      'depositLimit', 'withdrawLimit', 'marginCall', 'miniDeposit', 'stopOut',
      
      // Trading Instruments
      'swapType', 'forex', 'crypto', 'commodities', 'indices', 'stocks',
      
      // Marketing Information
      'campaignId', 'tag', 'gclid', 'platform',
      
      // Profile Financial Data
      'avatarUrl', 'balance', 'marginLevel', 'openPnl', 'totalPnl',
      'freeMargin', 'margin', 'equity', 'openVolume',
      
      // Address Fields
      'address.line1', 'address.line2', 'address.zip', 'address.city', 'address.state'
    ]
    
    if (phaseAFields.includes(fieldKey)) {
      return <UnifiedFieldWrapper entityId={entityId} fieldKey={fieldKey} />
    }

    // Legacy fields that will be migrated in later phases
    if (fieldKey === 'finance.ftd.paymentMethod') {
      return <PaymentGatewayField clientId={entityId} />
    }
    
    // Legacy KYC field (Phase B migration)
    if (fieldKey === 'kycStatus' && !phaseAFields.includes(fieldKey)) {
      return <KYCStatusField clientId={entityId} />
    }
    
    // Special handling for address and client detail fields - editable text inputs
    if (['address.line1', 'address.line2', 'address.city', 'address.state', 'address.zip', 'nationality'].includes(fieldKey)) {
      return <TextFieldInput clientId={entityId} fieldKey={fieldKey} type="text" />
    }
    
    // Special handling for phone fields - editable dual inputs
    if (['phoneNumber', 'phoneNumber2'].includes(fieldKey)) {
      return <PhoneFieldInput clientId={entityId} fieldKey={fieldKey} />
    }
    
    // Special handling for boolean fields (dod, documents verification) - editable checkbox
    if (['dod', 'idPassport', 'proofOfAddress', 'creditCardFront', 'creditCardBack'].includes(fieldKey)) {
      return (
        <Checkbox
          id={fieldKey}
          checked={Boolean(currentValue)}
          onCheckedChange={(checked) => {
            dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: checked }))
          }}
        />
      )
    }
    
    if (fieldConfig.type === 'verification-checkbox') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={fieldKey}
            checked={Boolean(currentValue)}
            onCheckedChange={(checked) => {
              dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: checked }))
            }}
          />
          <Label
            htmlFor={fieldKey}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {fieldConfig.label}
          </Label>
        </div>
      )
    }
    
    // Default handling for boolean fields - editable checkboxes
    if (fieldConfig.type === 'boolean') {
      return (
        <Checkbox
          id={fieldKey}
          checked={Boolean(currentValue)}
          onCheckedChange={(checked) => {
            dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: checked }))
          }}
        />
      )
    }
    
    // Default handling for percentage fields - number input with % display
    if (fieldConfig.type === 'percentage') {
      return <PercentageFieldInput clientId={entityId} fieldKey={fieldKey} />
    }
    
    // Default handling for select fields - dropdown with options
    if (fieldConfig.type === 'select' && fieldConfig.options) {
      return (
        <SelectFieldInput 
          clientId={entityId} 
          fieldKey={fieldKey} 
          options={fieldConfig.options}
          defaultValue={fieldConfig.defaultValue}
        />
      )
    }
    
    // Default handling for text-based fields - editable text inputs
    if (['text', 'email', 'number', 'textarea', 'date', 'datetime'].includes(fieldConfig.type)) {
      const inputType = fieldConfig.type === 'email' ? 'email' : 'text'
      return <TextFieldInput clientId={entityId} fieldKey={fieldKey} type={inputType} />
    }
    
    return (
      <div className="text-sm text-muted-foreground">
        {String(currentValue || '-')}
      </div>
    )
  }

  return renderField()
}