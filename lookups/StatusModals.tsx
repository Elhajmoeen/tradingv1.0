import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export interface LookupValue {
  id: string;
  key: string;
  label: string;
  color?: string | null;
  order: number;
  active: boolean;
  deprecatedAt?: string | null;
  usageCount?: number;
}

interface AddStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (value: Omit<LookupValue, 'id' | 'order'>) => void
  category: string
}

export function AddStatusModal({ isOpen, onClose, onAdd, category }: AddStatusModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    color: '',
    active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        key: '',
        label: '',
        color: '',
        active: true,
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.key.trim() || !formData.label.trim()) {
      toast.error('Key and Label are required')
      return
    }

    setIsSubmitting(true)
    
    try {
      onAdd({
        key: formData.key.trim(),
        label: formData.label.trim(),
        color: formData.color.trim() || null,
        active: formData.active,
        usageCount: 0,
      })
      
      toast.success(`Status "${formData.label}" created successfully`)
      onClose()
    } catch (error) {
      toast.error('Failed to create status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New {category} Status</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder="e.g. approved, pending, rejected"
              required
            />
            <p className="text-xs text-gray-500">
              Unique identifier used in code (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g. Approved, Pending Review, Rejected"
              required
            />
            <p className="text-xs text-gray-500">
              Display name shown to users
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1 font-mono text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              Optional color for visual identification
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active Status</Label>
              <p className="text-xs text-gray-500">
                Whether this status is available for selection
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Status'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<LookupValue>) => void
  status: LookupValue | null
  category: string
}

export function EditStatusModal({ isOpen, onClose, onUpdate, status, category }: EditStatusModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    color: '',
    active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when status changes
  useEffect(() => {
    if (status) {
      setFormData({
        key: status.key,
        label: status.label,
        color: status.color || '',
        active: status.active,
      })
    }
  }, [status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.key.trim() || !formData.label.trim() || !status) {
      toast.error('Key and Label are required')
      return
    }

    setIsSubmitting(true)
    
    try {
      onUpdate(status.id, {
        key: formData.key.trim(),
        label: formData.label.trim(),
        color: formData.color.trim() || null,
        active: formData.active,
      })
      
      toast.success(`Status "${formData.label}" updated successfully`)
      onClose()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!status) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {category} Status</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-key">Key *</Label>
            <Input
              id="edit-key"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder="e.g. approved, pending, rejected"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-label">Label *</Label>
            <Input
              id="edit-label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g. Approved, Pending Review, Rejected"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color">Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="edit-color"
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active">Active Status</Label>
              <p className="text-xs text-gray-500">
                Whether this status is available for selection
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              disabled={!!status.deprecatedAt}
            />
          </div>

          {status.deprecatedAt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>Deprecated:</strong> This status was deprecated on{' '}
                {new Date(status.deprecatedAt).toLocaleDateString()} and cannot be reactivated.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}