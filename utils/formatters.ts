/**
 * Format enum values with proper fallbacks (no more "Offline" defaults)
 */
export function formatEnum<T extends string | number>(
  value: T | null | undefined,
  map: Record<string, string>,
  fallback: string = '-'
): string {
  if (value === null || value === undefined || value === '') return fallback
  const label = map[String(value)]
  return label ?? fallback
}

/**
 * Transaction type mapping
 */
export const TRANSACTION_TYPE_MAP: Record<string, string> = {
  'Deposit': 'Deposit',
  'deposit': 'Deposit',
  'Withdraw': 'Withdrawal',
  'withdrawal': 'Withdrawal', 
  'withdraw': 'Withdrawal',
  'Credit': 'Credit',
  'credit': 'Credit',
  'credit_in': 'Credit',
  'Credit Out': 'Credit Out',
  'credit_out': 'Credit Out',
  'chargeback': 'Chargeback',
  'bonus': 'Bonus',
  'commission': 'Commission',
  'fee': 'Fee',
  'adjustment': 'Adjustment',
  'transfer': 'Transfer'
}

/**
 * Lead status mapping
 */
export const LEAD_STATUS_MAP: Record<string, string> = {
  'New': 'New',
  'new': 'New',
  'Warm': 'Warm',
  'warm': 'Warm',
  'Hot': 'Hot', 
  'hot': 'Hot',
  'Cold': 'Cold',
  'cold': 'Cold',
  'Qualified': 'Qualified',
  'qualified': 'Qualified',
  'contacted': 'Contacted',
  'demo': 'Demo Scheduled',
  'negotiation': 'In Negotiation',
  'converted': 'Converted',
  'lost': 'Lost',
  'nurture': 'Nurturing',
  'callback': 'Callback Scheduled',
  'not_interested': 'Not Interested',
  'invalid': 'Invalid Lead'
}

/**
 * KYC status mapping
 */
export const KYC_STATUS_MAP: Record<string, string> = {
  'pending': 'Pending',
  'submitted': 'Submitted',
  'under_review': 'Under Review',
  'approved': 'Approved',
  'rejected': 'Rejected',
  'expired': 'Expired',
  'verified': 'Verified',
  'declined': 'Declined',
  'resubmission_required': 'Resubmission Required'
}

/**
 * Retention status mapping
 */
export const RETENTION_STATUS_MAP: Record<string, string> = {
  'active': 'Active',
  'inactive': 'Inactive',
  'pending': 'Pending',
  'churned': 'Churned',
  'at_risk': 'At Risk',
  'engaged': 'Engaged',
  'disengaged': 'Disengaged'
}

/**
 * Account type mapping
 */
export const ACCOUNT_TYPE_MAP: Record<string, string> = {
  'demo': 'Demo',
  'live': 'Live',
  'islamic': 'Islamic',
  'pro': 'Pro',
  'vip': 'VIP',
  'corporate': 'Corporate',
  'gold': 'Gold',
  'silver': 'Silver',
  'bronze': 'Bronze',
  'Individual': 'Individual'
}

/**
 * Boolean formatter with proper null handling
 */
export function formatBoolean(value: boolean | null | undefined, fallback: string = '-'): string {
  if (value === null || value === undefined) return fallback
  return value ? 'Yes' : 'No'
}

/**
 * Currency formatter with proper null handling
 */
export function formatCurrency(value: number | null | undefined, fallback: string = '-'): string {
  if (value === null || value === undefined) return fallback
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Date formatter with proper null handling
 */
export function formatDate(value: string | null | undefined, fallback: string = '-'): string {
  if (!value) return fallback
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value))
  } catch {
    return fallback
  }
}