import { configureStore } from '@reduxjs/toolkit'
import notesReducer from './notesSlice'
import entitiesReducer, { setEntities } from './entitiesSlice'
import transactionsReducer from './transactionsSlice'
import positionsReducer from './positionsSlice' // Clean simple slice
import marketReducer from '../features/market/marketSlice'
import emailReducer from '../features/email/emailSlice'
import commentsReducer from '../features/comments/commentsSlice'
import accountTypesReducer from './accountTypesSlice'
import assetsReducer from './assetsSlice'
import accountTypeAssetRulesReducer from './accountTypeAssetRulesSlice'
import allowIpReducer from './allowIpSlice'
import emailTemplatesReducer from './emailTemplatesSlice'
import paymentGatewaysReducer from './paymentGatewaysSlice'
import usersReducer from './usersSlice'
import authReducer from './authSlice'
import activityLogsReducer from './activityLogSlice'
import { baseApi } from '@/integration/baseApi'
import { activityRecorderMiddleware } from '@/middleware/activityRecorder'

// Import the positions API to ensure it's injected into baseApi
import '@/features/positions_next/state/positionsApi'

// Import the transactions API to ensure it's injected into baseApi
import '@/features/transactions_next/state/transactionsApi'

// Import the leads API to ensure it's injected into baseApi
import '@/features/leads_next/state/leadsApi'

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    entities: entitiesReducer,
    comments: commentsReducer,
    transactions: transactionsReducer,
    positions: positionsReducer,
    market: marketReducer,
    email: emailReducer,
    accountTypes: accountTypesReducer,
    assets: assetsReducer,
    accountTypeAssetRules: accountTypeAssetRulesReducer,
    allowIp: allowIpReducer,
    emailTemplates: emailTemplatesReducer,
    paymentGateways: paymentGatewaysReducer,
    users: usersReducer,
    auth: authReducer,
    activityLogs: activityLogsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(activityRecorderMiddleware),
})

// Load state from localStorage after store creation
const loadStoredState = () => {
  try {
    const serializedState = localStorage.getItem('rtk-state')
    if (serializedState === null) {
      console.log('Redux: No saved state found, keeping initial state with mock data')
      return
    }
    
    const parsed = JSON.parse(serializedState)
    console.log('Redux: Found stored state in localStorage:', {
      hasPositions: !!parsed.positions,
      positionsCount: parsed.positions?.open?.length || 0,
      hasEntities: !!parsed.entities,
      entitiesCount: parsed.entities?.entities?.length || 0,
      fullStructure: {
        positions: parsed.positions ? Object.keys(parsed.positions) : null,
        entities: parsed.entities ? Object.keys(parsed.entities) : null
      }
    })
    
    // Only restore entities from localStorage, NEVER positions (always use mock data)
    if (parsed.entities?.entities?.length > 0) {
      console.log('Redux: Restoring entities from localStorage (keeping positions as mock data)')
      store.dispatch(setEntities(parsed.entities.entities))
    } else {
      console.log('Redux: localStorage data is empty, keeping initial state with mock data')
    }
    
    // FORCE: Ensure positions are always loaded from initialState, never from localStorage
    console.log('Redux: Force-ensuring positions mock data is available')
    const currentPositions = store.getState().positions
    console.log('Redux: Current positions state:', {
      openCount: currentPositions.open?.length || 0,
      closedCount: currentPositions.closed?.length || 0,
      pendingCount: currentPositions.pending?.length || 0
    })
    
  } catch (err) {
    console.warn('Redux: Failed to load stored state, keeping initial state:', err)
  }
}

// TEMP FIX: Clear localStorage to fix positions issue
if (typeof window !== 'undefined') {
  console.log('Redux: Clearing localStorage to fix positions issue')
  localStorage.removeItem('rtk-state')
}

// Load stored state on initialization
loadStoredState()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Save state to localStorage on every store change (demo only)
const saveState = (state: RootState) => {
  try {
    // Save everything except positions (keep positions as mock data)
    const { positions, ...stateWithoutPositions } = state
    const serializedState = JSON.stringify(stateWithoutPositions)
    localStorage.setItem('rtk-state', serializedState)
  } catch {
    // Ignore write errors
  }
}

// Utility to clear localStorage state if needed (for debugging)
export const clearStoredState = () => {
  try {
    localStorage.removeItem('rtk-state')
    console.log('Redux: Cleared stored state from localStorage')
  } catch (err) {
    console.warn('Redux: Failed to clear stored state:', err)
  }
}

// Make store and utilities available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).store = store
  ;(window as any).clearReduxState = clearStoredState
}

store.subscribe(() => {
  saveState(store.getState())
})