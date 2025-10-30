import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { coerceBoolean } from '@/lib/utils'
import type { FTDFields, DepositMetrics, FTWFields, WithdrawalMetrics, CreditMetrics } from '../types/finance'

export type OnlineStatus = 'online' | 'offline'

export interface UploadedFile {
  name: string
  size: number
  lastModified: number
  url: string
  type: string
}

export interface Entity {
  id: string
  type: 'lead' | 'client'
  
  // Core Account Information
  accountId?: string
  createdAt?: string
  desk?: string
  conversationOwner?: string
  accountType?: string
  regulation?: string | boolean
  
  // Platform Status
  status?: OnlineStatus // set only by trading platform integration
  
  // Personal Information
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  phoneNumber2?: string
  phone?: {
    countryCode?: string
    number?: string
    manualCC?: boolean
  }
  phone2?: {
    countryCode?: string
    number?: string
    manualCC?: boolean
  }
  country?: string
  countryCode?: string
  dateOfBirth?: string
  age?: number
  gender?: string
  citizen?: string
  language?: string
  
  // Network Information
  registeredIp?: string
  
  // Activity Timeline
  lastContactAt?: string
  lastCommentAt?: string
  firstLoginAt?: string
  lastLoginAt?: string
  lastActivityAt?: string
  followUpAt?: string
  
  // Engagement Counters
  noAnswerCount?: number
  callAttempts?: number
  loginCount?: number
  
  // Lifecycle Management
  firstConversationOwner?: string
  conversationAssignedAt?: string
  conversationOwnerId?: string
  retentionOwner?: string
  retentionOwnerId?: string
  retentionAssignedAt?: string
  dateConverted?: string
  convertedAt?: string
  leadStatus?: string
  salesReview?: string | number
  salesSecondHand?: string | boolean

  // Conversation Owner Dynamic Fields
  conversationOwnerStatus?: string
  conversationOwnerEmail?: string
  conversationOwnerTeam?: string
  conversationOwnerRole?: string
  conversationOwnerWorkload?: string
  conversationOwnerLastActive?: string
  conversationOwnerAssignedAt?: string
  conversationOwnerNotes?: string

  // Retention Owner Dynamic Fields
  retentionOwnerStatus?: string
  retentionOwnerEmail?: string
  retentionOwnerTier?: string
  retentionOwnerTeam?: string
  retentionOwnerRole?: string
  retentionOwnerWorkload?: string
  retentionOwnerLastActive?: string
  retentionOwnerAssignedAt?: string
  retentionOwnerNotes?: string
  
  // Additional retention fields
  retentionStatus?: string
  retentionReview?: string
  
  // Trading timeline (if not present already)
  firstTradedAt?: string
  lastTradedAt?: string
  
  // Financial Information
  totalFtd?: number
  ftdDate?: string
  ftd?: number
  ftdSelf?: number | boolean
  ftdFirstConversation?: number | boolean
  daysToFtd?: number
  
  // New structured finance fields for tracking
  finance?: {
    ftd: FTDFields
    ftw?: FTWFields
    deposit?: DepositMetrics
    withdrawal?: WithdrawalMetrics
    credit?: CreditMetrics
  }
  
  // Document flags
  idDoc?: boolean
  passport?: boolean
  proofOfAddress?: boolean
  ccFront?: boolean
  ccBack?: boolean
  dod?: string | boolean
  
  // Document uploads (file storage)
  idPassportUpload?: UploadedFile[]
  proofOfAddressUpload?: UploadedFile[]
  creditCardFront?: UploadedFile[]
  creditCardBack?: UploadedFile[]
  
  // Document status tracking
  idPassportStatus?: 'approved' | 'declined' | 'pending'
  proofOfAddressStatus?: 'approved' | 'declined' | 'pending'
  ccFrontStatus?: 'approved' | 'declined' | 'pending'
  ccBackStatus?: 'approved' | 'declined' | 'pending'
  
  // Custom documents
  customDocuments?: Array<{
    id: string
    name: string
    description: string
  }>
  
  // Marketing Information
  campaignId?: string
  tag?: string
  leadSource?: string
  utm?: {
    keyword?: string
    term?: string
    creative?: string
    source?: string
    medium?: string
    adGroupId?: string
    adPosition?: string
    country?: string
    feedItemId?: string
    landingPage?: string
    language?: string
    matchType?: string
    targetId?: string
    content?: string
    account?: string
    accountId?: string
    campaignId?: string
    adGroupName?: string
    campaign?: string
    device?: string
  }
  gclid?: string
  platform?: string
  
  // Settings/Permissions
  password?: string
  enableLogin?: boolean
  blockNotifications?: boolean
  allowedToTrade?: boolean
  withdrawLimitAllowed?: boolean
  twoFAEnabled?: boolean
  allowed2fa?: boolean
  allowDeposit?: boolean
  depositLimit?: number
  allowWithdraw?: boolean
  withdrawLimit?: number
  marginCall?: number
  miniDeposit?: number
  stopOut?: number
  swapType?: string
  forex?: string
  crypto?: string
  commodities?: string
  indices?: string
  stocks?: string
  
