import * as React from 'react'
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store, AppDispatch } from '@/state/store'
import { restoreSession, selectCurrentUser } from '@/state/authSlice'
import { initializeFinanceSystem } from '@/state/financeActions'
import { setInstruments, updateQuote } from '@/features/market/marketSlice'
import { seedDefaultsOnce } from '@/state/accountTypesSlice'
import { seedDefaultsOnce as seedAssetsDefaults, selectAllAssets } from '@/state/assetsSlice'
import { seedDefaultRulesForAccountType } from '@/state/accountTypeAssetRulesSlice'
import { seedIfEmpty } from '@/state/usersSlice'
import { seedIfEmpty as seedPaymentGateways } from '@/state/paymentGatewaysSlice'
import { FilterBuilderTest } from '@/features/leads_next/components'
import { instruments } from '@/config/instruments'
// Removed positions mock - starting fresh
// import { mockInstruments, startMockQuotes } from '@/features/positions/mock'
import { setupDevUtilities } from '@/features/devUtils'
import { Header } from '@/components/header'
import { DataSeeder } from '@/components/DataSeeder'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { isPositionsNextEnabled } from '@/lib/flags'
import { initPositionsRealtimeNext } from '@/features/positions_next/ws'
import ProfilePage from '@/pages/Profile'
import UserProfilePage from '@/pages/UserProfile'
import ProfileSettingsPage from '@/pages/settings/profile/ProfileSettingsPage'
import LeadsPageWrapper from '@/pages/LeadsPageWrapper'
import { CustomThemeProvider } from '@/features/theme/ThemeProvider'
import ActiveClientsPage from '@/pages/ActiveClientsPage'
import DashboardPage from '@/pages/DashboardPage'
import OpenPositionsPage from '@/pages/positions/OpenPositionsPage'
import { ClosedPositionsPage } from '@/pages/ClosedPositionsPage'
import PendingPositionsPage from '@/pages/positions/PendingPositionsPage'
import TransactionsPage from '@/pages/TransactionsPage'
import CompliancePage from '@/pages/CompliancePage'
import AccountTypesPage from '@/pages/management/trading/AccountTypesPage'
import AccountTypeSettingsPage from '@/features/accountTypes/AccountTypeSettingsPage'
import NewAccountTypePage from '@/pages/settings/account-types/NewAccountTypePage'
import AllowIpPage from '@/pages/settings/administration/AllowIpPage'
import EmailTemplatesPage from '@/pages/settings/administration/EmailTemplatesPage'
import PaymentGatewaysPage from '@/pages/settings/administration/PaymentGatewaysPage'
import UsersPage from '@/pages/UsersPage'
import UserEditPage from '@/pages/UserEditPage'
// PATCH: begin StatusManager import
import SimpleStatusManagerPage from '@/pages/SimpleStatusManagerPage'
// PATCH: end StatusManager import
import LoginPage from '@/pages/auth/LoginPage'
import ProtectedRoute from '@/components/routing/ProtectedRoute'

// Create Material-UI theme
const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blue-600
    },
    secondary: {
      main: '#dc2626', // Red-600
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem',
        },
      },
    },
  },
})

