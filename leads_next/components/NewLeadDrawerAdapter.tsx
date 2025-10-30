import React, { useState } from "react"
import { isLeadsNextEnabled } from "@/lib/flags"
import { useCreateLeadMutation, useUpdateLeadMutation } from "../state/leadsApi"
import { NewLeadDrawer as LegacyNewLeadDrawer } from "@/components/NewLeadDrawer"
import { CreateLeadRequestSchema } from "../types/lead.schema"
import type { CreateLeadRequest, LeadDTO } from "../types/lead"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface NewLeadDrawerAdapterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadToEdit?: LeadDTO | null
}

export const NewLeadDrawerAdapter: React.FC<NewLeadDrawerAdapterProps> = ({
  open,
  onOpenChange,
  leadToEdit,
}) => {
  const shouldUseNext = isLeadsNextEnabled()
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation()
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation()
  
  const [formData, setFormData] = useState<Partial<CreateLeadRequest>>(() => {
    if (leadToEdit) {
      return {
        fullName: leadToEdit.fullName,
        email: leadToEdit.email,
        phone: leadToEdit.phone || "",
        countryCode: leadToEdit.countryCode || "",
        status: leadToEdit.status,
        source: leadToEdit.source || "",
        ownerName: leadToEdit.ownerName || "",
        notes: leadToEdit.notes || "",
      }
    }
    return { status: "new" }
  })

  const isEditing = Boolean(leadToEdit)
  const isLoading = isCreating || isUpdating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate the form data
      const validationResult = CreateLeadRequestSchema.safeParse(formData)
      
      if (!validationResult.success) {
        console.error("Validation failed:", validationResult.error)
        toast.error("Please check the form for errors")
        return
      }

      if (isEditing && leadToEdit) {
        // Update existing lead
        await updateLead({
          id: leadToEdit.id,
          data: validationResult.data,
        }).unwrap()
        
        toast.success("Lead updated successfully")
      } else {
        // Create new lead  
        await createLead(validationResult.data).unwrap()
        toast.success("Lead created successfully")
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving lead:", error)
      toast.error("Failed to save lead")
    }
  }

  const handleFieldChange = (field: keyof CreateLeadRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Use NEXT implementation if enabled
  if (shouldUseNext) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit Lead" : "Create New Lead"}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Lead Status
                </Label>
                <Select value={formData.status || "new"} onValueChange={(value) => handleFieldChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                    <SelectItem value="negotiation">In Negotiation</SelectItem>
                    <SelectItem value="proposal">Proposal Sent</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">
                  Lead Source
                </Label>
                <Select value={formData.source || ""} onValueChange={(value) => handleFieldChange("source", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-sm font-medium">
                  Assigned To
                </Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName || ""}
                  onChange={(e) => handleFieldChange("ownerName", e.target.value)}
                  placeholder="Sales representative name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Additional notes about this lead"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Lead" : "Create Lead")}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Fallback to legacy implementation
  return (
    <LegacyNewLeadDrawer
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}