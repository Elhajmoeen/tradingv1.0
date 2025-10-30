import React from 'react'
import { Plus, Sliders, Eye, Columns, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { Button as MUIButton } from '@mui/material'

interface ListHeaderBarActions {
  onNew?: () => void
  onFilter?: () => void
  onColumns?: () => void
  onImport?: () => void
  onExport?: () => void
  filtersActive?: boolean
}

interface ListHeaderBarProps {
  onSearch: (query: string) => void
  actions?: ListHeaderBarActions
  columnsDrawer?: React.ReactNode
  viewsMenu?: React.ReactNode
  entityNamePlural?: string // e.g., "leads", "clients"
}

/**
 * Reusable header bar with search and action buttons for CRM list pages
 */
export function ListHeaderBar({ onSearch, actions, columnsDrawer, viewsMenu, entityNamePlural = "leads" }: ListHeaderBarProps) {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    onSearch(value)
  }

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200 px-6 py-4 shadow-sm" data-testid="list-header">
      <div className="flex items-center justify-between gap-6">
        {/* Search input */}
        <div className="flex-shrink-0">
          <form className="flex items-center max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>   
            <label htmlFor="simple-search" className="sr-only">Search</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                id="simple-search" 
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 py-1.5 px-3" 
                placeholder={`Search ${entityNamePlural || 'data'}...`}
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions?.onNew && (
            <MUIButton 
              variant="contained"
              onClick={actions.onNew}
              sx={{
                backgroundColor: '#F0B90B',
                color: '#000000',
                borderColor: '#F0B90B',
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '0.5rem',
                textTransform: 'none',
                gap: 0.5,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#E6A500',
                  borderColor: '#E6A500',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Plus size={12} />
              New {entityNamePlural?.slice(0, -1) || 'Item'}
            </MUIButton>
          )}
          
          {actions?.onFilter && (
            <MUIButton 
              variant={actions.filtersActive ? "contained" : "outlined"}
              onClick={actions.onFilter}
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '0.5rem',
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                gap: 0.5,
                ...(actions.filtersActive ? {
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  color: '#ffffff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #ea580c, #c2410c)',
                    transform: 'scale(1.05)',
                  },
                } : {
                  borderColor: '#d1d5db',
                  color: '#374151',
                  backgroundColor: 'transparent',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                }),
              }}
            >
              <Sliders size={12} />
              Filter
              {actions.filtersActive && (
                <span style={{ 
                  marginLeft: 4, 
                  width: 8, 
                  height: 8, 
                  backgroundColor: 'white', 
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              )}
            </MUIButton>
          )}
          
          {actions?.onExport && (
            <MUIButton 
              variant="outlined"
              onClick={actions.onExport}
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '0.5rem',
                textTransform: 'none',
                gap: 0.5,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'scale(1.05)',
                },
              }}
              data-testid="export-button"
            >
              <DownloadSimple size={12} />
              Export
            </MUIButton>
          )}
          
          {actions?.onImport && (
            <MUIButton 
              variant="outlined"
              onClick={actions.onImport}
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                px: 1.5,
                py: 0.5,
                fontSize: '0.8125rem',
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '0.5rem',
                textTransform: 'none',
                gap: 0.5,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  borderColor: '#9ca3af',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'scale(1.05)',
                },
              }}
              data-testid="import-button"
            >
              <UploadSimple size={12} />
              Import
            </MUIButton>
          )}

          {viewsMenu && viewsMenu}
          
          {(actions?.onColumns || columnsDrawer) && (
            columnsDrawer || (
              <MUIButton 
                variant="outlined"
                onClick={actions?.onColumns}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '0.5rem',
                  textTransform: 'none',
                  gap: 0.5,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Columns size={12} />
                Columns
              </MUIButton>
            )
          )}
        </div>
      </div>
    </div>
  )
}