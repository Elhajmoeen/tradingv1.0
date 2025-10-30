import { useState, useEffect, useCallback } from 'react'

// Simple localStorage-based replacement for useKV hook
export function useKV<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Load initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Update localStorage whenever the value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}