import { z } from "zod"

/**
 * Zod schemas for client validation and safe parsing with coercion
 */

export const LeadStatusSchema = z.enum(["new", "qualified", "unqualified", "negotiation", "proposal", "renewal"])

export const ClientOwnersSchema = z.object({
  owner: z.string().nullable().optional(),
  conversationOwner: z.string().nullable().optional(),
  retentionOwner: z.string().nullable().optional(),
})

export const ClientDTOSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneCC: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  createdAt: z.string(),
  lastLogin: z.string().nullable().optional(),
  leadStatus: LeadStatusSchema.nullable().optional(),
  owners: ClientOwnersSchema,
})

export const UpdateClientRequestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneCC: z.string().optional(),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  dob: z.string().optional().transform((val) => {
    // Coerce date strings to ISO format
    if (!val) return val
    try {
      return new Date(val).toISOString().split('T')[0]
    } catch {
      return val
    }
  }),
  leadStatus: LeadStatusSchema.optional(),
  owners: ClientOwnersSchema.partial().optional(),
})

export const ClientDocumentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  type: z.enum(["id_passport", "proof_of_address", "cc_front", "cc_back", "other"]),
  name: z.string(),
  status: z.enum(["pending", "approved", "declined"]),
  uploadedAt: z.string(),
  reviewedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const DocumentRequestSchema = z.object({
  type: z.enum(["id_passport", "proof_of_address", "cc_front", "cc_back", "other"]),
  requirementText: z.string(),
})

export const ClientsListResponseSchema = z.object({
  clients: z.array(ClientDTOSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

// Safe parsing helpers
export const parseClientDTO = (data: unknown) => ClientDTOSchema.safeParse(data)
export const parseUpdateClientRequest = (data: unknown) => UpdateClientRequestSchema.safeParse(data)
export const parseClientDocument = (data: unknown) => ClientDocumentSchema.safeParse(data)
export const parseClientsListResponse = (data: unknown) => ClientsListResponseSchema.safeParse(data)

// Transform helpers for coercion
export const coerceClientUpdate = (data: Record<string, any>) => {
  const result = UpdateClientRequestSchema.safeParse(data)
  if (result.success) {
    return result.data
  }
  
  // Fallback with manual coercion
  const coerced = { ...data }
  
  // Coerce phone fields
  if (coerced.phoneCC && !coerced.phoneCC.startsWith('+')) {
    coerced.phoneCC = `+${coerced.phoneCC}`
  }
  
  // Coerce date
  if (coerced.dob && typeof coerced.dob === 'string') {
    try {
      coerced.dob = new Date(coerced.dob).toISOString().split('T')[0]
    } catch {
      // Keep original if invalid
    }
  }
  
  return coerced
}