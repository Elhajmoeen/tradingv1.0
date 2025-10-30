import * as React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectEntityById, setCountryAndLinkDial } from '@/state/entitiesSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, PencilSimple } from '@phosphor-icons/react'

interface CountryFieldProps {
  clientId: string
}

export function CountryField({ clientId }: CountryFieldProps) {
  const dispatch = useDispatch()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  
  useEffect(() => {
    if (entity) {
      setInputValue(entity.country || '')
    }
  }, [entity])

  if (!entity) {
    return <div className="text-muted-foreground">Entity not found</div>
  }

  const handleEdit = () => {
    setIsEditing(true)
    setInputValue(entity.country || '')
  }

  const handleSave = () => {
    // Use the new thunk that handles country change and auto-fills dial codes
    dispatch(setCountryAndLinkDial({ 
      id: clientId, 
      countryIsoOrName: inputValue.trim() 
    }))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setInputValue(entity.country || '')
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter country (e.g., AE, UAE, United Arab Emirates)"
          className="flex-1"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleSave}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleCancel}
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-between group cursor-pointer"
      onClick={handleEdit}
    >
      <span className="text-sm text-muted-foreground flex-1">
        {entity.country || 'Not set'}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <PencilSimple className="h-3 w-3 text-gray-500" />
      </Button>
    </div>
  )
}