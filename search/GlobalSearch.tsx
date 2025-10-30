import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItemText,
  ListItemIcon,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  ClickAwayListener,
  useMediaQuery,
  useTheme,
  Chip,
  Box,
  Typography,
  Avatar,
  Badge,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useGlobalSearch, SearchResult } from './useGlobalSearch';
import { highlightMatch } from './lib';

interface GlobalSearchProps {
  onNavigate?: (type: 'lead' | 'client', id: string) => void;
  maxResults?: number;
  debounceMs?: number;
}

// Highlight component for rendering matched text
const HighlightedText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const segments = highlightMatch(text, query);
  return (
    <>
      {segments.map((segment, index) => (
        segment.h ? (
          <span key={index} className="bg-amber-100 text-amber-900 font-medium">
            {segment.t}
          </span>
        ) : (
          <span key={index}>{segment.t}</span>
        )
      ))}
    </>
  );
};

// Desktop combobox component
const DesktopSearch: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  onSelect: (item: SearchResult) => void;
  clear: () => void;
}> = ({ query, setQuery, results, isSearching, onSelect, clear }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = 'search-results-list';

  const isOpen = Boolean(query.trim() && anchorEl);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  useEffect(() => {
    if (inputRef.current) {
      setAnchorEl(inputRef.current);
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (event.key === 'Escape') {
        clear();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (results[activeIndex]) {
          onSelect(results[activeIndex]);
          clear();
        }
        break;
      case 'Escape':
        event.preventDefault();
        clear();
        break;
    }
  };

  const handleClickAway = (event: Event | React.SyntheticEvent) => {
    // Ignore click-away events to prevent glitches - user can press Escape or clear to close
    return;
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="relative">
        <TextField
          inputRef={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search CRM Data"
          size="small"
          variant="outlined"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-haspopup="listbox"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              borderRadius: '20px',
              height: '36px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                borderWidth: '2px',
              },
              '& input': {
                color: '#ffffff',
                padding: '8px 14px',
                fontSize: '0.875rem',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
            },
          }}
        />

        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ zIndex: 1300, width: 500 }}
          modifiers={[
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                boundariesElement: 'scrollParent',
              },
            },
          ]}
        >
          <Paper 
            elevation={0}
            className="mt-2 max-h-96 overflow-y-auto"
            sx={{ 
              minWidth: 500,
              width: 500,
              bgcolor: '#ffffff',
              border: '1px solid rgba(20, 50, 83, 0.08)',
              boxShadow: '0 12px 40px rgba(20, 50, 83, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(20, 50, 83, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: 'rgba(20, 50, 83, 0.3)',
                }
              }
            }}
          >
            <List id={listId} role="listbox" sx={{ py: 1 }}>
              {isSearching && results.length === 0 ? (
                <Box className="flex items-center justify-center py-4">
                  <CircularProgress size={20} className="mr-2" />
                  <Typography variant="body2" color="text.secondary">
                    Searching...
                  </Typography>
                </Box>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <Box
                    key={result.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(result);
                      clear();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(result);
                        clear();
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      borderRadius: '8px',
                      mx: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease-in-out',
                      bgcolor: index === activeIndex ? 
                        'linear-gradient(135deg, rgba(20, 50, 83, 0.12) 0%, rgba(20, 50, 83, 0.08) 100%)' :
                        'transparent',
                      '&:hover': { 
                        bgcolor: 'linear-gradient(135deg, rgba(20, 50, 83, 0.08) 0%, rgba(20, 50, 83, 0.06) 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(20, 50, 83, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ minWidth: 48, mr: 1 }}>
                      <Badge
                        variant="dot"
                        color={result.isOnline ? "success" : "default"}
                        sx={{
                          '& .MuiBadge-dot': {
                            backgroundColor: result.isOnline ? '#00e676' : '#bdbdbd',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            border: '2px solid #ffffff'
                          }
                        }}
                      >
                        <Avatar
                          src={result.avatarUrl}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: result.type === 'lead' ? 
                              'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 
                              'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: '2px solid rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {result.firstName?.[0]?.toUpperCase()}{result.lastName?.[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, ml: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#143253',
                          mb: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.95rem'
                        }}
                      >
                        <HighlightedText 
                          text={`${result.firstName || ''} ${result.lastName || ''}`.trim() || result.title} 
                          query={query} 
                        />
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(0, 0, 0, 0.6)',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8rem',
                          mb: 0.25
                        }}
                      >
                        {result.email}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#143253',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(20, 50, 83, 0.08)',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '12px',
                            border: '1px solid rgba(20, 50, 83, 0.1)'
                          }}
                        >
                          ID: {result.accountId}
                        </Typography>
                        <Box sx={{ 
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: result.isOnline ? '#00e676' : '#bdbdbd'
                        }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: result.isOnline ? '#00c853' : '#757575',
                            fontSize: '0.7rem',
                            fontWeight: 500
                          }}
                        >
                          {result.isOnline ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={result.type === 'lead' ? 'LEAD' : 'CLIENT'}
                      size="small"
                      sx={{ 
                        minWidth: 55,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        height: 24,
                        bgcolor: result.type === 'lead' ? 
                          'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                          'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        border: 'none',
                        '&:hover': {
                          bgcolor: result.type === 'lead' ? 
                            'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)' :
                            'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        }
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Box className="px-4 py-6 text-center">
                  <Typography variant="body2" color="text.secondary">
                    No results found
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Try searching by name, email, or phone
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

// Mobile full-screen sheet component
const MobileSearch: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  onSelect: (item: SearchResult) => void;
  clear: () => void;
  open: boolean;
  onClose: () => void;
}> = ({ query, setQuery, results, isSearching, onSelect, clear, open, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    onClose();
    clear();
  };

  const handleClose = () => {
    onClose();
    clear();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { bgcolor: 'background.default' }
      }}
    >
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#143253', color: 'white' }}>
        <Toolbar>
          <TextField
            autoFocus
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CRM Data"
            variant="standard"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
              sx: {
                color: 'white',
                '&:before': {
                  borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover:before': {
                  borderBottomColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:after': {
                  borderBottomColor: 'white',
                },
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: 1,
                  },
                },
              },
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInput-input': {
                fontSize: '1.1rem',
                py: 1,
              },
            }}
          />
          <IconButton
            edge="end"
            onClick={handleClose}
            aria-label="close"
            sx={{ ml: 2, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box className="flex-1 overflow-hidden">
        {query.trim() && (
          <List className="h-full overflow-y-auto">
            {isSearching && results.length === 0 ? (
              <Box className="flex items-center justify-center py-8">
                <CircularProgress size={24} className="mr-3" />
                <Typography variant="body1" color="text.secondary">
                  Searching...
                </Typography>
              </Box>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <Box
                  key={result.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(result);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(result);
                    }
                  }}
                  sx={{ 
                    py: 2,
                    px: 3,
                    borderRadius: '12px',
                    mx: 2,
                    mb: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    bgcolor: index === activeIndex ? 
                      'linear-gradient(135deg, rgba(20, 50, 83, 0.12) 0%, rgba(20, 50, 83, 0.08) 100%)' :
                      'transparent',
                    '&:hover': { 
                      bgcolor: 'linear-gradient(135deg, rgba(20, 50, 83, 0.08) 0%, rgba(20, 50, 83, 0.06) 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(20, 50, 83, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ minWidth: 56, mr: 1 }}>
                    <Badge
                      variant="dot"
                      color={result.isOnline ? "success" : "default"}
                      sx={{
                        '& .MuiBadge-dot': {
                          backgroundColor: result.isOnline ? '#00e676' : '#bdbdbd',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          border: '2px solid #ffffff'
                        }
                      }}
                    >
                      <Avatar
                        src={result.avatarUrl}
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: result.type === 'lead' ? 
                            'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 
                            'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          border: '3px solid rgba(255, 255, 255, 0.9)',
                          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {result.firstName?.[0]?.toUpperCase()}{result.lastName?.[0]?.toUpperCase()}
                      </Avatar>
                    </Badge>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#143253',
                        mb: 0.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      <HighlightedText 
                        text={`${result.firstName || ''} ${result.lastName || ''}`.trim() || result.title} 
                        query={query} 
                      />
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(0, 0, 0, 0.6)',
                        mb: 0.5,
                        fontSize: '0.9rem'
                      }}
                    >
                      {result.email}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#143253',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          bgcolor: 'rgba(20, 50, 83, 0.08)',
                          px: 1,
                          py: 0.25,
                          borderRadius: '16px',
                          border: '1px solid rgba(20, 50, 83, 0.1)'
                        }}
                      >
                        ID: {result.accountId}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: result.isOnline ? '#00e676' : '#bdbdbd'
                        }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: result.isOnline ? '#00c853' : '#757575',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {result.isOnline ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                    <Chip
                      label={result.type === 'lead' ? 'LEAD' : 'CLIENT'}
                      size="small"
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        height: 28,
                        minWidth: 60,
                        bgcolor: result.type === 'lead' ? 
                          'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                          'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        border: 'none',
                        '&:hover': {
                          bgcolor: result.type === 'lead' ? 
                            'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)' :
                            'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        }
                      }}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="px-6 py-12 text-center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try searching by name, email, or phone number
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Box>
    </Dialog>
  );
};

// Main GlobalSearch component
export const GlobalSearch: React.FC<GlobalSearchProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { query, setQuery, results, isSearching, onSelect, clear } = useGlobalSearch(props);

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={() => setMobileOpen(true)}
          className="text-white hover:bg-white/10"
          size="small"
        >
          <SearchIcon />
        </IconButton>
        <MobileSearch
          query={query}
          setQuery={setQuery}
          results={results}
          isSearching={isSearching}
          onSelect={onSelect}
          clear={clear}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </>
    );
  }

  return (
    <DesktopSearch
      query={query}
      setQuery={setQuery}
      results={results}
      isSearching={isSearching}
      onSelect={onSelect}
      clear={clear}
    />
  );
};