import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { X } from '@phosphor-icons/react'
import { EmailTemplate, isUniqueName } from '@/state/emailTemplatesSlice'
import type { RootState } from '@/state/store'

interface AddTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: {
    name: string
    subject: string
    bodyHtml: string
    language?: string
    category?: string
    variables?: string[]
  }) => void
  isLoading: boolean
}

export function AddTemplateModal({ isOpen, onClose, onSubmit, isLoading }: AddTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
    language: 'English',
    category: 'General',
    variables: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const state = useSelector((state: RootState) => state)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        subject: '',
        bodyHtml: '',
        language: 'English',
        category: 'General',
        variables: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    } else if (!isUniqueName(state, formData.name.trim())) {
      newErrors.name = 'Template name must be unique'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.bodyHtml.trim()) {
      newErrors.bodyHtml = 'Email body is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const variables = formData.variables
      ? formData.variables.split(',').map(v => v.trim()).filter(Boolean)
      : []

    onSubmit({
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      bodyHtml: formData.bodyHtml.trim(),
      language: formData.language || undefined,
      category: formData.category || undefined,
      variables: variables.length > 0 ? variables : undefined,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Email Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter template name"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Language and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Leads">Leads</option>
                  <option value="Deposits">Deposits</option>
                  <option value="Withdrawals">Withdrawals</option>
                  <option value="KYC">KYC</option>
                </select>
              </div>
            </div>

            {/* Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables (comma-separated)
              </label>
              <input
                type="text"
                value={formData.variables}
                onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., client.name, account.id, lead.source"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter variable names that can be used in the email body (e.g., {`{{client.name}}`})
              </p>
            </div>

            {/* Body HTML */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Body (HTML) *
              </label>
              <textarea
                value={formData.bodyHtml}
                onChange={(e) => setFormData(prev => ({ ...prev, bodyHtml: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.bodyHtml ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={10}
                placeholder="Enter HTML content for the email body"
              />
              {errors.bodyHtml && (
                <p className="text-red-600 text-xs mt-1">{errors.bodyHtml}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                HTML content will be rendered in the email. Use variables like {`{{client.name}}`} for dynamic content.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditTemplateModalProps {
  isOpen: boolean
  template: EmailTemplate | null
  onClose: () => void
  onSubmit: (values: {
    name: string
    subject: string
    bodyHtml: string
    language?: string
    category?: string
    variables?: string[]
  }) => void
  isLoading: boolean
}

export function EditTemplateModal({ isOpen, template, onClose, onSubmit, isLoading }: EditTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
    language: 'English',
    category: 'General',
    variables: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const state = useSelector((state: RootState) => state)

  // Update form when template changes
  useEffect(() => {
    if (isOpen && template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        language: template.language || 'English',
        category: template.category || 'General',
        variables: template.variables ? template.variables.join(', ') : '',
      })
      setErrors({})
    }
  }, [isOpen, template])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    } else if (!isUniqueName(state, formData.name.trim(), template?.id)) {
      newErrors.name = 'Template name must be unique'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.bodyHtml.trim()) {
      newErrors.bodyHtml = 'Email body is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const variables = formData.variables
      ? formData.variables.split(',').map(v => v.trim()).filter(Boolean)
      : []

    onSubmit({
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      bodyHtml: formData.bodyHtml.trim(),
      language: formData.language || undefined,
      category: formData.category || undefined,
      variables: variables.length > 0 ? variables : undefined,
    })
  }

  if (!isOpen || !template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Email Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter template name"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className={`w-full h-9 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Language and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Leads">Leads</option>
                  <option value="Deposits">Deposits</option>
                  <option value="Withdrawals">Withdrawals</option>
                  <option value="KYC">KYC</option>
                </select>
              </div>
            </div>

            {/* Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables (comma-separated)
              </label>
              <input
                type="text"
                value={formData.variables}
                onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., client.name, account.id, lead.source"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter variable names that can be used in the email body (e.g., {`{{client.name}}`})
              </p>
            </div>

            {/* Body HTML */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Body (HTML) *
              </label>
              <textarea
                value={formData.bodyHtml}
                onChange={(e) => setFormData(prev => ({ ...prev, bodyHtml: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  errors.bodyHtml ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={10}
                placeholder="Enter HTML content for the email body"
              />
              {errors.bodyHtml && (
                <p className="text-red-600 text-xs mt-1">{errors.bodyHtml}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                HTML content will be rendered in the email. Use variables like {`{{client.name}}`} for dynamic content.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface PreviewTemplateModalProps {
  isOpen: boolean
  template: EmailTemplate | null
  onClose: () => void
}

export function PreviewTemplateModal({ isOpen, template, onClose }: PreviewTemplateModalProps) {
  if (!isOpen || !template) return null

  // Sample variable replacements for preview
  const sampleVariables: Record<string, string> = {
    'client.name': 'Mario Rossi',
    'account.id': 'ACC-123456',
    'lead.source': 'Website Contact Form',
    'client.email': 'mario.rossi@example.com',
    'client.phone': '+1-555-0123',
    'deposit.amount': '$1,000.00',
    'withdrawal.amount': '$500.00',
  }

  // Replace variables in subject and body with sample values
  const previewSubject = template.subject.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    return sampleVariables[variable.trim()] || match
  })

  const previewBody = template.bodyHtml.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    return sampleVariables[variable.trim()] || match
  })

  const isRTL = template.language === 'Arabic'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Preview: {template.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Email metadata */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Template:</span>
                <span className="ml-2 text-gray-600">{template.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Language:</span>
                <span className="ml-2 text-gray-600">{template.language || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="ml-2 text-gray-600">{template.category || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Variables:</span>
                <span className="ml-2 text-gray-600">
                  {template.variables ? template.variables.length : 0} defined
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Subject:</span>
              <span className="ml-2 text-gray-600">{previewSubject}</span>
            </div>
          </div>

          {/* Email preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-blue-800">Email Preview</p>
              <p className="text-xs text-blue-600">
                Variables have been replaced with sample values for preview
              </p>
            </div>
            <div 
              className={`p-6 bg-white ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div
                dangerouslySetInnerHTML={{ __html: previewBody }}
                className="prose prose-sm max-w-none"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                }}
              />
            </div>
          </div>

          {/* Variable list */}
          {template.variables && template.variables.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Available Variables:</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/20"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}