  // Profile specific fields
  avatarUrl?: string
  balance?: number
  marginLevel?: number
  openPnl?: number
  totalPnl?: number
  freeMargin?: number
  margin?: number
  equity?: number
  openVolume?: number
  
  // Document data structure
  docs?: {
    idPassportVerified?: boolean
    proofOfAddressVerified?: boolean
    ccFrontVerified?: boolean
    ccBackVerified?: boolean
    idPassportFile?: string
    idPassportFileName?: string
    idPassportFileSize?: number
    proofOfAddressFile?: string
    proofOfAddressFileName?: string
    proofOfAddressFileSize?: number
    ccFrontFile?: string
    ccFrontFileName?: string
    ccFrontFileSize?: number
    ccBackFile?: string
    ccBackFileName?: string
    ccBackFileSize?: number
  }
  
  // Address structure
  address?: {
    line1?: string
    line2?: string
    zip?: string
    city?: string
    state?: string
  }
  
  // Allow any additional properties
  [key: string]: any
}

interface EntitiesState {
  entities: Entity[]
  globalCustomDocuments: Array<{
    id: string
    name: string
    description: string
  }>
}

const initialState: EntitiesState = {
  entities: [
    // Real entity data for ACC9001 - Mariam Haddad (matching positions data)
    {
      id: 'ACC9001',
      type: 'lead',
      accountId: 'ACC9001',
      createdAt: '2024-01-15T12:30:00Z',
      status: 'online',
      desk: 'arabic desk',
      conversationOwner: 'John Smith',
      conversationOwnerId: 'john-smith',
      retentionOwner: 'Emma Davis',
      retentionOwnerId: 'emma-davis',
      firstName: 'Mariam',
      lastName: 'Haddad',
      email: 'mariam.haddad@example.com',
      phoneNumber: '+971-55-123-4567',
      phoneNumber2: '+971-55-765-4321',
      accountType: 'gold',
      regulation: 'Yes',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      dateOfBirth: '1992-06-18',
      age: 32,
      gender: 'female',
      citizen: 'UAE',
      language: 'arabic',
      kycStatus: 'approved',
      retentionStatus: 'active',
      retentionReview: 'High value client',
      balance: 10000,
      marginLevel: 150.5,
      openPnl: 375.00,
      totalPnl: 1250.00,
      freeMargin: 8500,
      margin: 1500,
      equity: 10375,
      openVolume: 150000,
      enableLogin: true,
      allowedToTrade: true,
      marginCall: 50,
      stopOut: 20,
      lastContactAt: '2024-03-05T09:40:00Z',
      lastCommentAt: '2024-03-05T10:05:00Z',
      firstLoginAt: '2024-03-01T08:10:00Z',
      lastLoginAt: '2024-03-07T18:20:00Z',
      lastActivityAt: '2024-03-07T18:25:00Z',
      followUpAt: '2024-03-10T10:00:00Z',
      noAnswerCount: 1,
      callAttempts: 4,
      loginCount: 6,
      leadStatus: 'Warm',
      // Sample KYC document flags
      idDoc: true,
      passport: true,
      proofOfAddress: true,
      ccFront: true,
      ccBack: false,
      // Sample document status tracking
      idPassportStatus: 'approved',
      proofOfAddressStatus: 'approved',
      ccFrontStatus: 'pending',
      ccBackStatus: 'declined',
      // Sample allowance/limits
      allowDeposit: true,
      depositLimit: 50000,
      allowWithdraw: true,
      miniDeposit: 100,
      withdrawLimit: 10000,
    },
    // Additional sample entity - ACC001 (offline status)
    {
      id: 'ACC001',
      type: 'client',
      accountId: 'ACC001',
      createdAt: '2024-01-16T08:00:00Z',
      status: 'offline',
      desk: 'english desk',
      conversationOwner: 'Sarah Wilson',
      retentionOwner: 'Mike Davis',
      firstName: 'Michael',
      lastName: 'Thompson',
      email: 'michael.thompson@example.com',
      phoneNumber: '+1-555-123-4567',
      accountType: 'silver',
      regulation: 'No',
      country: 'United States',
      kycStatus: 'pending',
      retentionStatus: 'new',
      leadStatus: 'Cold',
      idDoc: false,
      passport: false,
      proofOfAddress: false,
      allowDeposit: true,
      depositLimit: 25000,
      allowWithdraw: false,
      withdrawLimit: 0,
    },
    // Additional sample entity - ACC002 (online status)
    {
      id: 'ACC002',
      type: 'client', 
      accountId: 'ACC002',
      createdAt: '2024-01-18T10:30:00Z',
      status: 'online',
      desk: 'spanish desk',
      conversationOwner: 'Carlos Rodriguez',
      retentionOwner: 'Anna Lopez',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.martinez@example.com',
      phoneNumber: '+34-666-789-012',
      accountType: 'platinum',
      regulation: 'Yes',
      country: 'Spain',
      kycStatus: 'approved',
      retentionStatus: 'active',
      leadStatus: 'Hot',
      idDoc: true,
      passport: true,
      proofOfAddress: true,
      ccFront: true,
      ccBack: true,
      idPassportStatus: 'approved',
      proofOfAddressStatus: 'approved',
      ccFrontStatus: 'approved',
      ccBackStatus: 'approved',
      allowDeposit: true,
      depositLimit: 100000,
      allowWithdraw: true,
      withdrawLimit: 50000,
    },

  ],
  globalCustomDocuments: []
}

