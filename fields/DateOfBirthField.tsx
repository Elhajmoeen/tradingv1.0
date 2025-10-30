import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectEntityById, setDateOfBirthAndCalculateAge } from '@/state/entitiesSlice'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { formatDateForDisplay, isValidBirthDate } from '@/utils/dateUtils'

interface DateOfBirthFieldProps {
  clientId: string
}

// Calendar component for date selection
function DatePickerCalendar({ 
  selectedDate, 
  onDateSelect, 
  onSave,
  onCancel 
}: { 
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  onSave: () => void
  onCancel: () => void 
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: Array<{
      day: number
      isCurrentMonth: boolean
      isNextMonth: boolean
      date: Date
    }> = []
    
    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isNextMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        date: new Date(year, month, day)
      })
    }
    
    // Next month's days to fill the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(year, month + 1, day)
      })
    }
    
    return days
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }
  
  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  const isFutureDate = (date: Date) => {
    return date > today
  }
  
  // Generate year options (120 years back from current year)
  const currentYear = today.getFullYear()
  const yearOptions: number[] = []
  for (let year = currentYear; year >= currentYear - 120; year--) {
    yearOptions.push(year)
  }

  return (
    <div className="absolute top-full left-0 z-50 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="p-3 space-y-0.5">
        {/* Month/Year Navigation */}
        <div className="grid grid-cols-5 items-center gap-x-3 mx-1.5 pb-3">
          <div className="col-span-1">
            <button 
              type="button" 
              onClick={() => navigateMonth('prev')}
              className="size-8 flex justify-center items-center text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:bg-gray-100"
            >
              <svg className="shrink-0 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="col-span-3 flex justify-center items-center gap-x-1">
            <select 
              value={currentMonth.getMonth()}
              onChange={(e) => setCurrentMonth(prev => new Date(prev.getFullYear(), parseInt(e.target.value), 1))}
              className="text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer hover:text-blue-600"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            
            <span className="text-gray-800">/</span>
            
            <select 
              value={currentMonth.getFullYear()}
              onChange={(e) => setCurrentMonth(prev => new Date(parseInt(e.target.value), prev.getMonth(), 1))}
              className="text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer hover:text-blue-600"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1 flex justify-end">
            <button 
              type="button" 
              onClick={() => navigateMonth('next')}
              className="size-8 flex justify-center items-center text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:bg-gray-100"
            >
              <svg className="shrink-0 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="flex pb-1.5">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <span key={day} className="m-px w-10 block text-center text-sm text-gray-500">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <div key={weekIndex} className="flex">
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayInfo, dayIndex) => {
                const isSelected = isSelectedDate(dayInfo.date)
                const isTodayDate = isToday(dayInfo.date)
                const isFuture = isFutureDate(dayInfo.date)
                const isDisabled = !dayInfo.isCurrentMonth || isFuture
                
                return (
                  <div key={dayIndex}>
                    <button
                      type="button"
                      onClick={() => !isDisabled && onDateSelect(dayInfo.date)}
                      disabled={isDisabled}
                      className={`m-px size-10 flex justify-center items-center text-sm rounded-full transition-colors focus:outline-none ${
                        selectedDate && dayInfo.date.toDateString() === selectedDate.toDateString()
                          ? 'bg-blue-600 text-white font-medium' 
                          : isTodayDate && dayInfo.isCurrentMonth
                          ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                          : dayInfo.isCurrentMonth && !isDisabled
                          ? 'text-gray-800 hover:border-blue-600 hover:text-blue-600 border-2 border-transparent'
                          : 'text-gray-400 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {dayInfo.day}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex justify-between items-center">
        <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {selectedDate 
            ? `Selected: ${selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}`
            : 'Select a date'
          }
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Save button clicked, selectedDate:', selectedDate)
              onSave()
            }}
            disabled={!selectedDate}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export function DateOfBirthField({ clientId }: DateOfBirthFieldProps) {
  const dispatch = useDispatch()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  if (!entity) {
    return <div className="text-muted-foreground">Entity not found</div>
  }

  const currentDateOfBirth = entity.dateOfBirth || ''
  const selectedDate = currentDateOfBirth ? new Date(currentDateOfBirth) : null
  
  const handleEditClick = () => {
    setPendingDate(selectedDate) // Initialize with current date
    setIsEditing(true)
  }

  const handleCancel = () => {
    setPendingDate(null)
    setIsEditing(false)
  }

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date)
    setPendingDate(date) // Just store the selected date, don't save yet
    console.log('Pending date set to:', date)
  }

  const handleSave = async () => {
    console.log('handleSave called, pendingDate:', pendingDate)
    if (!pendingDate) {
      console.log('No pending date to save')
      return
    }
    
    const dateString = pendingDate.toISOString().split('T')[0]
    console.log('Saving date string:', dateString)
    
    if (!isValidBirthDate(dateString)) {
      alert('Please select a valid birth date')
      return
    }

    setIsLoading(true)
    try {
      console.log('Dispatching setDateOfBirthAndCalculateAge...')
      const result = await dispatch(setDateOfBirthAndCalculateAge({ 
        entityId: clientId, 
        dateOfBirth: dateString 
      }) as any)
      console.log('Dispatch result:', result)
      setIsEditing(false)
      setPendingDate(null)
    } catch (error) {
      console.error('Failed to update date of birth:', error)
      alert('Failed to update date of birth. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldRef.current && !fieldRef.current.contains(event.target as Node)) {
        setIsEditing(false)
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  // Debug logging
  console.log('DateOfBirthField render - pendingDate:', pendingDate, 'isEditing:', isEditing, 'currentDateOfBirth:', currentDateOfBirth)

  return (
    <div className="w-full relative" ref={fieldRef}>
      <div 
        className="flex items-center justify-between w-full cursor-pointer bg-white border border-transparent rounded-lg px-3 py-2 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
        onClick={handleEditClick}
      >
        <div className="flex items-center gap-2 flex-1">
          <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span 
            className={`text-sm truncate ${
              currentDateOfBirth ? 'text-gray-700' : 'text-gray-400'
            }`}
            style={{
              fontWeight: 400,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {formatDateForDisplay(currentDateOfBirth)}
          </span>
        </div>
        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          Click to edit
        </div>
      </div>

      {isEditing && !isLoading && (
        <DatePickerCalendar
          selectedDate={pendingDate}
          onDateSelect={handleDateSelect}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {isLoading && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-200 shadow-lg rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Updating...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}