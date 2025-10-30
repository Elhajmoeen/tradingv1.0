import * as React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { profileTabs } from '@/config/fields'
import { FieldGrid } from '@/components/FieldGrid'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react'
import { DocumentUpload } from '@/components/DocumentUpload'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { AppDispatch } from '@/state/store'
import { selectEntityById, updateEntityField, addGlobalCustomDocument, selectGlobalCustomDocuments } from '@/state/entitiesSlice'

interface DocumentsTabProps {
  clientId: string
}

interface CustomDocument {
  id: string
  name: string
  description: string
}

export default function DocumentsTab({ clientId }: DocumentsTabProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(clientId))
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const [documentDescription, setDocumentDescription] = useState('')
  const customDocuments = useSelector(selectGlobalCustomDocuments)
  
  const tab = profileTabs.find(t => t.id === 'documents')
  
  // Create enhanced sections with custom documents
  const enhancedSections = React.useMemo(() => {
    if (!tab) return []
    
    return tab.sections.map(section => {
      if (section.title === 'Documents Verification') {
        // Add custom document fields to Documents Verification section
        const customFields = customDocuments.map(doc => ({
          key: doc.id,
          label: doc.name,
          type: 'verification-checkbox' as const,
          description: doc.description
        }))
        
        return {
          ...section,
          fields: [...section.fields, ...customFields]
        }
      }
      return section
    })
  }, [tab, customDocuments])
  
  // Initialize all sections as open by default
  useEffect(() => {
    if (tab) {
      const initialSections: Record<string, boolean> = {}
      tab.sections.forEach(section => {
        initialSections[section.title] = true
      })
      setOpenSections(initialSections)
    }
  }, [tab])

  // No need to load custom documents as they're global

  const handleAddDocument = () => {
    if (!documentName.trim()) return

    const newDocument = {
      id: `custom_${Date.now()}`,
      name: documentName.trim(),
      description: documentDescription.trim()
    }

    // Add to global custom documents
    dispatch(addGlobalCustomDocument(newDocument))

    // Reset form and close dialog
    setDocumentName('')
    setDocumentDescription('')
    setIsAddDocumentOpen(false)
  }

  if (!tab) {
    return <div className="text-muted-foreground">Documents tab configuration not found</div>
  }

  return (
    <div className="space-y-8">
      {enhancedSections.map((section, index) => (
        <Collapsible 
          key={section.title} 
          open={openSections[section.title] ?? true}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, [section.title]: open }))}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full pb-3 hover:opacity-70 transition-opacity">
            <h2 className="text-lg font-semibold text-foreground relative">
              {section.title}
              <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
            </h2>
            {openSections[section.title] ?? true ? (
              <CaretUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <CaretDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-6">
            <FieldGrid entityId={clientId} fields={section.fields} />
          </CollapsibleContent>
          {index < enhancedSections.length - 1 && (
            <div className="border-b border-gray-200 mt-2" />
          )}
        </Collapsible>
      ))}
      
      {/* Divider before Upload Documents Section */}
      <div className="border-b border-gray-200 mt-2" />
      
      {/* Upload Documents Section */}
      <Collapsible 
        open={openSections['Upload Documents'] ?? true}
        onOpenChange={(open) => setOpenSections(prev => ({ ...prev, 'Upload Documents': open }))}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full pb-3 hover:opacity-70 transition-opacity">
          <h2 className="text-lg font-semibold text-foreground relative">
            Upload Documents
            <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
          </h2>
          {openSections['Upload Documents'] ?? true ? (
            <CaretUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <CaretDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Standard Document Types */}
            <DocumentUpload
              clientId={clientId}
              documentType="idPassport"
              label="ID/Passport Upload"
              description="Upload ID or Passport documents"
            />
            <DocumentUpload
              clientId={clientId}
              documentType="proofOfAddress"
              label="Proof of Address Upload"
              description="Upload proof of address documents (utility bill, bank statement)"
            />
            <DocumentUpload
              clientId={clientId}
              documentType="creditCardFront"
              label="Credit Card Front"
              description="Upload front side of credit card"
            />
            <DocumentUpload
              clientId={clientId}
              documentType="creditCardBack"
              label="Credit Card Back Upload"
              description="Upload back side of credit card"
            />
            
            {/* Custom Document Types */}
            {customDocuments.map((doc) => (
              <DocumentUpload
                key={doc.id}
                clientId={clientId}
                documentType={doc.id}
                label={doc.name}
                description={doc.description}
              />
            ))}
            
            {/* Add Document Button */}
            <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <Button
                variant="ghost"
                onClick={() => setIsAddDocumentOpen(true)}
                className="flex flex-col items-center gap-2 h-full w-full text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add Document Type</span>
              </Button>
            </div>
          </div>
          
          {/* Add Document Dialog */}
          <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Custom Document Type</DialogTitle>
                <DialogDescription>
                  Create a new document type for uploading specific files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    placeholder="e.g., Bank Statement, Tax Return"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-description">Description</Label>
                  <Textarea
                    id="document-description"
                    placeholder="Brief description of what documents to upload..."
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddDocument}
                    disabled={!documentName.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}