// Helper functions for finance metrics
const ensureFinance = (client: Entity) => {
  if (!client.finance) {
    client.finance = { ftd: { isFTD: false, totalFTD: 0 } } as any
  }
}

const ensureDeposit = (client: Entity) => {
  ensureFinance(client)
  if (!client.finance!.deposit) {
    client.finance!.deposit = {
      totalDeposit: 0,
      netDeposit: 0
    }
  }
}

const ensureWithdrawal = (client: Entity) => {
  ensureFinance(client)
  if (!client.finance!.withdrawal) {
    client.finance!.withdrawal = {
      totalWithdrawal: 0,
      netWithdrawal: 0
    }
  }
}

const ensureCredit = (client: Entity) => {
  ensureFinance(client)
  if (!client.finance!.credit) {
    client.finance!.credit = {
      totalCredit: 0,
      totalCreditOut: 0,
      netCredit: 0
    }
  }
}

const daysBetween = (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

// Helper function to recalculate net deposit as: Total Deposit - Net Withdrawals
const recalculateNetDeposit = (client: Entity) => {
  ensureFinance(client)
  ensureDeposit(client)
  ensureWithdrawal(client)
  
  const totalDeposit = client.finance!.deposit!.totalDeposit || 0
  const netWithdrawal = client.finance!.withdrawal!.netWithdrawal || 0
  
  client.finance!.deposit!.netDeposit = totalDeposit - netWithdrawal
}

// Helper function to recalculate net credit as: Total Credit - Total Credit Out
const recalculateNetCredit = (client: Entity) => {
  ensureFinance(client)
  ensureCredit(client)
  
  const totalCredit = client.finance!.credit!.totalCredit || 0
  const totalCreditOut = client.finance!.credit!.totalCreditOut || 0
  
  client.finance!.credit!.netCredit = totalCredit - totalCreditOut
}

// Type for creating a new lead
export interface CreateLeadPayload {
  firstName: string
  lastName: string
  email: string
  country: string
  countryCode: string
  phoneNumber: string
  leadStatus: string
  salesReview?: number
  leadSource: string
  password: string
  id?: string
  accountId?: string
}

// Async thunk for creating a new lead
export const createLead = createAsyncThunk(
  'entities/createLead',
  async (payload: CreateLeadPayload, { extra, rejectWithValue }) => {
    try {
      // Generate ID if not provided
      const id = payload.id ?? `ACC${Math.floor(1000 + Math.random() * 9000)}`
      const accountId = payload.accountId ?? id
      
      const newLead: Entity = {
        id,
        type: 'lead' as const,
        accountId,
        createdAt: new Date().toISOString(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        country: payload.country,
        countryCode: payload.countryCode,
        phoneNumber: payload.phoneNumber,
        leadStatus: payload.leadStatus,
        salesReview: payload.salesReview,
        leadSource: payload.leadSource,
        password: payload.password, // Store encrypted in real app
        // Default values for other required fields
        regulation: coerceBoolean('No'),
        platform: 'Web',
        enableLogin: true,
      }

      // In a real app, this would be an API call
      // await api.createLead(newLead)
      
      return newLead
    } catch (error) {
      return rejectWithValue('Failed to create lead')
    }
  }
)

// Async thunk for updating regulation field with API persistence
export const updateRegulation = createAsyncThunk(
  'entities/updateRegulation',
  async ({ id, value }: { id: string; value: boolean | undefined }, { dispatch, getState }) => {
    // Normalize the value
    const normalizedValue = coerceBoolean(value)
    
    // Optimistic update
    dispatch(setEntityField({ id, key: 'regulation', value: normalizedValue }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { regulation: normalizedValue })
      console.log(`Updated regulation for ${id} to:`, normalizedValue)
      return { id, value: normalizedValue }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error('Failed to update regulation:', error)
      throw error
    }
  }
)

// Async thunk for updating account type field with API persistence
export const updateAccountType = createAsyncThunk(
  'entities/updateAccountType',
  async ({ id, value }: { id: string; value: string }, { dispatch, getState }) => {
    // Optimistic update
    dispatch(setEntityField({ id, key: 'accountType', value }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { accountType: value })
      console.log(`Updated accountType for ${id} to:`, value)
      return { id, value }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error('Failed to update accountType:', error)
      throw error
    }
  }
)

// Async thunk for updating desk field with API persistence
export const updateDesk = createAsyncThunk(
  'entities/updateDesk',
  async ({ id, value }: { id: string; value: string }, { dispatch, getState }) => {
    // Optimistic update
    dispatch(setEntityField({ id, key: 'desk', value }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { desk: value })
      console.log(`Updated desk for ${id} to:`, value)
      return { id, value }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error('Failed to update desk:', error)
      throw error
    }
  }
)

// Async thunk for updating language field with API persistence
export const updateLanguage = createAsyncThunk(
  'entities/updateLanguage',
  async ({ id, value }: { id: string; value: string }, { dispatch, getState }) => {
    // Optimistic update
    dispatch(setEntityField({ id, key: 'language', value }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { language: value })
      console.log(`Updated language for ${id} to:`, value)
      return { id, value }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error('Failed to update language:', error)
      throw error
    }
  }
)

// Async thunk for updating gender field with API persistence
export const updateGender = createAsyncThunk(
  'entities/updateGender',
  async ({ id, value }: { id: string; value: string }, { dispatch, getState }) => {
    // Optimistic update
    dispatch(setEntityField({ id, key: 'gender', value }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { gender: value })
      console.log(`Updated gender for ${id} to:`, value)
      return { id, value }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error('Failed to update gender:', error)
      throw error
    }
  }
)

// Generic async thunk for updating any entity field
export const updateEntityField = createAsyncThunk(
  'entities/updateEntityField',
  async ({ id, key, value }: { id: string; key: keyof Entity; value: any }, { dispatch, getState }) => {
    // Get the old value before updating for activity logging
    const state = getState() as any;
    const entity = selectEntityById(state, id);
    const oldValue = entity?.[key];
    
    // Optimistic update
    dispatch(setEntityField({ id, key, value }))
    
    // If updating totalFtd, trigger FTD status check
    if (key === 'totalFtd' && typeof value === 'number') {
      await dispatch(checkAndSetFTDStatus({ entityId: id, totalFtd: value }))
    }
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, { [key]: value })
      console.log(`Updated ${key} for ${id} to:`, value)
      return { id, key, value, oldValue }
    } catch (error) {
      // In case of error, you could rollback by getting the previous value
      // and dispatching setEntityField again, or refetch from server
      console.error(`Failed to update ${key}:`, error)
      throw error
    }
  }
)

