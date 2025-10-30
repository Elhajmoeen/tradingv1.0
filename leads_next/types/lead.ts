/**
 * Lead DTO types for the "next" leads feature
 * These align with API responses and lead management requirements
 */

export type LeadStatus = "new" | "qualified" | "unqualified" | "negotiation" | "proposal" | "renewal"

export interface LeadDTO {
  id: string
  fullName: string
  email: string
  phone?: string | null
  countryCode?: string | null
  status: LeadStatus
  source?: string | null
  ownerName?: string | null
  createdAt: string  // ISO string
  notes?: string | null
}

export interface CreateLeadRequest {
  fullName: string
  email: string
  phone?: string
  countryCode?: string
  status?: LeadStatus
  source?: string
  ownerName?: string
  notes?: string
}

export interface UpdateLeadRequest {
  fullName?: string
  email?: string
  phone?: string
  countryCode?: string
  status?: LeadStatus
  source?: string
  ownerName?: string
  notes?: string
}