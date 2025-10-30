import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UploadSimple, DownloadSimple, X } from '@phosphor-icons/react'

interface ImportLeadsModalProps {
  open: boolean
  onClose: () => void
  onImport: (leads: any[]) => Promise<void>
}

export function ImportLeadsModal({ open, onClose, onImport }: ImportLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const requiredHeaders = ['First Name', 'Last Name', 'Email', 'Phone Number', 'Country']
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFile(selectedFile || null)
    setError('')
  }

  const downloadTemplate = () => {
    const csvContent = requiredHeaders.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'leads-import-template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text: string): { headers: string[], rows: string[][] } => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) throw new Error('File is empty')
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.replace(/"/g, '').trim())
    )
    
    return { headers, rows }
  }

  const validateHeaders = (fileHeaders: string[]): boolean => {
    const normalizedFileHeaders = fileHeaders.map(h => h.toLowerCase().trim())
    const normalizedRequired = requiredHeaders.map(h => h.toLowerCase().trim())
    
    return normalizedRequired.every(required => 
      normalizedFileHeaders.some(fileHeader => fileHeader === required)
    )
  }

  const transformToLeadEntity = (headers: string[], row: string[]): any => {
    const leadData: any = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'lead' as const,
      createdAt: new Date().toISOString()
    }
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      const value = row[index]?.trim()
      
      if (normalizedHeader.includes('first') && normalizedHeader.includes('name')) {
        leadData.firstName = value
      } else if (normalizedHeader.includes('last') && normalizedHeader.includes('name')) {
        leadData.lastName = value
      } else if (normalizedHeader.includes('email')) {
        leadData.email = value
        // Basic email validation
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          console.warn(`Invalid email format: ${value}`)
        }
      } else if (normalizedHeader.includes('phone')) {
        leadData.phoneNumber = value
      } else if (normalizedHeader.includes('country')) {
        leadData.country = value
      }
    })

    return leadData
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const text = await file.text()
      const { headers, rows } = parseCSV(text)
      
      if (!validateHeaders(headers)) {
        throw new Error(`Missing required headers. Expected: ${requiredHeaders.join(', ')}`)
      }

      const leads = rows
        .filter(row => row.some(cell => cell.trim())) // Skip empty rows
        .map(row => transformToLeadEntity(headers, row))
        .filter(lead => lead.firstName || lead.lastName || lead.email) // Basic validation

      if (leads.length === 0) {
        throw new Error('No valid leads found in the file')
      }

      await onImport(leads)
      
      // Reset state and close modal
      setFile(null)
      setError('')
      onClose()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import leads')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setFile(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose} data-testid="import-modal">
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadSimple size={20} />
            Import Leads
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Upload a CSV file containing the following headers (required):
            <div className="mt-1 font-medium">
              {requiredHeaders.join(', ')}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">Choose File</Label>
            <Input
              id="file-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              data-testid="file-input"
            />
          </div>

          {file && (
            <div className="text-sm text-green-600">
              Selected: {file.name}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <DownloadSimple size={16} />
              Download Template
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                data-testid="upload-confirm"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}