import * as React from 'react'
import { Label } from '@/components/ui/label'

interface FieldRowProps {
  label: string
  children: React.ReactNode
  required?: boolean
  fullWidth?: boolean
}

/**
 * Responsive field row component that adapts layout based on screen size:
 * - md+: Two columns with fixed-width label and flexible value area
 * - xs/sm: Stacked layout with label above value
 * - fullWidth: For textarea and other wide inputs
 */
export default function FieldRow({ label, children, required, fullWidth = false }: FieldRowProps) {
  if (fullWidth) {
    return (
      <div className="py-3 border-b border-border/50 last:border-b-0">
        <div className="mb-2">
          <Label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        <div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-2 md:gap-4 items-start py-3 border-b border-border/50 last:border-b-0">
      <div className="md:pt-2">
        <Label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}