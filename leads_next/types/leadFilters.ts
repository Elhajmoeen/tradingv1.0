/**
 * Enhanced filter types for leads with facets support
 */

export type FieldType = "text" | "select" | "multiselect" | "number" | "date" | "boolean"

export interface FieldKitField {
  key: string // e.g., "accountType", "desk", "country"
  label: string
  type: FieldType
  operators: string[] // e.g., ["equals","in","contains","between"]
  options?: { value: string; label: string }[] // static options (optional)
  dataDriven?: boolean // true -> values come from facets API
  filterable?: boolean // can this field be used in filters?
}

export type LeadsFilter = {
  field: string
  op: string
  value: unknown
}

export type LeadsFilters = LeadsFilter[]

export type LeadsFacetsResponse = Record<string, string[]> // { accountType: ["Standard","Pro"], desk: ["MENA","EU"] }

// Enhanced field definitions for leads with facets support
// All keys must match the actual database/API field names exactly
export const LEAD_FIELDS: FieldKitField[] = [
  // Core identifying fields - Data Driven
  { 
    key: "status", 
    label: "Status", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "source", 
    label: "Source", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "assignedTo", 
    label: "Assigned To", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "country", 
    label: "Country", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "campaign", 
    label: "Campaign", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "utm_source", 
    label: "UTM Source", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "utm_medium", 
    label: "UTM Medium", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "utm_campaign", 
    label: "UTM Campaign", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },

  // Extended fields that might exist in real data
  { 
    key: "language", 
    label: "Language", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: false,  // Use static options from fieldkit
    filterable: true 
  },
  { 
    key: "paymentGateway", 
    label: "Payment Gateway", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: false,  // Use dynamic options from Redux state 
    filterable: true 
  },
  { 
    key: "accountType", 
    label: "Account Type", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "desk", 
    label: "Desk", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "countryCode", 
    label: "Country Code", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "gender", 
    label: "Gender", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "citizen", 
    label: "Citizen", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "salesManager", 
    label: "Sales Manager", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "conversationOwner", 
    label: "Conversation Owner", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "leadStatus", 
    label: "Lead Status", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "kycStatus", 
    label: "KYC Status", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },
  { 
    key: "platform", 
    label: "Platform", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: true, 
    filterable: true 
  },

  // Static Options - Not Data Driven (predefined business logic)
  { 
    key: "regulation", 
    label: "Regulation", 
    type: "boolean", 
    operators: ["equals"], 
    dataDriven: false, 
    filterable: true,
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ]
  },
  { 
    key: "ftdSelf", 
    label: "FTD Self", 
    type: "select", 
    operators: ["equals", "in"], 
    dataDriven: false, 
    filterable: true,
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" }
    ]
  },

  // Text Fields - Not Data Driven
  { 
    key: "firstName", 
    label: "First Name", 
    type: "text", 
    operators: ["contains", "equals", "startsWith"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "lastName", 
    label: "Last Name", 
    type: "text", 
    operators: ["contains", "equals", "startsWith"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "email", 
    label: "Email", 
    type: "text", 
    operators: ["contains", "equals", "startsWith"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "phone", 
    label: "Phone", 
    type: "text", 
    operators: ["contains", "equals"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "notes", 
    label: "Notes", 
    type: "text", 
    operators: ["contains", "equals"], 
    dataDriven: false, 
    filterable: true 
  },

  // Number Fields - Not Data Driven
  { 
    key: "score", 
    label: "Score", 
    type: "number", 
    operators: ["equals", ">", ">=", "<", "<=", "between"], 
    dataDriven: false, 
    filterable: true 
  },

  // Date Fields - Not Data Driven
  { 
    key: "createdAt", 
    label: "Created At", 
    type: "date", 
    operators: ["on", "before", "after", "between_dates"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "updatedAt", 
    label: "Updated At", 
    type: "date", 
    operators: ["on", "before", "after", "between_dates"], 
    dataDriven: false, 
    filterable: true 
  },
  
  // Extended date fields that might exist in real data
  { 
    key: "lastContactAt", 
    label: "Last Contact", 
    type: "date", 
    operators: ["on", "before", "after", "between_dates"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "lastLoginAt", 
    label: "Last Login", 
    type: "date", 
    operators: ["on", "before", "after", "between_dates"], 
    dataDriven: false, 
    filterable: true 
  },
  { 
    key: "followUpAt", 
    label: "Follow Up", 
    type: "date", 
    operators: ["on", "before", "after", "between_dates"], 
    dataDriven: false, 
    filterable: true 
  }
]

// FieldKit utilities with enhanced helpers
export const fieldKit = {
  all: LEAD_FIELDS,
  filterable: LEAD_FIELDS.filter(f => f.filterable),
  byKey: (k: string) => LEAD_FIELDS.find(f => f.key === k),
  dataDriven: LEAD_FIELDS.filter(f => f.dataDriven && f.filterable),
  dataDrivenKeys: LEAD_FIELDS.filter(f => f.filterable && (f.type === "select" || f.type === "multiselect") && f.dataDriven).map(f => f.key),
}