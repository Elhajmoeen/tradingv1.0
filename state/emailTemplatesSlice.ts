import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export interface EmailTemplate {
  id: string
  name: string          // unique per tenant
  subject: string
  bodyHtml: string      // store HTML; Drawer renders as HTML
  language?: string     // e.g., 'en', 'ar'
  category?: string     // e.g., 'Leads', 'Deposits', 'KYC', 'General'
  variables?: string[]  // tokens like {{client.name}}, {{account.id}}
  createdBy: string
  createdOn: string     // ISO
  updatedOn?: string    // ISO
  isActive: boolean
}

interface EmailTemplatesState {
  items: EmailTemplate[]
  loading: boolean
  error?: string
}

const initialState: EmailTemplatesState = {
  items: [],
  loading: false,
}

// Demo data for seeding
const demoTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to our platform, {{client.name}}!',
    bodyHtml: `<html><body>
      <h2>Welcome {{client.name}}!</h2>
      <p>Thank you for joining our platform. Your account ID is: <strong>{{account.id}}</strong></p>
      <p>We're excited to have you on board. If you have any questions, don't hesitate to contact our support team.</p>
      <p>Best regards,<br/>The Support Team</p>
    </body></html>`,
    language: 'English',
    category: 'General',
    variables: ['client.name', 'account.id'],
    createdBy: 'admin',
    createdOn: '2024-01-15T10:30:00.000Z',
    updatedOn: '2024-01-20T14:15:00.000Z',
    isActive: true,
  },
  {
    id: '2',
    name: 'Lead Follow-up',
    subject: 'Follow-up on your inquiry - {{lead.source}}',
    bodyHtml: `<html><body>
      <h3>Dear {{client.name}},</h3>
      <p>We wanted to follow up on your recent inquiry from <strong>{{lead.source}}</strong>.</p>
      <p>Our team is ready to assist you with:</p>
      <ul>
        <li>Account setup and verification</li>
        <li>Trading platform walkthrough</li>
        <li>Market analysis and insights</li>
      </ul>
      <p>Please reply to this email or call us at your convenience.</p>
      <p>Best regards,<br/>Sales Team</p>
    </body></html>`,
    language: 'English',
    category: 'Leads',
    variables: ['client.name', 'lead.source'],
    createdBy: 'sales',
    createdOn: '2024-01-10T08:45:00.000Z',
    updatedOn: '2024-01-18T16:30:00.000Z',
    isActive: true,
  },
  {
    id: '3',
    name: 'KYC Verification Required',
    subject: 'Action Required: Complete your KYC verification',
    bodyHtml: `<html><body>
      <h2>KYC Verification Required</h2>
      <p>Dear {{client.name}},</p>
      <p>To comply with regulatory requirements, we need you to complete your KYC (Know Your Customer) verification.</p>
      <p><strong>Required documents:</strong></p>
      <ul>
        <li>Government-issued ID (passport, driver's license)</li>
        <li>Proof of address (utility bill, bank statement)</li>
      </ul>
      <p>Please upload these documents through your account portal within 7 days.</p>
      <p>Compliance Team</p>
    </body></html>`,
    language: 'English',
    category: 'KYC',
    variables: ['client.name'],
    createdBy: 'compliance',
    createdOn: '2024-01-12T12:00:00.000Z',
    isActive: false, // Disabled template for demo
  },
]

const emailTemplatesSlice = createSlice({
  name: 'emailTemplates',
  initialState,
  reducers: {
    // Seed demo data if no templates exist
    seedIfEmpty: (state) => {
      if (state.items.length === 0) {
        state.items = demoTemplates
      }
    },

    // Add new template
    addTemplate: (state, action: PayloadAction<{
      name: string
      subject: string
      bodyHtml: string
      language?: string
      category?: string
      variables?: string[]
    }>) => {
      const { name, subject, bodyHtml, language, category, variables } = action.payload
      const now = new Date().toISOString()
      
      const newTemplate: EmailTemplate = {
        id: crypto.randomUUID(),
        name,
        subject,
        bodyHtml,
        language,
        category,
        variables,
        createdBy: 'current-user', // TODO: Get from auth context
        createdOn: now,
        updatedOn: now,
        isActive: true,
      }
      
      state.items.push(newTemplate)
    },

    // Update existing template
    updateTemplate: (state, action: PayloadAction<{
      id: string
      patch: Partial<Pick<EmailTemplate, 'name' | 'subject' | 'bodyHtml' | 'language' | 'category' | 'variables'>>
    }>) => {
      const { id, patch } = action.payload
      const template = state.items.find(item => item.id === id)
      
      if (template) {
        Object.assign(template, patch)
        template.updatedOn = new Date().toISOString()
      }
    },

    // Set template active/inactive status
    setTemplateActive: (state, action: PayloadAction<{
      id: string
      isActive: boolean
    }>) => {
      const { id, isActive } = action.payload
      const template = state.items.find(item => item.id === id)
      
      if (template) {
        template.isActive = isActive
        template.updatedOn = new Date().toISOString()
      }
    },

    // Duplicate template
    duplicateTemplate: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      const template = state.items.find(item => item.id === id)
      
      if (template) {
        const now = new Date().toISOString()
        const duplicated: EmailTemplate = {
          ...template,
          id: crypto.randomUUID(),
          name: `${template.name} (Copy)`,
          createdBy: 'current-user',
          createdOn: now,
          updatedOn: now,
          isActive: true,
        }
        
        state.items.push(duplicated)
      }
    },

    // Remove template (keep but don't surface yet)
    removeTemplate: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      state.items = state.items.filter(item => item.id !== id)
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Set error state
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload
    },
  },
})

export const {
  seedIfEmpty,
  addTemplate,
  updateTemplate,
  setTemplateActive,
  duplicateTemplate,
  removeTemplate,
  setLoading,
  setError,
} = emailTemplatesSlice.actions

// Selectors
export const selectAllEmailTemplates = (state: RootState) => state.emailTemplates.items

export const selectActiveEmailTemplates = (state: RootState) => 
  state.emailTemplates.items
    .filter(template => template.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

export const selectEmailTemplatesByQuery = (state: RootState, query: string) => {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return state.emailTemplates.items
  
  return state.emailTemplates.items.filter(template =>
    template.name.toLowerCase().includes(normalizedQuery) ||
    template.subject.toLowerCase().includes(normalizedQuery) ||
    (template.category && template.category.toLowerCase().includes(normalizedQuery)) ||
    (template.language && template.language.toLowerCase().includes(normalizedQuery))
  )
}

export const selectTemplateById = (state: RootState, id: string) =>
  state.emailTemplates.items.find(template => template.id === id)

export const selectEmailTemplatesLoading = (state: RootState) => state.emailTemplates.loading
export const selectEmailTemplatesError = (state: RootState) => state.emailTemplates.error

// Validation helpers
export const isUniqueName = (state: RootState, name: string, excludeId?: string) => {
  return !state.emailTemplates.items.some(template => 
    template.name.toLowerCase() === name.toLowerCase() && template.id !== excludeId
  )
}

export default emailTemplatesSlice.reducer