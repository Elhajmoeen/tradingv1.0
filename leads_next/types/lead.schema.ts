import { z } from "zod"

/**
 * Zod schemas for lead validation and safe parsing
 */

export const LeadStatusSchema = z.enum(["new", "qualified", "unqualified", "negotiation", "proposal", "renewal"])

export const LeadDTOSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  status: LeadStatusSchema,
  source: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  createdAt: z.string(),
  notes: z.string().nullable().optional(),
})

export const CreateLeadRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  status: LeadStatusSchema.optional().default("new"),
  source: z.string().optional(),
  ownerName: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateLeadRequestSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  status: LeadStatusSchema.optional(),
  source: z.string().optional(),
  ownerName: z.string().optional(),
  notes: z.string().optional(),
})

export const LeadsListResponseSchema = z.object({
  leads: z.array(LeadDTOSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

// Safe parsing helpers
export const parseLeadDTO = (data: unknown) => LeadDTOSchema.safeParse(data)
export const parseCreateLeadRequest = (data: unknown) => CreateLeadRequestSchema.safeParse(data)
export const parseUpdateLeadRequest = (data: unknown) => UpdateLeadRequestSchema.safeParse(data)
export const parseLeadsListResponse = (data: unknown) => LeadsListResponseSchema.safeParse(data)