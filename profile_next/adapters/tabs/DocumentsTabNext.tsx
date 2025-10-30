import React, { useState } from 'react'
import { useGetClientDocumentsQuery, useRequestDocumentMutation, useUploadDocumentMutation } from '../../state/clientsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { FileTextIcon, UploadIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon } from 'lucide-react'
import type { ClientDocument } from '../../types/client'

interface DocumentsTabNextProps {
  clientId: string
}

const documentTypes = [
  {
    type: 'id_passport' as const,
    label: 'ID/Passport',
    description: 'Government-issued identification document',
    requirementText: 'Please upload a clear, color copy of your government-issued photo ID or passport. Ensure all text is legible and the document is not expired.',
  },
  {
    type: 'proof_of_address' as const,
    label: 'Proof of Address',
    description: 'Recent utility bill or bank statement',
    requirementText: 'Please upload a recent utility bill, bank statement, or official document showing your full name and current address. Document must be dated within the last 3 months.',
  },
  {
    type: 'cc_front' as const,
    label: 'Credit Card Front',
    description: 'Front side of credit card',
    requirementText: 'Please upload the front side of your credit card. For security, you may cover the middle 8 digits, but ensure the first 4 and last 4 digits are visible along with your name.',
  },
  {
    type: 'cc_back' as const,
    label: 'Credit Card Back',
    description: 'Back side of credit card',
    requirementText: 'Please upload the back side of your credit card. For security, you may cover the CVV code, but ensure the signature strip is visible.',
  },
  {
    type: 'other' as const,
    label: 'Other Document',
    description: 'Additional supporting documents',
    requirementText: 'Please upload any additional documents as requested by our compliance team.',
  },
]

export const DocumentsTabNext: React.FC<DocumentsTabNextProps> = ({ clientId }) => {
  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useGetClientDocumentsQuery(clientId)

  const [requestDocument] = useRequestDocumentMutation()
  const [uploadDocument] = useUploadDocumentMutation()

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<ClientDocument['type'] | ''>('')
  const [customRequirement, setCustomRequirement] = useState('')

  const handleRequestDocument = async () => {
    if (!selectedDocType) return

    try {
      const docTypeConfig = documentTypes.find(dt => dt.type === selectedDocType)
      const requirementText = customRequirement || docTypeConfig?.requirementText || ''

      await requestDocument({
        clientId,
        type: selectedDocType,
        requirementText,
      }).unwrap()

      toast.success('Document request sent successfully')
      setIsRequestModalOpen(false)
      setSelectedDocType('')
      setCustomRequirement('')
      refetch()
    } catch (error) {
      console.error('Error requesting document:', error)
      toast.error('Failed to request document')
    }
  }

  const handleFileUpload = async (file: File, type: ClientDocument['type']) => {
    try {
      await uploadDocument({
        clientId,
        file,
        type,
      }).unwrap()

      toast.success('Document uploaded successfully')
      refetch()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    }
  }

  const getStatusBadge = (status: ClientDocument['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDocumentTypeLabel = (type: ClientDocument['type']) => {
    return documentTypes.find(dt => dt.type === type)?.label || type
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive text-center">Failed to load documents</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Client Documents</h3>
          <p className="text-sm text-muted-foreground">
            Manage uploaded documents and compliance requirements
          </p>
        </div>
        
        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Request Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Document</DialogTitle>
              <DialogDescription>
                Send a document request to the client with specific requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select value={selectedDocType} onValueChange={(value) => setSelectedDocType(value as ClientDocument['type'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((docType) => (
                      <SelectItem key={docType.type} value={docType.type}>
                        <div>
                          <div className="font-medium">{docType.label}</div>
                          <div className="text-xs text-muted-foreground">{docType.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirement">Requirement Text</Label>
                <Textarea
                  id="requirement"
                  value={customRequirement || documentTypes.find(dt => dt.type === selectedDocType)?.requirementText || ''}
                  onChange={(e) => setCustomRequirement(e.target.value)}
                  placeholder="Enter specific requirements for this document..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestDocument} disabled={!selectedDocType}>
                  Send Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Start by requesting documents from the client
              </p>
              <Button onClick={() => setIsRequestModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Request First Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileTextIcon className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{document.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getDocumentTypeLabel(document.type)} • 
                        Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                      {document.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {document.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(document.status)}
                    <Button variant="outline" size="sm">
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <Card className="border-dashed">
        <CardContent className="p-8">
          <div className="text-center">
            <UploadIcon className="w-8 h-8 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Upload Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here or click to browse
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                files.forEach(file => {
                  // For demo, default to 'other' type
                  handleFileUpload(file, 'other')
                })
              }}
            />
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}