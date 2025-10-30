import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { conversationOwnerFields } from '@/config/fields'
import { FieldRenderer } from '@/fieldkit/FieldRenderer'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Badge,
  IconButton,
  InputAdornment,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import { cn } from '@/lib/utils'

// Agent type definition
export interface Agent {
  id: string
  name: string
  avatarUrl?: string
  online: boolean
  email?: string
  team?: string
  role?: string
  workload?: string
}

// Component props
interface ConversationOwnerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  currentOwnerId?: string | null
  onAssigned?: (owner: { id: string; name: string } | null) => void
}

// Enhanced agents selector with dynamic data
const selectAgents = (state: RootState): Agent[] => {
  // Mock data with enhanced properties for dynamic fields
  return [
    { 
      id: '1', 
      name: 'John Smith', 
      avatarUrl: '/avatars/john.jpg', 
      online: true, 
      email: 'john.smith@company.com',
      team: 'sales',
      role: 'senior_agent',
      workload: 'medium'
    },
    { 
      id: '2', 
      name: 'Sarah Johnson', 
      avatarUrl: '/avatars/sarah.jpg', 
      online: false, 
      email: 'sarah.johnson@company.com',
      team: 'retention',
      role: 'team_lead',
      workload: 'heavy'
    },
    { 
      id: '3', 
      name: 'Mike Williams', 
      avatarUrl: '/avatars/mike.jpg', 
      online: true, 
      email: 'mike.williams@company.com',
      team: 'support',
      role: 'junior_agent',
      workload: 'light'
    },
    { 
      id: '4', 
      name: 'Emma Davis', 
      avatarUrl: '/avatars/emma.jpg', 
      online: true, 
      email: 'emma.davis@company.com',
      team: 'vip',
      role: 'specialist',
      workload: 'medium'
    },
    { 
      id: '5', 
      name: 'David Brown', 
      avatarUrl: '/avatars/david.jpg', 
      online: false, 
      email: 'david.brown@company.com',
      team: 'sales',
      role: 'manager',
      workload: 'full'
    }
  ]
}

