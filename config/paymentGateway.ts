export const PAYMENT_GATEWAY_OPTIONS = [
  'Stripe',
  'My Fatoorah',
  'Telr',
  'Adyen'
] as const

export type PaymentGateway = typeof PAYMENT_GATEWAY_OPTIONS[number]

export const normalizePaymentGateway = (value: string): string => {
  if (!value || typeof value !== 'string') return ''
  
  const normalized = value.trim()
  const found = PAYMENT_GATEWAY_OPTIONS.find(gateway => 
    gateway.toLowerCase() === normalized.toLowerCase()
  )
  
  return found || normalized
}