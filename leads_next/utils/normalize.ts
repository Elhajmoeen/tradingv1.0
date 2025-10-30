/**
 * Normalization utilities for facets and field values
 * Ensures consistent data representation across frontend and backend
 */

export type NormalizationMode = "lower" | "upper" | "title" | "trim" | "raw"

/**
 * Normalize a facet value based on the specified mode
 * @param v - The value to normalize
 * @param mode - The normalization mode
 * @returns Normalized value
 */
export const normalizeFacet = (v: unknown, mode: NormalizationMode = "trim"): string => {
  if (typeof v !== "string") return String(v || "")
  
  let s = v.trim()
  
  switch (mode) {
    case "lower":
      return s.toLowerCase()
    case "upper":
      return s.toUpperCase()
    case "title":
      return s.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    case "trim":
      return s
    case "raw":
    default:
      return v
  }
}

/**
 * Normalize an array of facet values, removing duplicates and empty values
 * @param values - Array of values to normalize
 * @param mode - Normalization mode
 * @returns Normalized and deduplicated array
 */
export const normalizeFacetArray = (values: unknown[], mode: NormalizationMode = "trim"): string[] => {
  const normalized = values
    .map(v => normalizeFacet(v, mode))
    .filter(v => v !== null && v !== undefined && v !== "")
    .filter(v => String(v).trim() !== "")
  
  // Remove duplicates and sort
  return Array.from(new Set(normalized)).sort()
}

/**
 * Field-specific normalization rules
 * Maps field keys to their preferred normalization mode
 */
export const fieldNormalizationRules: Record<string, NormalizationMode> = {
  // Lowercase fields
  language: "lower",
  utm_source: "lower", 
  utm_medium: "lower",
  email: "lower",
  
  // Title case fields
  country: "title",
  source: "title",
  campaign: "title",
  assignedTo: "title",
  salesManager: "title",
  conversationOwner: "title",
  
  // Uppercase fields
  countryCode: "upper",
  status: "upper",
  
  // Trim only (preserve original case)
  paymentGateway: "trim",
  accountType: "trim",
  desk: "trim",
  platform: "trim",
  gender: "trim",
  citizen: "trim",
  kycStatus: "trim",
  leadStatus: "trim",
  utm_campaign: "trim",
}

/**
 * Get the normalization mode for a specific field
 * @param fieldKey - The field key
 * @returns Normalization mode for the field
 */
export const getNormalizationModeForField = (fieldKey: string): NormalizationMode => {
  return fieldNormalizationRules[fieldKey] || "trim"
}

/**
 * Normalize facets for a specific field
 * @param fieldKey - The field key
 * @param values - Array of values to normalize
 * @returns Normalized facet array
 */
export const normalizeFacetsForField = (fieldKey: string, values: unknown[]): string[] => {
  const mode = getNormalizationModeForField(fieldKey)
  return normalizeFacetArray(values, mode)
}