import * as React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Eye, X, Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppDispatch } from '@/state/store';
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice';

interface DocumentUploadProps {
  clientId: string;
  documentType: 'idPassport' | 'proofOfAddress' | 'creditCardFront' | 'creditCardBack' | string;
  label: string;
  description: string;
}

interface UploadedFile {
  name: string;
  size: number;
  lastModified: number;
  url: string;
  type: string;
}

export function DocumentUpload({ clientId, documentType, label, description }: DocumentUploadProps) {
  const dispatch = useDispatch<AppDispatch>();
  const entity = useSelector(selectEntityById(clientId));
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Map document types to their verification fields and status fields
  const getDocumentFields = (docType: string) => {
    const fieldMappings = {
      'idPassport': { 
        verificationField: 'idPassport' as keyof typeof entity, 
        statusField: 'idPassportStatus' as keyof typeof entity 
      },
      'proofOfAddress': { 
        verificationField: 'proofOfAddress' as keyof typeof entity, 
        statusField: 'proofOfAddressStatus' as keyof typeof entity 
      },
      'creditCardFront': { 
        verificationField: 'ccFront' as keyof typeof entity, 
        statusField: 'ccFrontStatus' as keyof typeof entity 
      },
      'creditCardBack': { 
        verificationField: 'ccBack' as keyof typeof entity, 
        statusField: 'ccBackStatus' as keyof typeof entity 
      }
    };
    
    // Return predefined mapping if it exists
    if (fieldMappings[docType as keyof typeof fieldMappings]) {
      return fieldMappings[docType as keyof typeof fieldMappings];
    }
    
    // For custom documents, create dynamic field mapping
    return {
      verificationField: docType as keyof typeof entity,
      statusField: `${docType}Status` as keyof typeof entity
    };
  };

  // Load existing files from entity data
  React.useEffect(() => {
    const uploadFieldMap = {
      'idPassport': 'idPassportUpload',
      'proofOfAddress': 'proofOfAddressUpload',
      'creditCardFront': 'creditCardFront',
      'creditCardBack': 'creditCardBack'
    } as const;
    
    // For custom documents, use the documentType as the upload field name
    const uploadField = uploadFieldMap[documentType as keyof typeof uploadFieldMap] || `${documentType}Upload`;
    const existingFiles = entity?.[uploadField] as UploadedFile[] | undefined;
    if (existingFiles && Array.isArray(existingFiles)) {
      setFiles(existingFiles);
    }
  }, [entity, documentType]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      newFiles.push({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        url: url,
        type: file.type
      });
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    // Update entity in Redux
    const uploadFieldMap = {
      'idPassport': 'idPassportUpload',
      'proofOfAddress': 'proofOfAddressUpload',
      'creditCardFront': 'creditCardFront',
      'creditCardBack': 'creditCardBack'
    } as const;
    
    // For custom documents, use the documentType as the upload field name
    const uploadField = uploadFieldMap[documentType as keyof typeof uploadFieldMap] || `${documentType}Upload`;
    dispatch(updateEntityField({
      id: clientId,
      key: uploadField as any,
      value: updatedFiles
    }));
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    // Update entity in Redux
    const uploadFieldMap = {
      'idPassport': 'idPassportUpload',
      'proofOfAddress': 'proofOfAddressUpload',
      'creditCardFront': 'creditCardFront',
      'creditCardBack': 'creditCardBack'
    } as const;
    
    // For custom documents, use the documentType as the upload field name
    const uploadField = uploadFieldMap[documentType as keyof typeof uploadFieldMap] || `${documentType}Upload`;
    dispatch(updateEntityField({
      id: clientId,
      key: uploadField as any,
      value: updatedFiles
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  const isPdfFile = (type: string) => {
    return type === 'application/pdf';
  };

  const handleDocumentAction = (action: 'approve' | 'decline') => {
    const fields = getDocumentFields(documentType);
    if (!fields) return;

    const { verificationField, statusField } = fields;
    
    // Update verification checkbox (true for approve, false for decline)
    dispatch(updateEntityField({
      id: clientId,
      key: verificationField,
      value: action === 'approve'
    }));

    // Update document status
    dispatch(updateEntityField({
      id: clientId,
      key: statusField,
      value: action === 'approve' ? 'approved' : 'declined'
    }));

    // Close the modal
    setViewingFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          {label}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => document.getElementById(`file-input-${documentType}`)?.click()}
        >
          <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
          <p className="text-xs font-medium text-gray-900 mb-1">
            Drop files or click
          </p>
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-6">
            Choose
          </Button>
          
          <input
            id={`file-input-${documentType}`}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-medium text-xs text-gray-900">Files ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {(() => {
                        const fields = getDocumentFields(documentType);
                        const status = fields ? entity?.[fields.statusField] : null;
                        if (status === 'approved') {
                          return <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Approved</span>;
                        } else if (status === 'declined') {
                          return <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Declined</span>;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingFile(file)}
                    className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Viewer Dialog - Enlarged */}
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{viewingFile?.name}</DialogTitle>
              <DialogDescription>
                {viewingFile && `${formatFileSize(viewingFile.size)} • ${formatDate(viewingFile.lastModified)}`}
              </DialogDescription>
            </DialogHeader>
            {viewingFile && (
              <>
                <div className="mt-4 flex-1">
                  {isImageFile(viewingFile.type) && (
                    <img 
                      src={viewingFile.url} 
                      alt={viewingFile.name}
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: '60vh' }}
                    />
                  )}
                  {isPdfFile(viewingFile.type) && (
                    <iframe
                      src={viewingFile.url}
                      className="w-full border rounded-lg"
                      style={{ height: '60vh' }}
                      title={viewingFile.name}
                    />
                  )}
                  {!isImageFile(viewingFile.type) && !isPdfFile(viewingFile.type) && (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600">Preview not available for this file type</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = viewingFile.url;
                          link.download = viewingFile.name;
                          link.click();
                        }}
                        className="mt-4"
                      >
                        Download File
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Document Actions */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingFile.url;
                      link.download = viewingFile.name;
                      link.click();
                    }}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    Download
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleDocumentAction('decline')}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleDocumentAction('approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}