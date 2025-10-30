import { useState, useEffect } from 'react'
import { Search, Plus, Trash, X } from 'lucide-react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Autocomplete,
  Divider,
  Chip,
  Paper,
} from '@mui/material'


import { ColumnDefinition } from '@/components/ColumnsDrawer'
import { Rule, Operator, OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/types/filter'
import { getDistinctValues } from '@/utils/filterUtils'
import { optionsByKey } from '@/fieldkit'
import { useSelector } from 'react-redux'
import type { RootState } from '@/state/store'


interface LeadsFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: ColumnDefinition[]
  rules: Rule[]
  onRulesChange: (rules: Rule[]) => void
  data: any[] // For generating select options
}

export function LeadsFilterDrawer({
  open,
  onOpenChange,
  columns,
  rules,
  onRulesChange,
  data
}: LeadsFilterDrawerProps) {
  const [localRules, setLocalRules] = useState<Rule[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Use unified field options for consistent dropdowns - Phase A comprehensive coverage
  const unifiedFieldOptions = useSelector((state: RootState) => {
    const phaseAFields = [
      // Core identity & contact
      'leadStatus', 'leadSource', 'accountType', 'gender', 'kycStatus', 'citizen', 'language',
      'country', 'countryCode', 'regulation', 'platform',
      // Financial & Trading
      'paymentGateway', 'leverage', 'spread', 'swapType', 'accountMargin', 'marginCall',
      // Documents & Verification
      'passportUploaded', 'idUploaded', 'proofOfAddressUploaded', 'ccFrontUploaded', 'ccBackUploaded', 'dodUploaded',
      // Settings & Preferences
      'enableLogin', 'blockNotifications', 'allowedToTrade', 'withdrawLimitAllowed',
      'twoFAEnabled', 'allowed2fa', 'allowDeposit', 'allowWithdraw',
      // Trading Instruments
      'forex', 'crypto', 'commodities', 'indices', 'stocks',
      // Lead Management
      'ftdSelf', 'salesSecondHand', 'ftdFirstConversation'
    ]
    const options: Record<string, any[]> = {}
    
    phaseAFields.forEach(fieldKey => {
      try {
        options[fieldKey] = optionsByKey(state, fieldKey as any)
      } catch (e) {
        options[fieldKey] = []
      }
    })
    
    return options
  })

  // Sync local rules with props when drawer opens
  useEffect(() => {
    if (open) {
      setLocalRules([...rules])
    }
  }, [open, rules])

  // Filter columns based on search query
  const filteredColumns = columns.filter(column =>
    column.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
    column.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddRule = () => {
    if (filteredColumns.length === 0) return
    
    const firstColumn = filteredColumns[0]
    const operators = OPERATORS_BY_TYPE[firstColumn.type] || []
    const defaultOperator = operators[0] || 'contains'
    
    const newRule: Rule = {
      columnId: firstColumn.id,
      operator: defaultOperator,
      value: ''
    }
    
    setLocalRules(prev => [...prev, newRule])
  }

  const handleRemoveRule = (index: number) => {
    setLocalRules(prev => prev.filter((_, i) => i !== index))
  }

  const handleRuleChange = (index: number, field: keyof Rule, value: any) => {
    setLocalRules(prev => prev.map((rule, i) => {
      if (i !== index) return rule
      
      const updatedRule = { ...rule, [field]: value }
      
      // If column changed, reset operator and value
      if (field === 'columnId') {
        const column = columns.find(col => col.id === value)
        if (column) {
          const operators = OPERATORS_BY_TYPE[column.type] || []
          updatedRule.operator = operators[0] || 'contains'
          updatedRule.value = ''
        }
      }
      
      // If operator changed, reset value
      if (field === 'operator') {
        updatedRule.value = ''
      }
      
      return updatedRule
    }))
  }

  const handleApply = () => {
    onRulesChange(localRules)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setLocalRules([...rules])
    onOpenChange(false)
  }



  const handleClear = () => {
    setLocalRules([])
  }

  const renderValueInput = (rule: Rule, index: number) => {
    const column = columns.find(col => col.id === rule.columnId)
    if (!column) return null

    // No value input for isEmpty/isNotEmpty
    if (rule.operator === 'isEmpty' || rule.operator === 'isNotEmpty') {
      return null
    }

    // Boolean type
    if (column.type === 'boolean') {
      return (
        <FormControl sx={{ minWidth: 140 }}>
          <Select
            value={String(rule.value)}
            onChange={(e) => handleRuleChange(index, 'value', e.target.value === 'true')}
            displayEmpty
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'grey.300',
              }
            }}
          >
            <MenuItem value="">
              <em style={{ color: '#9ca3af' }}>Select...</em>
            </MenuItem>
            <MenuItem value="true">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ✅ <Typography>Yes</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="false">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ❌ <Typography>No</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      )
    }

    // Between operator for numbers/dates
    if (rule.operator === 'between') {
      const betweenValue = (rule.value as any) || { from: '', to: '' }
      
      if (column.type === 'date' || column.type === 'datetime') {
        const inputType = column.type === 'datetime' ? 'datetime-local' : 'date'
        return (
          <Box className="flex items-center gap-3">
            <TextField
              type={inputType}
              value={betweenValue.from || ''}
              onChange={(e) => handleRuleChange(index, 'value', { ...betweenValue, from: e.target.value })}
              size="small"
              className="w-36"
              InputProps={{ className: "bg-white" }}
            />
            <Typography variant="body2" className="text-gray-500 font-medium">
              to
            </Typography>
            <TextField
              type={inputType}
              value={betweenValue.to || ''}
              onChange={(e) => handleRuleChange(index, 'value', { ...betweenValue, to: e.target.value })}
              size="small"
              className="w-36"
              InputProps={{ className: "bg-white" }}
            />
          </Box>
        )
      } else {
        return (
          <Box className="flex items-center gap-3">
            <TextField
              type="number"
              placeholder="From"
              value={betweenValue.from || ''}
              onChange={(e) => handleRuleChange(index, 'value', { ...betweenValue, from: Number(e.target.value) || '' })}
              size="small"
              className="w-24"
              InputProps={{ className: "bg-white" }}
            />
            <Typography variant="body2" className="text-gray-500 font-medium">
              to
            </Typography>
            <TextField
              type="number"
              placeholder="To"
              value={betweenValue.to || ''}
              onChange={(e) => handleRuleChange(index, 'value', { ...betweenValue, to: Number(e.target.value) || '' })}
              size="small"
              className="w-24"
              InputProps={{ className: "bg-white" }}
            />
          </Box>
        )
      }
    }

    // Date/datetime inputs
    if (column.type === 'date' || column.type === 'datetime') {
      const inputType = column.type === 'datetime' ? 'datetime-local' : 'date'
      return (
        <TextField
          type={inputType}
          value={String(rule.value || '')}
          onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
          size="small"
          className="w-40"
          InputProps={{ className: "bg-white" }}
        />
      )
    }

    // Number inputs
    if (['number', 'money', 'rating', 'calculated'].includes(column.type)) {
      return (
        <TextField
          type="number"
          placeholder="Enter number"
          value={String(rule.value || '')}
          onChange={(e) => handleRuleChange(index, 'value', Number(e.target.value) || '')}
          size="small"
          className="w-32"
          InputProps={{ className: "bg-white" }}
        />
      )
    }

    // Select type columns with predefined options - Phase A comprehensive coverage
    if (column.type === 'select' || unifiedFieldOptions[column.id]?.length > 0) {
      // Use unified options for supported fields, fallback to distinct values for others
      const unifiedOptions = unifiedFieldOptions[column.id]
      const options = unifiedOptions && unifiedOptions.length > 0 
        ? unifiedOptions 
        : getDistinctValues(data, column.path).map(value => ({ label: value, value }))
      
      return (
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={String(rule.value || '')}
            onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'grey.300',
              }
            }}
          >
            <MenuItem value="">
              <em style={{ color: '#9ca3af' }}>Select value...</em>
            </MenuItem>
            {options.map(option => {
              const optionValue = typeof option === 'object' ? option.value : option
              const optionLabel = typeof option === 'object' ? option.label : option
              return (
                <MenuItem key={optionValue} value={optionValue}>
                  <Typography sx={{ fontWeight: 500 }}>{optionLabel}</Typography>
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      )
    }

    // Default text input
    return (
      <TextField
        type="text"
        placeholder="💭 Enter value"
        value={String(rule.value || '')}
        onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
        sx={{ 
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: '12px',
          }
        }}
        InputProps={{
          sx: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'grey.300',
            }
          }
        }}
      />
    )
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onOpenChange(false)}
      PaperProps={{
        sx: { 
          width: { xs: '100%', md: '600px' },
          maxWidth: 'none',
          backgroundColor: '#fafafa',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper 
          elevation={2}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 0,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🎯 Filter Leads
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Create advanced conditions to filter your leads
                  </Typography>
                  <Chip 
                    label={`${localRules.length} active`}
                    size="small"
                    sx={{
                      backgroundColor: localRules.length > 0 ? 'warning.main' : 'rgba(255,255,255,0.2)',
                      color: localRules.length > 0 ? 'warning.contrastText' : 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
              <IconButton 
                onClick={() => onOpenChange(false)}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <X size={20} />
              </IconButton>
            </Box>
          </Box>
          {/* Decorative background pattern */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '100%',
              opacity: 0.1,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3Ccircle cx="27" cy="7" r="2"/%3E%3Ccircle cx="47" cy="7" r="2"/%3E%3Ccircle cx="7" cy="27" r="2"/%3E%3Ccircle cx="27" cy="27" r="2"/%3E%3Ccircle cx="47" cy="27" r="2"/%3E%3Ccircle cx="7" cy="47" r="2"/%3E%3Ccircle cx="27" cy="47" r="2"/%3E%3Ccircle cx="47" cy="47" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </Paper>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Search columns */}
          <Paper elevation={1} sx={{ mb: 3, backgroundColor: 'white' }}>
            <TextField
              fullWidth
              placeholder="🔍 Search columns to filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} style={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' },
                  }
                }
              }}
              variant="outlined"
              size="medium"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  padding: '8px',
                }
              }}
            />
          </Paper>

          {/* Add condition button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleAddRule}
              disabled={filteredColumns.length === 0}
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: 'success.dark',
                  boxShadow: 3,
                },
                '&:disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500',
                }
              }}
            >
              Add New Condition
            </Button>
          </Box>

          {/* Rules list */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {localRules.length === 0 && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    backgroundColor: 'white',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'grey.600', mb: 1, fontSize: '1.1rem' }}>
                      📋 No filter conditions yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.500' }}>
                      Create your first condition to start filtering leads
                    </Typography>
                  </Box>
                  {/* Decorative background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '80px',
                      opacity: 0.05,
                    }}
                  >
                    ⚙️
                  </Box>
                </Paper>
              )}

              {localRules.map((rule, index) => {
                const column = columns.find(col => col.id === rule.columnId)
                if (!column) return null

                const operators = OPERATORS_BY_TYPE[column.type] || []
                
                return (
                  <Paper 
                    key={index} 
                    elevation={3}
                    sx={{
                      p: 3,
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      position: 'relative',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 6,
                        borderColor: 'primary.light',
                      }
                    }}
                  >
                    {/* Rule number badge */}
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: 16,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        minWidth: '32px'
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mt: 1 }}>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Column selector */}
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontWeight: 500, color: 'primary.dark' }}>📊 Column</InputLabel>
                          <Select
                            value={rule.columnId}
                            onChange={(e) => handleRuleChange(index, 'columnId', e.target.value)}
                            label="📊 Column"
                            sx={{
                              backgroundColor: 'grey.50',
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'grey.300',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            }}
                          >
                            {filteredColumns.map(col => (
                              <MenuItem key={col.id} value={col.id}>
                                <Typography sx={{ fontWeight: 500 }}>{col.header}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Operator selector */}
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontWeight: 500, color: 'secondary.dark' }}>⚡ Condition</InputLabel>
                          <Select
                            value={rule.operator}
                            onChange={(e) => handleRuleChange(index, 'operator', e.target.value as Operator)}
                            label="⚡ Condition"
                            sx={{
                              backgroundColor: 'grey.50',
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'grey.300',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'secondary.main',
                              }
                            }}
                          >
                            {operators.map(op => (
                              <MenuItem key={op} value={op}>
                                <Typography sx={{ fontWeight: 500 }}>{OPERATOR_LABELS[op]}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Value input */}
                        {!['isEmpty', 'isNotEmpty'].includes(rule.operator) && (
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                color: 'info.dark', 
                                fontWeight: 600, 
                                mb: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              💎 Value
                            </Typography>
                            <Box sx={{ '& .MuiTextField-root, & .MuiFormControl-root': {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'grey.50',
                                borderRadius: '12px',
                              }
                            }}}>
                              {renderValueInput(rule, index)}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Remove button */}
                      <IconButton
                        onClick={() => handleRemoveRule(index)}
                        sx={{
                          backgroundColor: 'error.50',
                          color: 'error.main',
                          width: 40,
                          height: 40,
                          '&:hover': {
                            backgroundColor: 'error.100',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <Trash size={18} />
                      </IconButton>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Paper 
          elevation={4}
          sx={{ 
            backgroundColor: 'white',
            borderRadius: '24px 24px 0 0',
            p: 3,
            mt: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                borderColor: 'grey.300',
                color: 'grey.700',
                '&:hover': {
                  borderColor: 'grey.400',
                  backgroundColor: 'grey.50',
                }
              }}
            >
              ✕ Cancel
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                borderColor: 'warning.main',
                color: 'warning.main',
                '&:hover': {
                  borderColor: 'warning.dark',
                  backgroundColor: 'warning.50',
                }
              }}
            >
              🗑️ Clear All
            </Button>
            <Button 
              variant="contained"
              onClick={handleApply}
              sx={{
                flex: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                backgroundColor: 'primary.main',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 6,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              ✨ Apply {localRules.length > 0 && `(${localRules.length})`} Filters
            </Button>
          </Box>
        </Paper>
      </Box>
    </Drawer>
  )
}