import { z } from 'zod'

export const AllowIpStatus = z.enum(['active', 'disabled'])

export const AllowIpDTO = z.object({
  id: z.string(),
  ip: z.string().trim()
    // IPv4, IPv6, or CIDR validation
    .regex(
      /^(([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?|([0-9a-fA-F:]+)(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?)$/,
      'Invalid IP address or CIDR notation'
    ),
  description: z.string().trim().max(120).optional().nullable(),
  status: AllowIpStatus,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(), 
  createdBy: z.string().optional(),
})

export type AllowIp = z.infer<typeof AllowIpDTO>

// Additional validation schemas for forms
export const CreateAllowIpSchema = AllowIpDTO.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const UpdateAllowIpSchema = AllowIpDTO.partial().omit({ 
  id: true, 
  createdAt: true 
}).extend({
  updatedAt: z.string().optional()
})

export type CreateAllowIpRequest = z.infer<typeof CreateAllowIpSchema>
export type UpdateAllowIpRequest = z.infer<typeof UpdateAllowIpSchema>