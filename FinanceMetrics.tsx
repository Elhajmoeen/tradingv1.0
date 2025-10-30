import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectEntityById } from '@/state/entitiesSlice'
import { FieldConfig } from '@/config/fields'
import { Button } from '@/components/ui/button'
import { FileUploadInput } from '@/components/FileUploadInput'
import { FieldInput } from '@/components/FieldInput'
import { coerceBoolean } from '@/lib/utils'
import { 
  User, 
  Calendar, 
  Phone, 
  Envelope, 
  ChartLine, 
  CreditCard, 
  Bank, 
  Money, 
  Coins, 
  Receipt, 
  FileText,
  ClockClockwise,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

interface FinanceMetricsProps {
  entityId: string
}

// Icon mapping for different field types
const getFieldIcon = (fieldKey: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // FTD fields
    'finance.ftd.totalFTD': Money,
    'finance.ftd.ftdDateISO': Calendar,
    'finance.ftd.isFTD': CreditCard,
    'ftdSelf': CreditCard,
    'finance.ftd.paymentMethod': CreditCard,
    'ftdFirstConversation': Money,
    'finance.ftd.daysToFTD': Calendar,
    
    // Deposit fields
    'finance.deposit.totalDeposit': Bank,
    'finance.deposit.netDeposit': ChartLine,
    'finance.deposit.daysToDeposit': Calendar,
    'finance.deposit.firstDepositDateISO': Calendar,
    'finance.deposit.lastDepositDateISO': Calendar,
    
    // Withdrawal fields
    'finance.withdrawal.totalWithdrawal': Coins,
    'finance.withdrawal.netWithdrawal': Coins,
    'finance.withdrawal.daysToWithdrawal': Calendar,
    'finance.withdrawal.firstWithdrawalDateISO': Calendar,
    'finance.withdrawal.lastWithdrawalDateISO': Calendar,
    'withdrawFromDeposit': Coins,
    
    // FTW and Credit fields
    'finance.ftw.totalFTW': Money,
    'finance.ftw.ftwDateISO': Calendar,
    'finance.ftw.isFTW': CreditCard,
    'finance.ftw.ftwSelf': CreditCard,
    'finance.ftw.daysToFTW': Calendar,
    'finance.credit.totalCredit': Money,
    'finance.credit.netCredit': Money,
    'finance.credit.totalCreditOut': Money,
    'totalChargebacks': Receipt,
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
      return new Date(value).toLocaleString()
    case 'date':
      return new Date(value).toLocaleDateString()
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

interface MetricRowProps {
  field: FieldConfig
  entity: any
  maskedFields: Record<string, boolean>
  toggleMask: (fieldKey: string) => void
  entityId: string
}

function MetricRow({ field, entity, maskedFields, toggleMask, entityId }: MetricRowProps) {
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
  
  return (
    <div 
      className="group flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors relative min-h-[48px] border-b last:border-b-0"
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
            <FieldInput entityId={entityId} fieldKey={field.key} />
          </div>
        ) : ['firstName', 'lastName', 'email', 'phoneNumber', 'phoneNumber2', 'dateOfBirth', 'salesReview', 'retentionReview', 'leadStatus', 'kycStatus', 'citizen', 'ftd', 'ftdSelf', 'finance.ftd.paymentMethod'].includes(field.key) ? (
          <div className="w-full">
            <FieldInput entityId={entityId} fieldKey={field.key} />
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
}

export function FinanceMetrics({ entityId }: FinanceMetricsProps) {
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

  // Define the field configurations for each section
  const ftdFields: FieldConfig[] = [
    { key: 'finance.ftd.totalFTD', label: 'Total FTD', type: 'number' },
    { key: 'finance.ftd.ftdDateISO', label: 'FTD Date', type: 'date' },
    { key: 'finance.ftd.isFTD', label: 'FTD', type: 'text', compute: (entity: any) => entity.finance?.ftd?.isFTD ? 'Yes' : 'No' },
    { key: 'ftdSelf', label: 'FTD Self', type: 'text', compute: (entity: any) => entity.finance?.ftd?.ftdSelf ? 'Yes' : 'No' },
    { key: 'finance.ftd.daysToFTD', label: 'Days to FTD', type: 'number' },
    { key: 'ftdFirstConversation', label: 'FTD First Conversation', type: 'number' },
  ]

  const depositFields: FieldConfig[] = [
    { key: 'finance.deposit.totalDeposit', label: 'Total Deposits', type: 'number', defaultValue: 0 },
    { key: 'finance.deposit.netDeposit', label: 'Net Deposits', type: 'number', defaultValue: 0 },
    { key: 'finance.deposit.firstDepositDateISO', label: 'First Deposit Date', type: 'datetime' },
    { key: 'finance.deposit.lastDepositDateISO', label: 'Last Deposit Date', type: 'datetime' },
    { key: 'finance.deposit.daysToDeposit', label: 'Days to Deposit', type: 'number', defaultValue: 0 },
    { key: 'finance.ftd.paymentMethod', label: 'Payment Gateway', type: 'text' },
  ]

  const withdrawalFields: FieldConfig[] = [
    { key: 'finance.withdrawal.totalWithdrawal', label: 'Total Withdrawals', type: 'number', defaultValue: 0 },
    { key: 'finance.withdrawal.netWithdrawal', label: 'Net Withdrawals', type: 'number', defaultValue: 0 },
    { key: 'finance.withdrawal.firstWithdrawalDateISO', label: 'First Withdrawal Date', type: 'datetime' },
    { key: 'finance.withdrawal.lastWithdrawalDateISO', label: 'Last Withdrawal Date', type: 'datetime' },
    { key: 'finance.withdrawal.daysToWithdrawal', label: 'Days to Withdrawal', type: 'number', defaultValue: 0 },
    { key: 'withdrawFromDeposit', label: 'Withdraw from Deposit', type: 'number', defaultValue: 0 },
    // FTW-related fields moved from Credits section
    { key: 'finance.ftw.ftwDateISO', label: 'FTW Date', type: 'date' },
    { key: 'finance.ftw.ftwSelf', label: 'FTW Self', type: 'text', compute: (entity: any) => entity.finance?.ftw?.ftwSelf ? 'Yes' : 'No' },
  ]

  const creditFields: FieldConfig[] = [
    { key: 'finance.credit.totalCredit', label: 'Total Credits', type: 'number', defaultValue: 0 },
    { key: 'finance.credit.netCredit', label: 'Net Credits', type: 'number', defaultValue: 0 },
    { key: 'finance.credit.totalCreditOut', label: 'Credits Out', type: 'number', defaultValue: 0 },
    { key: 'totalChargebacks', label: 'Total Chargebacks', type: 'number', defaultValue: 0 },
  ]
  
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* FTD Section */}
      <section className="rounded-2xl border bg-background p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">FTD</h3>
        <div>
          {ftdFields.map((field) => (
            <MetricRow 
              key={field.key}
              field={field}
              entity={entity}
              maskedFields={maskedFields}
              toggleMask={toggleMask}
              entityId={entityId}
            />
          ))}
        </div>
      </section>

      {/* Deposits Section */}
      <section className="rounded-2xl border bg-background p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Deposits</h3>
        <div>
          {depositFields.map((field) => (
            <MetricRow 
              key={field.key}
              field={field}
              entity={entity}
              maskedFields={maskedFields}
              toggleMask={toggleMask}
              entityId={entityId}
            />
          ))}
        </div>
      </section>

      {/* Withdrawals Section */}
      <section className="rounded-2xl border bg-background p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Withdrawals</h3>
        <div>
          {withdrawalFields.map((field) => (
            <MetricRow 
              key={field.key}
              field={field}
              entity={entity}
              maskedFields={maskedFields}
              toggleMask={toggleMask}
              entityId={entityId}
            />
          ))}
        </div>
      </section>

      {/* Credits Section */}
      <section className="rounded-2xl border bg-background p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Credits</h3>
        <div>
          {creditFields.map((field) => (
            <MetricRow 
              key={field.key}
              field={field}
              entity={entity}
              maskedFields={maskedFields}
              toggleMask={toggleMask}
              entityId={entityId}
            />
          ))}
        </div>
      </section>
    </div>
  )
}