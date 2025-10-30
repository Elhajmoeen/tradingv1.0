import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MegaphoneIcon } from 'lucide-react'

interface MarketingTabNextProps {
  clientId: string
}

export const MarketingTabNext: React.FC<MarketingTabNextProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MegaphoneIcon className="w-5 h-5" />
            Marketing Preferences
          </CardTitle>
          <CardDescription>
            Client marketing and communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MegaphoneIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Marketing tab implementation coming soon</p>
            <p className="text-xs mt-2">Client ID: {clientId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}