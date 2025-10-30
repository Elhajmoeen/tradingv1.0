import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { verify } from '@/services/authStub'
import type { RootState } from './store'
import type { CrmUser, UserPermission } from './usersSlice'

interface AuthUser {
  id: string
  email: string
  fullName: string
  permission: UserPermission
  avatar?: string
}

interface AuthState {
  currentUser: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: string
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
}

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, passwordPlain, remember = false }: { email: string; passwordPlain: string; remember?: boolean }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const user = state.users.items.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!user) {
        return rejectWithValue('User not found')
      }
      
      if (!user.isActive) {
        return rejectWithValue('Account disabled')
      }
      
      const isValid = await verify(passwordPlain, user.passwordHash)
      if (!isValid) {
        return rejectWithValue('Invalid password')
      }
      
      const authUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        permission: user.permission || 'Viewer',
        avatar: user.avatar
      }

      // Handle remember me functionality
      if (remember) {
        localStorage.setItem('crm.session', JSON.stringify({
          userId: user.id,
          t: Date.now()
        }))
      } else {
        localStorage.removeItem('crm.session')
      }

      return authUser
    } catch (error) {
      return rejectWithValue('Login failed')
    }
  }
)

// Session restoration thunk
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { getState, rejectWithValue }) => {
    try {
      const sessionData = localStorage.getItem('crm.session')
      if (!sessionData) {
        return rejectWithValue('No session found')
      }

      const { userId, t } = JSON.parse(sessionData)
      
      // Check if session is too old (7 days)
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - t > sevenDaysMs) {
        localStorage.removeItem('crm.session')
        return rejectWithValue('Session expired')
      }

      const state = getState() as RootState
      const user = state.users.items.find(u => u.id === userId)
      
      if (!user || !user.isActive) {
        localStorage.removeItem('crm.session')
        return rejectWithValue('User not found or inactive')
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        permission: user.permission || 'Viewer',
        avatar: user.avatar
      }
    } catch (error) {
      localStorage.removeItem('crm.session')
      return rejectWithValue('Session restoration failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
      state.error = undefined
      // Clear remembered session
      localStorage.removeItem('crm.session')
    },
    clearError: (state) => {
      state.error = undefined
    },
    setAvatarUrl: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.avatar = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.error = undefined
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.currentUser = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.error = undefined
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false
        state.currentUser = null
        state.isAuthenticated = false
        // Don't set error for failed session restoration
      })
  }
})

export const { logout, clearError, setAvatarUrl } = authSlice.actions

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.currentUser
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectAuthError = (state: RootState) => state.auth.error

export const selectUserPermission = (state: RootState) => state.auth.currentUser?.permission || 'Viewer'
export const selectIsAdmin = (state: RootState) => state.auth.currentUser?.permission === 'Admin'
export const selectCanManageUsers = (state: RootState) => {
  const permission = state.auth.currentUser?.permission
  return permission === 'Admin' || permission === 'Manager'
}

export default authSlice.reducer
