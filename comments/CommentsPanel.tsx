import React, { useState, useEffect } from 'react'
import { 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Avatar, 
  Typography, 
  Box,
  Snackbar,
  Alert,
  Paper,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material'
import { Send, Schedule, Person, FiberManualRecord } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { 
  postCommentAndUpdateEntity, 
  selectCommentsByEntityId, 
  selectCommentsLoading 
} from './commentsSlice'
import { LEAD_STATUS, type LeadStatus } from '@/config/leadStatus'

interface CommentsPanelProps {
  entityId: string
  entityType: 'lead' | 'client'
  onClose?: () => void
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  entityId,
  entityType,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const comments = useSelector((state: RootState) => selectCommentsByEntityId(state, entityId))
  const loading = useSelector(selectCommentsLoading)

  const [commentText, setCommentText] = useState('')
  const [applyStatus, setApplyStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('New')
  const [showComposer, setShowComposer] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setCommentText(value)
    if (value.trim() && !showComposer) {
      setShowComposer(true)
    } else if (!value.trim() && showComposer) {
      setShowComposer(false)
      setApplyStatus(false)
    }
  }

  const handlePost = async () => {
    if (!commentText.trim()) return
    if (applyStatus && !selectedStatus) return

    try {
      await dispatch(postCommentAndUpdateEntity({
        entityId,
        text: commentText.trim(),
        statusApplied: applyStatus ? selectedStatus : undefined
      })).unwrap()

      // Reset form
      setCommentText('')
      setApplyStatus(false)
      setShowComposer(false)
      setShowSuccess(true)
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  const handleCancel = () => {
    setCommentText('')
    setApplyStatus(false)
    setShowComposer(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handlePost()
    }
  }

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Box className="h-full flex flex-col" sx={{ backgroundColor: '#ffffff' }}>
      {/* Comment Composer Card */}
      <Paper 
        elevation={0}
        sx={{ 
          margin: '16px',
          marginBottom: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}
      >
        <Box className="p-6">
          <Box className="flex items-center gap-4 mb-4">
            <Avatar
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: '#64748b',
                fontSize: '1rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 600,
                color: 'white'
              }}
            >
              CU
            </Avatar>
            <Box>
              <Typography 
                sx={{ 
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: '#1e293b'
                }}
              >
                Add Comment
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Share updates and notes about this {entityType}
              </Typography>
            </Box>
          </Box>

          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Write a comment..."
            value={commentText}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            aria-label="Write a comment"
            sx={{
              marginBottom: '16px',
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: '#d1d5db'
                },
                '&:hover fieldset': {
                  borderColor: '#9ca3af'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6'
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: '12px 14px',
                lineHeight: 1.5
              }
            }}
          />

          {/* Expanded controls when typing */}
          {showComposer && (
            <Box className="mt-4 space-y-4">
              <Divider />
              
              <Box className="flex items-center justify-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={applyStatus}
                      onChange={(e) => setApplyStatus(e.target.checked)}
                      size="small"
                      sx={{
                        '&.Mui-checked': {
                          color: '#3b82f6'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'Poppins, sans-serif',
                      color: '#374151',
                      fontWeight: 500
                    }}>
                      Update lead status
                    </Typography>
                  }
                />

                {applyStatus && (
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                      displayEmpty
                      sx={{
                        fontSize: '0.875rem',
                        fontFamily: 'Poppins, sans-serif',
                        height: '36px',
                        backgroundColor: '#f9fafb',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb'
                        }
                      }}
                    >
                      {LEAD_STATUS.map((status) => (
                        <MenuItem 
                          key={status} 
                          value={status}
                          sx={{ 
                            fontSize: '0.875rem',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              <Box className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{
                    fontSize: '0.875rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textTransform: 'none',
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    height: '36px',
                    borderRadius: '6px',
                    paddingX: '16px',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePost}
                  disabled={!commentText.trim() || (applyStatus && !selectedStatus) || loading}
                  startIcon={<Send fontSize="small" />}
                  sx={{
                    fontSize: '0.875rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textTransform: 'none',
                    backgroundColor: '#3b82f6',
                    height: '36px',
                    borderRadius: '6px',
                    paddingX: '20px',
                    '&:hover': {
                      backgroundColor: '#2563eb'
                    },
                    '&:disabled': {
                      backgroundColor: '#e5e7eb',
                      color: '#9ca3af'
                    }
                  }}
                >
                  Post Comment
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Comments List */}
      <Box className="flex-1 overflow-y-auto px-4 pb-4">
        {comments.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center'
            }}
          >
            <Box 
              sx={{
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <FiberManualRecord sx={{ color: '#d1d5db', fontSize: '24px' }} />
            </Box>
            <Typography 
              sx={{ 
                color: '#6b7280',
                fontSize: '0.875rem',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                marginBottom: '8px'
              }}
            >
              No comments yet
            </Typography>
            <Typography 
              sx={{ 
                color: '#9ca3af',
                fontSize: '0.75rem',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Start the conversation by adding the first comment
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {comments.map((comment, index) => (
              <Card 
                key={comment.id}
                elevation={0}
                sx={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <CardContent sx={{ padding: '16px', '&:last-child': { paddingBottom: '16px' } }}>
                  <Box className="flex gap-3">
                    <Avatar
                      sx={{ 
                        width: 40, 
                        height: 40,
                        backgroundColor: '#3b82f6',
                        fontSize: '0.875rem',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 600
                      }}
                    >
                      {getInitials(comment.authorName)}
                    </Avatar>
                    <Box className="flex-1 min-w-0">
                      <Box className="flex items-center gap-2 mb-2">
                        <Typography 
                          sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            color: '#1f2937'
                          }}
                        >
                          {comment.authorName}
                        </Typography>
                        <Box className="flex items-center gap-1 text-gray-500">
                          <Schedule sx={{ fontSize: '14px' }} />
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}
                            title={new Date(comment.createdAt).toLocaleString()}
                          >
                            {formatRelativeTime(comment.createdAt)}
                          </Typography>
                        </Box>
                        {comment.statusApplied && (
                          <Chip
                            label={`Status: ${comment.statusApplied}`}
                            size="small"
                            sx={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              height: '24px',
                              borderRadius: '6px',
                              border: '1px solid #dbeafe'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        sx={{ 
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {comment.text}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.875rem',
            backgroundColor: '#059669',
            '& .MuiAlert-icon': {
              fontSize: '20px'
            }
          }}
        >
          Comment posted successfully
        </Alert>
      </Snackbar>
    </Box>
  )
}