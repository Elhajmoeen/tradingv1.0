import { Rule } from '@/types/filter'

// Predefined filter presets for common use cases
export const FILTER_PRESETS: Array<{
  label: string
  description: string
  rules: Rule[]
}> = [
  {
    label: 'New Leads (Last 7 days)',
    description: 'Leads created in the past 7 days',
    rules: [
      {
        columnId: 'createdAt',
        operator: 'after',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
  },
  {
    label: 'Hot Leads',
    description: 'Leads with New or Hot status',
    rules: [
      {
        columnId: 'leadStatus',
        operator: 'equals',
        value: 'Hot'
      }
    ]
  },
  {
    label: 'Leads with FTD',
    description: 'Leads that have made their first deposit',
    rules: [
      {
        columnId: 'ftd',
        operator: 'gt',
        value: 0
      }
    ]
  },
  {
    label: 'Uncontacted Leads',
    description: 'Leads that have never been contacted',
    rules: [
      {
        columnId: 'lastContactAt',
        operator: 'isEmpty'
      }
    ]
  },
  {
    label: 'VIP Leads (High FTD)',
    description: 'Leads with FTD above $1000',
    rules: [
      {
        columnId: 'ftd',
        operator: 'gt',
        value: 1000
      }
    ]
  },
  {
    label: 'Recent Active Leads',
    description: 'Leads active in the last 30 days',
    rules: [
      {
        columnId: 'lastActivityAt',
        operator: 'after',
        value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
  }
]