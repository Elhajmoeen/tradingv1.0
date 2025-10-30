import type { RootState } from '@/state/store'

export interface Agent {
  id: string
  name: string
  avatarUrl?: string
  online: boolean
  email?: string
  team?: string
  role?: string
  workload?: string
  tier?: string
}

// Shared retention agents selector
export const selectRetentionAgents = (state: RootState): Agent[] => {
  // Mock data with enhanced properties for retention-specific dynamic fields
  return [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      avatarUrl: '/avatars/sarah.jpg', 
      online: true, 
      email: 'sarah.johnson@company.com',
      team: 'retention_a',
      role: 'senior_retention_agent',
      workload: 'medium',
      tier: 'A'
    },
    { 
      id: '2', 
      name: 'Mike Williams', 
      avatarUrl: '/avatars/mike.jpg', 
      online: false, 
      email: 'mike.williams@company.com',
      team: 'vip_retention',
      role: 'vip_specialist',
      workload: 'light',
      tier: 'A'
    },
    { 
      id: '3', 
      name: 'Emma Davis', 
      avatarUrl: '/avatars/emma.jpg', 
      online: true, 
      email: 'emma.davis@company.com',
      team: 'retention_b',
      role: 'retention_team_lead',
      workload: 'heavy',
      tier: 'B'
    },
    { 
      id: '4', 
      name: 'David Brown', 
      avatarUrl: '/avatars/david.jpg', 
      online: true, 
      email: 'david.brown@company.com',
      team: 'senior_retention',
      role: 'retention_manager',
      workload: 'full',
      tier: 'A'
    },
    { 
      id: '5', 
      name: 'Lisa Wilson', 
      avatarUrl: '/avatars/lisa.jpg', 
      online: false, 
      email: 'lisa.wilson@company.com',
      team: 'junior_retention',
      role: 'junior_retention_agent',
      workload: 'light',
      tier: 'C'
    }
  ]
}