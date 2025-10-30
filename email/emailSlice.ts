import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Draft, EmailTemplate, EmailAccount, Attachment } from './types'
import { setEntityField } from '@/state/entitiesSlice'
import type { RootState } from '@/state/store'

interface EmailState {
  draftsById: Record<string, Draft>;
  recentDraftIds: string[];
  templates: EmailTemplate[];
  accounts: EmailAccount[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailState = {
  draftsById: {},
  recentDraftIds: [],
  templates: [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to {{CompanyName}}, {{FirstName}}!',
      bodyHtml: `<p>Dear {{FirstName}},</p>
        <p>Welcome to {{CompanyName}}! We're excited to have you on board.</p>
        <p>Your account ID is: {{AccountID}}</p>
        <p>Best regards,<br>The Team</p>`
    },
    {
      id: 'follow-up',
      name: 'Follow Up',
      subject: 'Following up - {{FirstName}}',
      bodyHtml: `<p>Hi {{FirstName}},</p>
        <p>I wanted to follow up on our recent conversation.</p>
        <p>Please let me know if you have any questions.</p>
        <p>Best regards</p>`
    },
    {
      id: 'document-request',
      name: 'Document Request',
      subject: 'Document Request - {{AccountID}}',
      bodyHtml: `<p>Dear {{FirstName}},</p>
        <p>We need some additional documents for your account {{AccountID}}.</p>
        <p>Please upload the following documents at your earliest convenience:</p>
        <ul>
          <li>Valid ID</li>
          <li>Proof of address</li>
        </ul>
        <p>Thank you for your cooperation.</p>`
    }
  ],
  accounts: [
    {
      id: 'default',
      label: 'Support Team',
      fromEmail: 'support@company.com',
      signature: `<div>
        <p>Best regards,<br>
        Support Team<br>
        Company Name</p>
      </div>`
    }
  ],
  isLoading: false,
  error: null
}

// Load drafts from localStorage
const loadDraftsFromStorage = (): Record<string, Draft> => {
  try {
    const stored = localStorage.getItem('email.drafts.v1')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Save drafts to localStorage
const saveDraftsToStorage = (drafts: Record<string, Draft>) => {
  try {
    localStorage.setItem('email.drafts.v1', JSON.stringify(drafts))
  } catch {
    // Ignore storage errors
  }
}

// Async thunk for sending email
export const sendDraft = createAsyncThunk(
  'email/sendDraft',
  async (draftId: string, { getState, dispatch }) => {
    const state = getState() as { email: EmailState }
    const draft = state.email.draftsById[draftId]
    
    if (!draft) {
      throw new Error('Draft not found')
    }

    // Validate email
    if (draft.to.length === 0) {
      throw new Error('At least one recipient is required')
    }

    if (!draft.subject.trim() && !draft.bodyHtml.trim()) {
      throw new Error('Email cannot be empty')
    }

    // Mock sending email (replace with Gmail API later)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const sentDraft = {
      ...draft,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
      threadId: `thread_${Date.now()}`
    }

    // Update entity's last activity
    dispatch(setEntityField({
      id: draft.entityId,
      key: 'lastActivityAt',
      value: sentDraft.sentAt
    }))

    return sentDraft
  }
)

const emailSlice = createSlice({
  name: 'email',
  initialState: {
    ...initialState,
    draftsById: loadDraftsFromStorage()
  },
  reducers: {
    upsertDraft: (state, action: PayloadAction<Draft>) => {
      const draft = action.payload
      draft.updatedAt = new Date().toISOString()
      
      state.draftsById[draft.id] = draft
      
      // Update recent drafts list
      state.recentDraftIds = state.recentDraftIds.filter(id => id !== draft.id)
      state.recentDraftIds.unshift(draft.id)
      state.recentDraftIds = state.recentDraftIds.slice(0, 20) // Keep last 20
      
      // Persist to localStorage
      saveDraftsToStorage(state.draftsById)
    },

    deleteDraft: (state, action: PayloadAction<string>) => {
      const draftId = action.payload
      delete state.draftsById[draftId]
      state.recentDraftIds = state.recentDraftIds.filter(id => id !== draftId)
      
      saveDraftsToStorage(state.draftsById)
    },

    applyTemplate: (state, action: PayloadAction<{ draftId: string; templateId: string }>) => {
      const { draftId, templateId } = action.payload
      const draft = state.draftsById[draftId]
      const template = state.templates.find(t => t.id === templateId)
      
      if (draft && template) {
        if (template.subject) {
          draft.subject = template.subject
        }
        if (template.bodyHtml) {
          draft.bodyHtml = template.bodyHtml
        }
        draft.settings.templateId = templateId
        draft.updatedAt = new Date().toISOString()
        
        saveDraftsToStorage(state.draftsById)
      }
    },

    attachFiles: (state, action: PayloadAction<{ draftId: string; attachments: Attachment[] }>) => {
      const { draftId, attachments } = action.payload
      const draft = state.draftsById[draftId]
      
      if (draft) {
        draft.attachments.push(...attachments)
        draft.updatedAt = new Date().toISOString()
        
        saveDraftsToStorage(state.draftsById)
      }
    },

    removeAttachment: (state, action: PayloadAction<{ draftId: string; attachmentId: string }>) => {
      const { draftId, attachmentId } = action.payload
      const draft = state.draftsById[draftId]
      
      if (draft) {
        draft.attachments = draft.attachments.filter(a => a.id !== attachmentId)
        draft.updatedAt = new Date().toISOString()
        
        saveDraftsToStorage(state.draftsById)
      }
    },

    updateDraftField: (state, action: PayloadAction<{ 
      draftId: string; 
      field: keyof Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>; 
      value: any 
    }>) => {
      const { draftId, field, value } = action.payload
      const draft = state.draftsById[draftId]
      
      if (draft) {
        (draft as any)[field] = value
        draft.updatedAt = new Date().toISOString()
        
        saveDraftsToStorage(state.draftsById)
      }
    },

    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendDraft.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendDraft.fulfilled, (state, action) => {
        state.isLoading = false
        state.draftsById[action.payload.id] = action.payload
        saveDraftsToStorage(state.draftsById)
      })
      .addCase(sendDraft.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to send email'
      })
  }
})

export const {
  upsertDraft,
  deleteDraft,
  applyTemplate,
  attachFiles,
  removeAttachment,
  updateDraftField,
  clearError
} = emailSlice.actions

// Selectors
export const selectDraftById = (draftId: string) => (state: RootState) =>
  state.email.draftsById[draftId]

export const selectDraftForEntity = (entityId: string) => (state: RootState) => {
  const drafts = Object.values(state.email.draftsById) as Draft[]
  const entityDrafts = drafts
    .filter(draft => draft.entityId === entityId && draft.status === 'draft')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  
  return entityDrafts[0] // Return most recent draft for entity
}

export const selectTemplates = (state: RootState) => state.email.templates

export const selectEmailAccounts = (state: RootState) => state.email.accounts

export const selectEmailState = (state: RootState) => state.email

export default emailSlice.reducer