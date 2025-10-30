import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ClientDTO, UpdateClientRequest } from '../../types/client'
import { SettingsIcon, KeyIcon, BellIcon, ShieldIcon } from 'lucide-react'

interface SettingsTabNextProps {
  client: ClientDTO
  onUpdate: (updates: Partial<UpdateClientRequest>) => void
  isUpdating: boolean
}

export const SettingsTabNext: React.FC<SettingsTabNextProps> = ({
  client,
  onUpdate,
  isUpdating,
}) => {
  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage client account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password Reset</h4>
              <p className="text-sm text-muted-foreground">
                Send password reset email to client
              </p>
            </div>
            <Button variant="outline">
              <KeyIcon className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Enhance account security with 2FA
              </p>
            </div>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure client notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Notification settings implementation coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Account Management
          </CardTitle>
          <CardDescription>
            Account status and management options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Account Status</h4>
              <p className="text-green-600">Active</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Verification Level</h4>
              <p className="text-yellow-600">Pending Documents</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Risk Profile</h4>
              <p>Standard</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Trading Permissions</h4>
              <p>Limited</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm">
              Suspend Account
            </Button>
            <Button variant="outline" size="sm">
              Close Account
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}