import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateClosedPositionFields, selectClosedPositionById } from '@/state/positionsSlice'
import { OPEN_REASON_OPTIONS } from '@/config/openReason'
import { CLOSE_REASON_OPTIONS } from '@/config/closeReason'
import type { RootState } from '@/state/store'

interface ClosedPositionEditModalProps {
  open: boolean
  onClose: () => void
  accountId: string
  positionId: string | null
  theme?: 'light' | 'dark'
}

interface FormData {
  takeProfit: string
  stopLoss: string
  openPrice: string
  closedPrice: string
  pnlWithout: string
  totalPnL: string
  commission: string
  swap: string
  openReason: string
  closeReason: string
  openIp: string
  closeIp: string
}

export default function ClosedPositionEditModal({ 
  open, 
  onClose, 
  accountId, 
  positionId,
  theme = 'light' 
}: ClosedPositionEditModalProps) {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState<FormData>({
    takeProfit: '',
    stopLoss: '',
    openPrice: '',
    closedPrice: '',
    pnlWithout: '',
    totalPnL: '',
    commission: '',
    swap: '',
    openReason: '',
    closeReason: '',
    openIp: '',
    closeIp: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the position data for prefilling
  const position = useSelector((state: RootState) => 
    positionId ? selectClosedPositionById(state, accountId, positionId) : null
  )

  // Prefill form when position changes
  useEffect(() => {
    if (position && open) {
      setFormData({
        takeProfit: position.takeProfit?.toString() || '',
        stopLoss: position.stopLoss?.toString() || '',
        openPrice: position.openPrice?.toString() || '',
        closedPrice: position.closedPrice?.toString() || '',
        pnlWithout: position.pnlWithout?.toString() || '',
        totalPnL: position.totalPnL?.toString() || '',
        commission: position.commission?.toString() || '',
        swap: position.swap?.toString() || '',
        openReason: position.openReason || '',
        closeReason: position.closeReason || '',
        openIp: position.openIp || '',
        closeIp: position.closeIp || '',
      })
      setErrors({})
    }
  }, [position, open])

  // Clear form when modal closes
  useEffect(() => {
    if (!open) {
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open])

  if (!open || !positionId) return null

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate numeric fields
    const numericFields: (keyof FormData)[] = [
      'takeProfit', 'stopLoss', 'openPrice', 'closedPrice', 
      'pnlWithout', 'totalPnL', 'commission', 'swap'
    ]

    numericFields.forEach(field => {
      const value = formData[field].trim()
      if (value !== '' && (isNaN(Number(value)) || !isFinite(Number(value)))) {
        newErrors[field] = 'Must be a valid number'
      }
    })

    // Positive price validation for prices
    const priceFields: (keyof FormData)[] = ['takeProfit', 'stopLoss', 'openPrice', 'closedPrice']
    priceFields.forEach(field => {
      const value = formData[field].trim()
      if (value !== '' && !isNaN(Number(value)) && Number(value) <= 0) {
        newErrors[field] = 'Must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Build patch object with only changed/non-empty fields
      const patch: any = {}
      
      // Handle numeric fields
      const numericFields: (keyof FormData)[] = [
        'takeProfit', 'stopLoss', 'openPrice', 'closedPrice', 
        'pnlWithout', 'totalPnL', 'commission', 'swap'
      ]
      
      numericFields.forEach(field => {
        const value = formData[field].trim()
        if (value !== '') {
          patch[field] = Number(value)
        } else {
          patch[field] = null // Allow clearing fields
        }
      })

      // Handle text fields
      const textFields: (keyof FormData)[] = ['openIp', 'closeIp']
      textFields.forEach(field => {
        const value = formData[field].trim()
        patch[field] = value || null
      })

      // Handle dropdown fields
      const dropdownFields: (keyof FormData)[] = ['openReason', 'closeReason']
      dropdownFields.forEach(field => {
        const value = formData[field]
        patch[field] = value || null
      })

      dispatch(updateClosedPositionFields({ 
        id: positionId, 
        accountId, 
        patch 
      }))
      
      onClose()
    } catch (error) {
      console.error('Error updating closed position:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update position' })
    } finally {
      setIsSubmitting(false)
    }
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

  const getTextAreaClasses = () =>
    `w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border resize-none ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`

  return (
    <React.Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-gray-900/50" 
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className={`w-full max-w-6xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`px-8 py-5 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Closed Position
            </h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
              }`}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errors.general && (
              <div className={`p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-700 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            {/* Three-column grid for numeric fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Take Profit */}
              <div>
                <label className={getLabelClasses()}>Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={formData.takeProfit}
                  onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter take profit price"
                />
                {errors.takeProfit && <p className={getErrorClasses()}>{errors.takeProfit}</p>}
              </div>

              {/* Stop Loss */}
              <div>
                <label className={getLabelClasses()}>Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter stop loss price"
                />
                {errors.stopLoss && <p className={getErrorClasses()}>{errors.stopLoss}</p>}
              </div>

              {/* Open Price */}
              <div>
                <label className={getLabelClasses()}>Open Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.openPrice}
                  onChange={(e) => handleInputChange('openPrice', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter open price"
                />
                {errors.openPrice && <p className={getErrorClasses()}>{errors.openPrice}</p>}
              </div>

              {/* Closed Price */}
              <div>
                <label className={getLabelClasses()}>Closed Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.closedPrice}
                  onChange={(e) => handleInputChange('closedPrice', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter closed price"
                />
                {errors.closedPrice && <p className={getErrorClasses()}>{errors.closedPrice}</p>}
              </div>

              {/* PnL */}
              <div>
                <label className={getLabelClasses()}>PnL</label>
                <input
                  type="number"
                  step="any"
                  value={formData.pnlWithout}
                  onChange={(e) => handleInputChange('pnlWithout', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter PnL (without fees)"
                />
                {errors.pnlWithout && <p className={getErrorClasses()}>{errors.pnlWithout}</p>}
              </div>

              {/* Total PnL */}
              <div>
                <label className={getLabelClasses()}>Total PnL</label>
                <input
                  type="number"
                  step="any"
                  value={formData.totalPnL}
                  onChange={(e) => handleInputChange('totalPnL', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter total PnL (with fees)"
                />
                {errors.totalPnL && <p className={getErrorClasses()}>{errors.totalPnL}</p>}
              </div>

              {/* Commission */}
              <div>
                <label className={getLabelClasses()}>Commission</label>
                <input
                  type="number"
                  step="any"
                  value={formData.commission}
                  onChange={(e) => handleInputChange('commission', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter commission amount"
                />
                {errors.commission && <p className={getErrorClasses()}>{errors.commission}</p>}
              </div>

              {/* Swap */}
              <div>
                <label className={getLabelClasses()}>Swap</label>
                <input
                  type="number"
                  step="any"
                  value={formData.swap}
                  onChange={(e) => handleInputChange('swap', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter swap amount"
                />
                {errors.swap && <p className={getErrorClasses()}>{errors.swap}</p>}
              </div>

              {/* Close IP */}
              <div>
                <label className={getLabelClasses()}>Close IP</label>
                <input
                  type="text"
                  value={formData.closeIp}
                  onChange={(e) => handleInputChange('closeIp', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter close IP address"
                />
                {errors.closeIp && <p className={getErrorClasses()}>{errors.closeIp}</p>}
              </div>

              {/* Open Reason */}
              <div>
                <label className={getLabelClasses()}>Open Reason</label>
                <select
                  value={formData.openReason}
                  onChange={(e) => handleInputChange('openReason', e.target.value)}
                  className={getInputClasses()}
                >
                  <option value="">Select open reason</option>
                  {OPEN_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.openReason && <p className={getErrorClasses()}>{errors.openReason}</p>}
              </div>

              {/* Close Reason */}
              <div>
                <label className={getLabelClasses()}>Close Reason</label>
                <select
                  value={formData.closeReason}
                  onChange={(e) => handleInputChange('closeReason', e.target.value)}
                  className={getInputClasses()}
                >
                  <option value="">Select close reason</option>
                  {CLOSE_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.closeReason && <p className={getErrorClasses()}>{errors.closeReason}</p>}
              </div>

              {/* Open IP */}
              <div>
                <label className={getLabelClasses()}>Open IP</label>
                <input
                  type="text"
                  value={formData.openIp}
                  onChange={(e) => handleInputChange('openIp', e.target.value)}
                  className={getInputClasses()}
                  placeholder="Enter open IP address"
                />
                {errors.openIp && <p className={getErrorClasses()}>{errors.openIp}</p>}
              </div>

              {/* Empty div for 3-column alignment */}
              <div></div>
            </div>

            {/* Action buttons */}
            <div className={`flex gap-3 pt-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  )
}