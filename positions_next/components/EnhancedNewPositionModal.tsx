/**
 * Enhanced New Position Modal with TP/SL Amount support
 * Only used when isTpSlAmountEnabled() feature flag is active
 * Matches the design of the original modal
 */

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectQuoteByInstrument } from '@/features/market/marketSlice'
import { instruments } from '@/config/instruments'
import { OPEN_REASON_OPTIONS } from '@/config/openReason'
import { isTpSlAmountEnabled } from '@/lib/flags'
import { priceFromAmount, type Side } from '@/lib/pnl'
import { type NewPositionInput } from '@/features/positions_next/types/position'
import type { RootState } from '@/state/store'

interface EnhancedNewPositionModalProps {
  open: boolean
  onClose: () => void
  accountId: string
  onSubmit: (data: NewPositionInput) => Promise<void>
  theme?: 'light' | 'dark'
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

export function EnhancedNewPositionModal({ 
  open, 
  onClose, 
  accountId, 
  onSubmit,
  theme = 'dark'
}: EnhancedNewPositionModalProps) {
  // Feature flag check
  const isAmountFeatureEnabled = isTpSlAmountEnabled()
  
  // Form state
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

  // TP/SL Amount feature state
  const [tpMode, setTpMode] = useState<'price'|'amount'>('price')
  const [slMode, setSlMode] = useState<'price'|'amount'>('price')
  const [tpAmount, setTpAmount] = useState<number | ''>('')
  const [slAmount, setSlAmount] = useState<number | ''>('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Market data
  const currentQuote = useSelector((state: RootState) => 
    selectQuoteByInstrument(state, formData.instrument)
  )

  const selectedInstrument = instruments.find(i => i.id === formData.instrument)

  // Reset form when modal opens
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
      setTpMode('price')
      setSlMode('price')
      setTpAmount('')
      setSlAmount('')
      setErrors({})
    }
  }, [open])

  // Auto-fill specific price when switching to specific mode
  useEffect(() => {
    if (currentQuote && formData.priceMode === 'Specific') {
      setFormData(prev => ({
        ...prev,
        specificPrice: currentQuote.last.toString()
      }))
    }
  }, [currentQuote, formData.instrument, formData.priceMode])

  // Helper functions to calculate smart defaults for TP/SL
  const getSmartTpDefault = (side: Side, currentPrice: number): number => {
    if (!selectedInstrument) return currentPrice
    
    const pipSize = selectedInstrument.tickSize || 0.0001
    const defaultPips = 10 // 10 pips profit target
    
    if (side === 'BUY') {
      return currentPrice + (pipSize * defaultPips) // TP above current price for BUY
    } else {
      return currentPrice - (pipSize * defaultPips) // TP below current price for SELL
    }
  }

  const getSmartSlDefault = (side: Side, currentPrice: number): number => {
    if (!selectedInstrument) return currentPrice
    
    const pipSize = selectedInstrument.tickSize || 0.0001
    const defaultPips = 10 // 10 pips stop loss
    
    if (side === 'BUY') {
      return currentPrice - (pipSize * defaultPips) // SL below current price for BUY
    } else {
      return currentPrice + (pipSize * defaultPips) // SL above current price for SELL
    }
  }

  // Auto-populate TP/SL with smart defaults when enabled
  const updateTpSlDefaults = (side: Side) => {
    if (currentQuote && selectedInstrument) {
      const currentPrice = currentQuote.last
      
      // Update TP default if enabled and in price mode and empty
      if (formData.tpEnabled && tpMode === 'price' && !formData.tpValue) {
        const smartTp = getSmartTpDefault(side, currentPrice)
        setFormData(prev => ({
          ...prev,
          tpValue: smartTp.toFixed(selectedInstrument.precision || 5)
        }))
      }
      
      // Update SL default if enabled and in price mode and empty
      if (formData.slEnabled && slMode === 'price' && !formData.slValue) {
        const smartSl = getSmartSlDefault(side, currentPrice)
        setFormData(prev => ({
          ...prev,
          slValue: smartSl.toFixed(selectedInstrument.precision || 5)
        }))
      }
    }
  }

  if (!open) return null

  // Calculate open price for preview calculations
  const getOpenPrice = (): number => {
    if (formData.priceMode === 'Market') {
      return currentQuote?.last || 0
    }
    return parseFloat(formData.specificPrice) || 0
  }

  // Calculate TP/SL price previews when in amount mode
  const tpPricePreview = isAmountFeatureEnabled && tpMode === 'amount' && tpAmount && formData.amount && getOpenPrice()
    ? priceFromAmount({ 
        openPrice: getOpenPrice(),
        side: 'BUY', // We'll update this when user clicks Buy/Sell
        amountUnits: parseFloat(formData.amount),
        targetPnLAbs: Number(tpAmount),
        isProfit: true,
        symbol: formData.instrument
      })
    : undefined

  const slPricePreview = isAmountFeatureEnabled && slMode === 'amount' && slAmount && formData.amount && getOpenPrice()
    ? priceFromAmount({ 
        openPrice: getOpenPrice(),
        side: 'BUY', // We'll update this when user clicks Buy/Sell
        amountUnits: parseFloat(formData.amount),
        targetPnLAbs: Number(slAmount),
        isProfit: false,
        symbol: formData.instrument
      })
    : undefined

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-populate TP/SL defaults when first enabled (assuming BUY for initial defaults)
    if (field === 'tpEnabled' && value === true && !formData.tpValue && tpMode === 'price' && currentQuote) {
      const smartTp = getSmartTpDefault('BUY', currentQuote.last)
      setFormData(prev => ({
        ...prev,
        tpValue: smartTp.toFixed(selectedInstrument?.precision || 5)
      }))
    }

    if (field === 'slEnabled' && value === true && !formData.slValue && slMode === 'price' && currentQuote) {
      const smartSl = getSmartSlDefault('BUY', currentQuote.last)
      setFormData(prev => ({
        ...prev,
        slValue: smartSl.toFixed(selectedInstrument?.precision || 5)
      }))
    }
  }

  // Validation
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

    // TP validation
    if (formData.tpEnabled) {
      if (isAmountFeatureEnabled && tpMode === 'amount') {
        if (!tpAmount || Number(tpAmount) <= 0) {
          newErrors.tpAmount = 'TP amount must be positive'
        }
      } else {
        const tp = parseFloat(formData.tpValue)
        if (!formData.tpValue || isNaN(tp) || tp <= 0) {
          newErrors.tpValue = 'Take Profit must be a positive number'
        }
      }
    }

    // SL validation
    if (formData.slEnabled) {
      if (isAmountFeatureEnabled && slMode === 'amount') {
        if (!slAmount || Number(slAmount) <= 0) {
          newErrors.slAmount = 'SL amount must be positive'
        }
      } else {
        const sl = parseFloat(formData.slValue)
        if (!formData.slValue || isNaN(sl) || sl <= 0) {
          newErrors.slValue = 'Stop Loss must be a positive number'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (side: Side) => {
    // Update TP/SL defaults based on the side before validation
    updateTpSlDefaults(side)
    
    if (!validateForm() || isSubmitting) return
    
    setIsSubmitting(true)

    try {
      let entryPrice: number

      if (formData.priceMode === 'Market') {
        if (!currentQuote) {
          throw new Error('No market price available')
        }
        entryPrice = side === 'BUY' ? currentQuote.ask : currentQuote.bid
      } else {
        entryPrice = parseFloat(formData.specificPrice)
      }
      
      // Prepare payload (convert amounts to prices if needed)
      let payload: NewPositionInput = {
        instrument: formData.instrument,
        side: side,
        amountUnits: parseFloat(formData.amount),
        openPrice: entryPrice,
        takeProfit: formData.tpEnabled ? parseFloat(formData.tpValue) || null : null,
        stopLoss: formData.slEnabled ? parseFloat(formData.slValue) || null : null,
      }

      // Handle TP/SL amount conversion if feature enabled
      if (isAmountFeatureEnabled) {
        // TP by amount only → compute price
        if (formData.tpEnabled && tpMode === 'amount' && !formData.tpValue && tpAmount) {
          payload.takeProfit = priceFromAmount({ 
            openPrice: entryPrice,
            side: side,
            amountUnits: parseFloat(formData.amount),
            targetPnLAbs: Number(tpAmount),
            isProfit: true,
            symbol: formData.instrument
          })
          payload.takeProfitAmount = Number(tpAmount)
        }
        
        // SL by amount only → compute price  
        if (formData.slEnabled && slMode === 'amount' && !formData.slValue && slAmount) {
          payload.stopLoss = priceFromAmount({ 
            openPrice: entryPrice,
            side: side,
            amountUnits: parseFloat(formData.amount),
            targetPnLAbs: Number(slAmount),
            isProfit: false,
            symbol: formData.instrument
          })
          payload.stopLossAmount = Number(slAmount)
        }

        // Store mode info for UI
        payload.tpMode = tpMode
        payload.slMode = slMode
      }

      await onSubmit(payload)
      onClose()
    } catch (error) {
      console.error('Failed to create position:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create position'
      setErrors({ general: errorMessage })
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

  const stepAmountValue = (field: 'tp' | 'sl', direction: 1 | -1) => {
    const currentValue = field === 'tp' ? Number(tpAmount) || 0 : Number(slAmount) || 0
    const step = 10 // $10 increments for amounts
    const newValue = Math.max(0, currentValue + (direction * step))
    
    if (field === 'tp') {
      setTpAmount(newValue === 0 ? '' : newValue)
    } else {
      setSlAmount(newValue === 0 ? '' : newValue)
    }
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

  // Helper functions for consistent theming (matching original)
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
      {/* Backdrop */}
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
                {errors.general}
              </div>
            )}

            {/* Instrument */}
            <div>
              <label className={getLabelClasses()}>Instrument</label>
              <select 
                value={formData.instrument}
                onChange={(e) => handleInputChange('instrument', e.target.value)}
                className={getInputClasses()}
              >
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
              {errors.instrument && <div className={getErrorClasses()}>{errors.instrument}</div>}
            </div>

            {/* Current Market Rate */}
            {currentQuote && (
              <div className={`p-3 rounded-lg border ${
                theme === 'dark' ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Rate
                  </span>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Bid
                      </div>
                      <div className={`font-mono text-sm ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {currentQuote.bid.toFixed(selectedInstrument?.precision || 5)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Ask
                      </div>
                      <div className={`font-mono text-sm ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {currentQuote.ask.toFixed(selectedInstrument?.precision || 5)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Last
                      </div>
                      <div className={`font-mono text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {currentQuote.last.toFixed(selectedInstrument?.precision || 5)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Mode */}
            <div>
              <label className={getLabelClasses()}>Price Mode</label>
              <div className="flex space-x-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceMode"
                    value="Market"
                    checked={formData.priceMode === 'Market'}
                    onChange={(e) => handleInputChange('priceMode', e.target.value)}
                    className="mr-2"
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Market</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceMode"
                    value="Specific"
                    checked={formData.priceMode === 'Specific'}
                    onChange={(e) => handleInputChange('priceMode', e.target.value)}
                    className="mr-2"
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Specific</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={getLabelClasses()}>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={getInputClasses()}
                placeholder="10000"
              />
              {errors.amount && <div className={getErrorClasses()}>{errors.amount}</div>}
            </div>

            {/* Specific Price */}
            {formData.priceMode === 'Specific' && (
              <div>
                <label className={getLabelClasses()}>Specific Price</label>
                <input
                  type="number"
                  step="0.00001"
                  min="0"
                  value={formData.specificPrice}
                  onChange={(e) => handleInputChange('specificPrice', e.target.value)}
                  className={getInputClasses()}
                  placeholder="1.08000"
                />
                {errors.specificPrice && <div className={getErrorClasses()}>{errors.specificPrice}</div>}
              </div>
            )}

            {/* Take Profit Section */}
            <div className={`border rounded-lg p-4 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tpEnabled}
                    onChange={(e) => handleInputChange('tpEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Take Profit
                  </span>
                </label>
              </div>

              {formData.tpEnabled && (
                <div className="space-y-3">
                  {/* TP Mode Toggle (only if feature enabled) */}
                  {isAmountFeatureEnabled && (
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mode</label>
                      <div className="flex space-x-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setTpMode('price')}
                          className={`px-3 py-1 text-xs rounded ${
                            tpMode === 'price'
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          By Price
                        </button>
                        <button
                          type="button"
                          onClick={() => setTpMode('amount')}
                          className={`px-3 py-1 text-xs rounded ${
                            tpMode === 'amount'
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          By Amount
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TP Input */}
                  {tpMode === 'price' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => stepValue('tpValue', -1)}
                        className={`px-2 py-1 rounded text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.00001"
                        min="0"
                        value={formData.tpValue}
                        onChange={(e) => handleInputChange('tpValue', e.target.value)}
                        className={getInputClasses()}
                        placeholder={currentQuote ? `e.g., ${(currentQuote.last + 0.001).toFixed(selectedInstrument?.precision || 5)}` : "1.09850"}
                      />
                      <button
                        type="button"
                        onClick={() => stepValue('tpValue', 1)}
                        className={`px-2 py-1 rounded text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => stepAmountValue('tp', -1)}
                          className={`px-2 py-1 rounded text-sm ${
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tpAmount}
                          onChange={(e) => setTpAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className={getInputClasses()}
                          placeholder="100.00"
                        />
                        <button
                          type="button"
                          onClick={() => stepAmountValue('tp', 1)}
                          className={`px-2 py-1 rounded text-sm ${
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                      </div>
                      {tpPricePreview && (
                        <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ≈ {tpPricePreview.toFixed(5)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.tpValue && <div className={getErrorClasses()}>{errors.tpValue}</div>}
                  {errors.tpAmount && <div className={getErrorClasses()}>{errors.tpAmount}</div>}
                </div>
              )}
            </div>

            {/* Stop Loss Section */}
            <div className={`border rounded-lg p-4 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.slEnabled}
                    onChange={(e) => handleInputChange('slEnabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Stop Loss
                  </span>
                </label>
              </div>

              {formData.slEnabled && (
                <div className="space-y-3">
                  {/* SL Mode Toggle (only if feature enabled) */}
                  {isAmountFeatureEnabled && (
                    <div>
                      <label className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Mode</label>
                      <div className="flex space-x-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setSlMode('price')}
                          className={`px-3 py-1 text-xs rounded ${
                            slMode === 'price'
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          By Price
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlMode('amount')}
                          className={`px-3 py-1 text-xs rounded ${
                            slMode === 'amount'
                              ? 'bg-blue-600 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          By Amount
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SL Input */}
                  {slMode === 'price' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => stepValue('slValue', -1)}
                        className={`px-2 py-1 rounded text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.00001"
                        min="0"
                        value={formData.slValue}
                        onChange={(e) => handleInputChange('slValue', e.target.value)}
                        className={getInputClasses()}
                        placeholder={currentQuote ? `e.g., ${(currentQuote.last - 0.001).toFixed(selectedInstrument?.precision || 5)}` : "1.06800"}
                      />
                      <button
                        type="button"
                        onClick={() => stepValue('slValue', 1)}
                        className={`px-2 py-1 rounded text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => stepAmountValue('sl', -1)}
                          className={`px-2 py-1 rounded text-sm ${
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={slAmount}
                          onChange={(e) => setSlAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className={getInputClasses()}
                          placeholder="150.00"
                        />
                        <button
                          type="button"
                          onClick={() => stepAmountValue('sl', 1)}
                          className={`px-2 py-1 rounded text-sm ${
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                      </div>
                      {slPricePreview && (
                        <div className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ≈ {slPricePreview.toFixed(5)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.slValue && <div className={getErrorClasses()}>{errors.slValue}</div>}
                  {errors.slAmount && <div className={getErrorClasses()}>{errors.slAmount}</div>}
                </div>
              )}
            </div>

            {/* Open Reason */}
            <div>
              <label className={getLabelClasses()}>Open Reason</label>
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

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => handleSubmit('BUY')}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {getBuyButtonText()}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('SELL')}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
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