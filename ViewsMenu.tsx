import { useState } from 'react'
import { Plus, Pencil, Trash, SquaresFour, Star } from '@phosphor-icons/react'
import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { ColumnView } from '@/features/tableViews/columnViewsSlice'

interface ViewsMenuProps {
  views: ColumnView[]
  currentViewId?: string | null
  onApplyView: (view: ColumnView) => void
  onRenameView: (viewId: string, newName: string) => void
  onDeleteView: (viewId: string) => void
  onSetFavorite?: (viewId: string | null) => void // Add favorite toggle function
  refreshKey?: number // Used to trigger re-renders when views change
  children: React.ReactNode
}

export function ViewsMenu({
  views,
  currentViewId,
  onApplyView,
  onRenameView,
  onDeleteView,
  onSetFavorite,
  refreshKey,
  children
}: ViewsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [editingView, setEditingView] = useState<{ id: string; name: string } | null>(null)
  
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleApplyView = (view: ColumnView) => {
    onApplyView(view)
    handleMenuClose()
  }

  const handleManageViewsClick = () => {
    setManageDialogOpen(true)
    handleMenuClose()
  }

  const handleRenameStart = (viewId: string, currentName: string) => {
    setEditingView({ id: viewId, name: currentName })
  }

  const handleRenameConfirm = () => {
    if (editingView && editingView.name.trim()) {
      onRenameView(editingView.id, editingView.name.trim())
      setEditingView(null)
    }
  }

  const handleRenameCancel = () => {
    setEditingView(null)
  }

  const handleDeleteView = (viewId: string) => {
    onDeleteView(viewId)
  }

  const handleToggleFavorite = (viewId: string, currentIsFavorite: boolean) => {
    if (!onSetFavorite) return
    // If currently favorite, remove favorite (pass null), otherwise set this view as favorite
    onSetFavorite(currentIsFavorite ? null : viewId)
  }

  return (
    <>
      <Box onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            minWidth: '224px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
            border: '1px solid #e5e7eb',
            fontFamily: 'Poppins',
          }
        }}
      >
        {/* Saved Views */}
        {views.length > 0 && (
          <>
            <Typography
              variant="body2"
              sx={{
                px: 2,
                py: 1,
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontFamily: 'Poppins'
              }}
            >
              Saved Views
            </Typography>
            {views.map((view) => (
              <MenuItem
                key={view.id}
                onClick={() => handleApplyView(view)}
                sx={{
                  fontFamily: 'Poppins',
                  fontSize: '0.875rem',
                  py: 1.5,
                  backgroundColor: currentViewId === view.id ? 'action.selected' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {view.isFavorite ? (
                    <Star size={16} weight="fill" style={{ color: '#f59e0b' }} />
                  ) : (
                    <SquaresFour size={16} />
                  )}
                </ListItemIcon>
                <ListItemText primary={view.name} />
                {view.isFavorite && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#f59e0b', 
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      ml: 1 
                    }}
                  >
                    Favorite
                  </Typography>
                )}
              </MenuItem>
            ))}
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Manage Views */}
        <MenuItem onClick={handleManageViewsClick} sx={{ fontFamily: 'Poppins', fontSize: '0.875rem', py: 1.5 }}>
          <ListItemIcon>
            <Pencil size={16} />
          </ListItemIcon>
          <ListItemText primary="Manage Views" />
        </MenuItem>
      </Menu>

      {/* Manage Views Dialog */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            fontFamily: 'Poppins'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
          Manage Views
        </DialogTitle>
        <DialogContent>
          {views.length === 0 ? (
            <Typography sx={{ fontFamily: 'Poppins', color: 'text.secondary', textAlign: 'center', py: 3 }}>
              No saved views yet. Use the Filter drawer to save your first view.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {views.map((view) => (
                <Box
                  key={view.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  {view.isFavorite ? (
                    <Star size={20} weight="fill" style={{ color: '#f59e0b' }} />
                  ) : (
                    <SquaresFour size={20} />
                  )}
                  
                  {editingView?.id === view.id ? (
                    <TextField
                      value={editingView.name}
                      onChange={(e) => setEditingView({ ...editingView, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameConfirm()
                        } else if (e.key === 'Escape') {
                          handleRenameCancel()
                        }
                      }}
                      size="small"
                      variant="outlined"
                      sx={{ flex: 1, fontFamily: 'Poppins' }}
                      autoFocus
                    />
                  ) : (
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500 }}>
                          {view.name}
                        </Typography>
                        {view.isFavorite && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#f59e0b', 
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#fef3c7',
                              px: 1,
                              py: 0.25,
                              borderRadius: '4px'
                            }}
                          >
                            FAVORITE
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: 'text.secondary' }}>
                        {view.selectedColumnIds.length} columns • Created {new Date(view.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {editingView?.id === view.id ? (
                      <>
                        <IconButton size="small" onClick={handleRenameConfirm} color="primary">
                          <Plus size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={handleRenameCancel}>
                          <Trash size={16} />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFavorite(view.id, view.isFavorite || false)}
                          sx={{ 
                            color: view.isFavorite ? '#f59e0b' : '#6b7280',
                            '&:hover': { 
                              backgroundColor: view.isFavorite ? '#fef3c7' : '#f3f4f6' 
                            }
                          }}
                          title={view.isFavorite ? 'Remove from favorites' : 'Set as favorite'}
                        >
                          <Star size={16} weight={view.isFavorite ? 'fill' : 'regular'} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRenameStart(view.id, view.name)}
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteView(view.id)}
                          color="error"
                        >
                          <Trash size={16} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageDialogOpen(false)} sx={{ fontFamily: 'Poppins' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}