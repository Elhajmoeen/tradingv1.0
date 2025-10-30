import React, { useState, useEffect } from 'react';
import { Plus, PencilSimple, Trash, DotsThree } from '@phosphor-icons/react';
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { 
  ViewConfig, 
  loadSavedViews, 
  saveSavedViews 
} from './filters';

interface ViewsMenuProps {
  views: ViewConfig[];
  onApplyView: (view: ViewConfig) => void;
  onViewsChanged: (views: ViewConfig[]) => void;
  children: React.ReactNode;
}

export const ViewsMenu: React.FC<ViewsMenuProps> = ({
  views,
  onApplyView,
  onViewsChanged,
  children
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewConfig | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState<null | HTMLElement>(null);
  const [subMenuView, setSubMenuView] = useState<ViewConfig | null>(null);
  const menuOpen = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchor);

  const handleApplyView = (view: ViewConfig) => {
    onApplyView(view);
  };

  const handleRenameView = (view: ViewConfig) => {
    setSelectedView(view);
    setNewName(view.name);
    setRenameDialogOpen(true);
  };

  const handleConfirmRename = () => {
    if (!selectedView || !newName.trim()) return;

    const updatedViews = views.map(view =>
      view.id === selectedView.id ? { ...view, name: newName.trim() } : view
    );
    
    saveSavedViews(updatedViews);
    onViewsChanged(updatedViews);
    
    setRenameDialogOpen(false);
    setSelectedView(null);
    setNewName('');
  };

  const handleCancelRename = () => {
    setRenameDialogOpen(false);
    setSelectedView(null);
    setNewName('');
  };

  const handleDeleteView = (view: ViewConfig) => {
    setSelectedView(view);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedView) return;

    const updatedViews = views.filter(view => view.id !== selectedView.id);
    
    saveSavedViews(updatedViews);
    onViewsChanged(updatedViews);
    
    setDeleteDialogOpen(false);
    setSelectedView(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedView(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSubMenuAnchor(null);
    setSubMenuView(null);
  };

  const handleSubMenuOpen = (event: React.MouseEvent<HTMLElement>, view: ViewConfig) => {
    setSubMenuAnchor(event.currentTarget);
    setSubMenuView(view);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchor(null);
    setSubMenuView(null);
  };

  const handleApplyViewAndClose = (view: ViewConfig) => {
    handleApplyView(view);
    handleMenuClose();
  };

  const handleRenameViewAndClose = (view: ViewConfig) => {
    handleRenameView(view);
    handleMenuClose();
  };

  const handleDeleteViewAndClose = (view: ViewConfig) => {
    handleDeleteView(view);
    handleMenuClose();
  };

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
        {views.length === 0 ? (
          <MenuItem disabled sx={{ fontFamily: 'Poppins', fontSize: '0.875rem', color: 'text.secondary' }}>
            No saved views
          </MenuItem>
        ) : (
          views.map(view => (
            <MenuItem
              key={view.id}
              onClick={(e) => handleSubMenuOpen(e, view)}
              sx={{
                fontFamily: 'Poppins',
                fontSize: '0.875rem',
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.875rem' }}>
                {view.name}
              </Typography>
              <DotsThree size={16} />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Sub Menu for view actions */}
      <Menu
        anchorEl={subMenuAnchor}
        open={subMenuOpen}
        onClose={handleSubMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            minWidth: '160px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
            border: '1px solid #e5e7eb',
            fontFamily: 'Poppins',
          }
        }}
      >
        <MenuItem onClick={() => subMenuView && handleApplyViewAndClose(subMenuView)} sx={{ fontFamily: 'Poppins', fontSize: '0.875rem' }}>
          Apply View
        </MenuItem>
        <MenuItem onClick={() => subMenuView && handleRenameViewAndClose(subMenuView)} sx={{ fontFamily: 'Poppins', fontSize: '0.875rem' }}>
          <ListItemIcon>
            <PencilSimple size={16} />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem 
          onClick={() => subMenuView && handleDeleteViewAndClose(subMenuView)} 
          sx={{ fontFamily: 'Poppins', fontSize: '0.875rem', color: 'error.main' }}
        >
          <ListItemIcon>
            <Trash size={16} color="currentColor" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog 
        open={renameDialogOpen} 
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            fontFamily: 'Poppins',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 600, 
          pb: 1,
          fontSize: '1.25rem'
        }}>
          Rename View
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3, 
              fontFamily: 'Poppins',
              fontSize: '0.875rem'
            }}
          >
            Enter a new name for the view "{selectedView?.name}".
          </Typography>
          
          <TextField
            autoFocus
            id="new-name"
            label="View Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name..."
            fullWidth
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontFamily: 'Poppins',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Poppins',
              },
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleCancelRename}
            sx={{
              borderRadius: '8px',
              fontFamily: 'Poppins',
              textTransform: 'none',
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmRename} 
            disabled={!newName.trim()}
            sx={{
              borderRadius: '8px',
              fontFamily: 'Poppins',
              textTransform: 'none',
              px: 3,
              py: 1,
              background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
              '&:hover': {
                background: 'linear-gradient(to right, #1d4ed8, #1e40af)',
              },
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            fontFamily: 'Poppins',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 600, 
          pb: 1,
          fontSize: '1.25rem'
        }}>
          Delete View
        </DialogTitle>
        
        <DialogContent sx={{ pb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontFamily: 'Poppins',
              fontSize: '0.875rem'
            }}
          >
            Are you sure you want to delete the view "{selectedView?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleCancelDelete}
            sx={{
              borderRadius: '8px',
              fontFamily: 'Poppins',
              textTransform: 'none',
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: '8px',
              fontFamily: 'Poppins',
              textTransform: 'none',
              px: 3,
              py: 1,
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};