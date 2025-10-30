import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPosition } from '@/state/positionsSlice'
import { selectQuoteByInstrument } from '@/features/market/marketSlice'
import { instruments } from '@/config/instruments'
import { OPEN_REASON_OPTIONS } from '@/config/openReason'
import type { RootState } from '@/state/store'

interface NewPositionModalProps {
  open: boolean
  onClose: () => void
  accountId: string
  theme?: 'light' | 'dark' // Theme for the modal content
}

interface FormData {
  instrument: string
  amount: string
  priceMode: 'Market' | 'Specific'
  specificPrice: string
  tpEnabled: boolean
  tpValue: string
  slEnabled: boolean
  slValue: string
  openReason: string
}

export default function NewPositionModal({ open, onClose, accountId, theme = 'light' }: NewPositionModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<FormData>({
    instrument: 'EURUSD',
    amount: '',
    priceMode: 'Market',
    specificPrice: '',
    tpEnabled: false,
    tpValue: '',
    slEnabled: false,
    slValue: '',
    openReason: 'Manual'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuote = useSelector((state: RootState) => 
    selectQuoteByInstrument(state, formData.instrument)
  )

  const selectedInstrument = instruments.find(i => i.id === formData.instrument)

  useEffect(() => {
    if (open) {
        setFormData({
        instrument: 'EURUSD',
        amount: '',
        priceMode: 'Market',
        specificPrice: '',
        tpEnabled: false,
        tpValue: '',
        slEnabled: false,
        slValue: '',
        openReason: 'Manual'
        })
      setErrors({})
    }
  }, [open])

  useEffect(() => {
    if (currentQuote && formData.priceMode === 'Specific') {
      setFormData(prev => ({
        ...prev,
        specificPrice: currentQuote.last.toString()
      }))
    }
  }, [currentQuote, formData.instrument, formData.priceMode])

  if (!open) return null

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.instrument) {
      newErrors.instrument = 'Instrument is required'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number'
    }

    if (formData.priceMode === 'Specific') {
      const price = parseFloat(formData.specificPrice)
      if (!formData.specificPrice || isNaN(price) || price <= 0) {
        newErrors.specificPrice = 'Specific price must be a positive number'
      }
    }

    if (formData.tpEnabled) {
      const tp = parseFloat(formData.tpValue)
      if (!formData.tpValue || isNaN(tp) || tp <= 0) {
        newErrors.tpValue = 'Take Profit must be a positive number'
      }
    }

    if (formData.slEnabled) {
      const sl = parseFloat(formData.slValue)
      if (!formData.slValue || isNaN(sl) || sl <= 0) {
        newErrors.slValue = 'Stop Loss must be a positive number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (type: 'Buy' | 'Sell') => {
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)

    try {
      let entryPrice: number

      if (formData.priceMode === 'Market') {
        if (!currentQuote) {
          throw new Error('No market price available')
        }
        entryPrice = type === 'Buy' ? currentQuote.ask : currentQuote.bid
      } else {
        entryPrice = parseFloat(formData.specificPrice)
      }

      const newPosition = {
        id: `POS-${Date.now()}`,
        clientId: accountId,
        instrument: selectedInstrument?.symbol || formData.instrument,
        type,
        amount: parseFloat(formData.amount),
        openVolume: parseFloat(formData.amount) * entryPrice,
        openPrice: entryPrice,
        currentPrice: currentQuote?.last || entryPrice,
        takeProfit: formData.tpEnabled ? parseFloat(formData.tpValue) : undefined,
        stopLoss: formData.slEnabled ? parseFloat(formData.slValue) : undefined,
        openReason: formData.openReason,
        openPnL: 0,
        openIp: '192.168.1.1',
        commission: parseFloat(formData.amount) * 0.0015,
        swap: 0,
        totalPnL: 0,
        status: 'open' as const,
        openedAt: new Date().toISOString()
      }

      dispatch(addPosition(newPosition))
      onClose()
    } catch (error) {
      console.error('Error creating position:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create position' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepValue = (field: 'tpValue' | 'slValue', direction: 1 | -1) => {
    const current = parseFloat(formData[field]) || 0
    const step = selectedInstrument?.tickSize || 0.0001
    const newValue = Math.max(0, current + (direction * step))
    handleInputChange(field, newValue.toFixed(selectedInstrument?.precision || 4))
  }

  const getBuyButtonText = () => {
    if (isSubmitting) return 'Creating...'
    if (currentQuote && formData.priceMode === 'Market') {
      return `Buy @ ${currentQuote.ask.toFixed(selectedInstrument?.precision || 4)}`
    }
    return 'Buy'
  }

  const getSellButtonText = () => {
    if (isSubmitting) return 'Creating...'
    if (currentQuote && formData.priceMode === 'Market') {
      return `Sell @ ${currentQuote.bid.toFixed(selectedInstrument?.precision || 4)}`
    }
    return 'Sell'
  }

  // Helper functions for consistent theming
  const getInputClasses = () => 
    `w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`

  const getLabelClasses = () => 
    `block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`

  const getErrorClasses = () => 
    `mt-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`

  return (
    <React.Fragment>
      {/* Backdrop — transparent by default; click to close */}
      <div
        className="fixed inset-0 z-[60] bg-transparent" 
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
        <div className={`px-8 py-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>New Position</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <svg className={`w-6 h-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {errors.general && (
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-red-900/20 border-red-700 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1.5 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Instrument
              </label>
              <select
                value={formData.instrument}
                onChange={(e) => handleInputChange('instrument', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.symbol} - {instrument.name}
                  </option>
                ))}
              </select>
              {errors.instrument && <p className={`mt-1 text-xs ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>{errors.instrument}</p>}
            </div>

            <div>
              <label className={getLabelClasses()}>
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="10000"
                min="0"
                step="1000"
                className={getInputClasses()}
              />
              {errors.amount && <p className={getErrorClasses()}>{errors.amount}</p>}
            </div>

            <div>
              <label className={getLabelClasses()}>
                Price Mode
              </label>
              <select
                value={formData.priceMode}
                onChange={(e) => handleInputChange('priceMode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Market">Market</option>
                <option value="Specific">Specific Price</option>
              </select>
            </div>
          </div>



          {formData.priceMode === 'Specific' && (
            <div className="space-y-3">
              {currentQuote && (
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-blue-900/20 border-blue-700' 
                    : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Current Market Price: {currentQuote.last.toFixed(selectedInstrument?.precision || 4)}
                  </div>
                </div>
              )}
              <div>
                <label className={getLabelClasses()}>
                  Specific Price
                </label>
                <input
                  type="number"
                  value={formData.specificPrice}
                  onChange={(e) => handleInputChange('specificPrice', e.target.value)}
                  placeholder="1.0850"
                  step={selectedInstrument?.tickSize || 0.0001}
                  className={getInputClasses()}
                />
                {errors.specificPrice && <p className={getErrorClasses()}>{errors.specificPrice}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tpEnabled}
                    onChange={(e) => handleInputChange('tpEnabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    formData.tpEnabled ? 'bg-blue-600' : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.tpEnabled ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Take Profit</span>
                </label>
              </div>
              {formData.tpEnabled && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepValue('tpValue', -1)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={formData.tpValue}
                    onChange={(e) => handleInputChange('tpValue', e.target.value)}
                    placeholder="1.0950"
                    step={selectedInstrument?.tickSize || 0.0001}
                    className={`flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => stepValue('tpValue', 1)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    +
                  </button>
                </div>
              )}
              {errors.tpValue && <p className={getErrorClasses()}>{errors.tpValue}</p>}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.slEnabled}
                    onChange={(e) => handleInputChange('slEnabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    formData.slEnabled ? 'bg-blue-600' : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.slEnabled ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Stop Loss</span>
                </label>
              </div>
              {formData.slEnabled && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepValue('slValue', -1)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={formData.slValue}
                    onChange={(e) => handleInputChange('slValue', e.target.value)}
                    placeholder="1.0800"
                    step={selectedInstrument?.tickSize || 0.0001}
                    className={`flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => stepValue('slValue', 1)}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    +
                  </button>
                </div>
              )}
              {errors.slValue && <p className={getErrorClasses()}>{errors.slValue}</p>}
            </div>
          </div>

          <div>
            <label className={getLabelClasses()}>
              Open Reason
            </label>
            <select
              value={formData.openReason}
              onChange={(e) => handleInputChange('openReason', e.target.value)}
              className={getInputClasses()}
            >
              {OPEN_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`flex gap-4 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={() => handleSubmit('Buy')}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {getBuyButtonText()}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Sell')}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {getSellButtonText()}
            </button>
          </div>
        </div>
      </div>
      </div>
    </React.Fragment>
  )
}