// Async thunk for setting country and auto-linking dial codes
export const setCountryAndLinkDial = createAsyncThunk(
  'entities/setCountryAndLinkDial',
  async ({ id, countryIsoOrName }: { id: string; countryIsoOrName: string }, { dispatch, getState }) => {
    // Import phone utilities dynamically to avoid circular imports
    const { inferDialFromCountry, normalizePhone, toDigits } = await import('@/config/phone')
    
    // Update country field
    dispatch(setEntityField({ id, key: 'country', value: countryIsoOrName }))
    
    // Get current entity state
    const state = getState() as any
    const entity = state.entities.entities.find((e: Entity) => e.id === id)
    
    if (!entity) return { id, countryIsoOrName }
    
    // Infer dial code from country
    const dial = inferDialFromCountry(countryIsoOrName)
    
    // Update the legacy countryCode field with the dial code (for display compatibility)
    if (dial) {
      dispatch(setEntityField({ id, key: 'countryCode', value: dial }))
    }
    
    // Helper to auto-fill only if empty OR previously auto-filled (not manually edited)
    const maybeFill = (ph?: { countryCode?: string; number?: string; manualCC?: boolean }) => {
      if (ph?.manualCC) {
        // User manually edited the country code, don't overwrite
        return normalizePhone(ph)
      }
      // Auto-fill or update the country code
      return normalizePhone({
        ...ph,
        countryCode: dial || ph?.countryCode || '',
      })
    }
    
    // Update phone objects with normalized structure
    const updatedPhone = maybeFill(entity.phone)
    const updatedPhone2 = maybeFill(entity.phone2)
    
    dispatch(setEntityField({ id, key: 'phone', value: updatedPhone }))
    dispatch(setEntityField({ id, key: 'phone2', value: updatedPhone2 }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(id, {
      //   country: countryIsoOrName,
      //   countryCode: dial,
      //   phone: updatedPhone,
      //   phone2: updatedPhone2,
      // })
      console.log(`Updated country and linked dial codes for ${id}:`, {
        country: countryIsoOrName,
        countryCode: dial,
        phone: updatedPhone,
        phone2: updatedPhone2,
      })
      return { id, countryIsoOrName, countryCode: dial, phone: updatedPhone, phone2: updatedPhone2 }
        } catch (error) {
      console.error('Failed to update country and dial codes:', error)
      throw error
    }
  }
)

// Async thunk for setting date of birth and auto-calculating age
export const setDateOfBirthAndCalculateAge = createAsyncThunk(
  'entities/setDateOfBirthAndCalculateAge',
  async ({ entityId, dateOfBirth }: { entityId: string; dateOfBirth: string }, { dispatch }) => {
    // Import date utilities dynamically
    const { calculateAge, normalizeDateString, isValidBirthDate } = await import('@/utils/dateUtils')
    
    // Normalize and validate the date
    const normalizedDate = normalizeDateString(dateOfBirth)
    
    if (!isValidBirthDate(normalizedDate)) {
      throw new Error('Invalid birth date provided')
    }
    
    // Calculate age from the date
    const calculatedAge = calculateAge(normalizedDate)
    
    // Update both dateOfBirth and age fields
    dispatch(setEntityField({ id: entityId, key: 'dateOfBirth', value: normalizedDate }))
    dispatch(setEntityField({ id: entityId, key: 'age', value: calculatedAge }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.update(entityId, {
      //   dateOfBirth: normalizedDate,
      //   age: calculatedAge,
      // })
      console.log(`Updated date of birth and calculated age for ${entityId}:`, {
        dateOfBirth: normalizedDate,
        age: calculatedAge,
      })
      return { entityId, dateOfBirth: normalizedDate, age: calculatedAge }
    } catch (error) {
      console.error('Failed to update date of birth and age:', error)
      throw error
    }
  }
)

// Auto-detect FTD when totalFtd is updated
export const checkAndSetFTDStatus = createAsyncThunk(
  'entities/checkAndSetFTDStatus',
  async ({ entityId, totalFtd }: { entityId: string; totalFtd: number }, { dispatch, getState }) => {
    const state = getState() as { entities: { entities: Entity[] } }
    const entity = state.entities.entities.find((e: Entity) => e.id === entityId)
    
    if (!entity) {
      throw new Error(`Entity with id ${entityId} not found`)
    }

    // Auto-set FTD to "Yes" if totalFtd > 0 and FTD is not already set to "Yes"
    const currentFTD = entity.ftd
    const normalizedCurrentFTD = typeof currentFTD === 'number' ? (currentFTD > 0 ? 'Yes' : 'No') : 
                                  typeof currentFTD === 'string' ? currentFTD : 'No'
    
    if (totalFtd > 0 && normalizedCurrentFTD !== 'Yes') {
      // Set FTD to "Yes" when client makes first deposit
      dispatch(setEntityField({ id: entityId, key: 'ftd', value: 'Yes' }))
      
      // Also set ftdDate if not already set
      if (!entity.ftdDate) {
        const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        dispatch(setEntityField({ id: entityId, key: 'ftdDate', value: currentDate }))
      }
      
      console.log(`Auto-set FTD status to "Yes" for entity ${entityId} (totalFtd: ${totalFtd})`)
      
      return { entityId, ftd: 'Yes', totalFtd }
    }
    
    // If totalFtd becomes 0 or less, set FTD to "No"
    if (totalFtd <= 0 && normalizedCurrentFTD === 'Yes') {
      dispatch(setEntityField({ id: entityId, key: 'ftd', value: 'No' }))
      console.log(`Auto-set FTD status to "No" for entity ${entityId} (totalFtd: ${totalFtd})`)
      return { entityId, ftd: 'No', totalFtd }
    }
    
    return { entityId, ftd: normalizedCurrentFTD, totalFtd }
  }
)

// Convert lead to client thunk
export const convertLeadToClient = createAsyncThunk(
  'entities/convertLeadToClient',
  async ({ id, retentionOwnerId, commentText }: { id: string; retentionOwnerId: string; commentText?: string }, { dispatch, getState }) => {
    const state = getState() as RootState
    const entity = state.entities.entities.find(e => e.id === id)
    
    if (!entity) {
      throw new Error('Entity not found')
    }
    
    if (entity.type !== 'lead') {
      throw new Error('Can only convert leads to clients')
    }
    
    // Get retention agent details from state
    const retentionAgents = [
      { id: '1', name: 'Sarah Johnson', avatarUrl: '/avatars/sarah.jpg', online: true, email: 'sarah.johnson@company.com', team: 'retention_a', role: 'senior_retention_agent', workload: 'medium', tier: 'A' },
      { id: '2', name: 'Mike Williams', avatarUrl: '/avatars/mike.jpg', online: false, email: 'mike.williams@company.com', team: 'vip_retention', role: 'vip_specialist', workload: 'light', tier: 'A' },
      { id: '3', name: 'Emma Davis', avatarUrl: '/avatars/emma.jpg', online: true, email: 'emma.davis@company.com', team: 'retention_b', role: 'retention_team_lead', workload: 'heavy', tier: 'B' },
      { id: '4', name: 'Alex Thompson', avatarUrl: '/avatars/alex.jpg', online: true, email: 'alex.thompson@company.com', team: 'retention_c', role: 'retention_agent', workload: 'medium', tier: 'C' },
      { id: '5', name: 'Jessica Chen', avatarUrl: '/avatars/jessica.jpg', online: false, email: 'jessica.chen@company.com', team: 'vip_retention', role: 'vip_specialist', workload: 'light', tier: 'A' }
    ]
    const retentionAgent = retentionAgents.find(agent => agent.id === retentionOwnerId)
    const retentionOwnerName = retentionAgent?.name || 'Unknown Agent'
    
    const now = new Date().toISOString()
    
    // Optimistic updates
    dispatch(setEntityField({ id, key: 'type', value: 'client' }))
    dispatch(setEntityField({ id, key: 'retentionOwnerId', value: retentionOwnerId }))
    dispatch(setEntityField({ id, key: 'retentionOwner', value: retentionOwnerName }))
    dispatch(setEntityField({ id, key: 'convertedAt', value: now }))
    dispatch(setEntityField({ id, key: 'dateConverted', value: now }))
    dispatch(setEntityField({ id, key: 'retentionAssignedAt', value: now }))
    dispatch(setEntityField({ id, key: 'leadStatus', value: 'Converted' }))
    
    try {
      // In a real app, this would be an API call
      // await api.entities.convertLead(id, { retentionOwnerId })
      console.log(`✅ Successfully converted lead ${id} to client`)
      console.log(`📋 Conversion details:`, {
        id,
        retentionOwnerId,
        retentionOwnerName,
        convertedAt: now,
        commentText
      })
      
      // Verify the entity was updated by getting it from state again
      setTimeout(() => {
        const updatedState = getState() as RootState
        const updatedEntity = updatedState.entities.entities.find(e => e.id === id)
        console.log(`🔄 Updated entity after conversion:`, {
          id: updatedEntity?.id,
          type: updatedEntity?.type,
          retentionOwner: updatedEntity?.retentionOwner,
          retentionOwnerId: updatedEntity?.retentionOwnerId,
          convertedAt: updatedEntity?.convertedAt,
          dateConverted: updatedEntity?.dateConverted,
          leadStatus: updatedEntity?.leadStatus
        })
      }, 100)
      
      return { id, retentionOwnerId, retentionOwnerName, convertedAt: now, commentText }
    } catch (error) {
      // Rollback optimistic updates
      dispatch(setEntityField({ id, key: 'type', value: 'lead' }))
      dispatch(setEntityField({ id, key: 'retentionOwnerId', value: entity.retentionOwnerId }))
      dispatch(setEntityField({ id, key: 'retentionOwner', value: entity.retentionOwner }))
      dispatch(setEntityField({ id, key: 'convertedAt', value: entity.convertedAt }))
      dispatch(setEntityField({ id, key: 'dateConverted', value: entity.dateConverted }))
      dispatch(setEntityField({ id, key: 'retentionAssignedAt', value: entity.retentionAssignedAt }))
      dispatch(setEntityField({ id, key: 'leadStatus', value: entity.leadStatus }))
      
      console.error('Failed to convert lead:', error)
      throw error
    }
  }
)

// Entity slice

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    setEntities: (state, action: PayloadAction<Entity[]>) => {
      state.entities = action.payload
    },
    upsertMany: (state, action: PayloadAction<Entity[]>) => {
      action.payload.forEach(entity => {
        const existingIndex = state.entities.findIndex(e => e.id === entity.id)
        if (existingIndex >= 0) {
          state.entities[existingIndex] = entity
        } else {
          state.entities.push(entity)
        }
      })
    },
    upsertOne: (state, action: PayloadAction<Entity>) => {
      const existingIndex = state.entities.findIndex(e => e.id === action.payload.id)
      if (existingIndex >= 0) {
        state.entities[existingIndex] = action.payload
      } else {
        state.entities.push(action.payload)
      }
    },
    removeOne: (state, action: PayloadAction<string>) => {
      state.entities = state.entities.filter(e => e.id !== action.payload)
    },
    addEntity: (state, action: PayloadAction<Entity>) => {
      state.entities.push(action.payload)
    },
    updateOne: (state, action: PayloadAction<{ id: string; changes: Partial<Entity> }>) => {
      const existingIndex = state.entities.findIndex(e => e.id === action.payload.id)
      if (existingIndex >= 0) {
        state.entities[existingIndex] = { ...state.entities[existingIndex], ...action.payload.changes }
      }
    },
    setEntityField: (state, action: PayloadAction<{ id: string; key: keyof Entity; value: any }>) => {
      const { id, key, value } = action.payload
      const existingIndex = state.entities.findIndex(e => e.id === id)
      if (existingIndex >= 0) {
        state.entities[existingIndex] = {
          ...state.entities[existingIndex],
          [key]: value,
          updatedAt: new Date().toISOString()
        }
      }
    },
    applyFTDForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      ftdDateISO: string
      createdBy: 'CRM' | 'Client'
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, ftdDateISO, createdBy, clientCreatedAtISO } = action.payload
      const existingIndex = state.entities.findIndex(e => e.id === clientId)
      
      if (existingIndex >= 0) {
        const client = state.entities[existingIndex]
        
        // Check both legacy field and new structured field to determine if this is first FTD
        const alreadyHasFTD = client.finance?.ftd?.isFTD || (client.totalFtd && client.totalFtd > 0)
        
        // Only set FTD metrics the FIRST time
        if (!alreadyHasFTD) {
          const ftdSelf = createdBy === 'Client'
          const start = new Date(clientCreatedAtISO || client.createdAt || new Date().toISOString())
          const end = new Date(ftdDateISO)
          const ms = end.getTime() - start.getTime()
          const daysToFTD = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))

          console.log('🔄 Applying FTD for client:', clientId)
          console.log('📊 FTD Data:', {
            amount,
            ftdDateISO,
            ftdSelf,
            daysToFTD,
            createdBy
          })

          state.entities[existingIndex] = {
            ...client,
            // Legacy fields (for existing UI compatibility)
            totalFtd: amount,
            ftdDate: ftdDateISO,
            ftd: 1, // Number field: 1 = Yes, 0 = No
            ftdSelf: ftdSelf ? 1 : 0, // Number field: 1 = Self, 0 = CRM
            daysToFtd: daysToFTD,
            
            // New structured fields (for future use)
            finance: {
              ...client.finance,
              ftd: {
                isFTD: true,
                totalFTD: amount,
                ftdDateISO,
                ftdSelf,
                daysToFTD
              }
              // Note: Deposit metrics are separate from FTD and will be initialized only when first non-FTD deposit occurs
            },
            updatedAt: new Date().toISOString()
          }
          
          console.log('✅ FTD applied successfully for client:', clientId)
        } else {
          console.log('⚠️ Client already has FTD, skipping update:', clientId)
        }
      } else {
        console.error('❌ Client not found:', clientId)
      }
    },
    applyNonFTDDepositForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      depositDateISO: string
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, depositDateISO, clientCreatedAtISO } = action.payload
      const client = state.entities.find(e => e.id === clientId)
      if (!client) return

      ensureDeposit(client)

      // Update totals
      client.finance!.deposit!.totalDeposit += amount
      // Recalculate net deposit as Total Deposit - Net Withdrawals
      recalculateNetDeposit(client)

      // First/Last deposit dates
      if (!client.finance!.deposit!.firstDepositDateISO) {
        // This is the first non-FTD deposit transaction, so set as first deposit date
        client.finance!.deposit!.firstDepositDateISO = depositDateISO
        client.finance!.deposit!.daysToDeposit = daysBetween(clientCreatedAtISO, depositDateISO)
      }
      // Always refresh last deposit date to this deposit
      client.finance!.deposit!.lastDepositDateISO = depositDateISO
      
      console.log('💳 Applied non-FTD deposit for client:', clientId, 'Amount:', amount)
    },
    applyFTWForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      ftwDateISO: string
      createdBy: 'CRM' | 'Client'
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, ftwDateISO, createdBy, clientCreatedAtISO } = action.payload
      const existingIndex = state.entities.findIndex(e => e.id === clientId)
      
      if (existingIndex >= 0) {
        const client = state.entities[existingIndex]
        
        // Check both legacy field and new structured field to determine if this is first FTW
        const alreadyHasFTW = client.finance?.ftw?.isFTW
        
        // Only set FTW metrics the FIRST time
        if (!alreadyHasFTW) {
          const ftwSelf = createdBy === 'Client'
          const start = new Date(clientCreatedAtISO || client.createdAt || new Date().toISOString())
          const end = new Date(ftwDateISO)
          const ms = end.getTime() - start.getTime()
          const daysToFTW = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))

          console.log('🔄 Applying FTW for client:', clientId)
          console.log('📊 FTW Data:', {
            amount,
            ftwDateISO,
            ftwSelf,
            daysToFTW,
            createdBy
          })

          state.entities[existingIndex] = {
            ...client,
            // New structured FTW fields
            finance: {
              ...client.finance,
              ftd: client.finance?.ftd || { isFTD: false, totalFTD: 0 },
              ftw: {
                isFTW: true,
                totalFTW: amount,
                ftwDateISO,
                ftwSelf,
                daysToFTW
              }
              // Note: Withdrawal metrics are separate from FTW and will be initialized only when first non-FTW withdrawal occurs
            },
            updatedAt: new Date().toISOString()
          }
          
          console.log('✅ FTW applied successfully for client:', clientId)
        } else {
          console.log('⚠️ Client already has FTW, skipping update:', clientId)
        }
      } else {
        console.error('❌ Client not found:', clientId)
      }
    },
    applyNonFTWWithdrawalForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      withdrawalDateISO: string
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, withdrawalDateISO, clientCreatedAtISO } = action.payload
      const client = state.entities.find(e => e.id === clientId)
      if (!client) return

      ensureWithdrawal(client)

      // Update totals
      client.finance!.withdrawal!.totalWithdrawal += amount
      client.finance!.withdrawal!.netWithdrawal += amount
      // Recalculate net deposit as Total Deposit - Net Withdrawals
      recalculateNetDeposit(client)

      // First/Last withdrawal dates
      if (!client.finance!.withdrawal!.firstWithdrawalDateISO) {
        // This is the first non-FTW withdrawal transaction, so set as first withdrawal date
        client.finance!.withdrawal!.firstWithdrawalDateISO = withdrawalDateISO
        client.finance!.withdrawal!.daysToWithdrawal = daysBetween(clientCreatedAtISO, withdrawalDateISO)
      }
      // Always refresh last withdrawal date to this withdrawal
      client.finance!.withdrawal!.lastWithdrawalDateISO = withdrawalDateISO
      
      console.log('🏦 Applied non-FTW withdrawal for client:', clientId, 'Amount:', amount)
    },

    // Apply Credit to client
    applyCreditForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      creditDateISO: string
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, creditDateISO, clientCreatedAtISO } = action.payload
      const client = state.entities.find(e => e.id === clientId)
      if (!client) {
        console.warn('❌ applyCreditForClient: Client not found:', clientId)
        return
      }

      ensureCredit(client)

      // Update credit metrics
      client.finance!.credit!.totalCredit += amount

      // Recalculate net credit as Total Credit - Total Credit Out
      recalculateNetCredit(client)

      // First/Last credit dates
      if (!client.finance!.credit!.firstCreditDateISO) {
        client.finance!.credit!.firstCreditDateISO = creditDateISO
      }
      // Always refresh last credit date to this credit
      client.finance!.credit!.lastCreditDateISO = creditDateISO
      
      console.log('➕ Applied credit for client:', clientId, 'Amount:', amount)
    },

    // Apply Credit Out to client
    applyCreditOutForClient: (state, action: PayloadAction<{
      clientId: string
      amount: number
      creditOutDateISO: string
      clientCreatedAtISO: string
    }>) => {
      const { clientId, amount, creditOutDateISO, clientCreatedAtISO } = action.payload
      const client = state.entities.find(e => e.id === clientId)
      if (!client) {
        console.warn('❌ applyCreditOutForClient: Client not found:', clientId)
        return
      }

      ensureCredit(client)

      // Validate that Credit Out doesn't exceed Total Credits
      const currentTotalCredit = client.finance!.credit!.totalCredit || 0
      const currentTotalCreditOut = client.finance!.credit!.totalCreditOut || 0
      const availableCredit = currentTotalCredit - currentTotalCreditOut

      if (amount > availableCredit) {
        console.warn('❌ Credit Out amount exceeds available credits:', {
          requestedAmount: amount,
          availableCredit: availableCredit,
          totalCredit: currentTotalCredit,
          totalCreditOut: currentTotalCreditOut
        })
        // You could throw an error or just cap the amount
        // For now, I'll cap it to available credit
        const cappedAmount = Math.max(0, availableCredit)
        if (cappedAmount === 0) {
          console.warn('❌ No credits available for Credit Out')
          return
        }
        console.log('⚠️ Capping Credit Out to available amount:', cappedAmount)
        // Use the capped amount instead
        client.finance!.credit!.totalCreditOut += cappedAmount
      } else {
        // Update credit out metrics
        client.finance!.credit!.totalCreditOut += amount
      }

      // Recalculate net credit as Total Credit - Total Credit Out
      recalculateNetCredit(client)

      // First/Last credit out dates
      if (!client.finance!.credit!.firstCreditOutDateISO) {
        client.finance!.credit!.firstCreditOutDateISO = creditOutDateISO
      }
      // Always refresh last credit out date to this credit out
      client.finance!.credit!.lastCreditOutDateISO = creditOutDateISO
      
      console.log('➖ Applied credit out for client:', clientId, 'Amount:', amount)
    },

    // Global Custom Documents Actions
    addGlobalCustomDocument: (state, action: PayloadAction<{id: string, name: string, description: string}>) => {
      const existingIndex = state.globalCustomDocuments.findIndex(doc => doc.id === action.payload.id)
      if (existingIndex === -1) {
        state.globalCustomDocuments.push(action.payload)
      }
    },
    
    removeGlobalCustomDocument: (state, action: PayloadAction<string>) => {
      state.globalCustomDocuments = state.globalCustomDocuments.filter(doc => doc.id !== action.payload)
    },
    
    updateGlobalCustomDocument: (state, action: PayloadAction<{id: string, name?: string, description?: string}>) => {
      const docIndex = state.globalCustomDocuments.findIndex(doc => doc.id === action.payload.id)
      if (docIndex >= 0) {
        if (action.payload.name !== undefined) {
          state.globalCustomDocuments[docIndex].name = action.payload.name
        }
        if (action.payload.description !== undefined) {
          state.globalCustomDocuments[docIndex].description = action.payload.description
        }
      }
    },
    
    setEntityStatus: (state, action: PayloadAction<{ id: string; status: OnlineStatus }>) => {
      const entityIndex = state.entities.findIndex(e => e.id === action.payload.id)
      if (entityIndex >= 0) {
        state.entities[entityIndex].status = action.payload.status
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLead.fulfilled, (state, action) => {
        state.entities.push(action.payload)
      })
  }
})

