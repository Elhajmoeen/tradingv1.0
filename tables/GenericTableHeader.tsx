import React from 'react'
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'
import { 
  Add, 
  FileUpload, 
  FileDownload, 
  FilterList,
  ViewColumn,
  Visibility,
  Search,
  Close
} from '@mui/icons-material'

interface GenericTableHeaderProps {
  title: string
  entityType: string // 'lead', 'client', etc.
  totalCount: number
  selectedCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewClick: () => void
  onImportClick: () => void
  onExportClick: () => void
  onFilterClick: () => void
  onViewsClick: () => void
  onColumnsClick: () => void
  onMassChangesClick: () => void
  onClearSelection: () => void
  activeFilters?: number
  activeView?: string
}

export function GenericTableHeader({
  title,
  entityType,
  totalCount,
  selectedCount,
  searchQuery,
  onSearchChange,
  onNewClick,
  onImportClick,
  onExportClick,
  onFilterClick,
  onViewsClick,
  onColumnsClick,
  onMassChangesClick,
  onClearSelection,
  activeFilters = 0,
  activeView
}: GenericTableHeaderProps) {

  const buttonStyles = {
    textTransform: 'none',
    borderRadius: '8px',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 2,
    py: 1,
    minWidth: 'auto'
  }

  const primaryButtonStyles = {
    ...buttonStyles,
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }
  }

  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#374151',
    '&:hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1',
    }
  }

  return (
    <Box sx={{ 
      p: 3, 
      borderBottom: '1px solid #e5e7eb',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
    }}>
      {/* Title and Stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: '#1f2937',
              fontSize: '1.75rem',
              letterSpacing: '-0.025em'
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {totalCount.toLocaleString()} total {entityType}s
            </Typography>
            {activeView && (
              <Chip 
                label={`View: ${activeView}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.75rem'
                }}
              />
            )}
            {activeFilters > 0 && (
              <Chip 
                label={`${activeFilters} filter${activeFilters > 1 ? 's' : ''}`}
                size="small"
                color="primary"
                sx={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onNewClick}
            sx={primaryButtonStyles}
          >
            New {entityType}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={onImportClick}
            sx={secondaryButtonStyles}
          >
            Import
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={onExportClick}
            sx={secondaryButtonStyles}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Search and Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Search */}
        <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 400 }}>
          <Search sx={{ 
            position: 'absolute', 
            left: 12, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1.25rem'
          }} />
          <Box
            component="input"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder={`Search ${entityType}s...`}
            sx={{
              width: '100%',
              pl: 6,
              pr: searchQuery ? 6 : 2,
              py: 1.5,
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif',
              '&:focus': {
                outline: 'none',
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgb(59 130 246 / 0.1)',
              },
              '&::placeholder': {
                color: '#9ca3af'
              }
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => onSearchChange('')}
              sx={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Control Buttons */}
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={onFilterClick}
          sx={{
            ...secondaryButtonStyles,
            ...(activeFilters > 0 && {
              backgroundColor: '#dbeafe',
              borderColor: '#3b82f6',
              color: '#1d4ed8'
            })
          }}
        >
          Filter {activeFilters > 0 && `(${activeFilters})`}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={onViewsClick}
          sx={secondaryButtonStyles}
        >
          Views
        </Button>

        <Button
          variant="outlined"
          startIcon={<ViewColumn />}
          onClick={onColumnsClick}
          sx={secondaryButtonStyles}
        >
          Columns
        </Button>

        {selectedCount > 0 && (
          <>
            <Box sx={{ 
              px: 3, 
              py: 1, 
              backgroundColor: '#dbeafe', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1d4ed8',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500
                }}
              >
                {selectedCount} selected
              </Typography>
              <IconButton 
                size="small" 
                onClick={onClearSelection}
                sx={{ color: '#1d4ed8' }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
            
            <Button
              variant="contained"
              onClick={onMassChangesClick}
              sx={{
                ...primaryButtonStyles,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                }
              }}
            >
              Mass Changes
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}