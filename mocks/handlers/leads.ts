/**
 * MSW handlers for leads API
 * Mocks all lead-related endpoints with NEXT features support
 */

import { http, HttpResponse } from 'msw'
import { leadsSeed } from '@/mocks/data/leadsSeed'
import { parseQuery, processQuery, generateId } from '@/mocks/utils'
import type { LeadDTO as LegacyLeadDTO } from '@/mocks/data/leadsSeed'
import type { LeadDTO as NextLeadDTO, CreateLeadRequest, UpdateLeadRequest } from '@/features/leads_next/types/lead'

// Transform legacy lead to NEXT format
function transformLegacyToNext(legacy: LegacyLeadDTO): NextLeadDTO {
  return {
    id: legacy.id,
    fullName: `${legacy.firstName} ${legacy.lastName}`,
    email: legacy.email,
    phone: legacy.phone || null,
    countryCode: legacy.country?.slice(0, 2).toUpperCase() || null,
    status: mapLegacyStatusToNext(legacy.status),
    source: legacy.source?.toLowerCase() || null,
    ownerName: legacy.assignedTo || null,
    createdAt: legacy.createdAt,
    notes: legacy.notes || null,
  }
}

// Transform NEXT lead to legacy format
function transformNextToLegacy(next: NextLeadDTO): LegacyLeadDTO {
  const [firstName, ...lastNameParts] = next.fullName.split(' ')
  return {
    id: next.id,
    firstName: firstName || '',
    lastName: lastNameParts.join(' ') || '',
    email: next.email,
    phone: next.phone || undefined,
    country: next.countryCode || undefined,
    source: next.source || undefined,
    status: mapNextStatusToLegacy(next.status),
    assignedTo: next.ownerName || undefined,
    createdAt: next.createdAt,
    updatedAt: next.createdAt,
    notes: next.notes || undefined,
  }
}

// Status mapping functions
function mapLegacyStatusToNext(legacyStatus: LegacyLeadDTO['status']): NextLeadDTO['status'] {
  const statusMap: Record<LegacyLeadDTO['status'], NextLeadDTO['status']> = {
    'NEW': 'new',
    'CONTACTED': 'qualified', 
    'QUALIFIED': 'qualified',
    'CONVERTED': 'renewal',
    'LOST': 'unqualified',
  }
  return statusMap[legacyStatus] || 'new'
}

function mapNextStatusToLegacy(nextStatus: NextLeadDTO['status']): LegacyLeadDTO['status'] {
  const statusMap: Record<NextLeadDTO['status'], LegacyLeadDTO['status']> = {
    'new': 'NEW',
    'qualified': 'QUALIFIED',
    'unqualified': 'LOST',
    'negotiation': 'QUALIFIED',
    'proposal': 'QUALIFIED', 
    'renewal': 'CONVERTED',
  }
  return statusMap[nextStatus] || 'NEW'
}

// In-memory store (will reset on page refresh)
let leads = [...leadsSeed]

