import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button as MUIButton } from '@mui/material'
import { Plus, DownloadSimple } from '@phosphor-icons/react'
import EmailTemplatesTable from '@/features/emailTemplates/EmailTemplatesTable'
import { 
  selectEmailTemplatesByQuery, 
  addTemplate, 
  updateTemplate, 
  seedIfEmpty,
  EmailTemplate 
} from '@/state/emailTemplatesSlice'
import { exportFilteredEmailTemplates, getEmailTemplateExportStats } from '@/utils/csvExport'
import type { RootState } from '@/state/store'

import { AddTemplateModal, EditTemplateModal, PreviewTemplateModal } from '@/features/emailTemplates/TemplateModals'

export default function EmailTemplatesPage() {
  const dispatch = useDispatch()
  
  // State
  const [query, setQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data
  const filteredTemplates = useSelector((state: RootState) => selectEmailTemplatesByQuery(state, query))
  
  // Seed demo data on component mount
  useEffect(() => {
    dispatch(seedIfEmpty())
  }, [dispatch])

  // Export handler
  const handleExport = () => {
    try {
      exportFilteredEmailTemplates(filteredTemplates, query)
      const stats = getEmailTemplateExportStats(filteredTemplates)
      toast.success(
        `Exported ${stats.total} email templates (${stats.active} active, ${stats.inactive} inactive)`
      )
    } catch (error) {
      toast.error('Failed to export email templates')
      console.error('Export error:', error)
    }
  }

  // Add template handlers
  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setIsSubmitting(false)
  }

  const handleAddSubmit = async (values: {
    name: string
    subject: string
    bodyHtml: string
    language?: string
    category?: string
    variables?: string[]
  }) => {
    setIsSubmitting(true)
    try {
      dispatch(addTemplate(values))
      toast.success(`Email template "${values.name}" created successfully`)
      handleCloseAddModal()
    } catch (error) {
      toast.error('Failed to create email template')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit template handlers
  const handleOpenEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTemplate(null)
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (values: {
    name: string
    subject: string
    bodyHtml: string
    language?: string
    category?: string
    variables?: string[]
  }) => {
    if (!editingTemplate) return
    
    setIsSubmitting(true)
    try {
      dispatch(updateTemplate({ 
        id: editingTemplate.id, 
        patch: values 
      }))
      toast.success(`Email template updated successfully`)
      handleCloseEditModal()
    } catch (error) {
      toast.error('Failed to update email template')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preview template handlers
  const handleOpenPreviewModal = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewModalOpen(true)
  }
  
  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setPreviewTemplate(null)
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage email templates and communications
                </p>
              </div>
              <div className="max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                disabled={filteredTemplates.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadSimple size={16} className="mr-2" />
                Export
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                New Template
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <EmailTemplatesTable
          searchQuery={query}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onOpenPreviewModal={handleOpenPreviewModal}
        />
      </div>

      {/* Modals */}
      <AddTemplateModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddSubmit}
        isLoading={isSubmitting}
      />

      <EditTemplateModal
        isOpen={isEditModalOpen}
        template={editingTemplate}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        isLoading={isSubmitting}
      />

      <PreviewTemplateModal
        isOpen={isPreviewModalOpen}
        template={previewTemplate}
        onClose={handleClosePreviewModal}
      />
    </div>
  )
}