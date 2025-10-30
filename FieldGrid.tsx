import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectEntityById } from '@/state/entitiesSlice'
import { FieldConfig, FieldType } from '@/config/fields'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileUploadInput } from '@/components/FileUploadInput'
import { FieldInput } from '@/components/FieldInput'
import { coerceBoolean } from '@/lib/utils'
import { formatDateTimeForDisplay, formatDateOnlyForDisplay } from '@/utils/dateUtils'
import { 
  User, 
  Calendar, 
  Buildings, 
  IdentificationCard, 
  Phone, 
  Envelope, 
  Globe, 
  MapPin, 
  GenderIntersex, 
  Flag, 
  Translate, 
  Briefcase, 
  Star, 
  ChartLine, 
  CreditCard, 
  Bank, 
  Money, 
  Coins, 
  Receipt, 
  FileText,
  PencilSimple,
  ClockClockwise,
  Check,
  X,
  Eye,
  EyeSlash,
  AddressBook,
  House,
  NumberCircleOne,
  Placeholder,
  CheckCircle,
  XCircle,
  CreditCard as CreditCardIcon,
  Shield,
  WifiHigh
} from '@phosphor-icons/react'

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

interface FieldGridProps {
  entityId: string
  fields: FieldConfig[]
}

// Icon mapping for different field types
const getFieldIcon = (fieldKey: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Account fields
    'accountId': IdentificationCard,
    'createdAt': Calendar,
    'desk': Buildings,
    'salesManager': User,
    'retentionManager': User,
    'accountType': Briefcase,
    'regulation': FileText,
    
    // Personal fields
    'firstName': User,
    'lastName': User,
    'email': Envelope,
    'phoneNumber': Phone,
    'phoneNumber2': Phone,
    'country': Globe,
    'countryCode': Flag,
    'registeredIp': WifiHigh,
    'dateOfBirth': Calendar,
    'age': Calendar,
    'gender': GenderIntersex,
    'citizen': Flag,
    'language': Translate,
    
    // Activity fields
    'lastContactAt': ClockClockwise,
    'lastCommentAt': ClockClockwise,
    'firstLoginAt': ClockClockwise,
    'lastLoginAt': ClockClockwise,
    'lastActivityAt': ClockClockwise,
    'followUpAt': Calendar,
    'firstTradedAt': ChartLine,
    'lastTradedAt': ChartLine,
    
    // Engagement fields
    'noAnswerCount': Phone,
    'callAttempts': Phone,
    'loginCount': User,
    
    // Lifecycle fields
    'dateConverted': Calendar,
    'firstConversationOwner': User,
    'firstRetentionOwner': User,
    'conversationAssignedAt': Calendar,
    'retentionAssignedAt': Calendar,
    'retentionStatus': Star,
    'retentionReview': Star,
    'secondHandRetention': User,
    
    // Finance fields - Sales
    'totalFtd': Money,
    'ftdDate': Calendar,
    'ftd': CreditCard,
    'ftdSelf': CreditCard,
    'finance.ftd.paymentMethod': CreditCard,
    'ftdFirstConversation': Money,
    'daysToFtd': Calendar,
    
    // Finance fields - Retention
    'totalDeposits': Bank,
    'totalWithdraws': Coins,
    'netWithdraws': Coins,
    'totalChargebacks': Receipt,
    'finance.credit.totalCredit': Money,
    'netCredits': Money,
    'creditsOut': Money,
    'netDeposits': ChartLine,
    'daysToDeposit': Calendar,
    'firstDepositDate': Calendar,
    'lastDepositDate': Calendar,
    'withdrawFromDeposit': Coins,
    
    // Status fields
    'kycStatus': FileText,
    'leadStatus': Star,
    'salesReview': Star,
    'salesSecondHand': User,
    
    // Documents & Address fields
    'address.line1': House,
    'address.line2': House,
    'address.zip': MapPin,
    'address.city': MapPin,
    'address.state': MapPin,
    'nationality': Flag,
    'dod': CheckCircle,
    'docs.idPassportVerified': Shield,
    'docs.proofOfAddressVerified': FileText,
    'docs.ccFrontVerified': CreditCardIcon,
    'docs.ccBackVerified': CreditCardIcon,
    'docs.idPassportFile': Shield,
    'docs.proofOfAddressFile': FileText,
    'docs.ccFrontFile': CreditCardIcon,
    'docs.ccBackFile': CreditCardIcon,
  }
  
  return iconMap[fieldKey] || FileText
}

// Format field values for display
const formatFieldValue = (value: any, field: FieldConfig, showMasked: boolean = true): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  
  switch (field.type) {
    case 'datetime':
      try {
        if (value && typeof value === 'string') {
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
        }
        return formatDateTimeForDisplay(value) || String(value)
      } catch {
        return String(value)
      }
    case 'date':
      try {
        if (value && typeof value === 'string') {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit'
            })
          }
        }
        return formatDateOnlyForDisplay(value) || String(value)
      } catch {
        return String(value)
      }
    case 'boolean':
      const boolVal = coerceBoolean(value)
      return boolVal === true ? 'Yes' : boolVal === false ? 'No' : 'Not Set'
    case 'verification-checkbox':
      return value === true ? 'Verified' : value === false ? 'Rejected' : 'Pending'
    case 'number':
      return value.toLocaleString()
    case 'phone':
      // Show masked or unmasked based on state
      if (showMasked && typeof value === 'string' && value.length > 4) {
        return value.slice(0, 3) + ' ••• ••••'
      }
      return value
    default:
      return String(value)
  }
}

