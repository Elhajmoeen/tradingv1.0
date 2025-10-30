import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { selectEntityById, updateEntityField } from '@/state/entitiesSlice'
import { retentionOwnerFields } from '@/config/fields'
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
import { selectRetentionAgents, type Agent } from '@/state/retentionSelectors'

// Re-export Agent type for backward compatibility
export type { Agent }

// Component props
interface RetentionOwnerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  currentOwnerId?: string | null
  onAssigned?: (owner: { id: string; name: string } | null) => void
}

export default function RetentionOwnerDrawer({
  open,
  onOpenChange,
  clientId,
  currentOwnerId,
  onAssigned,
}: RetentionOwnerDrawerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const agents = useSelector(selectRetentionAgents)
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
      agent.team?.toLowerCase().includes(searchTerm) ||
      agent.tier?.toLowerCase().includes(searchTerm)
    )
  }, [agents, debounced])
  
  // Get current owner ID from props or client data
  const ownerId = currentOwnerId ?? client?.retentionOwnerId ?? null
  const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null
  
  // Handle dynamic field changes
  const handleFieldChange = (fieldKey: string, value: any) => {
    dispatch(updateEntityField({ 
      id: clientId, 
      key: fieldKey, 
      value 
    }))
  }
  
  // Assign retention owner with all dynamic field data
  const handleAssign = (agent: Agent) => {
    // Update main owner fields
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwnerId', 
      value: agent.id 
    }))
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwner', 
      value: agent.name 
    }))
    
    // Update dynamic fields with agent data
    if (agent.email) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'retentionOwnerEmail', 
        value: agent.email 
      }))
    }
    if (agent.team) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'retentionOwnerTeam', 
        value: agent.team 
      }))
    }
    if (agent.role) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'retentionOwnerRole', 
        value: agent.role 
      }))
    }
    if (agent.workload) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'retentionOwnerWorkload', 
        value: agent.workload 
      }))
    }
    if (agent.tier) {
      dispatch(updateEntityField({ 
        id: clientId, 
        key: 'retentionOwnerTier', 
        value: agent.tier 
      }))
    }
    
    // Set assignment timestamp
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwnerAssignedAt', 
      value: new Date().toISOString() 
    }))
    
    // Set status to active
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwnerStatus', 
      value: 'active' 
    }))
    
    onAssigned?.({ id: agent.id, name: agent.name })
    onOpenChange(false)
  }
  
  // Remove retention owner
  const handleRemove = () => {
    // Determine if this is a new lead or existing lead with owner
    const isNewLead = !client?.retentionOwner || client.retentionOwner === 'Unassigned'
    const newValue = isNewLead ? 'Unassigned' : 'RO Removed'
    
    // Clear main owner fields
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwnerId', 
      value: null 
    }))
    dispatch(updateEntityField({ 
      id: clientId, 
      key: 'retentionOwner', 
      value: newValue 
    }))
    
    // Clear all related dynamic fields
    retentionOwnerFields.forEach(field => {
      if (field.key !== 'retentionOwnerAssignedAt') {
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
  const hasOwner = ownerId && client?.retentionOwner !== 'RO Removed'
  
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
            Retention Owner
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
                Search Retention Agents
              </Typography>
              <TextField
                fullWidth
                placeholder="Search retention agents..."
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

            {/* Available Retention Agents */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#374151', fontFamily: 'Poppins, sans-serif' }}>
                Available Retention Agents ({filteredAgents.length})
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
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '0.75rem'
                        }}>
                          Tier {agent.tier}
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
                    {debounced ? 'No retention agents match your search' : 'No retention agents available'}
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
            Remove Retention Owner
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