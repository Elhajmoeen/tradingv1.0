import React, { useState } from 'react'
import { FieldRenderer } from '@/fieldkit'
import type { ClientDTO, UpdateClientRequest } from '../../types/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, MapPinIcon, PhoneIcon, MailIcon, UserIcon, TagIcon } from 'lucide-react'

interface GeneralTabNextProps {
  client: ClientDTO
  onUpdate: (updates: Partial<UpdateClientRequest>) => void
  onCountryChange: (country: string) => void
  isUpdating: boolean
}

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
]

const leadStatusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
  { value: 'unqualified', label: 'Unqualified', color: 'bg-gray-100 text-gray-800' },
  { value: 'negotiation', label: 'In Negotiation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'proposal', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
  { value: 'renewal', label: 'Renewal', color: 'bg-indigo-100 text-indigo-800' },
]

export const GeneralTabNext: React.FC<GeneralTabNextProps> = ({
  client,
  onUpdate,
  onCountryChange,
  isUpdating,
}) => {
  const [localData, setLocalData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phoneCC: client.phoneCC || '',
    phoneNumber: client.phoneNumber || '',
    country: client.country || '',
    dob: client.dob ? client.dob.split('T')[0] : '',
    leadStatus: client.leadStatus || 'new',
    owner: client.owners.owner || '',
    conversationOwner: client.owners.conversationOwner || '',
    retentionOwner: client.owners.retentionOwner || '',
  })

  const handleFieldUpdate = (field: string, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
    
    // Immediate update for name fields (live sync)
    if (field === 'firstName' || field === 'lastName') {
      onUpdate({ [field]: value })
    }
    
    // Handle country change with phone code update
    if (field === 'country') {
      onCountryChange(value)
      setLocalData(prev => {
        const countryPhoneCodes: Record<string, string> = {
          'US': '+1', 'UK': '+44', 'CA': '+1', 'AU': '+61', 'DE': '+49',
          'FR': '+33', 'ES': '+34', 'IT': '+39', 'NL': '+31', 'SE': '+46',
        }
        return { ...prev, phoneCC: countryPhoneCodes[value] || '' }
      })
    }
  }

  const handleSave = () => {
    const updates: Partial<UpdateClientRequest> = {
      firstName: localData.firstName,
      lastName: localData.lastName,
      email: localData.email,
      phoneCC: localData.phoneCC,
      phoneNumber: localData.phoneNumber,
      country: localData.country,
      dob: localData.dob,
      leadStatus: localData.leadStatus as any,
      owners: {
        owner: localData.owner || null,
        conversationOwner: localData.conversationOwner || null,
        retentionOwner: localData.retentionOwner || null,
      },
    }
    
    onUpdate(updates)
  }

  const selectedCountry = countries.find(c => c.code === localData.country)
  const selectedStatus = leadStatusOptions.find(s => s.value === localData.leadStatus)

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Basic client details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                First Name
              </Label>
              <Input
                id="firstName"
                value={localData.firstName}
                onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Last Name
              </Label>
              <Input
                id="lastName"
                value={localData.lastName}
                onChange={(e) => handleFieldUpdate('lastName', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <MailIcon className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={localData.email}
              onChange={(e) => handleFieldUpdate('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Country
              </Label>
              <Select value={localData.country} onValueChange={(value) => handleFieldUpdate('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country">
                    {selectedCountry && (
                      <span className="flex items-center gap-2">
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneCC" className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                Code
              </Label>
              <Input
                id="phoneCC"
                value={localData.phoneCC}
                onChange={(e) => handleFieldUpdate('phoneCC', e.target.value)}
                placeholder="+1"
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={localData.phoneNumber}
                onChange={(e) => handleFieldUpdate('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={localData.dob}
              onChange={(e) => handleFieldUpdate('dob', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Status & Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Status & Ownership
          </CardTitle>
          <CardDescription>
            Lead status and assigned team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leadStatus" className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Lead Status
            </Label>
            <Select value={localData.leadStatus} onValueChange={(value) => handleFieldUpdate('leadStatus', value)}>
              <SelectTrigger>
                <SelectValue>
                  {selectedStatus && (
                    <Badge className={selectedStatus.color}>
                      {selectedStatus.label}
                    </Badge>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {leadStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Account Owner</Label>
              <Input
                id="owner"
                value={localData.owner}
                onChange={(e) => handleFieldUpdate('owner', e.target.value)}
                placeholder="Assign account owner"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conversationOwner">Conversation Owner</Label>
              <Input
                id="conversationOwner"
                value={localData.conversationOwner}
                onChange={(e) => handleFieldUpdate('conversationOwner', e.target.value)}
                placeholder="Assign conversation owner"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retentionOwner">Retention Owner</Label>
              <Input
                id="retentionOwner"
                value={localData.retentionOwner}
                onChange={(e) => handleFieldUpdate('retentionOwner', e.target.value)}
                placeholder="Assign retention owner"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Read-only account metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Client ID</Label>
              <p className="font-mono text-sm">{client.id}</p>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
              <p>{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
            
            {client.lastLogin && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Last Login</Label>
                <p>{new Date(client.lastLogin).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}