export function FieldGrid({ entityId, fields }: FieldGridProps) {
  // Force re-render by including timestamp
  const forceRender = Date.now()
  const entity = useSelector(selectEntityById(entityId))
  const [maskedFields, setMaskedFields] = useState<Record<string, boolean>>({})
  
  if (!entity) {
    return <div className="text-muted-foreground">Entity not found</div>
  }
  
  const toggleMask = (fieldKey: string) => {
    setMaskedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }))
  }
  
  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 bg-white" 
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {fields.map((field, index) => {
        let value = getNestedValue(entity, field.key)
        
        // Handle calculated fields
        if (field.type === 'calculated' && field.compute) {
          value = field.compute(entity)
        }
        
        // Use default value if current value is undefined
        if (value === undefined || value === null) {
          value = field.defaultValue || ''
        }
        
        const IconComponent = getFieldIcon(field.key)
        const isPhoneField = field.type === 'phone'
        const isMasked = maskedFields[field.key] ?? true
        const displayValue = formatFieldValue(value, field, isMasked)
        
        // Calculate grid position for borders
        const isRightBorder = (index + 1) % 4 !== 0
        const isBottomBorder = index < fields.length - 4
        const isSmRightBorder = (index + 1) % 2 !== 0
        const isSmBottomBorder = index < fields.length - 2
        
        return (
          <div 
            key={field.key} 
            className={`
              group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px]
              ${isRightBorder ? 'lg:border-r' : ''} 
              ${isBottomBorder ? 'lg:border-b' : ''}
              ${isSmRightBorder ? 'sm:border-r lg:border-r-0' : 'sm:border-r-0'}
              ${isSmBottomBorder ? 'sm:border-b lg:border-b-0' : 'sm:border-b-0'}
              border-b
            `}
            style={{ 
              borderColor: '#E5E7EB'
            }}
          >
            {/* Label Section - Left Side */}
            <div className="flex items-center gap-2 flex-shrink-0 pr-4">
              <IconComponent className="h-4 w-4 text-gray-500" />
              <span 
                className="text-sm text-gray-700 truncate"
                style={{ 
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {field.label}:
              </span>
            </div>
            
            {/* Value Section - Right Side */}
            <div className="flex items-center flex-1 min-w-0">
              {field.type === 'file' ? (
                <div className="w-full">
                  <FileUploadInput entityId={entityId} fieldKey={field.key} />
                </div>
              ) : field.type === 'verification-checkbox' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'regulation' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'accountType' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'leadStatus' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'desk' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'language' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'gender' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'country' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'countryCode' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : field.key === 'registeredIp' ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : (['firstName', 'lastName', 'email', 'phoneNumber', 'phoneNumber2', 'dateOfBirth', 'salesReview', 'retentionReview', 'leadStatus', 'kycStatus', 'citizen', 'ftd', 'ftdSelf', 'finance.ftd.paymentMethod', 'address.line1', 'address.line2', 'address.zip', 'address.city', 'address.state', 'nationality', 'dod', 'idPassport', 'proofOfAddress', 'creditCardFront', 'creditCardBack', 'campaignId', 'tag', 'leadSource', 'utmKeyword', 'utmTerm', 'utmCreative', 'campaignSource', 'utmMedium', 'utmAdGroupId', 'utmAdPosition', 'utmCountry', 'utmFeedItemId', 'utmLandingPage', 'utmLanguage', 'utmMatchType', 'utmTargetId', 'gclid', 'utmContent', 'utmSource', 'utmAccount', 'utmAccountId', 'utmCampaign', 'utmCampaignId', 'utmAdGroupName', 'platform', 'utmDevice', 'forex', 'crypto', 'commodities', 'indices', 'stocks'].includes(field.key) || (['text', 'email', 'number', 'textarea', 'date', 'datetime', 'boolean', 'percentage', 'select'].includes(field.type) && !['lastCommentAt', 'lastContactAt', 'firstLoginAt', 'lastLoginAt', 'lastActivityAt', 'firstTradedAt', 'lastTradedAt', 'createdAt', 'dateConverted', 'conversationAssignedAt', 'retentionAssignedAt', 'ftdDate', 'firstDepositDate', 'lastDepositDate'].includes(field.key))) ? (
                <div className="w-full">
                  <FieldInput entityId={entityId} fieldKey={field.key} fieldConfig={field} />
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span 
                    className="text-sm text-gray-600 truncate flex-1"
                    style={{ 
                      fontWeight: 400,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {displayValue}
                  </span>
                  {isPhoneField && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                      onClick={() => toggleMask(field.key)}
                    >
                      {isMasked ? (
                        <Eye className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <EyeSlash className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}