import React, { useState, useEffect, useRef } from 'react'

interface FilterCondition {
  operator: string
  value: string
}

interface ColumnFilterPopupProps {
  isOpen: boolean
  onClose: () => void
  columnId: string
  columnLabel: string
  columnType: 'text' | 'number' | 'date'
  values: (string | number)[] // Unique values in this column
  onApplyFilter: (columnId: string, condition: FilterCondition | null) => void
  currentFilter?: FilterCondition | null
  anchorElement?: HTMLElement | null
}

export default function ColumnFilterPopup({
  isOpen,
  onClose,
  columnId,
  columnLabel,
  columnType,
  values,
  onApplyFilter,
  currentFilter,
  anchorElement
}: ColumnFilterPopupProps) {
  const [operator, setOperator] = useState(currentFilter?.operator || 'equals')
  const [filterValue, setFilterValue] = useState(currentFilter?.value || '')
  const [showUniqueValues, setShowUniqueValues] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  // Position the popup relative to the anchor element
  useEffect(() => {
    if (isOpen && anchorElement && popupRef.current) {
      const rect = anchorElement.getBoundingClientRect()
      const popup = popupRef.current
      
      popup.style.position = 'fixed'
      popup.style.top = `${rect.bottom + 5}px`
      popup.style.left = `${Math.max(10, rect.left - 150)}px`
      popup.style.zIndex = '1000'
    }
  }, [isOpen, anchorElement])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const getOperatorOptions = () => {
    switch (columnType) {
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: '>', label: 'Greater than' },
          { value: '>=', label: 'Greater or equal' },
          { value: '<', label: 'Less than' },
          { value: '<=', label: 'Less or equal' }
        ]
      case 'date':
        return [
          { value: 'on', label: 'On date' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' }
        ]
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts with' },
          { value: 'endsWith', label: 'Ends with' }
        ]
    }
  }

  const handleApply = () => {
    if (filterValue.trim()) {
      onApplyFilter(columnId, { operator, value: filterValue.trim() })
    } else {
      onApplyFilter(columnId, null) // Clear filter
    }
    onClose()
  }

  const handleClear = () => {
    setFilterValue('')
    onApplyFilter(columnId, null)
    onClose()
  }

  const uniqueValues = [...new Set(values)].slice(0, 10) // Show max 10 unique values

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-64"
    >
      <div className="mb-3">
        <h3 className="font-medium text-gray-900 text-sm mb-2">
          Filter: {columnLabel}
        </h3>
      </div>

      <div className="space-y-3">
        {/* Operator selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getOperatorOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            type={columnType === 'number' ? 'number' : columnType === 'date' ? 'date' : 'text'}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Unique values for text columns */}
        {columnType === 'text' && uniqueValues.length > 0 && (
          <div>
            <button
              onClick={() => setShowUniqueValues(!showUniqueValues)}
              className="text-xs text-blue-600 hover:text-blue-800 mb-1"
            >
              {showUniqueValues ? 'Hide' : 'Show'} unique values ({uniqueValues.length})
            </button>
            {showUniqueValues && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-1">
                {uniqueValues.map((value, index) => (
                  <button
                    key={index}
                    onClick={() => setFilterValue(String(value))}
                    className="block w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded truncate"
                  >
                    {String(value)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}