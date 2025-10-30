import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { FileText, Upload, X, CheckCircle, Eye, ThumbsUp, ThumbsDown, FilePdf } from '@phosphor-icons/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { AppDispatch } from '@/state/store'

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

interface FileUploadInputProps {
  entityId: string
  fieldKey: string
}

export function FileUploadInput({ entityId, fieldKey }: FileUploadInputProps) {
  const dispatch = useDispatch<AppDispatch>()
  const entity = useSelector(selectEntityById(entityId))
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileData = getNestedValue(entity, fieldKey)
  const fileName = getNestedValue(entity, `${fieldKey}Name`)
  const fileSize = getNestedValue(entity, `${fieldKey}Size`)

  // Debug effect to track modal state changes
  useEffect(() => {
    console.log('🎭 Modal state changed:', { 
      showImagePreview, 
      hasFileData: !!fileData, 
      fileName, 
      entityId, 
      fieldKey 
    })
  }, [showImagePreview, fileData, fileName, entityId, fieldKey])
  
  // Get status from corresponding status field
  const statusKey = fieldKey.replace('File', 'Status')
  const status = getNestedValue(entity, statusKey) || null

  // Clear selected file when fileData appears (upload completed)
  useEffect(() => {
    if (fileData && selectedFile) {
      setSelectedFile(null)
    }
  }, [fileData, selectedFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): { valid: boolean, error?: string } => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, and PDF files are allowed' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    return { valid: true }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (file: File) => {
    console.log('📁 Starting file upload for:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    const validation = validateFile(file)
    if (!validation.valid) {
      console.log('📁 File validation failed:', validation.error)
      alert(validation.error)
      clearPreview() // Clear preview on validation failure
      return
    }

    console.log('📁 File validation passed, starting upload...')
    setIsUploading(true)

    try {
      // Convert file to base64
      console.log('📁 Converting file to base64...')
      const fileData = await convertFileToBase64(file)
      console.log('📁 File converted to base64, length:', fileData.length)
      
      // Update file data
      console.log('📁 Updating entity fields...')
      console.log('📁 Entity ID:', entityId)
      console.log('📁 Field Key:', fieldKey)
      console.log('📁 Status Key:', statusKey)
      
      await dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: fileData }))
      await dispatch(updateEntityField({ id: entityId, key: `${fieldKey}Name` as any, value: file.name }))
      await dispatch(updateEntityField({ id: entityId, key: `${fieldKey}Size` as any, value: file.size }))

      // Set status to 'review' for the corresponding verification field
      await dispatch(updateEntityField({ id: entityId, key: statusKey as any, value: 'review' }))

      console.log('📁 File upload completed successfully!')
      
      // Selected file will be cleared by useEffect when fileData appears
    } catch (error) {
      console.error('📁 File upload failed:', error)
      alert('File upload failed. Please try again.')
      clearPreview() // Clear preview on upload failure
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileRemove = async () => {
    try {
      await dispatch(updateEntityField({ id: entityId, key: fieldKey as any, value: null }))
      await dispatch(updateEntityField({ id: entityId, key: `${fieldKey}Name` as any, value: null }))
      await dispatch(updateEntityField({ id: entityId, key: `${fieldKey}Size` as any, value: null }))

      // Reset status when file is removed
      await dispatch(updateEntityField({ id: entityId, key: statusKey as any, value: null }))
      
      // Clear preview
      clearPreview()
    } catch (error) {
      console.error('File removal failed:', error)
    }
  }

  const clearPreview = () => {
    setSelectedFile(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files)
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      console.log('📁 File selected:', file)
      
      // Set selected file for preview
      setSelectedFile(file)
      
      // Then handle upload
      handleFileUpload(file)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    console.log('📁 Upload button clicked')
    if (fileInputRef.current) {
      console.log('📁 Triggering file input click')
      fileInputRef.current.click()
    }
  }

  const handleApprove = async () => {
    try {
      await dispatch(updateEntityField({ id: entityId, key: statusKey as any, value: 'approved' }))
      // Also update the verification boolean field
      const verificationKey = fieldKey.replace('docs.', '').replace('File', '')
      await dispatch(updateEntityField({ id: entityId, key: verificationKey as any, value: true }))
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  const handleReject = async () => {
    try {
      await dispatch(updateEntityField({ id: entityId, key: statusKey as any, value: 'rejected' }))
      // Also update the verification boolean field
      const verificationKey = fieldKey.replace('docs.', '').replace('File', '')
      await dispatch(updateEntityField({ id: entityId, key: verificationKey as any, value: false }))
    } catch (error) {
      console.error('Rejection failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'review':
        return <Eye className="h-4 w-4 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  // Show uploaded file with status and review actions (when file is stored in Redux)
  if (fileData && !isUploading) {
    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <div 
            className="flex-1 min-w-0"
            onClick={() => {
              console.log('📋 File area clicked, opening preview...')
              console.log('📋 Current showImagePreview state:', showImagePreview)
              console.log('📋 File data exists:', !!fileData)
              console.log('📋 File name:', fileName)
              alert('File clicked! Check console for details.')
              setShowImagePreview(true)
            }}
            title="Click to view and review file"
          >
            <div className="text-sm font-medium truncate">
              {fileName || 'Uploaded file'}
            </div>
            <div className="text-xs">
              {fileSize && formatFileSize(fileSize)} • Status: {status || 'Uploaded'}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                console.log('👁️ Eye button clicked')
                alert('Eye button clicked!')
                e.stopPropagation()
                setShowImagePreview(true)
              }}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              title="View file"
            >
              <Eye className="h-3 w-3 text-blue-600" />
            </button>
            <button
              onClick={(e) => {
                alert('Testing modal - Modal state: ' + showImagePreview)
                setShowImagePreview(!showImagePreview)
              }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
              title="Test Modal"
            >
              TEST
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFileRemove()
              }}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="h-3 w-3 text-red-500" />
            </button>
          </div>
        </div>

        {/* Review Actions - Only show if status is 'review' */}
        {status === 'review' && (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 transition-colors"
            >
              <ThumbsUp className="h-3 w-3" />
              Approve
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors"
            >
              <ThumbsDown className="h-3 w-3" />
              Reject
            </button>
          </div>
        )}

        {/* Image Preview Modal with Approve/Decline */}
        {showImagePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
            console.log('🖼️ Modal backdrop clicked, closing...')
            setShowImagePreview(false)
          }}>
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {fileName || 'File Preview'}
                </h3>
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* File Content */}
              <div className="flex-1 flex items-center justify-center mb-4 overflow-hidden">
                {fileName?.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <FilePdf className="h-16 w-16 text-red-500" />
                    <span className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>{fileName}</span>
                    <a 
                      href={fileData} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <img 
                    src={fileData} 
                    alt={fileName} 
                    className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                  />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Status: {status || 'Uploaded'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {status === 'review' && (
                  <>
                    <button
                      onClick={async () => {
                        await handleApprove()
                        setShowImagePreview(false)
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await handleReject()
                        setShowImagePreview(false)
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Decline
                    </button>
                  </>
                )}
                {status === 'approved' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>Document Approved</span>
                  </div>
                )}
                {status === 'rejected' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                    <X className="h-4 w-4 text-red-600" />
                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>Document Rejected</span>
                  </div>
                )}
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show upload button (when no file is stored in Redux)
  return (
    <div className="w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
        className="hidden"
      />
      
      {isUploading ? (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-blue-700">Uploading...</span>
        </div>
      ) : (
        <>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>

          {/* Immediate File Preview - Show only when file is selected but not uploaded yet */}
          {selectedFile && !fileData && !isUploading && (
            <div className="flex items-center gap-3 mt-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedFile.type.includes('image') ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-md border border-gray-200" 
                />
              ) : selectedFile.type === 'application/pdf' ? (
                <div className="flex items-center gap-2">
                  <FilePdf className="h-6 w-6 text-red-500" />
                  <span className="truncate max-w-[120px] text-gray-700">{selectedFile.name}</span>
                  <a 
                    href={URL.createObjectURL(selectedFile)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <span className="truncate max-w-[120px] text-gray-700">{selectedFile.name}</span>
                </div>
              )}
              <button 
                onClick={clearPreview} 
                className="text-xs text-red-500 hover:underline ml-auto"
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}