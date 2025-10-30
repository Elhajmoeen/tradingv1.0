import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquareIcon } from 'lucide-react'

interface CommentsTabNextProps {
  clientId: string
}

export const CommentsTabNext: React.FC<CommentsTabNextProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="w-5 h-5" />
            Client Comments
          </CardTitle>
          <CardDescription>
            Internal notes and comments about this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Comments system implementation coming soon</p>
            <p className="text-xs mt-2">Client ID: {clientId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}