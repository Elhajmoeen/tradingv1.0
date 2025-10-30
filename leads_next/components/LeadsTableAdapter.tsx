import React, { useMemo } from "react"
import { isLeadsNextEnabled } from "@/lib/flags"
import { useGetLeadsQuery } from "../state/leadsApi"
import { LeadsTable as LegacyLeadsTable } from "@/components/LeadsTable"
import type { LeadDTO } from "../types/lead"
import type { Entity } from "@/state/entitiesSlice"

interface LeadsTableAdapterProps {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: string
  owner?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onRowClick?: (lead: Entity) => void
  visibleColumns?: Record<string, boolean>
  columnOrder?: string[]
  customDocuments?: Array<{id: string, label: string}>
}

// Transform NEXT lead format to legacy Entity format
function transformLeadToEntity(lead: LeadDTO): Entity {
  return {
    id: lead.id,
    type: 'lead' as const,
    createdAt: lead.createdAt,
    
    // Map lead fields to Entity fields
    name: lead.fullName,
    email: lead.email,
    phoneNumber: lead.phone || undefined,
    phone: lead.phone && lead.countryCode ? {
      countryCode: lead.countryCode,
      number: lead.phone,
    } : undefined,
    country: lead.countryCode || undefined,
    leadStatus: lead.status, // Use leadStatus instead of status
    source: lead.source || undefined,
    salesManager: lead.ownerName || undefined,
    notes: lead.notes || undefined,
  }
}

export const LeadsTableAdapter: React.FC<LeadsTableAdapterProps> = ({
  page = 1,
  limit = 50,
  search,
  status,
  source,
  owner,
  sortBy,
  sortOrder,
  onRowClick,
  visibleColumns,
  columnOrder,
  customDocuments,
}) => {
  const shouldUseNext = isLeadsNextEnabled()

  // NEXT implementation
  const {
    data: nextLeadsData,
    isLoading: nextIsLoading,
    error: nextError,
  } = useGetLeadsQuery(
    {
      page,
      limit,
      search,
      status,
      source,
      owner,
      sortBy,
      sortOrder,
    },
    { skip: !shouldUseNext }
  )

  // Transform NEXT data to legacy Entity format
  const transformedLeads = useMemo(() => {
    if (!shouldUseNext || !nextLeadsData) return []
    
    return nextLeadsData.leads.map(transformLeadToEntity)
  }, [shouldUseNext, nextLeadsData])

  // Use NEXT data if enabled
  if (shouldUseNext) {
    return (
      <LegacyLeadsTable
        rows={transformedLeads}
        onRowClick={onRowClick}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        customDocuments={customDocuments}
      />
    )
  }

  // Fallback to legacy implementation
  return (
    <LegacyLeadsTable
      rows={[]}
      onRowClick={onRowClick}
      visibleColumns={visibleColumns}
      columnOrder={columnOrder}
      customDocuments={customDocuments}
    />
  )
}