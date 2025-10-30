import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { hash } from '@/services/authStub'
import type { RootState } from './store'

export type UserPermission = 'Admin' | 'Manager' | 'Agent' | 'Viewer'

export interface CrmUser {
  id: string
  fullName: string
  email: string
  startDate?: string
  phone?: string
  permission?: UserPermission
  avatar?: string
  passwordHash: string
  isActive: boolean
  createdOn: string
  updatedOn?: string
  createdBy: string
}

interface UsersState {
  items: CrmUser[]
  loading: boolean
  error?: string
}

const initialState: UsersState = {
  items: [],
  loading: false,
}

// Demo data - Password: admin123 for all users
const demoUsers: CrmUser[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'admin@crm.com',
    startDate: '2024-01-15',
    phone: '+1 (555) 123-4567',
    permission: 'Admin',
    passwordHash: 'YWRtaW4xMjM=', // admin123 (base64 encoded for demo)
    isActive: true,
    createdOn: '2024-01-15T09:00:00Z',
    createdBy: 'System',
    updatedOn: '2024-10-15T14:30:00Z'
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@crm.com',
    startDate: '2024-02-01',
    phone: '+1 (555) 987-6543',
    permission: 'Manager',
    passwordHash: 'YWRtaW4xMjM=', // admin123 (base64 encoded for demo)
    isActive: true,
    createdOn: '2024-02-01T10:15:00Z',
    createdBy: 'admin@crm.com',
    updatedOn: '2024-10-10T11:20:00Z'
  },
  {
    id: '3',
    fullName: 'Michael Chen',
    email: 'michael.chen@crm.com',
    startDate: '2024-03-10',
    phone: '+1 (555) 456-7890',
    permission: 'Agent',
    passwordHash: 'YWRtaW4xMjM=', // admin123 (base64 encoded for demo)
    isActive: true,
    createdOn: '2024-03-10T08:45:00Z',
    createdBy: 'sarah.johnson@crm.com',
    updatedOn: '2024-10-12T16:45:00Z'
  },
  {
    id: '4',
    fullName: 'Emily Davis',
    email: 'emily.davis@crm.com',
    startDate: '2024-04-05',
    phone: '+1 (555) 321-0987',
    permission: 'Agent',
    passwordHash: 'YWRtaW4xMjM=', // admin123 (base64 encoded for demo)
    isActive: false,
    createdOn: '2024-04-05T13:20:00Z',
    createdBy: 'sarah.johnson@crm.com',
    updatedOn: '2024-09-30T09:15:00Z'
  },
  {
    id: '5',
    fullName: 'David Wilson',
    email: 'david.wilson@crm.com',
    startDate: '2024-05-20',
    phone: '+1 (555) 654-3210',
    permission: 'Viewer',
    passwordHash: 'YWRtaW4xMjM=', // admin123 (base64 encoded for demo)
    isActive: true,
    createdOn: '2024-05-20T11:30:00Z',
    createdBy: 'admin@crm.com',
    updatedOn: '2024-10-08T15:10:00Z'
  }
]

// Async thunks
export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData: { fullName: string; email: string; startDate?: string; phone?: string; permission?: UserPermission; avatar?: string; password: string }) => {
    const passwordHash = await hash(userData.password)
    const newUser: CrmUser = {
      id: Date.now().toString(),
      fullName: userData.fullName,
      email: userData.email,
      startDate: userData.startDate,
      phone: userData.phone,
      permission: userData.permission || 'Viewer',
      avatar: userData.avatar,
      passwordHash,
      isActive: true,
      createdOn: new Date().toISOString(),
      createdBy: 'Current User'
    }
    return newUser
  }
)

export const resetPassword = createAsyncThunk(
  'users/resetPassword',
  async ({ id, newPasswordPlain }: { id: string; newPasswordPlain: string }) => {
    const passwordHash = await hash(newPasswordPlain)
    return { id, passwordHash }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    seedIfEmpty: (state) => {
      if (state.items.length === 0) {
        state.items = demoUsers
      }
    },
    updateUser: (state, action: PayloadAction<{ id: string; patch: Partial<CrmUser> }>) => {
      const { id, patch } = action.payload
      const user = state.items.find(u => u.id === id)
      if (user) {
        Object.assign(user, patch, { updatedOn: new Date().toISOString() })
      }
    },
    setUserActive: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const { id, isActive } = action.payload
      const user = state.items.find(u => u.id === id)
      if (user) {
        user.isActive = isActive
        user.updatedOn = new Date().toISOString()
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.loading = true
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        const { id, passwordHash } = action.payload
        const user = state.items.find(u => u.id === id)
        if (user) {
          user.passwordHash = passwordHash
          user.updatedOn = new Date().toISOString()
        }
      })
  }
})

export const { seedIfEmpty, updateUser, setUserActive } = usersSlice.actions

// Selectors
export const selectAllUsers = (state: RootState) => state.users.items
export const selectUsersByQuery = (state: RootState, query: string) => {
  const normalizedQuery = query.toLowerCase().trim()
  if (!normalizedQuery) return state.users.items
  
  return state.users.items.filter(user =>
    user.fullName.toLowerCase().includes(normalizedQuery) ||
    user.email.toLowerCase().includes(normalizedQuery) ||
    (user.phone && user.phone.toLowerCase().includes(normalizedQuery))
  )
}

export const selectUserByEmail = (state: RootState, email: string) =>
  state.users.items.find(user => user.email.toLowerCase() === email.toLowerCase())

export const selectUserById = (state: RootState, id: string) =>
  state.users.items.find(user => user.id === id)

export const selectUsersLoading = (state: RootState) => state.users.loading
export const selectUsersError = (state: RootState) => state.users.error

export const selectIsEmailAvailable = (state: RootState, email: string, excludeId?: string) =>
  !state.users.items.some(user =>
    user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId
  )

export default usersSlice.reducer
