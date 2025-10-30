import { useId } from 'react'

type StarRatingProps = {
  value?: number // 1..5
  onChange?: (n: number | undefined) => void
  readOnly?: boolean
  size?: number // px
  allowClear?: boolean
  className?: string
}

export default function StarRating({ 
  value, 
  onChange, 
  readOnly = false, 
  size = 18, 
  allowClear = true, 
  className = '' 
}: StarRatingProps) {
  const id = useId()
  const filled = (i: number) => (value ?? 0) >= i

  return (
    <div 
      className={`inline-flex items-center gap-0.5 ${className}`} 
      role="slider"
      aria-valuemin={1} 
      aria-valuemax={5} 
      aria-valuenow={value ?? 0} 
      aria-label="rating"
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={(e) => {
        if (readOnly || !onChange) return
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault()
          onChange(Math.min(5, (value ?? 0) + 1))
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault()
          onChange(Math.max(1, (value ?? 1) - 1))
        }
        if (allowClear && (e.key === 'Backspace' || e.key === 'Delete')) {
          e.preventDefault()
          onChange(undefined)
        }
      }}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={`${id}-${i}`}
          type="button"
          className="p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors"
          disabled={readOnly}
          onClick={() => onChange && onChange(allowClear && value === i ? undefined : i)}
          aria-pressed={filled(i)}
          title={`${i} star${i !== 1 ? 's' : ''}`}
        >
          <svg
            width={size} 
            height={size} 
            viewBox="0 0 24 24"
            className={`transition-colors ${
              filled(i) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            } ${readOnly ? '' : 'cursor-pointer'}`}
            fill="currentColor"
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
      ))}
      {!readOnly && value && allowClear && (
        <button
          type="button"
          className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors"
          onClick={() => onChange && onChange(undefined)}
          title="Clear rating"
        >
          <svg width={size - 2} height={size - 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  )
}