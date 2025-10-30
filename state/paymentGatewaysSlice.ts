import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

// Payment Gateway data model
export interface Gateway {
  id: string
  name: string           // unique label shown in dropdowns
  provider?: string      // optional (e.g., "Checkout.com")
  currency?: string      // optional (e.g., "USD", "AED")
  links: {
    a500?: string        // URL for 500
    a1000?: string       // URL for 1000
    a2500?: string       // URL for 2500
    a3000?: string       // URL for 3000
    a5000?: string       // URL for 5000
  }
  isActive: boolean      // controls visibility in field dropdowns
  createdOn: string      // ISO
  updatedOn?: string     // ISO
  createdBy: string      // display name or user id ref
}

interface PaymentGatewaysState {
  items: Gateway[]
  loading: boolean
  error?: string
}

const initialState: PaymentGatewaysState = {
  items: [],
  loading: false,
}

// Demo data for seeding
const demoGateways: Gateway[] = [
  {
    id: '1',
    name: 'Checkout.com USD',
    provider: 'Checkout.com',
    currency: 'USD',
    links: {
      a500: 'https://checkout.com/pay/usd-500',
      a1000: 'https://checkout.com/pay/usd-1000',
      a2500: 'https://checkout.com/pay/usd-2500',
      a3000: 'https://checkout.com/pay/usd-3000',
      a5000: 'https://checkout.com/pay/usd-5000',
    },
    isActive: true,
    createdOn: '2024-01-15T10:00:00.000Z',
    updatedOn: '2024-01-20T14:30:00.000Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    name: 'PayPal EUR',
    provider: 'PayPal',
    currency: 'EUR',
    links: {
      a500: 'https://paypal.com/checkout/eur/500',
      a1000: 'https://paypal.com/checkout/eur/1000',
      a2500: 'https://paypal.com/checkout/eur/2500',
    },
    isActive: true,
    createdOn: '2024-01-18T09:15:00.000Z',
    updatedOn: '2024-01-25T11:45:00.000Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    name: 'Stripe AED',
    provider: 'Stripe',
    currency: 'AED',
    links: {
      a500: 'https://stripe.com/payments/aed/500',
      a1000: 'https://stripe.com/payments/aed/1000',
      a2500: 'https://stripe.com/payments/aed/2500',
      a3000: 'https://stripe.com/payments/aed/3000',
      a5000: 'https://stripe.com/payments/aed/5000',
    },
    isActive: false, // Disabled for demo
    createdOn: '2024-01-10T08:30:00.000Z',
    createdBy: 'admin',
  },
]

// Helper to generate unique IDs
const generateId = () => `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const paymentGatewaysSlice = createSlice({
  name: 'paymentGateways',
  initialState,
  reducers: {
    // Seed with demo data (dev only)
    seedIfEmpty: (state) => {
      if (state.items.length === 0) {
        state.items = demoGateways
      }
    },

    // Add new gateway
    addGateway: (state, action: PayloadAction<{
      name: string
      provider?: string
      currency?: string
      links?: Partial<Gateway['links']>
    }>) => {
      const { name, provider, currency, links } = action.payload
      const now = new Date().toISOString()

      const newGateway: Gateway = {
        id: generateId(),
        name: name.trim(),
        provider: provider?.trim(),
        currency: currency?.trim(),
        links: links || {},
        isActive: true,
        createdOn: now,
        updatedOn: now,
        createdBy: 'current_user', // TODO: Replace with actual user
      }

      state.items.push(newGateway)
    },

    // Update existing gateway
    updateGateway: (state, action: PayloadAction<{
      id: string
      patch: Partial<Pick<Gateway, 'name' | 'provider' | 'currency' | 'links'>>
    }>) => {
      const { id, patch } = action.payload
      const gateway = state.items.find(item => item.id === id)
      
      if (gateway) {
        if (patch.name !== undefined) {
          gateway.name = patch.name.trim()
        }
        if (patch.provider !== undefined) {
          gateway.provider = patch.provider?.trim()
        }
        if (patch.currency !== undefined) {
          gateway.currency = patch.currency?.trim()
        }
        if (patch.links !== undefined) {
          gateway.links = { ...gateway.links, ...patch.links }
        }
        gateway.updatedOn = new Date().toISOString()
      }
    },

    // Set gateway active/inactive
    setGatewayActive: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const { id, isActive } = action.payload
      const gateway = state.items.find(item => item.id === id)
      
      if (gateway) {
        gateway.isActive = isActive
        gateway.updatedOn = new Date().toISOString()
      }
    },

    // Remove gateway (keep but don't surface now)
    removeGateway: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      state.items = state.items.filter(item => item.id !== id)
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Set error state
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload
    },
  },
})

export const {
  seedIfEmpty,
  addGateway,
  updateGateway,
  setGatewayActive,
  removeGateway,
  setLoading,
  setError,
} = paymentGatewaysSlice.actions

// Selectors
export const selectAllGateways = (state: RootState) => state.paymentGateways.items

export const selectActiveGateways = (state: RootState) => 
  state.paymentGateways.items
    .filter(gateway => gateway.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

export const selectGatewaysByQuery = (state: RootState, query: string) => {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return state.paymentGateways.items
  
  return state.paymentGateways.items.filter(gateway =>
    gateway.name.toLowerCase().includes(normalizedQuery) ||
    (gateway.provider && gateway.provider.toLowerCase().includes(normalizedQuery)) ||
    (gateway.currency && gateway.currency.toLowerCase().includes(normalizedQuery)) ||
    Object.values(gateway.links).some(link => 
      link && link.toLowerCase().includes(normalizedQuery)
    )
  )
}

export const selectGatewayById = (state: RootState, id: string) =>
  state.paymentGateways.items.find(gateway => gateway.id === id)

export const selectPaymentGatewaysLoading = (state: RootState) => state.paymentGateways.loading
export const selectPaymentGatewaysError = (state: RootState) => state.paymentGateways.error

// Validation helpers
export const isUniqueGatewayName = (state: RootState, name: string, excludeId?: string) => {
  return !state.paymentGateways.items.some(gateway => 
    gateway.name.toLowerCase() === name.toLowerCase() && gateway.id !== excludeId
  )
}

export default paymentGatewaysSlice.reducer