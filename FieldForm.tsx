import * as React from 'react'
import { FieldConfig } from '@/config/fields'
import { FieldInput } from '@/components/FieldInput'
import FieldRow from '@/components/FieldRow'

interface FieldFormProps {
  entityId: string
  fields: FieldConfig[]
}

/**
 * Form-style field renderer using FieldRow + FieldInput
 * Used for the Documents tab and other form-heavy sections
 */
export function FieldForm({ entityId, fields }: FieldFormProps) {
  return (
    <div className="space-y-1">
      {fields.map((field) => (
        <FieldRow
          key={field.key}
          label={field.label}
          required={field.required}
          fullWidth={field.type === 'textarea' || field.type === 'file'}
        >
          <FieldInput entityId={entityId} fieldKey={field.key} />
        </FieldRow>
      ))}
    </div>
  )
}