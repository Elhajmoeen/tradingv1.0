import React from 'react'
import { 
  Drawer, 
  Dialog, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useMediaQuery, 
  useTheme,
  Divider,
  Box,
  Paper
} from '@mui/material'
import { Close, MessageRounded, ChatBubbleOutline } from '@mui/icons-material'
import { CommentsPanel } from './CommentsPanel'

interface CommentsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityId: string
  entityType: 'lead' | 'client'
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  open,
  onOpenChange,
  entityId,
  entityType
}) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handleClose = () => onOpenChange(false)

  if (isSmallScreen) {
    // Full-screen dialog on small screens
    return (
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#fafafa',
          }
        }}
      >
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Toolbar sx={{ minHeight: 64, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <ChatBubbleOutline sx={{ color: '#64748b', fontSize: '1.5rem' }} />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: '#1e293b'
                }}
              >
                Comments & Activity
              </Typography>
            </Box>
            <IconButton
              edge="end"
              onClick={handleClose}
              aria-label="close comments"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }
              }}
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box className="flex-1 bg-gray-50">
          <CommentsPanel 
            entityId={entityId} 
            entityType={entityType}
            onClose={handleClose} 
          />
        </Box>
      </Dialog>
    )
  }

  // Right drawer on desktop
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 720,
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e2e8f0'
        }
      }}
    >
      <Box className="h-full flex flex-col">
        {/* Professional Header */}
        <Paper 
          elevation={0}
          sx={{ 
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ChatBubbleOutline sx={{ color: '#64748b', fontSize: '1.5rem' }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    color: '#1e293b'
                  }}
                >
                  Comments & Activity
                </Typography>
              </Box>
              <IconButton
                onClick={handleClose}
                size="medium"
                aria-label="close comments"
                sx={{
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Content */}
        <Box className="flex-1 overflow-hidden">
          <CommentsPanel 
            entityId={entityId} 
            entityType={entityType}
            onClose={handleClose} 
          />
        </Box>
      </Box>
    </Drawer>
  )
}