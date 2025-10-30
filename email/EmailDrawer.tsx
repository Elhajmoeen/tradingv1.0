import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Chip,
  Divider,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Paper,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Avatar
} from '@mui/material'
import { 
  Send as SendIcon,
  AttachFile,
  Delete,
  MoreVert,
  Close,
  ExpandMore,
  Save,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link,
  Image as ImageIcon,
  AttachMoney,
  Email as EmailIcon,
  Person
} from '@mui/icons-material'
import { RootState } from '@/state/store'
import { 
  upsertDraft, 
  deleteDraft, 
  sendDraft,
  updateDraftField,
  selectEmailAccounts,
  selectDraftById 
} from './emailSlice'
import { selectActiveEmailTemplates } from '@/state/emailTemplatesSlice'
import { selectEntityById } from '@/state/entitiesSlice'
import { Draft } from './types'

interface EmailDrawerComponentProps {
  open: boolean;
  onClose: () => void;
  entityContext?: {
    id: string;
    type: 'lead' | 'client';
  };
  draftId?: string | null;
}

const EmailDrawer: React.FC<EmailDrawerComponentProps> = ({ 
  open, 
  onClose, 
  entityContext, 
  draftId = null 
}) => {
  const dispatch = useDispatch()
  const entity = useSelector((state: RootState) => 
    entityContext ? selectEntityById(entityContext.id)(state) : null
  )
  const existingDraft = useSelector((state: RootState) => 
    draftId ? selectDraftById(draftId)(state) : null
  )
  const templates = useSelector(selectActiveEmailTemplates)
  const accounts = useSelector(selectEmailAccounts)
  
  // Form state
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)
  
  // Load existing draft or initialize new one
  useEffect(() => {
    if (existingDraft) {
      setTo(existingDraft.to.join(', '))
      setCc(existingDraft.cc?.join(', ') || '')
      setBcc(existingDraft.bcc?.join(', ') || '')
      setSubject(existingDraft.subject)
      setBody(existingDraft.bodyHtml)
      setSelectedAccount(existingDraft.settings?.fromEmail || '')
      setCurrentDraft(existingDraft)
    } else if (entityContext && open && Array.isArray(accounts)) {
      // Auto-populate recipient from entity
      const email = entity?.email || ''
      setTo(email)
      setSubject('')
      setBody('')
      
      // Create new draft
      const newDraftData: Draft = {
        id: `draft_${Date.now()}`,
        entityId: entityContext.id,
        to: email ? [email] : [],
        cc: [],
        bcc: [],
        subject: '',
        bodyHtml: '',
        attachments: [],
        settings: {
          fromEmail: accounts[0]?.fromEmail || '',
          accountId: accounts[0]?.id || '',
          trackOpens: true,
          trackClicks: true
        },
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      dispatch(upsertDraft(newDraftData))
      setCurrentDraft(newDraftData)
    }
  }, [existingDraft, entityContext, entity, open, accounts, dispatch])

  // Auto-populate from entity context
  useEffect(() => {
    if (entity && to === '') {
      setTo(entity.email || '')
    }
  }, [entity, to])

  // Set default account
  useEffect(() => {
    if (Array.isArray(accounts) && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].fromEmail)
    }
  }, [accounts, selectedAccount])

  // Apply template
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      let processedSubject = template.subject || ''
      let processedBody = template.bodyHtml || ''
      
      // Replace variables with entity data
      if (entity) {
        const replacements = {
          '{{client.name}}': `${entity.firstName || ''} ${entity.lastName || ''}`.trim(),
          '{{client.firstName}}': entity.firstName || '',
          '{{client.lastName}}': entity.lastName || '',
          '{{client.email}}': entity.email || '',
          '{{client.phone}}': entity.phone || '',
          '{{account.id}}': entity.id || '',
          // Legacy format support
          '{firstName}': entity.firstName || '',
          '{lastName}': entity.lastName || '',
          '{fullName}': `${entity.firstName || ''} ${entity.lastName || ''}`.trim(),
          '{email}': entity.email || '',
          '{phone}': entity.phone || ''
        }
        
        Object.entries(replacements).forEach(([variable, value]) => {
          processedSubject = processedSubject.replace(new RegExp(escapeRegExp(variable), 'g'), String(value))
          processedBody = processedBody.replace(new RegExp(escapeRegExp(variable), 'g'), String(value))
        })
      }
      
      setSubject(processedSubject)
      setBody(processedBody)
    }
    setSelectedTemplate('')
  }
  
  // Helper function to escape regex special characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Save draft
  const handleSaveDraft = () => {
    if (!currentDraft) return
    
    const updatedDraft: Draft = {
      ...currentDraft,
      to: to.split(',').map(email => email.trim()).filter(Boolean),
      cc: cc.split(',').map(email => email.trim()).filter(Boolean),
      bcc: bcc.split(',').map(email => email.trim()).filter(Boolean),
      subject,
      bodyHtml: body,
      settings: {
        ...currentDraft.settings,
        fromEmail: selectedAccount
      },
      updatedAt: new Date().toISOString()
    }
    
    dispatch(upsertDraft(updatedDraft))
    setCurrentDraft(updatedDraft)
  }

  // Send email
  const handleSend = () => {
    if (!currentDraft) return
    
    const finalDraft: Draft = {
      ...currentDraft,
      to: to.split(',').map(email => email.trim()).filter(Boolean),
      cc: cc.split(',').map(email => email.trim()).filter(Boolean),
      bcc: bcc.split(',').map(email => email.trim()).filter(Boolean),
      subject,
      bodyHtml: body,
      settings: {
        ...currentDraft.settings,
        fromEmail: selectedAccount
      },
      updatedAt: new Date().toISOString()
    }
    
    dispatch(upsertDraft(finalDraft))
    dispatch(sendDraft(currentDraft.id) as any)
    onClose()
  }

  // Delete draft
  const handleDelete = () => {
    if (currentDraft) {
      dispatch(deleteDraft(currentDraft.id))
    }
    onClose()
  }

  // Handle close
  const handleClose = () => {
    // Auto-save before closing
    if (currentDraft && (to || subject || body)) {
      handleSaveDraft()
    }
    onClose()
  }

  // File attachment
  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: '600px', lg: '680px', xl: '720px' },
          maxWidth: 'none',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.2)'
        }
      }}
    >
      {/* Gmail-like Header */}
      <Box sx={{ 
        backgroundColor: '#f6f8fc', 
        borderBottom: '1px solid #e8eaed',
        px: 3, 
        py: 2.5,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#3c4043', 
            fontWeight: 400,
            fontSize: '1.375rem',
            fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
          }}
        >
          New Message
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            sx={{ color: '#5f6368', '&:hover': { backgroundColor: '#f1f3f4' } }}
          >
            <ExpandMore />
          </IconButton>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{ color: '#5f6368', '&:hover': { backgroundColor: '#f1f3f4' } }}
          >
            <Close />
          </IconButton>
        </Stack>
      </Box>

      {/* Gmail-like Content */}
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Entity Context */}
        {entity && (
          <Box sx={{ 
            px: 3, 
            py: 2, 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e8eaed' 
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#1a73e8', 
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                {(entity.firstName?.[0] || '') + (entity.lastName?.[0] || '')}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500, 
                  color: '#3c4043',
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
                }}>
                  {entity.firstName} {entity.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5f6368' }}>
                  {entity.email}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Gmail-like Form */}
        <Box sx={{ flex: 1, px: 3, py: 2, display: 'flex', flexDirection: 'column' }}>
          {/* From & Template Selection */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ 
                mb: 1, 
                color: '#3c4043', 
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
              }}>
                From
              </Typography>
              <TextField
                fullWidth
                select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#5f6368', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dadce0',
                      },
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a73e8',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dadce0',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 12px',
                  },
                }}
              >
                {Array.isArray(accounts) && accounts.map((account) => (
                  <MenuItem key={account.id} value={account.fromEmail}>
                    {account.label} ({account.fromEmail})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ 
                mb: 1, 
                color: '#3c4043', 
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
              }}>
                Template
              </Typography>
              <TextField
                fullWidth
                select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                size="small"
                placeholder="Choose template..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dadce0',
                      },
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a73e8',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dadce0',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px 12px',
                  },
                }}
              >
                <MenuItem value="">
                  <em style={{ color: '#5f6368' }}>No template</em>
                </MenuItem>
                {Array.isArray(templates) && templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>

          {/* Recipients */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ 
                color: '#3c4043', 
                fontWeight: 500,
                fontSize: '0.875rem',
                minWidth: 40,
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
              }}>
                To
              </Typography>
              <TextField
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipients"
                variant="outlined"
                size="small"
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#5f6368', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dadce0',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a73e8',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '12px 16px',
                    '&::placeholder': {
                      color: '#5f6368',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Stack>
          </Box>
          
          {showCcBcc && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ 
                  color: '#3c4043', 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 40,
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
                }}>
                  Cc
                </Typography>
                <TextField
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Carbon copy"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontFamily: 'Roboto, Arial, sans-serif',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#dadce0',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a73e8',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#5f6368',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ 
                  color: '#3c4043', 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  minWidth: 40,
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
                }}>
                  Bcc
                </Typography>
                <TextField
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Blind carbon copy"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontFamily: 'Roboto, Arial, sans-serif',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#dadce0',
                        },
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a73e8',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 16px',
                      '&::placeholder': {
                        color: '#5f6368',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}
          
          {!showCcBcc && (
            <Button
              variant="text"
              size="small"
              onClick={() => setShowCcBcc(true)}
              sx={{ 
                alignSelf: 'flex-start', 
                textTransform: 'none',
                color: '#1a73e8',
                fontSize: '0.875rem',
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              Cc/Bcc
            </Button>
          )}

          {/* Subject */}
          <Box sx={{ mb: 2 }}>
            <TextField
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              variant="outlined"
              size="small"
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dadce0',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a73e8',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontWeight: 500,
                  '&::placeholder': {
                    color: '#5f6368',
                    opacity: 1,
                    fontWeight: 400,
                  },
                },
              }}
            />
          </Box>

          {/* Message Body */}
          <Box sx={{ flex: 1, mb: 2 }}>
            <TextField
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your message..."
              multiline
              rows={16}
              fullWidth
              variant="outlined"
              sx={{
                height: '100%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  height: '100%',
                  alignItems: 'flex-start',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dadce0',
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a73e8',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dadce0',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '16px',
                  height: '100% !important',
                  '&::placeholder': {
                    color: '#5f6368',
                    opacity: 1,
                  },
                },
                '& .MuiInputBase-inputMultiline': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
          </Box>

          {/* Attachments */}
          {attachments.length > 0 && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e8eaed' }}>
              <Typography variant="body2" sx={{ 
                mb: 1, 
                color: '#3c4043', 
                fontWeight: 500,
                fontFamily: 'Google Sans, Roboto, Arial, sans-serif' 
              }}>
                Attachments:
              </Typography>
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => removeAttachment(index)}
                  size="small"
                  sx={{ 
                    mr: 1, 
                    mb: 1,
                    backgroundColor: '#ffffff',
                    border: '1px solid #dadce0',
                    '& .MuiChip-label': {
                      fontSize: '0.8125rem',
                      fontFamily: 'Roboto, Arial, sans-serif'
                    }
                  }}
                />
              ))}
            </Box>
          )}

          {/* Gmail-like Footer */}
          <Box sx={{ 
            borderTop: '1px solid #e8eaed',
            pt: 2,
            backgroundColor: '#ffffff'
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!to.trim() || !subject.trim()}
                startIcon={<SendIcon />}
                sx={{
                  backgroundColor: '#1a73e8',
                  boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)',
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 3,
                  py: 1,
                  '&:hover': { 
                    backgroundColor: '#1765cc',
                    boxShadow: '0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)'
                  },
                  '&:disabled': {
                    backgroundColor: '#f1f3f4',
                    color: '#5f6368'
                  }
                }}
              >
                Send
              </Button>
              
              <input
                type="file"
                multiple
                onChange={handleFileAttach}
                style={{ display: 'none' }}
                id="attachment-input"
              />
              <label htmlFor="attachment-input">
                <IconButton
                  component="span"
                  sx={{ 
                    color: '#5f6368',
                    '&:hover': { backgroundColor: '#f1f3f4' }
                  }}
                  title="Attach files"
                >
                  <AttachFile />
                </IconButton>
              </label>
              
              <IconButton
                onClick={handleSaveDraft}
                sx={{ 
                  color: '#5f6368',
                  '&:hover': { backgroundColor: '#f1f3f4' }
                }}
                title="Save draft"
              >
                <Save sx={{ fontSize: '1.125rem' }} />
              </IconButton>
              
              <IconButton
                sx={{ 
                  color: '#5f6368',
                  '&:hover': { backgroundColor: '#f1f3f4' }
                }}
                title="More options"
              >
                <MoreVert />
              </IconButton>
              
              {currentDraft && (
                <IconButton
                  onClick={handleDelete}
                  sx={{ 
                    color: '#d93025',
                    ml: 'auto',
                    '&:hover': { backgroundColor: '#fce8e6' }
                  }}
                  title="Delete draft"
                >
                  <Delete />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EmailDrawer