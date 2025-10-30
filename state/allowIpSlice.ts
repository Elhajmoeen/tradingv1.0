import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

// AllowIp data model
export type AllowIp = {
  id: string
  ip: string             // IPv4 or IPv6
  description?: string
  createdOn: string      // ISO string
  createdBy: string      // display name or userId→map later
  updatedOn?: string     // ISO string
  isActive: boolean      // true = enabled, false = disabled
}

type AllowIpState = {
  items: AllowIp[]
  loading: boolean
  error?: string
}

// Initial state with demo data
const initialState: AllowIpState = {
  items: [],
  loading: false,
  error: undefined,
}

// Helper to generate unique IDs
const generateId = () => `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const allowIpSlice = createSlice({
  name: 'allowIp',
  initialState,
  reducers: {
    // Seed with demo data (dev only)
    seedIfEmpty: (state) => {
      if (state.items.length === 0) {
        const now = new Date().toISOString()
        const demoIps: AllowIp[] = [
          {
            id: generateId(),
            ip: '192.168.1.100',
            description: 'Office network gateway',
            createdOn: now,
            createdBy: 'John Doe',
            updatedOn: now,
            isActive: true,
          },
          {
            id: generateId(),
            ip: '10.0.0.50',
            description: 'Development server',
            createdOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            createdBy: 'Jane Smith',
            updatedOn: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            isActive: true,
          },
          {
            id: generateId(),
            ip: '203.0.113.45',
            description: 'Client VPN endpoint',
            createdOn: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            createdBy: 'Mike Johnson',
            isActive: false,
          },
          {
            id: generateId(),
            ip: '2001:db8::1',
            description: 'IPv6 test server',
            createdOn: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            createdBy: 'Alice Chen',
            updatedOn: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            isActive: true,
          },
          {
            id: generateId(),
            ip: '172.16.0.1',
            description: 'Internal load balancer',
            createdOn: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            createdBy: 'Bob Wilson',
            isActive: true,
          },
        ]
        state.items = demoIps
      }
    },

    // Add new IP
    addIp: (state, action: PayloadAction<{ ip: string; description?: string }>) => {
      const { ip, description } = action.payload
      const now = new Date().toISOString()
      const newIp: AllowIp = {
        id: generateId(),
        ip,
        description,
        createdOn: now,
        createdBy: 'Current User', // TODO: Replace with actual user
        updatedOn: now,
        isActive: true,
      }
      state.items.push(newIp)
    },

    // Update IP (ip and/or description only)
    updateIp: (state, action: PayloadAction<{ id: string; patch: Partial<Pick<AllowIp, 'ip' | 'description'>> }>) => {
      const { id, patch } = action.payload
      const item = state.items.find(item => item.id === id)
      if (item) {
        if (patch.ip !== undefined) item.ip = patch.ip
        if (patch.description !== undefined) item.description = patch.description
        item.updatedOn = new Date().toISOString()
      }
    },

    // Set IP active/inactive
    setIpActive: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const { id, isActive } = action.payload
      const item = state.items.find(item => item.id === id)
      if (item) {
        item.isActive = isActive
        item.updatedOn = new Date().toISOString()
      }
    },

    // Remove IP (keep for later use)
    removeIp: (state, action: PayloadAction<{ id: string }>) => {
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
  addIp,
  updateIp,
  setIpActive,
  removeIp,
  setLoading,
  setError,
} = allowIpSlice.actions

// Selectors
export const selectAllIps = (state: RootState) => state.allowIp.items

export const selectActiveIps = (state: RootState) => 
  state.allowIp.items.filter(item => item.isActive)

export const selectByQuery = (state: RootState, query: string) => {
  if (!query.trim()) return state.allowIp.items
  
  const lowerQuery = query.toLowerCase()
  return state.allowIp.items.filter(item => 
    item.ip.toLowerCase().includes(lowerQuery) ||
    (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
    item.createdBy.toLowerCase().includes(lowerQuery)
  )
}

export const selectAllowIpLoading = (state: RootState) => state.allowIp.loading
export const selectAllowIpError = (state: RootState) => state.allowIp.error

export default allowIpSlice.reducer