import * as React from 'react'
import { CommentsPanel } from '@/features/comments'

interface CommentsTabProps {
  clientId: string
}

export default function CommentsTab({ clientId }: CommentsTabProps) {
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
        {/* Left Column - Comments */}
        <div className="h-full">
          <CommentsPanel entityId={clientId} entityType="client" />
        </div>
        
        {/* Right Column - Reserved for Future Features */}
        <div className="h-full">
          <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50/50">
            <div className="text-center text-gray-400">
              <div className="text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Reserved Space
              </div>
              <div className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Available for additional features
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}