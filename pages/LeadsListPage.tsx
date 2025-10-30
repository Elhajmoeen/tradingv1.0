import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectEntitiesByType } from '@/state/entitiesSlice'
import { EntityTable } from '@/components/EntityTable'
import { tableColumnKeys } from '@/config/fields'

export default function LeadsListPage() {
  const navigate = useNavigate()
  const leads = useSelector(selectEntitiesByType('lead'))

  // Ensure all tableColumnKeys exist in each row (fallback to empty string)
  const rows = leads.map(lead => {
    const row: any = { ...lead }
    tableColumnKeys.forEach(key => {
      if (key.includes('.')) {
        // Handle nested keys like 'mkt.campaignId'
        const keys = key.split('.')
        let nested = row
        for (let i = 0; i < keys.length - 1; i++) {
          if (!nested[keys[i]]) {
            nested[keys[i]] = {}
          }
          nested = nested[keys[i]]
        }
        if (!nested[keys[keys.length - 1]]) {
          nested[keys[keys.length - 1]] = ''
        }
      } else {
        if (!row[key]) {
          row[key] = ''
        }
      }
    })
    return row
  })

  const handleRowClick = (row: any) => {
    navigate(`/clients/${row.id}`)
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
          <p className="text-muted-foreground">
            Manage your potential clients and track their progress
          </p>
        </div>

        <EntityTable rows={rows} onRowClick={handleRowClick} />
      </div>
    </div>
  )
}