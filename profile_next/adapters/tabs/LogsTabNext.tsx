import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityIcon } from 'lucide-react'

interface LogsTabNextProps {
  clientId: string
}

export const LogsTabNext: React.FC<LogsTabNextProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Client activity and system logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Activity logs implementation coming soon</p>
            <p className="text-xs mt-2">Client ID: {clientId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}