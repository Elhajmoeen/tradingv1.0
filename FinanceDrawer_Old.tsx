import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Tab,
  Tabs as MuiTabs,
  Button,
  TextField,
  InputAdornment,
  MenuItem
} from '@mui/material'
import { 
  PaymentOutlined, 
  AttachMoneyOutlined, 
  DescriptionOutlined, 
  CheckCircleOutlined 
} from '@mui/icons-material'
import type { RootState, AppDispatch } from '../state/store'
import type { PaymentMethod } from '../types/finance'
import { 
  recordDepositFTDYes, 
  recordDepositFTDNo, 
  recordWithdrawalFTWYes,
  recordWithdrawalFTWNo,
  recordCredit, 
  recordCreditOut
} from '../state/financeActions'

interface FinanceDrawerProps {
  clientId: string
  children: React.ReactNode
}

interface DepositFormData {
  paymentMethod: PaymentMethod | ''
  amount: string
  description: string
  ftd: boolean
}

interface WithdrawFormData {
  paymentMethod: PaymentMethod | ''
  amount: string
  description: string
  ftw: boolean
}

interface CreditFormData {
  paymentMethod: PaymentMethod | ''
  amount: string
  description: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: 3, py: 1 }}>{children}</Box>}
    </div>
  )
}

export function FinanceDrawer({ clientId, children }: FinanceDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  
  // Debug selectors
  const allEntities = useSelector((s: RootState) => s.entities || {})
  const allTransactions = useSelector((s: RootState) => s.transactions || {})
  const currentClient = useSelector((s: RootState) => s.entities.entities.find(e => e.id === clientId) || null)
  
  // Form states for each tab
  const [depositForm, setDepositForm] = useState<DepositFormData>({
    paymentMethod: '',
    amount: '',
    description: '',
    ftd: false,
  })
  
  const [withdrawForm, setWithdrawForm] = useState<WithdrawFormData>({
    paymentMethod: '',
    amount: '',
    description: '',
    ftw: false,
  })
  
  const [creditForm, setCreditForm] = useState<CreditFormData>({
    paymentMethod: '',
    amount: '',
    description: '',
  })
  
  const [creditOutForm, setCreditOutForm] = useState<CreditFormData>({
    paymentMethod: '',
    amount: '',
    description: '',
  })

  // Get current user for createdBy info
  const currentAgentName = useSelector((s: RootState) => (s as any).auth?.user?.name ?? 'Agent')

  const handleProceed = () => {
    console.log('🚀 Processing transaction...')
    console.log('🔍 Redux State Check - Client ID:', clientId)
    
    let currentForm: DepositFormData | WithdrawFormData | CreditFormData
    let actionType: string
    
    switch (tabValue) {
      case 0: // Deposit
        currentForm = depositForm
        actionType = 'deposit'
        break
      case 1: // Withdraw
        currentForm = withdrawForm
        actionType = 'withdraw'
        break
      case 2: // Credit
        currentForm = creditForm
        actionType = 'credit'
        break
      case 3: // Credit Out
        currentForm = creditOutForm
        actionType = 'credit-out'
        break
      default:
        return
    }

    console.log('📝 Current form data:', currentForm)
    console.log('📊 Tab value:', tabValue, 'Action type:', actionType)

    const numericAmount = Number(currentForm.amount || 0)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      console.warn('❌ Amount must be > 0')
      return
    }

    if (!currentForm.paymentMethod) {
      console.warn('❌ Payment method is required')
      return
    }

    // Special validation for Credit Out - check available credits
    if (actionType === 'credit-out') {
      const currentTotalCredit = currentClient?.finance?.credit?.totalCredit || 0
      const currentTotalCreditOut = currentClient?.finance?.credit?.totalCreditOut || 0
      const availableCredit = currentTotalCredit - currentTotalCreditOut

      if (numericAmount > availableCredit) {
        console.warn('❌ Credit Out amount exceeds available credits:', {
          requestedAmount: numericAmount,
          availableCredit: availableCredit,
          totalCredit: currentTotalCredit,
          totalCreditOut: currentTotalCreditOut
        })
        alert(`Insufficient credits!\n\nAvailable Credits: $${availableCredit.toFixed(2)}\nRequested Amount: $${numericAmount.toFixed(2)}\n\nPlease enter an amount up to $${availableCredit.toFixed(2)}.`)
        return
      }

      if (availableCredit === 0) {
        alert('No credits available for withdrawal.')
        return
      }
    }

    const params = {
      clientId,
      amount: numericAmount,
      description: currentForm.description,
      paymentMethod: currentForm.paymentMethod as PaymentMethod,
      createdBy: 'CRM' as const,
      createdByName: currentAgentName
    }

    console.log('📦 Transaction params:', params)

    // Dispatch appropriate action based on tab and form data
    switch (actionType) {
      case 'deposit':
        const depositData = currentForm as DepositFormData
        if (depositData.ftd) {
          console.log('💰 Dispatching FTD YES deposit...')
          dispatch(recordDepositFTDYes(params))
        } else {
          console.log('💵 Dispatching regular deposit...')
          dispatch(recordDepositFTDNo(params))
        }
        break
      case 'withdraw':
        const withdrawData = currentForm as WithdrawFormData
        if (withdrawData.ftw) {
          console.log('🏦 Dispatching FTW YES withdrawal...')
          dispatch(recordWithdrawalFTWYes(params))
        } else {
          console.log('🏦 Dispatching regular withdrawal...')
          dispatch(recordWithdrawalFTWNo(params))
        }
        break
      case 'credit':
        console.log('➕ Dispatching credit...')
        dispatch(recordCredit(params))
        break
      case 'credit-out':
        console.log('➖ Dispatching credit out...')
        try {
          dispatch(recordCreditOut(params))
        } catch (error) {
          console.error('❌ Credit out failed:', error)
          alert(`Credit Out failed: ${error.message}`)
          return
        }
        break
    }

    console.log('✅ Transaction dispatched successfully!')

    // Log successful dispatch
    setTimeout(() => {
      console.log('🔄 Checking Redux state after dispatch...')
      console.log('📊 All entities keys:', Object.keys(allEntities))
      console.log('📊 Current client data:', currentClient)
      console.log('📊 All transactions:', allTransactions)
      console.log('� Client transactions:', allTransactions.byClientId?.[clientId] || [])
    }, 100)

    // Reset form and close drawer
    resetCurrentForm()
    setOpen(false)
  }

  const resetCurrentForm = () => {
    switch (tabValue) {
      case 0:
        setDepositForm({
          paymentMethod: '',
          amount: '',
          description: '',
          ftd: false,
        })
        break
      case 1:
        setWithdrawForm({
          paymentMethod: '',
          amount: '',
          description: '',
          ftw: false,
        })
        break
      case 2:
        setCreditForm({
          paymentMethod: '',
          amount: '',
          description: '',
        })
        break
      case 3:
        setCreditOutForm({
          paymentMethod: '',
          amount: '',
          description: '',
        })
        break
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)}>
        {children}
      </div>

      {/* MUI Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: '29.13vw', lg: '27.05vw', xl: '24.97vw' },
            maxWidth: 'none'
          }
        }}
      >
        {/* Header */}
        <div className="px-6 py-4" style={{ backgroundColor: '#143253' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">
              Finance
            </h2>
            <button
              onClick={handleCancel}
              className="text-white/70 hover:text-white transition-colors p-1 rounded"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

          {/* Tabs */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-1">
              {['Deposit', 'Withdraw', 'Credit', 'Credit Out'].map((label, index) => (
                <button
                  key={label}
                  onClick={() => handleTabChange({} as any, index)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    tabValue === index
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>          {/* Deposit Tab */}
          <TabPanel value={tabValue} index={0}>
            <div className="p-6 space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <TextField
                  fullWidth
                  select
                  value={depositForm.paymentMethod}
                  onChange={(e) => setDepositForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  placeholder="Choose your payment method"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#143253',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Choose your payment method</span>
                  </MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Crypto">Crypto</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <TextField
                  fullWidth
                  type="number"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  inputProps={{ 
                    min: 0, 
                    step: 0.01
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="text-gray-500 text-sm mr-2">USD</span>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#143253',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={depositForm.description}
                  onChange={(e) => setDepositForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter transaction details and notes..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#143253',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </div>

              {/* FTD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FTD (First Time Deposit) *
                </label>
                <TextField
                  fullWidth
                  select
                  value={depositForm.ftd ? 'true' : 'false'}
                  onChange={(e) => setDepositForm(prev => ({ ...prev, ftd: e.target.value === 'true' }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#143253',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              </div>
            </div>
          </TabPanel>

          {/* Withdraw Tab */}
          <TabPanel value={tabValue} index={1}>
            <div className="p-6 space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <TextField
                  fullWidth
                  select
                  value={withdrawForm.paymentMethod}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  placeholder="Choose your payment method"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Choose your payment method</span>
                  </MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Crypto">Crypto</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Box>

              {/* Amount */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Amount *
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  inputProps={{ 
                    min: 0, 
                    step: 0.01
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, ml: 0.5 }}>
                          USD
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={withdrawForm.description}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter withdrawal details and notes..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* FTW */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  FTW (First Time Withdrawal) *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={withdrawForm.ftw ? 'true' : 'false'}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, ftw: e.target.value === 'true' }))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CheckCircleOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              </Box>
            </form>
          </TabPanel>

          {/* Credit Tab */}
          <TabPanel value={tabValue} index={2}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Payment Method (Internal) */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Payment Method (Internal) *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={creditForm.paymentMethod}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  placeholder="Choose internal payment method"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Choose internal payment method</span>
                  </MenuItem>
                  <MenuItem value="Internal Transfer">Internal Transfer</MenuItem>
                  <MenuItem value="Account Credit">Account Credit</MenuItem>
                  <MenuItem value="Bonus Credit">Bonus Credit</MenuItem>
                  <MenuItem value="Adjustment">Adjustment</MenuItem>
                </TextField>
              </Box>

              {/* Amount */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Amount *
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  inputProps={{ 
                    min: 0, 
                    step: 0.01
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, ml: 0.5 }}>
                          USD
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={creditForm.description}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter credit details and notes..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </form>
          </TabPanel>

          {/* Credit Out Tab */}
          <TabPanel value={tabValue} index={3}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Payment Method (Internal) */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Payment Method (Internal) *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={creditOutForm.paymentMethod}
                  onChange={(e) => setCreditOutForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  placeholder="Choose internal payment method"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaymentOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Choose internal payment method</span>
                  </MenuItem>
                  <MenuItem value="Internal Debit">Internal Debit</MenuItem>
                  <MenuItem value="Account Debit">Account Debit</MenuItem>
                  <MenuItem value="Chargeback">Chargeback</MenuItem>
                  <MenuItem value="Adjustment">Adjustment</MenuItem>
                </TextField>
              </Box>

              {/* Amount */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Amount *
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={creditOutForm.amount}
                  onChange={(e) => setCreditOutForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  helperText={`Available Credits: $${((currentClient?.finance?.credit?.totalCredit || 0) - (currentClient?.finance?.credit?.totalCreditOut || 0)).toFixed(2)}`}
                  inputProps={{ 
                    min: 0, 
                    step: 0.01
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, ml: 0.5 }}>
                          USD
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginLeft: 0
                    }
                  }}
                />
              </Box>

              {/* Description */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={creditOutForm.description}
                  onChange={(e) => setCreditOutForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter credit out details and notes..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionOutlined sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#263238',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      fontFamily: 'Poppins, sans-serif',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </form>
          </TabPanel>
        </Box>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('🔥 BUTTON CLICKED!')
              console.log('🔥 Client ID:', clientId)
              console.log('🔥 Current Form:', 
                tabValue === 0 ? depositForm :
                tabValue === 1 ? withdrawForm :
                tabValue === 2 ? creditForm :
                creditOutForm
              )
              handleProceed()
            }}
            className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
            style={{ backgroundColor: '#143253' }}
          >
            Process Transaction
          </button>
        </div>
      </Drawer>
    </>
  )
}