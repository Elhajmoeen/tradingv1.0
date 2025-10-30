import React from 'react'
import { Select } from 'flowbite-react'
import { useAppSelector, useAppDispatch } from '../../state/hooks'
import { updateEntityField } from '../../state/entitiesSlice'
import { LEAD_STATUS, normalizeLeadStatus, type LeadStatus } from '../../config/leadStatus'

interface LeadStatusSelectProps {
  entityId: string
  value?: LeadStatus
  onChange?: (value: LeadStatus | undefined) => void
}

export function LeadStatusSelect({ entityId, value, onChange }: LeadStatusSelectProps) {
  const dispatch = useAppDispatch()
  const currentValue = value || ''

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value
    const normalizedValue = normalizeLeadStatus(newValue)
    
    dispatch(updateEntityField({
      id: entityId,
      key: 'leadStatus',
      value: normalizedValue
    }))
    
    onChange?.(normalizedValue)
  }

  return (
    <Select
      id={`leadStatus-${entityId}`}
      value={currentValue}
      onChange={handleChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    >
      <option value="">Select Status...</option>
      {LEAD_STATUS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Select>
  )
}