// Selectors
export const selectAllEntities = (state: RootState) => state.entities.entities
export const selectEntitiesByType = (type: 'lead' | 'client') => (state: RootState) => 
  state.entities.entities.filter(entity => entity.type === type)
export const selectEntityById = (id: string) => (state: RootState) => 
  state.entities.entities.find(entity => entity.id === id)
export const selectDisplayNameById = (state: RootState, id: string) => {
  const entity = state.entities.entities.find(e => e.id === id)
  const first = (entity?.firstName ?? '').trim()
  const last = (entity?.lastName ?? '').trim()
  return `${first} ${last}`.trim() || 'Unknown'
}
export const selectGlobalCustomDocuments = (state: RootState) => state.entities.globalCustomDocuments

// Entity status selector
export const selectEntityStatus = (state: RootState, id: string): OnlineStatus => 
  state.entities.entities.find(e => e.id === id)?.status ?? 'offline'

// Convenience selectors for search
export const selectAllLeads = (state: RootState) => selectEntitiesByType('lead')(state)
export const selectAllClients = (state: RootState) => selectEntitiesByType('client')(state)

// Dashboard selectors
export const selectTotalDeposits = createSelector(
  [selectAllClients],
  (clients) => clients.reduce((sum, c) => sum + (Number(c.finance?.deposit?.totalDeposit) || 0), 0)
)

export const { setEntities, upsertMany, upsertOne, removeOne, addEntity, updateOne, setEntityField, applyFTDForClient, applyNonFTDDepositForClient, applyFTWForClient, applyNonFTWWithdrawalForClient, applyCreditForClient, applyCreditOutForClient, addGlobalCustomDocument, removeGlobalCustomDocument, updateGlobalCustomDocument, setEntityStatus } = entitiesSlice.actions
export default entitiesSlice.reducer