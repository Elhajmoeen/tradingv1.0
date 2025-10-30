import React from 'react'

interface ConfirmClosePositionsModalProps {
  open: boolean
  count: number
  onCancel: () => void
  onConfirm: () => void
  theme?: 'light' | 'dark'
}

export default function ConfirmClosePositionsModal({
  open,
  count,
  onCancel,
  onConfirm,
  theme = 'light'
}: ConfirmClosePositionsModalProps) {
  if (!open) return null

  // Helper functions for consistent theming
  const getModalBgClasses = () => 
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'

  const getHeaderClasses = () =>
    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  const getTitleClasses = () =>
    theme === 'dark' ? 'text-white' : 'text-gray-900'

  const getTextClasses = () =>
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'

  const getSubtextClasses = () =>
    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  const getCloseButtonClasses = () =>
    theme === 'dark' 
      ? 'text-gray-400 hover:bg-gray-700' 
      : 'text-gray-500 hover:bg-gray-100'

  const getCancelButtonClasses = () =>
    theme === 'dark'
      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'

  return (
    <React.Fragment>
      {/* Backdrop (light dim) */}
      <div
        className="fixed inset-0 z-[60] bg-black/10"
        aria-hidden="true"
        onClick={onCancel}
      />
      
      {/* Panel */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-xl shadow-xl border ${getModalBgClasses()}`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${getHeaderClasses()}`}>
            <h3 className={`text-base font-semibold ${getTitleClasses()}`}>
              Close Positions
            </h3>
            <button
              onClick={onCancel}
              className={`w-8 h-8 grid place-items-center rounded-lg ${getCloseButtonClasses()}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="p-6">
            <p className={`text-sm ${getTextClasses()}`}>
              Are you sure you want to close{' '}
              <span className="font-semibold">{count}</span>{' '}
              {count === 1 ? 'position' : 'positions'}?
            </p>
            <p className={`mt-2 text-xs ${getSubtextClasses()}`}>
              This action will be finalized when the Closed Positions workflow is implemented.
            </p>
          </div>

          <div className={`px-6 py-4 border-t flex gap-3 ${getHeaderClasses()}`}>
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium flex-1 transition-colors ${getCancelButtonClasses()}`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex-1 transition-colors"
            >
              Confirm Close
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}