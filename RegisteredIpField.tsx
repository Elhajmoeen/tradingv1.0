import * as React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, PencilSimple, Warning } from '@phosphor-icons/react'
import { validateIPInput, normalizeIp } from '@/utils/net'

interface RegisteredIpFieldProps {
  clientId: string
}

export function RegisteredIpField({ clientId }: RegisteredIpFieldProps) {
  const dispatch = useDispatch()
  const entity = useSelector(selectEntityById(clientId))
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [validation, setValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true })
  
  useEffect(() => {
    if (entity) {
      setInputValue(entity.registeredIp || '')
    }
  }, [entity])

  // Validate input as user types
  useEffect(() => {
    if (isEditing) {
      const result = validateIPInput(inputValue)
      setValidation(result)
    }
  }, [inputValue, isEditing])

  if (!entity) {
    return <div className="text-muted-foreground">Entity not found</div>
  }

  const handleEdit = () => {
    setIsEditing(true)
    setInputValue(entity.registeredIp || '')
    setValidation({ isValid: true })
  }

  const handleSave = () => {
    const normalized = normalizeIp(inputValue)
    
    // Only save if valid or empty
    if (validation.isValid) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'registeredIp',
        value: normalized
      }))
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setInputValue(entity.registeredIp || '')
    setIsEditing(false)
    setValidation({ isValid: true })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validation.isValid) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter IP address (e.g., 192.168.1.1 or 2001:db8::1)"
            className={`flex-1 ${!validation.isValid ? 'border-red-500' : ''}`}
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleSave}
            disabled={!validation.isValid}
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
        {!validation.isValid && validation.message && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Warning className="h-3 w-3" />
            <span>{validation.message}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-between group cursor-pointer"
      onClick={handleEdit}
    >
      <span className="text-sm text-muted-foreground flex-1">
        {entity.registeredIp || 'Not set'}
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