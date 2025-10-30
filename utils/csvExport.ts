// CSV Export utility for Allow IP data
import { AllowIp } from '@/state/allowIpSlice'

/**
 * Converts data to CSV format and triggers download
 * @param data - Array of data objects to export
 * @param filename - Name of the CSV file (without extension)
 * @param columns - Array of column keys to include in export
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: (keyof T)[]
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create CSV header
  const headers = columns.map(col => String(col))
  
  // Create CSV rows
  const csvRows = data.map(row => 
    columns.map(col => {
      const value = row[col]
      // Handle special cases
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Yes' : 'No'
      if (typeof value === 'string' && value.includes(',')) {
        // Escape commas by wrapping in quotes
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  )

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Specific export function for Allow IP data
 * @param allowIps - Array of AllowIp objects to export
 * @param filename - Optional custom filename (defaults to 'allow-ips')
 */
export function exportAllowIpsToCsv(
  allowIps: AllowIp[],
  filename: string = 'allow-ips'
): void {
  // Transform data for better CSV format
  const transformedData = allowIps.map(ip => ({
    ip: ip.ip,
    description: ip.description || '',
    isActive: ip.isActive,
    createdBy: ip.createdBy,
    createdOn: formatDateForExport(ip.createdOn),
    updatedOn: ip.updatedOn ? formatDateForExport(ip.updatedOn) : '',
  }))

  // Define columns to export (matches transformed data keys)
  const columns: (keyof typeof transformedData[0])[] = [
    'ip',
    'description', 
    'isActive',
    'createdBy',
    'createdOn',
    'updatedOn',
  ]

  exportToCsv(transformedData, filename, columns)
}

/**
 * Format date for export (more readable than ISO string)
 * @param dateStr - ISO date string
 * @returns Formatted date string
 */
function formatDateForExport(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    // Format as MM/DD/YYYY HH:MM AM/PM
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateStr // Return original if parsing fails
  }
}

/**
 * Generate filename with current date
 * @param baseName - Base name for the file
 * @returns Filename with timestamp
 */
export function generateTimestampedFilename(baseName: string): string {
  const now = new Date()
  const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD format
  return `${baseName}-${timestamp}`
}

/**
 * Export filtered Allow IP data with automatic filename
 * @param allowIps - Array of AllowIp objects
 * @param searchQuery - Current search query for filename context
 */
export function exportFilteredAllowIps(
  allowIps: AllowIp[], 
  searchQuery?: string
): void {
  let filename = generateTimestampedFilename('allow-ips')
  
  if (searchQuery && searchQuery.trim()) {
    // Add search context to filename (sanitized)
    const sanitizedQuery = searchQuery.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    if (sanitizedQuery) {
      filename = generateTimestampedFilename(`allow-ips-search-${sanitizedQuery}`)
    }
  }
  
  exportAllowIpsToCsv(allowIps, filename)
}

// Export statistics for user feedback
export function getExportStats(allowIps: AllowIp[]): {
  total: number
  active: number
  inactive: number
} {
  return {
    total: allowIps.length,
    active: allowIps.filter(ip => ip.isActive).length,
    inactive: allowIps.filter(ip => !ip.isActive).length,
  }
}

// ==================== EMAIL TEMPLATES EXPORT ====================

import type { EmailTemplate } from '@/state/emailTemplatesSlice'

/**
 * Export filtered email templates to CSV
 * @param templates - Filtered email templates to export
 * @param searchQuery - Current search query (for filename context)
 */
export function exportFilteredEmailTemplates(
  templates: EmailTemplate[],
  searchQuery: string = ''
): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  const queryPart = searchQuery.trim() ? `_${searchQuery.replace(/[^\w]/g, '_')}` : ''
  const filename = `email_templates${queryPart}_${timestamp}`

  // Define columns to export
  const columns: (keyof EmailTemplate)[] = [
    'name',
    'subject', 
    'language',
    'category',
    'updatedOn',
    'isActive'
  ]

  exportToCsv(templates, filename, columns)
}

/**
 * Get export statistics for email templates
 * @param templates - Email templates array
 * @returns Statistics object
 */
export function getEmailTemplateExportStats(templates: EmailTemplate[]): {
  total: number
  active: number
  inactive: number
  byCategory: Record<string, number>
  byLanguage: Record<string, number>
} {
  const byCategory: Record<string, number> = {}
  const byLanguage: Record<string, number> = {}
  
  templates.forEach(template => {
    // Count by category
    const category = template.category || 'Uncategorized'
    byCategory[category] = (byCategory[category] || 0) + 1
    
    // Count by language
    const language = template.language || 'Unspecified'
    byLanguage[language] = (byLanguage[language] || 0) + 1
  })

  return {
    total: templates.length,
    active: templates.filter(template => template.isActive).length,
    inactive: templates.filter(template => !template.isActive).length,
    byCategory,
    byLanguage,
  }
}