function AppContent() {
    const dispatch = useDispatch<AppDispatch>()
    const currentUser = useSelector(selectCurrentUser)
    
    useEffect(() => {
        // Try to restore session on app start
        dispatch(restoreSession())
        
        // Initialize clean finance system on app start
        dispatch(initializeFinanceSystem())
        
        // Seed users, account types, assets and payment gateways with proper timing
        dispatch(seedIfEmpty())
        dispatch(seedDefaultsOnce())
        dispatch(seedAssetsDefaults())
        dispatch(seedPaymentGateways())
        
        // Small delay to ensure all slices are properly initialized before pages render
        // This prevents initialization race conditions in complex components like LeadsPage
        setTimeout(() => {
          console.log('App initialization complete - all stores ready')
        }, 100)
        
        // Wait a bit for the assets to be seeded, then add sample rules
        setTimeout(() => {
          const state = store.getState()
          const assets = selectAllAssets(state)
          const accountTypes = state.accountTypes.items
          
          // Add sample rules to first few account types
          if (accountTypes.length > 0 && assets.length > 0) {
            // Add rules to the first 3 account types
            accountTypes.slice(0, 3).forEach(accountType => {
              dispatch(seedDefaultRulesForAccountType(accountType.id, assets))
            })
          }
        }, 100)
        
        // Initialize market data
        dispatch(setInstruments(instruments.map(inst => ({
            id: inst.id,
            symbol: inst.symbol,
            name: inst.name,
            precision: inst.precision,
            tickSize: inst.tickSize,
            contractSize: inst.contractSize
        }))))

        // Initialize sample quotes
        const initializeQuotes = () => {
            const sampleQuotes = {
                'EURUSD': { ask: 1.0875, bid: 1.0873, last: 1.0874, timestamp: Date.now() },
                'GBPUSD': { ask: 1.2525, bid: 1.2523, last: 1.2524, timestamp: Date.now() },
                'USDJPY': { ask: 149.88, bid: 149.86, last: 149.87, timestamp: Date.now() },
                'AUDUSD': { ask: 0.6725, bid: 0.6723, last: 0.6724, timestamp: Date.now() },
                'XAUUSD': { ask: 1985.50, bid: 1985.00, last: 1985.25, timestamp: Date.now() },
                'BTCUSD': { ask: 28150.00, bid: 28140.00, last: 28145.00, timestamp: Date.now() },
                'ETHUSD': { ask: 1825.50, bid: 1824.00, last: 1824.75, timestamp: Date.now() }
            }

            Object.entries(sampleQuotes).forEach(([instrumentId, quote]) => {
                dispatch(updateQuote({ instrumentId, quote }))
            })
        }

        initializeQuotes()

        // Update quotes every 2 seconds (simulate live data)
        const quoteInterval = setInterval(() => {
            const variations = {
                'EURUSD': 0.0001,
                'GBPUSD': 0.0001,
                'USDJPY': 0.01,
                'AUDUSD': 0.0001,
                'XAUUSD': 0.50,
                'BTCUSD': 10.00,
                'ETHUSD': 1.00
            }

            Object.entries(variations).forEach(([instrumentId, variation]) => {
                const randomChange = (Math.random() - 0.5) * variation * 2
                const currentQuote = store.getState().market?.quotes?.[instrumentId]
                if (currentQuote) {
                    const newLast = Math.max(0.001, currentQuote.last + randomChange)
                    const spread = variation * 0.5
                    dispatch(updateQuote({
                        instrumentId,
                        quote: {
                            ask: newLast + spread,
                            bid: newLast - spread,
                            last: newLast,
                            timestamp: Date.now()
                        }
                    }))
                }
            })
        }, 2000)
        
        // Initialize dev utilities
        if (import.meta.env.DEV) {
            setupDevUtilities(dispatch);
        }

        // Initialize WebSocket for positions real-time updates (if flag enabled)
        if (import.meta.env.DEV && isPositionsNextEnabled()) {
            initPositionsRealtimeNext(dispatch, () => store.getState())
        }

        // Initialize positions_next WebSocket integration if enabled
        if (isPositionsNextEnabled()) {
            import('@/features/positions_next/integration/websocket').then(({ initializePositionWebSocket }) => {
                initializePositionWebSocket()
            })
        }

        // Load validation tests in development
        if (import.meta.env.DEV) {
            import('@/features/positions_next/tests/validation')
        }

        return () => {
            clearInterval(quoteInterval)
        }
    }, [dispatch])
    
    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <div className="min-h-screen bg-gray-50 font-poppins">
                    {currentUser && <Header />}
                    <main className="flex-1 bg-gray-50">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<div className="p-8 text-center">Forgot password page - Coming soon</div>} />
                        
                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/profile" element={<UserProfilePage />} />
                            <Route path="/clients" element={<Navigate to="/clients/leads" replace />} />
                            <Route path="/clients/leads" element={<LeadsPageWrapper />} />
                            <Route path="/leads" element={<LeadsPageWrapper />} />
                            <Route path="/clients/active" element={<ActiveClientsPage />} />
                            <Route path="/clients/:id" element={<ProfilePage />} />
                            <Route path="/positions/open" element={<OpenPositionsPage />} />
                            <Route path="/positions/closed" element={<ClosedPositionsPage />} />
                            <Route path="/positions/pending" element={<PendingPositionsPage />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/compliance" element={<CompliancePage />} />
                            <Route path="/management/trading/account-types" element={<AccountTypesPage />} />
                            <Route path="/management/trading/account-types/new" element={<NewAccountTypePage />} />
                            <Route path="/management/trading/account-types/:accountTypeId/settings" element={<AccountTypeSettingsPage />} />
                            <Route path="/settings/administration/allow-ip" element={<AllowIpPage />} />
                            <Route path="/settings/administration/email-templates" element={<EmailTemplatesPage />} />
                            <Route path="/settings/administration/payment-gateways" element={<PaymentGatewaysPage />} />
                            <Route path="/settings/administration/users" element={<UsersPage />} />
                            <Route path="/settings/administration/users/new" element={<UserEditPage />} />
                            <Route path="/settings/administration/users/:id/edit" element={<UserEditPage />} />
                            {/* PATCH: begin route StatusManager */}
                            <Route path="/admin/status-manager" element={<SimpleStatusManagerPage />} />
                            {/* PATCH: end route StatusManager */}
                            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                            {/* Test route for filter builder */}
                            <Route path="/test/filters" element={<FilterBuilderTest />} />
                        </Route>
                    </Routes>
                </main>
                <Toaster />
                <DataSeeder />
                </div>
            </Router>
        </ThemeProvider>
    )
}

function App() {
    return (
        <Provider store={store}>
            <CustomThemeProvider>
                <AppContent />
            </CustomThemeProvider>
        </Provider>
    )
}

function HomePage() {
    return (
        <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-foreground">Welcome to your CRM</h1>
                <p className="text-muted-foreground">Your customer relationship management system</p>
                <div className="pt-4 space-x-4">
                    <Button asChild>
                        <Link to="/clients/leads">
                            View Leads
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link to="/clients/active">
                            View Active Clients
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default App