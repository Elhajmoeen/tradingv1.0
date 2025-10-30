/**
 * Leads NEXT feature exports
 * Centralized exports for the leads_next feature
 */

// API exports
export {
  leadsApi,
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useImportLeadsMutation,
} from './state/leadsApi'

// Component exports
export { LeadsTableAdapter } from './components/LeadsTableAdapter'
export { NewLeadDrawerAdapter } from './components/NewLeadDrawerAdapter'

// Type exports
export type { LeadDTO, CreateLeadRequest, UpdateLeadRequest, LeadStatus } from './types/lead'

// Schema exports
export {
  LeadDTOSchema,
  CreateLeadRequestSchema,
  UpdateLeadRequestSchema,
  parseLeadDTO,
  parseCreateLeadRequest,
  parseUpdateLeadRequest,
} from './types/lead.schema'