// Helper function to get field value from lead object for facets
function getLeadFieldValue(lead: LegacyLeadDTO, field: string): any {
  // Helper functions for mock data
  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const randomDateWithinDays = (days: number): string => {
    const now = new Date()
    const past = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime())
    return new Date(randomTime).toISOString()
  }

  // Map fields to actual lead data properties or generate realistic mock data
  const fieldMap: Record<string, any> = {
    // Real fields from LeadDTO
    status: lead.status,
    source: lead.source,
    assignedTo: lead.assignedTo,
    country: lead.country,
    campaign: lead.campaign,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    notes: lead.notes,
    score: lead.score,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    
    // Extended fields with realistic mock data for CRM - ALIGNED WITH REAL COMPONENTS
    language: randomItem(['', 'arabic', 'english', 'french', 'spanish']), // From LanguageField.tsx
    paymentGateway: randomItem(['Checkout.com USD', 'PayPal EUR', 'Stripe AED']), // From paymentGatewaysSlice demo data
    accountType: randomItem(['micro-mini', 'mini', 'standard', 'gold', 'diamond', 'vip']), // Values from fieldkit options
    desk: randomItem(['Arabic Desk', 'English Desk', 'French Desk', 'Sales Desk A', 'Sales Desk B']),
    countryCode: lead.country?.slice(0, 2).toUpperCase() || randomItem(['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'CA', 'AU']),
    gender: randomItem(['Male', 'Female', 'Other']),
    citizen: randomItem(['Yes', 'No', 'InProcess']),
    salesManager: lead.assignedTo || randomItem(['Alice Johnson', 'Bob Wilson', 'Carol Smith', 'David Brown']),
    conversationOwner: lead.assignedTo || randomItem(['Alice Johnson', 'Bob Wilson', 'Carol Smith', 'David Brown']),
    leadStatus: randomItem(['New', 'Warm', 'Hot', 'Nurture', 'Qualified', 'Cold', 'Disqualified']),
    kycStatus: randomItem(['Approved', 'Pending', 'Declined']),
    platform: randomItem(['Web', 'Mobile', 'Desktop']),
    
    // Generated date fields for missing ones
    lastContactAt: randomDateWithinDays(30),
    lastLoginAt: randomDateWithinDays(15),
    followUpAt: randomDateWithinDays(7),
  }
  
  return fieldMap[field] || null
}

export const leadsHandlers = [
  // GET /leads - Legacy format for existing components
  http.get('/api/leads', ({ request }) => {
    const url = new URL(request.url)
    
    // Check if this is a NEXT API call (different response format)
    const isNextCall = url.searchParams.has('limit') || url.searchParams.has('sortBy')
    
    if (isNextCall) {
      // NEXT format response
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const search = url.searchParams.get('search') || ''
      const status = url.searchParams.get('status') || ''
      const source = url.searchParams.get('source') || ''
      const owner = url.searchParams.get('owner') || ''
      const sortBy = url.searchParams.get('sortBy') || 'createdAt'
      const sortOrder = url.searchParams.get('sortOrder') || 'desc'

      // Transform to NEXT format and filter
      let nextLeads = leads.map(transformLegacyToNext)

      if (search) {
        const searchLower = search.toLowerCase()
        nextLeads = nextLeads.filter(lead =>
          lead.fullName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.notes && lead.notes.toLowerCase().includes(searchLower))
        )
      }

      if (status) {
        nextLeads = nextLeads.filter(lead => lead.status === status)
      }

      if (source) {
        nextLeads = nextLeads.filter(lead => lead.source === source)
      }

      if (owner) {
        nextLeads = nextLeads.filter(lead => 
          lead.ownerName && lead.ownerName.toLowerCase().includes(owner.toLowerCase())
        )
      }

      // Sort
      nextLeads.sort((a, b) => {
        let valueA: any = a[sortBy as keyof NextLeadDTO]
        let valueB: any = b[sortBy as keyof NextLeadDTO]

        if (sortBy === 'createdAt') {
          valueA = new Date(valueA).getTime()
          valueB = new Date(valueB).getTime()
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase()
          valueB = valueB.toLowerCase()
        }

        if (sortOrder === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
        }
      })

      // Paginate
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedLeads = nextLeads.slice(startIndex, endIndex)

      return HttpResponse.json({
        leads: paginatedLeads,
        total: nextLeads.length,
        page,
        limit,
      })
    } else {
      // Legacy format response
      const query = parseQuery(url)
      const result = processQuery(leads, query)
      
      return HttpResponse.json({
        data: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / result.pageSize)
        }
      })
    }
  }),

  // GET /leads/:id
  http.get('/api/leads/:id', ({ params, request }) => {
    const { id } = params
    const lead = leads.find(l => l.id === id)
    
    if (!lead) {
      return new HttpResponse(null, { status: 404 })
    }
    
    // Check if NEXT format is requested
    const url = new URL(request.url)
    const isNextCall = url.searchParams.has('format') && url.searchParams.get('format') === 'next'
    
    if (isNextCall) {
      return HttpResponse.json(transformLegacyToNext(lead))
    } else {
      return HttpResponse.json(lead)
    }
  }),

  // POST /leads - Handle both legacy and NEXT formats
  http.post('/api/leads', async ({ request }) => {
    const body = await request.json() as any
    
    // Detect if this is a NEXT API call (has fullName instead of firstName/lastName)
    const isNextCall = 'fullName' in body
    
    if (isNextCall) {
      // NEXT format
      const nextData = body as CreateLeadRequest
      const newNextLead: NextLeadDTO = {
        id: generateId(),
        fullName: nextData.fullName,
        email: nextData.email,
        phone: nextData.phone || null,
        countryCode: nextData.countryCode || null,
        status: nextData.status || 'new',
        source: nextData.source || null,
        ownerName: nextData.ownerName || null,
        notes: nextData.notes || null,
        createdAt: new Date().toISOString(),
      }
      
      // Convert to legacy format for storage
      const legacyLead = transformNextToLegacy(newNextLead)
      leads.push(legacyLead)
      
      return HttpResponse.json(newNextLead, { status: 201 })
    } else {
      // Legacy format
      const newLead: LegacyLeadDTO = {
        id: generateId(),
        firstName: body.firstName || '',
        lastName: body.lastName || '',
        email: body.email || '',
        phone: body.phone,
        country: body.country,
        source: body.source,
        status: body.status || 'NEW',
        assignedTo: body.assignedTo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: body.notes,
        score: body.score || Math.floor(Math.random() * 100),
        campaign: body.campaign,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
      }
      
      leads.push(newLead)
      return HttpResponse.json(newLead, { status: 201 })
    }
  }),

  // PUT /leads/:id - NEXT format update
  http.put('/api/leads/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as UpdateLeadRequest
    
    const leadIndex = leads.findIndex(l => l.id === id)
    if (leadIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const existingLead = leads[leadIndex]
    const currentNext = transformLegacyToNext(existingLead)
    
    // Apply updates to NEXT format
    const updatedNext: NextLeadDTO = {
      ...currentNext,
      ...body,
    }
    
    // Convert back to legacy format for storage
    const updatedLegacy = transformNextToLegacy(updatedNext)
    leads[leadIndex] = updatedLegacy
    
    return HttpResponse.json(updatedNext)
  }),

  // PATCH /leads/:id - Legacy format update
  http.patch('/api/leads/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json() as Partial<LegacyLeadDTO>
    
    const leadIndex = leads.findIndex(l => l.id === id)
    if (leadIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    leads[leadIndex] = { 
      ...leads[leadIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return HttpResponse.json(leads[leadIndex])
  }),

  // DELETE /leads/:id
  http.delete('/api/leads/:id', ({ params }) => {
    const { id } = params
    const leadIndex = leads.findIndex(l => l.id === id)
    
    if (leadIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    leads.splice(leadIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /leads/facets - Get distinct values for specified fields
  http.get('/api/leads/facets', ({ request }) => {
    const url = new URL(request.url)
    const fieldsParam = url.searchParams.get('fields')
    const filtersParam = url.searchParams.get('filters')
    const searchParam = url.searchParams.get('search')
    
    if (!fieldsParam) {
      return HttpResponse.json({})
    }
    
    const fields = fieldsParam.split(',').map(f => f.trim())
    const filters = filtersParam ? JSON.parse(filtersParam) : []
    const search = searchParam || ''
    
    // Apply current filters to get filtered dataset
    let filteredLeads = leads
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLeads = filteredLeads.filter(lead => 
        lead.firstName?.toLowerCase().includes(searchLower) ||
        lead.lastName?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply filters (simplified for mock)
    filters.forEach((filter: any) => {
      if (filter.field && filter.value) {
        filteredLeads = filteredLeads.filter(lead => {
          const fieldValue = getLeadFieldValue(lead, filter.field)
          if (filter.op === 'equals') {
            return fieldValue === filter.value
          } else if (filter.op === 'in') {
            return Array.isArray(filter.value) && filter.value.includes(fieldValue)
          } else if (filter.op === 'contains') {
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase())
          }
          return true
        })
      }
    })
    
    // Generate facets for requested fields
    const facets: Record<string, string[]> = {}
    
    fields.forEach(field => {
      const values = new Set<string>()
      
      filteredLeads.forEach(lead => {
        const value = getLeadFieldValue(lead, field)
        if (value !== null && value !== undefined && value !== '') {
          values.add(String(value))
        }
      })
      
      facets[field] = Array.from(values).sort()
    })
    
    return HttpResponse.json(facets)
  }),

  // POST /leads/import - NEXT format import
  http.post('/api/leads/import', async ({ request }) => {
    // For now, simulate successful import
    const imported = Math.floor(Math.random() * 50) + 10
    const errors: string[] = []
    
    // Simulate some import errors
    if (Math.random() > 0.7) {
      errors.push("Row 5: Invalid email format")
      errors.push("Row 12: Missing required field 'fullName'")
    }

    return HttpResponse.json({
      imported,
      errors,
    })
  }),

  // POST /leads/:id/convert
  http.post('/api/leads/:id/convert', ({ params }) => {
    const { id } = params
    const leadIndex = leads.findIndex(l => l.id === id)
    
    if (leadIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    leads[leadIndex] = {
      ...leads[leadIndex],
      status: 'CONVERTED',
      updatedAt: new Date().toISOString(),
      notes: (leads[leadIndex].notes || '') + '\nLead converted to client'
    }
    
    return HttpResponse.json(leads[leadIndex])
  }),

  // POST /leads/:id/assign
  http.post('/api/leads/:id/assign', async ({ params, request }) => {
    const { id } = params
    const { assignedTo } = await request.json() as { assignedTo: string }
    
    const leadIndex = leads.findIndex(l => l.id === id)
    if (leadIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    leads[leadIndex] = {
      ...leads[leadIndex],
      assignedTo,
      updatedAt: new Date().toISOString()
    }
    
    return HttpResponse.json(leads[leadIndex])
  }),
]