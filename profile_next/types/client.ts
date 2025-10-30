/**
 * Client DTO types for the "next" profile feature
 * These align with API responses and client management requirements
 */

export type LeadStatus = "new" | "qualified" | "unqualified" | "negotiation" | "proposal" | "renewal"

export interface ClientOwners {
  owner?: string | null
  conversationOwner?: string | null
  retentionOwner?: string | null
}

export interface ClientDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneCC?: string | null // Country code like "+1"
  phoneNumber?: string | null
  country?: string | null
  dob?: string | null // ISO date string
  createdAt: string // ISO string
  lastLogin?: string | null // ISO string
  leadStatus?: LeadStatus | null
  owners: ClientOwners
}

export interface UpdateClientRequest {
  firstName?: string
  lastName?: string
  email?: string
  phoneCC?: string
  phoneNumber?: string
  country?: string
  dob?: string
  leadStatus?: LeadStatus
  owners?: Partial<ClientOwners>
}

export interface ClientDocument {
  id: string
  clientId: string
  type: "id_passport" | "proof_of_address" | "cc_front" | "cc_back" | "other"
  name: string
  status: "pending" | "approved" | "declined"
  uploadedAt: string
  reviewedAt?: string | null
  notes?: string | null
}

export interface DocumentRequest {
  type: ClientDocument['type']
  requirementText: string
}