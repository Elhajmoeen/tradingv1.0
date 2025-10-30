import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { bulkUpdatePositions } from '@/state/positionsSlice'
import { OPEN_REASON_OPTIONS } from '@/config/openReason'

interface EditPositionModalProps {
  open: boolean
  onClose: () => void
  positionIds: string[]
  theme?: 'light' | 'dark'
}

export default function EditPositionModal({ 
  open, 
  onClose, 
  positionIds, 
  theme = 'light' 
}: EditPositionModalProps) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    openPrice: '',
    takeProfit: '',
    stopLoss: '',
    openReason: 'Manual',
    commission: '',
    swap: '',
    openPnL: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!open) return null

  const setField = (k: keyof typeof form, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const toNum = (v: string) => (v.trim() === '' ? undefined : Number(v))

  const validate = () => {
    const e: Record<string, string> = {}
    const numericKeys: (keyof typeof form)[] = ['openPrice', 'takeProfit', 'stopLoss', 'commission', 'swap', 'openPnL']
    
    numericKeys.forEach(k => {
      const value = form[k].trim()
      if (value !== '' && Number.isNaN(Number(value))) {
        e[k] = 'Must be a valid number'
      }
      // Additional validation for positive values where appropriate
      if (value !== '' && !Number.isNaN(Number(value))) {
        if ((k === 'openPrice' || k === 'takeProfit' || k === 'stopLoss') && Number(value) <= 0) {
          e[k] = 'Must be greater than 0'
        }
      }
    })
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSave = async () => {
    if (!validate() || submitting) return
    setSubmitting(true)
    
    try {
      const patch = {
        openPrice: toNum(form.openPrice),
        takeProfit: toNum(form.takeProfit),
        stopLoss: toNum(form.stopLoss),
        commission: toNum(form.commission),
        swap: toNum(form.swap),
        openPnL: toNum(form.openPnL),
        openReason: form.openReason,
      }
      
      // Strip undefined so we only update provided fields
      Object.keys(patch).forEach(k => {
        if ((patch as any)[k] === undefined) {
          delete (patch as any)[k]
        }
      })

      if (Object.keys(patch).length === 0) {
        onClose()
        return
      }

      dispatch(bulkUpdatePositions({ ids: positionIds, patch }))
      onClose()
    } finally {
      setSubmitting(false)
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
    `block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`

  const getErrorClasses = () => 
    `mt-1 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`

  return (
    <React.Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/10" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      {/* Modal Panel */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-base font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Edit {positionIds.length > 1 ? `${positionIds.length} Positions` : 'Position'}
            </h3>
            <button 
              onClick={onClose} 
              className={`w-8 h-8 grid place-items-center rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className={getLabelClasses()}>Open Price</label>
                <input 
                  value={form.openPrice} 
                  onChange={e => setField('openPrice', e.target.value)}
                  type="number" 
                  step="0.00001"
                  placeholder="1.0875"
                  className={getInputClasses()}
                />
                {errors.openPrice && <p className={getErrorClasses()}>{errors.openPrice}</p>}
              </div>

              <div>
                <label className={getLabelClasses()}>Take Profit</label>
                <input 
                  value={form.takeProfit} 
                  onChange={e => setField('takeProfit', e.target.value)}
                  type="number" 
                  step="0.00001"
                  placeholder="1.0950"
                  className={getInputClasses()}
                />
                {errors.takeProfit && <p className={getErrorClasses()}>{errors.takeProfit}</p>}
              </div>

              <div>
                <label className={getLabelClasses()}>Stop Loss</label>
                <input 
                  value={form.stopLoss} 
                  onChange={e => setField('stopLoss', e.target.value)}
                  type="number" 
                  step="0.00001"
                  placeholder="1.0800"
                  className={getInputClasses()}
                />
                {errors.stopLoss && <p className={getErrorClasses()}>{errors.stopLoss}</p>}
              </div>

              <div>
                <label className={getLabelClasses()}>Commission</label>
                <input 
                  value={form.commission} 
                  onChange={e => setField('commission', e.target.value)}
                  type="number" 
                  step="0.01"
                  placeholder="15.00"
                  className={getInputClasses()}
                />
                {errors.commission && <p className={getErrorClasses()}>{errors.commission}</p>}
              </div>

              <div>
                <label className={getLabelClasses()}>Swap</label>
                <input 
                  value={form.swap} 
                  onChange={e => setField('swap', e.target.value)}
                  type="number" 
                  step="0.01"
                  placeholder="-2.50"
                  className={getInputClasses()}
                />
                {errors.swap && <p className={getErrorClasses()}>{errors.swap}</p>}
              </div>

              <div>
                <label className={getLabelClasses()}>Open PnL</label>
                <input 
                  value={form.openPnL} 
                  onChange={e => setField('openPnL', e.target.value)}
                  type="number" 
                  step="0.01"
                  placeholder="150.00"
                  className={getInputClasses()}
                />
                {errors.openPnL && <p className={getErrorClasses()}>{errors.openPnL}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={getLabelClasses()}>Open Reason</label>
                <select 
                  value={form.openReason} 
                  onChange={e => setField('openReason', e.target.value)}
                  className={getInputClasses()}
                >
                  {OPEN_REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {positionIds.length > 1 && (
              <div className={`p-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-blue-900/20 border border-blue-700' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <strong>Bulk Edit:</strong> Changes will be applied to all {positionIds.length} selected positions. 
                  Leave fields empty to keep current values unchanged.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex gap-3 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button 
              onClick={onClose} 
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={onSave} 
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}