export default function ConversationOwnerDrawer({
  open,
  onOpenChange,
  clientId,
  currentOwnerId,
  onAssigned,
}: ConversationOwnerDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const agents = useSelector(selectAgents)
  const client = useSelector(selectEntityById(clientId))
  
  // Search state
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  
  // Debounce search query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(timer)
  }, [query])
  
  // Filter agents based on debounced search
  const filteredAgents = useMemo(() => {
    const searchTerm = debounced.trim().toLowerCase()
    if (!searchTerm) return agents
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.email?.toLowerCase().includes(searchTerm) ||
      agent.team?.toLowerCase().includes(searchTerm)
    )
  }, [agents, debounced])
  
  // Get current owner ID from props or client data
  const ownerId = currentOwnerId ?? client?.conversationOwnerId ?? null
  const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null
  
  // Handle dynamic field changes
  const handleFieldChange = (fieldKey: string, value: any) => {
    dispatch(updateEntityField({ 
      id: clientId, 
      key: fieldKey, 
      value 
    }))
  }
  
  // Assign conversation owner with all dynamic field data
  const handleAssign = (agent: Agent) => {
    // Update main owner fields
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwnerId', 
      value: agent.id 
    }))
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwner', 
      value: agent.name 
    }))
    
    // Update dynamic fields with agent data
    if (agent.email) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'conversationOwnerEmail', 
        value: agent.email 
      }))
    }
    if (agent.team) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'conversationOwnerTeam', 
        value: agent.team 
      }))
    }
    if (agent.role) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'conversationOwnerRole', 
        value: agent.role 
      }))
    }
    if (agent.workload) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'conversationOwnerWorkload', 
        value: agent.workload 
      }))
    }
    
    // Set assignment timestamp
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwnerAssignedAt', 
      value: new Date().toISOString() 
    }))
    
    // Set status to active
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwnerStatus', 
      value: 'active' 
    }))
    
    onAssigned?.({ id: agent.id, name: agent.name })
    onOpenChange(false)
  }
  
  // Remove conversation owner
  const handleRemove = () => {
    // Determine if this is a new lead or existing lead with owner
    const isNewLead = !client?.conversationOwner || client.conversationOwner === 'Unassigned'
    const newValue = isNewLead ? 'Unassigned' : 'CO Removed'
    
    // Clear main owner fields
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwnerId', 
      value: null 
    }))
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'conversationOwner', 
      value: newValue 
    }))
    
    // Clear all related dynamic fields
    conversationOwnerFields.forEach(field => {
      if (field.key !== 'conversationOwnerAssignedAt') {
        dispatch(updateEntityField({ 
          id: clientId, 
          key: field.key, 
          value: null 
        }))
      }
    })
    
    onAssigned?.(null)
    onOpenChange(false)
  }
  
  // Check if current owner exists (for Remove button state)
  const hasOwner = ownerId && client?.conversationOwner !== 'CO Removed'
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onOpenChange(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: '29.13vw', lg: '27.05vw', xl: '24.97vw' },
          maxWidth: 'none'
        }
      }}
    >
      <Box className="flex flex-col h-full bg-white">
        {/* Header */}
        <Box className="bg-white border-b border-gray-200 px-6 py-6 flex justify-between items-center">
          <Typography 
            variant="h4" 
            className="text-2xl font-light text-gray-800"
            sx={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Conversation Owner
          </Typography>
          <IconButton 
            onClick={() => onOpenChange(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box className="px-6 py-4">
            {/* Search Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Search Agents
              </Typography>
              <TextField
                fullWidth
                placeholder="Search agents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9fafb',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9ca3af',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#263238',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.875rem',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            {/* Available Agents */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Available Agents ({filteredAgents.length})
              </Typography>
              <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {filteredAgents.map((agent) => {
                  const isCurrent = agent.id === ownerId
                  return (
                    <Box
                      key={agent.id}
                      onClick={() => handleAssign(agent)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        mb: 1,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        backgroundColor: isCurrent ? '#dbeafe' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isCurrent ? '#dbeafe' : '#f9fafb',
                          borderColor: '#d1d5db',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <Avatar 
                        src={agent.avatarUrl}
                        sx={{ width: 32, height: 32, fontSize: '0.75rem', mr: 3 }}
                      >
                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      
                      <Box className="flex-1 min-w-0">
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          {agent.name}
                        </Typography>
                      </Box>

                      <Box className="flex items-center gap-2">
                        <Badge
                          color={agent.online ? "success" : "default"}
                          variant="dot"
                        />
                        <Typography variant="caption" sx={{ 
                          color: agent.online ? '#10b981' : '#6b7280',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {agent.online ? "Online" : "Offline"}
                        </Typography>
                        
                        {isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            sx={{ 
                              ml: 2,
                              height: '20px',
                              fontSize: '0.75rem',
                              backgroundColor: '#3b82f6',
                              color: '#ffffff',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
              {filteredAgents.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: '3rem', mb: 2, color: '#d1d5db' }} />
                  <Typography variant="body2" sx={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
                    {debounced ? 'No agents match your search' : 'No agents available'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: 2, 
          p: 3, 
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff' 
        }}>
          <Button 
            variant="contained"
            onClick={handleRemove}
            disabled={!hasOwner}
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.8125rem',
              px: 3,
              py: 1,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#dc2626',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              '&:disabled': {
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
                boxShadow: 'none',
              }
            }}
          >
            Remove Conversation Owner
          </Button>
          <Button 
            variant="outlined"
            onClick={() => onOpenChange(false)}
            sx={{
              borderColor: '#e5e7eb',
              color: '#6b7280',
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.8125rem',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: '#f8fafc',
                color: '#374151'
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}