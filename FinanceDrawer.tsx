import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { FieldRenderer } from '../fieldkit'
import { CreditCard, Plus, Minus, DollarSign, FileText, X, ChevronDown } from 'lucide-react'

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

interface CreditOutFormData {
  paymentMethod: PaymentMethod | ''
  amount: string
  description: string
}

// Tab Panel component
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && children}
    </div>
  )
}

export default function FinanceDrawer({ clientId, children }: FinanceDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  
  // Draggable state
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ dragging: boolean; sx: number; sy: number; ox: number; oy: number }>({ 
    dragging: false, sx: 0, sy: 0, ox: 0, oy: 0 
  })
  
  // Form states
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

  const [creditOutForm, setCreditOutForm] = useState<CreditOutFormData>({
    paymentMethod: '',
    amount: '',
    description: '',
  })

  // Redux selectors
  const allEntities = useSelector((state: RootState) => state.entities.entities)
  const allTransactions = useSelector((state: RootState) => state.transactions)
  const currentClient = allEntities[clientId] as any
  const currentAgentName = 'CRM Agent'

  // Get current form based on tab
  const getCurrentForm = () => {
    switch (tabValue) {
      case 0: return depositForm
      case 1: return withdrawForm
      case 2: return creditForm
      case 3: return creditOutForm
      default: return depositForm
    }
  }

  const getActionType = (): 'deposit' | 'withdraw' | 'credit' | 'credit-out' => {
    switch (tabValue) {
      case 0: return 'deposit'
      case 1: return 'withdraw'
      case 2: return 'credit'
      case 3: return 'credit-out'
      default: return 'deposit'
    }
  }

  const handleProceed = () => {
    const currentForm = getCurrentForm()
    const actionType = getActionType()

    if (!currentForm.amount || !currentForm.paymentMethod) {
      console.warn('? Missing required fields')
      return
    }

    const numericAmount = parseFloat(currentForm.amount)
    if (numericAmount <= 0) {
      console.warn('? Amount must be > 0')
      return
    }

    // Special validation for Credit Out
    if (actionType === 'credit-out') {
      const currentTotalCredit = currentClient?.finance?.credit?.totalCredit || 0
      const currentTotalCreditOut = currentClient?.finance?.credit?.totalCreditOut || 0
      const availableCredit = currentTotalCredit - currentTotalCreditOut

      if (numericAmount > availableCredit) {
        alert(`Insufficient credits! Available: $${availableCredit.toFixed(2)}, Requested: $${numericAmount.toFixed(2)}`)
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

    // Dispatch appropriate action
    switch (actionType) {
      case 'deposit':
        const depositData = currentForm as DepositFormData
        if (depositData.ftd) {
          dispatch(recordDepositFTDYes(params))
        } else {
          dispatch(recordDepositFTDNo(params))
        }
        break
      case 'withdraw':
        const withdrawData = currentForm as WithdrawFormData
        if (withdrawData.ftw) {
          dispatch(recordWithdrawalFTWYes(params))
        } else {
          dispatch(recordWithdrawalFTWNo(params))
        }
        break
      case 'credit':
        dispatch(recordCredit(params))
        break
      case 'credit-out':
        dispatch(recordCreditOut(params))
        break
    }

    // Close drawer and reset form
    setOpen(false)
    resetCurrentForm()
  }

  const resetCurrentForm = () => {
    switch (tabValue) {
      case 0:
        setDepositForm({ paymentMethod: '', amount: '', description: '', ftd: false })
        break
      case 1:
        setWithdrawForm({ paymentMethod: '', amount: '', description: '', ftw: false })
        break
      case 2:
        setCreditForm({ paymentMethod: '', amount: '', description: '' })
        break
      case 3:
        setCreditOutForm({ paymentMethod: '', amount: '', description: '' })
        break
    }
  }

  const handleTabChange = (index: number) => {
    setTabValue(index)
  }

  // Dragging functions
  const onDown = (e: React.MouseEvent) => {
    dragState.current = { dragging: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp, { once: true })
  }

  const onMove = (e: MouseEvent) => {
    if (!dragState.current.dragging) return
    const x = dragState.current.ox + (e.clientX - dragState.current.sx)
    const y = dragState.current.oy + (e.clientY - dragState.current.sy)
    
    // Constrain within viewport
    const maxX = window.innerWidth - 900 // modal width
    const maxY = window.innerHeight - 600 // approximate modal height
    const constrainedX = Math.max(-400, Math.min(maxX, x))
    const constrainedY = Math.max(-300, Math.min(maxY, y))
    
    setPos({ x: constrainedX, y: constrainedY })
  }

  const onUp = () => {
    dragState.current.dragging = false
    window.removeEventListener('mousemove', onMove)
  }

  const handleClose = () => {
    setOpen(false)
    // Reset position on close
    setPos({ x: 0, y: 0 })
  }

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)}>
        {children}
      </div>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
            onClick={handleClose} 
          />
          
          <div
            ref={dragRef}
            style={{ 
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              ['--crm-header']: '#ffffff',
              ['--accent']: '#F0B90B',
            } as React.CSSProperties}
            className="relative w-[min(900px,96vw)] rounded-2xl shadow-2xl bg-white border border-gray-200 text-gray-900 max-h-[90vh] overflow-hidden"
          >
            {/* Draggable Header */}
            <div
              onMouseDown={onDown}
              className="flex items-center justify-between px-6 min-h-[60px] border-b border-gray-200 cursor-move select-none bg-white"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Finance Management
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-600 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            
            {/* Content Section */}
            <div className="p-6 bg-white overflow-y-auto max-h-[calc(90vh-60px)]">

              {/* Tabs */}
              <div className="mb-6">
                <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200" role="tablist">
                  {[
                    { label: 'Deposit', index: 0, icon: Plus, isPrimary: false },
                    { label: 'Withdraw', index: 1, icon: Minus, isPrimary: false },
                    { label: 'Credit', index: 2, icon: CreditCard, isPrimary: false },
                    { label: 'Credit Out', index: 3, icon: DollarSign, isPrimary: false }
                  ].map((tab) => (
                    <button
                      key={tab.index}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        tabValue === tab.index
                          ? 'bg-[var(--accent)] text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-transparent hover:border-[var(--accent)]/30'
                      }`}
                      onClick={() => handleTabChange(tab.index)}
                      type="button"
                      role="tab"
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Deposit Form */}
              <TabPanel value={tabValue} index={0}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleProceed(); }}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="deposit-method" className="block mb-2 text-sm font-medium text-gray-900">Payment Method</label>
                        <select 
                          id="deposit-method"
                          value={depositForm.paymentMethod}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="" className="bg-white text-gray-400">Select method</option>
                          <option value="Credit Card" className="bg-white text-gray-900">Credit Card</option>
                          <option value="Bank Transfer" className="bg-white text-gray-900">Bank Transfer</option>
                          <option value="PayPal" className="bg-white text-gray-900">PayPal</option>
                          <option value="Other" className="bg-white text-gray-900">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="deposit-amount" className="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                        <input 
                          type="text" 
                          id="deposit-amount"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value.replace(/[^\d.]/g,'') }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label htmlFor="deposit-ftd" className="block mb-2 text-sm font-medium text-gray-900">FTD</label>
                        <select 
                          id="deposit-ftd"
                          value={depositForm.ftd ? 'Yes' : 'No'}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, ftd: e.target.value === 'Yes' }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="No" className="bg-white text-gray-900">No</option>
                          <option value="Yes" className="bg-white text-gray-900">Yes</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="deposit-description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <textarea 
                          id="deposit-description" 
                          rows={4} 
                          value={depositForm.description}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, description: e.target.value }))}
                          className="block p-2.5 w-full text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                          placeholder="Enter deposit details and notes..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        onClick={resetCurrentForm}
                        className="text-white inline-flex items-center bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        Clear
                      </button>
                      <button 
                        type="submit" 
                        className="text-gray-900 inline-flex items-center bg-[var(--accent)] hover:bg-[#d8a608] focus:ring-4 focus:outline-none focus:ring-[var(--accent)]/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        <Plus className="mr-1 -ml-1 w-6 h-6" />
                        Process Deposit
                      </button>
                    </div>
                  </form>
                </div>
              </TabPanel>

              {/* Withdraw Form */}
              <TabPanel value={tabValue} index={1}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleProceed(); }}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="withdraw-method" className="block mb-2 text-sm font-medium text-gray-900">Payment Method</label>
                        <select 
                          id="withdraw-method"
                          value={withdrawForm.paymentMethod}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="" className="bg-white text-gray-400">Select method</option>
                          <option value="Bank Transfer" className="bg-white text-gray-900">Bank Transfer</option>
                          <option value="PayPal" className="bg-white text-gray-900">PayPal</option>
                          <option value="Skrill" className="bg-white text-gray-900">Skrill</option>
                          <option value="Neteller" className="bg-white text-gray-900">Neteller</option>
                          <option value="WebMoney" className="bg-white text-gray-900">WebMoney</option>
                          <option value="Bitcoin" className="bg-white text-gray-900">Bitcoin</option>
                          <option value="Other" className="bg-white text-gray-900">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="withdraw-amount" className="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                        <input 
                          type="text" 
                          id="withdraw-amount"
                          placeholder="250.00"
                          value={withdrawForm.amount}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value.replace(/[^\d.]/g,'') }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                      </div>
                      <div>
                        <label htmlFor="withdraw-ftw" className="block mb-2 text-sm font-medium text-gray-900">FTW (First Time Withdrawal)</label>
                        <select 
                          id="withdraw-ftw"
                          value={withdrawForm.ftw ? 'Yes' : 'No'}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, ftw: e.target.value === 'Yes' }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="No" className="bg-white text-gray-900">No</option>
                          <option value="Yes" className="bg-white text-gray-900">Yes</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="withdraw-description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <textarea 
                          id="withdraw-description" 
                          rows={4} 
                          placeholder="Enter withdrawal details and notes..."
                          value={withdrawForm.description}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, description: e.target.value }))}
                          className="block p-2.5 w-full text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        onClick={resetCurrentForm}
                        className="text-white inline-flex items-center bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        Clear
                      </button>
                      <button 
                        type="submit" 
                        className="text-[#111827] inline-flex items-center bg-[var(--accent)] hover:bg-[#d8a608] focus:ring-4 focus:outline-none focus:ring-[var(--accent)]/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        <Minus className="mr-1 -ml-1 w-6 h-6" />
                        Process Withdrawal
                      </button>
                    </div>
                  </form>
                </div>
              </TabPanel>

              {/* Credit Form */}
              <TabPanel value={tabValue} index={2}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleProceed(); }}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="credit-method" className="block mb-2 text-sm font-medium text-gray-900">Credit Type</label>
                        <select 
                          id="credit-method"
                          value={creditForm.paymentMethod}
                          onChange={(e) => setCreditForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="" className="bg-white text-gray-500">Select type</option>
                          <option value="Bonus" className="bg-white text-gray-900">Bonus</option>
                          <option value="Adjustment" className="bg-white text-gray-900">Adjustment</option>
                          <option value="Compensation" className="bg-white text-gray-900">Compensation</option>
                          <option value="Internal" className="bg-white text-gray-900">Internal Transfer</option>
                          <option value="Other" className="bg-white text-gray-900">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="credit-amount" className="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                        <input 
                          type="text" 
                          id="credit-amount"
                          placeholder="150.00"
                          value={creditForm.amount}
                          onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value.replace(/[^\d.]/g,'') }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="credit-description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <textarea 
                          id="credit-description" 
                          rows={4} 
                          placeholder="Enter credit reason and details..."
                          value={creditForm.description}
                          onChange={(e) => setCreditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="block p-2.5 w-full text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        onClick={resetCurrentForm}
                        className="text-white inline-flex items-center bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        Clear
                      </button>
                      <button 
                        type="submit" 
                        className="text-[#111827] inline-flex items-center bg-[var(--accent)] hover:bg-[#d8a608] focus:ring-4 focus:outline-none focus:ring-[var(--accent)]/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        <CreditCard className="mr-1 -ml-1 w-6 h-6" />
                        Apply Credit
                      </button>
                    </div>
                  </form>
                </div>
              </TabPanel>

              {/* Credit Out Form */}
              <TabPanel value={tabValue} index={3}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleProceed(); }}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="creditout-method" className="block mb-2 text-sm font-medium text-gray-900">Debit Type</label>
                        <select 
                          id="creditout-method"
                          value={creditOutForm.paymentMethod}
                          onChange={(e) => setCreditOutForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                          <option value="" className="bg-white text-gray-500">Select type</option>
                          <option value="Adjustment" className="bg-white text-gray-900">Adjustment</option>
                          <option value="Compensation" className="bg-white text-gray-900">Chargeback</option>
                          <option value="Internal" className="bg-white text-gray-900">Loan Repayment</option>
                          <option value="Other" className="bg-white text-gray-900">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="creditout-amount" className="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                        <input 
                          type="text" 
                          id="creditout-amount"
                          placeholder="100.00"
                          value={creditOutForm.amount}
                          onChange={(e) => setCreditOutForm(prev => ({ ...prev, amount: e.target.value.replace(/[^\d.]/g,'') }))}
                          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="creditout-description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <textarea 
                          id="creditout-description" 
                          rows={4} 
                          placeholder="Enter debit reason and details..."
                          value={creditOutForm.description}
                          onChange={(e) => setCreditOutForm(prev => ({ ...prev, description: e.target.value }))}
                          className="block p-2.5 w-full text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button" 
                        onClick={resetCurrentForm}
                        className="text-white inline-flex items-center bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        Clear
                      </button>
                      <button 
                        type="submit" 
                        className="text-[#111827] inline-flex items-center bg-[var(--accent)] hover:bg-[#d8a608] focus:ring-4 focus:outline-none focus:ring-[var(--accent)]/30 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                      >
                        <DollarSign className="mr-1 -ml-1 w-6 h-6" />
                        Apply Debit
                      </button>
                    </div>
                  </form>
                </div>
              </TabPanel>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
