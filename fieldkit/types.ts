// Core types for the unified field system
import type { Entity } from '@/state/entitiesSlice'

// Standard option format used across all selects
export interface Option {
  label: string
  value: string | number | boolean
}

// Map of field keys to their expected value types - PHASE A: ALL FIELDS
// Ensures type consistency across the app
export interface FieldValueMap {
  // Core Identity
  id: string
  type: 'lead' | 'client'
  accountId: string
  
  // Personal Information (Phase A)
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  phoneNumber2: string
  phone: { countryCode?: string; number?: string; manualCC?: boolean }
  phone2: { countryCode?: string; number?: string; manualCC?: boolean }
  country: string
  countryCode: string
  dateOfBirth: string
  age: number
  gender: string
  citizen: string
  language: string
  registeredIp: string

  // Core Account Information (Phase A)
  createdAt: string
  desk: string
  salesManager: string
  conversationOwner: string
  accountType: string
  regulation: boolean
  
  // Activity Timeline (Phase A - dates)
  lastContactAt: string
  lastCommentAt: string
  firstLoginAt: string
  lastLoginAt: string
  lastActivityAt: string
  followUpAt: string

  // Engagement Counters (Phase A - numbers)
  noAnswerCount: number
  callAttempts: number
  loginCount: number

  // Lead Management (Phase A)
  leadStatus: string
  salesReview: number  // 1-5 star rating
  retentionReview: number  // 1-5 star rating
  salesSecondHand: boolean
  leadSource: string

  // Lifecycle Management (Phase A)
  firstConversationOwner: string
  conversationAssignedAt: string
  conversationOwnerId: string
  retentionOwner: string
  retentionOwnerId: string
  retentionAssignedAt: string
  retentionStatus: string
  convertedAt: string  // Date converted
  firstTradedAt: string
  lastTradedAt: string

  // Financial (Phase A - basic numbers and flags)
  totalFtd: number
  ftdDate: string
  ftd: number
  ftdSelf: boolean
  ftdFirstConversation: boolean
  daysToFtd: number

  // Document Flags (Phase A - booleans)
  idPassport: boolean
  proofOfAddress: boolean
  ccFront: boolean
  ccBack: boolean
  dod: boolean

  // Marketing Information (Phase A)
  campaignId: string
  tag: string
  gclid: string
  platform: string

  // Settings/Permissions (Phase A - booleans and numbers)
  enableLogin: boolean
  blockNotifications: boolean
  allowedToTrade: boolean
  withdrawLimitAllowed: boolean
  twoFAEnabled: boolean
  allowed2fa: boolean
  allowDeposit: boolean
  depositLimit: number
  allowWithdraw: boolean
  withdrawLimit: number
  marginCall: number
  miniDeposit: number
  stopOut: number
  
  // Trading Preferences (Phase A - select fields)
  swapType: string
  forex: string
  crypto: string
  commodities: string
  indices: string
  stocks: string

  // Profile Financial Data (Phase A - numbers)
  avatarUrl: string
  balance: number
  marginLevel: number
  openPnl: number
  totalPnl: number
  freeMargin: number
  margin: number
  totalMargin: number
  equity: number
  openVolume: number

  // Address Fields (Phase A - text)
  'address.line1': string
  'address.line2': string
  'address.zip': string
  'address.city': string
  'address.state': string
}

// Extract valid field keys from Entity type
export type EntityFieldKey = keyof Entity

// Option provider types - static or dynamic
export type StaticOptions = Option[]
export type DynamicOptions = (entities: Entity[]) => Option[]
export type OptionsProvider = StaticOptions | DynamicOptions

// Field configuration for FieldRenderer
export interface FieldConfig {
  key: EntityFieldKey
  type: 'text' | 'email' | 'phone' | 'select' | 'rating' | 'date' | 'boolean' | 'textarea'
  label: string
  placeholder?: string
  options?: OptionsProvider
  required?: boolean
  disabled?: boolean
  description?: string
}