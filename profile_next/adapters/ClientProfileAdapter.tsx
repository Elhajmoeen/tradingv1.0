import * as React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isProfileNextEnabled } from '@/lib/flags'
import { useGetClientQuery, useUpdateClientMutation } from '../state/clientsApi'
import { coerceClientUpdate } from '../types/client.schema'
import type { ClientDTO, UpdateClientRequest } from '../types/client'

// Import legacy profile page as fallback
import LegacyProfile from '@/pages/Profile'

// Import tab components
import { GeneralTabNext } from './tabs/GeneralTabNext'
import { FinanceTabNext } from './tabs/FinanceTabNext'
import { PositionsTabNext } from './tabs/PositionsTabNext'
import { DocumentsTabNext } from './tabs/DocumentsTabNext'
import { MarketingTabNext } from './tabs/MarketingTabNext'
import { SettingsTabNext } from './tabs/SettingsTabNext'
import { LogsTabNext } from './tabs/LogsTabNext'
import { CommentsTabNext } from './tabs/CommentsTabNext'

import { profileTabs } from '@/config/fields'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import {
  Phone,
  Mail,
  MessageCircle,
  Video,
  DollarSign,
  ArrowLeft,
  User,
  CreditCard,
  FileText,
  Megaphone,
  Settings,
  BarChart3,
  Activity,
  MessageSquare,
} from 'lucide-react'

const tabIcons = {
  general: <User className="w-4 h-4" />,
  finance: <CreditCard className="w-4 h-4" />,
  positions: <BarChart3 className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  marketing: <Megaphone className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  logs: <Activity className="w-4 h-4" />,
  comments: <MessageSquare className="w-4 h-4" />,
}

interface ClientProfileAdapterProps {
  // Allow override for testing
  clientId?: string
}

export const ClientProfileAdapter: React.FC<ClientProfileAdapterProps> = ({ 
  clientId: propClientId 
}) => {
  const { id: paramId } = useParams<{ id: string }>()
  const clientId = propClientId || paramId || ''
  const shouldUseNext = isProfileNextEnabled()

  // Fallback to legacy if flag is disabled
  if (!shouldUseNext) {
    return <LegacyProfile />
  }

  // NEXT implementation
  const {
    data: client,
    isLoading,
    error,
    refetch,
  } = useGetClientQuery(clientId, { skip: !clientId })

  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation()

  const [localClient, setLocalClient] = useState<ClientDTO | null>(null)

  // Sync with API data
  useEffect(() => {
    if (client) {
      setLocalClient(client)
    }
  }, [client])

  const handleClientUpdate = async (updates: Partial<UpdateClientRequest>) => {
    if (!localClient) return

    try {
      // Optimistic update
      setLocalClient(prev => prev ? { ...prev, ...updates } : null)
      
      // Coerce the updates
      const coercedUpdates = coerceClientUpdate(updates)
      
      // API call
      await updateClient({
        id: clientId,
        data: coercedUpdates,
      }).unwrap()
      
      toast.success('Client updated successfully')
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
      
      // Revert optimistic update
      setLocalClient(client || null)
    }
  }

  // Handle country change to update phone code
  const handleCountryChange = (country: string) => {
    const countryPhoneCodes: Record<string, string> = {
      'US': '+1',
      'UK': '+44',
      'CA': '+1',
      'AU': '+61',
      'DE': '+49',
      'FR': '+33',
      'ES': '+34',
      'IT': '+39',
      'NL': '+31',
      'SE': '+46',
    }
    
    const phoneCC = countryPhoneCodes[country] || ''
    
    handleClientUpdate({
      country,
      phoneCC,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (error || !localClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load client profile</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  const fullName = `${localClient.firstName} ${localClient.lastName}`
  const initials = `${localClient.firstName[0] || ''}${localClient.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={fullName} />
                <AvatarFallback className="text-lg font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl font-semibold">{fullName}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{localClient.email}</span>
                  {localClient.leadStatus && (
                    <Badge variant="secondary" className="text-xs">
                      {localClient.leadStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {localClient.phoneNumber && (
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            
            <Button variant="outline" size="sm">
              <Video className="w-4 h-4 mr-2" />
              Meet
            </Button>
          </div>
        </div>
      </div>

      {/* Body - Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="general" className="h-full flex flex-col gap-0">
          <TabsList className="flex-shrink-0 w-full justify-start bg-background border-b rounded-none h-12">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="px-4 flex items-center gap-2">
                {tabIcons[tab.id as keyof typeof tabIcons]}
                <span>{tab.title}</span>
              </TabsTrigger>
            ))}
            <TabsTrigger value="positions" className="px-4 flex items-center gap-2">
              {tabIcons.positions}
              <span>Positions</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="px-4 flex items-center gap-2">
              {tabIcons.logs}
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="px-4 flex items-center gap-2">
              {tabIcons.comments}
              <span>Comments</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="flex-1 overflow-auto p-6 m-0">
            <GeneralTabNext 
              client={localClient}
              onUpdate={handleClientUpdate}
              onCountryChange={handleCountryChange}
              isUpdating={isUpdating}
            />
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="flex-1 overflow-auto p-6 m-0">
            <FinanceTabNext clientId={clientId} />
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="flex-1 overflow-hidden m-0">
            <PositionsTabNext clientId={clientId} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="flex-1 overflow-auto p-6 m-0">
            <DocumentsTabNext clientId={clientId} />
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="flex-1 overflow-auto p-6 m-0">
            <MarketingTabNext clientId={clientId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-auto p-6 m-0">
            <SettingsTabNext 
              client={localClient}
              onUpdate={handleClientUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="flex-1 overflow-auto p-6 m-0">
            <LogsTabNext clientId={clientId} />
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 overflow-auto p-6 m-0">
            <CommentsTabNext clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}