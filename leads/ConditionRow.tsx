import React from 'react';
import { X } from '@phosphor-icons/react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
} from '@mui/material';

// Finance drawer style for form inputs
const financeInputStyle = {
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
    padding: '12px 16px',
    fontFamily: 'Poppins, sans-serif',
    '&::placeholder': {
      color: '#9ca3af',
      opacity: 1,
    },
  },
};
import { 
  Condition, 
  ColumnDef, 
  Operator, 
  defaultOperatorsByType, 
  generateId 
} from './filters';

interface ConditionRowProps {
  condition: Condition;
  columns: ColumnDef[];
  onChange: (updates: Partial<Condition>) => void;
  onRemove: () => void;
}

export const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  columns,
  onChange,
  onRemove
}) => {
  const selectedColumn = columns.find(col => col.id === condition.columnId);
  const availableOperators = selectedColumn?.operators || defaultOperatorsByType[selectedColumn?.type || 'text'];

  const handleColumnChange = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    const operators = column.operators || defaultOperatorsByType[column.type];
    const defaultOperator = operators[0];
    
    onChange({
      columnId,
      operator: defaultOperator,
      value: getDefaultValueForOperator(defaultOperator, column.type)
    });
  };

  const handleOperatorChange = (operator: Operator) => {
    const newValue = getDefaultValueForOperator(operator, selectedColumn?.type || 'text');
    onChange({ operator, value: newValue });
  };

  const getDefaultValueForOperator = (operator: Operator, type: string): any => {
    switch (operator) {
      case 'between':
      case 'between_dates':
        return ['', ''];
      case 'in':
      case 'not_in':
        return [];
      case 'is':
        return true;
      default:
        return '';
    }
  };

  const renderValueEditor = () => {
    if (!selectedColumn) return null;

    const { type, options } = selectedColumn;
    const { operator, value } = condition;

    // Boolean type with switch
    if (type === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(e) => onChange({ value: e.target.checked })}
              size="small"
            />
          }
          label={value ? 'True' : 'False'}
          sx={{ margin: 0, minWidth: '100px' }}
        />
      );
    }

    // Date types
    if (type === 'date') {
      if (operator === 'between_dates') {
        const dateRange = Array.isArray(value) ? value : ['', ''];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '280px' }}>
            <TextField
              type="date"
              value={dateRange[0] || ''}
              onChange={(e) => onChange({ value: [e.target.value, dateRange[1]] })}
              size="small"
              sx={{ width: '130px', ...financeInputStyle }}
            />
            <Box sx={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif' }}>to</Box>
            <TextField
              type="date"
              value={dateRange[1] || ''}
              onChange={(e) => onChange({ value: [dateRange[0], e.target.value] })}
              size="small"
              sx={{ width: '130px', ...financeInputStyle }}
            />
          </Box>
        );
      } else {
        return (
          <TextField
            type="date"
            value={value || ''}
            onChange={(e) => onChange({ value: e.target.value })}
            size="small"
            sx={{ width: '160px', ...financeInputStyle }}
          />
        );
      }
    }

    // Number types
    if (type === 'number') {
      if (operator === 'between') {
        const numberRange = Array.isArray(value) ? value : ['', ''];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '200px' }}>
            <TextField
              type="number"
              placeholder="Min"
              value={numberRange[0] || ''}
              onChange={(e) => onChange({ value: [Number(e.target.value) || '', numberRange[1]] })}
              size="small"
              sx={{ width: '80px', ...financeInputStyle }}
            />
            <Box sx={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif' }}>to</Box>
            <TextField
              type="number"
              placeholder="Max"
              value={numberRange[1] || ''}
              onChange={(e) => onChange({ value: [numberRange[0], Number(e.target.value) || ''] })}
              size="small"
              sx={{ width: '80px', ...financeInputStyle }}
            />
          </Box>
        );
      } else {
        return (
          <TextField
            type="number"
            placeholder="Enter number"
            value={value || ''}
            onChange={(e) => onChange({ value: Number(e.target.value) || '' })}
            size="small"
            sx={{ width: '130px', ...financeInputStyle }}
          />
        );
      }
    }

    // Select type with single selection
    if (type === 'select' && !['in', 'not_in'].includes(operator)) {
      return (
        <FormControl size="small" sx={{ minWidth: '200px', ...financeInputStyle }}>
          <Select
            value={value || ''}
            onChange={(e) => onChange({ value: e.target.value })}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                fontFamily: 'Poppins, sans-serif',
              }
            }}
          >
            <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              <em style={{ color: '#9ca3af' }}>Select value...</em>
            </MenuItem>
            {options?.map(option => (
              <MenuItem key={option.value} value={String(option.value)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    // Multiselect or select with in/not_in operators
    if (type === 'multiselect' || ['in', 'not_in'].includes(operator)) {
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <Box sx={{ minWidth: '240px' }}>
          <FormControl size="small" fullWidth sx={{ ...financeInputStyle }}>
            <Select 
              value=""
              onChange={(e) => {
                const newValue = e.target.value;
                const currentValues = Array.isArray(value) ? [...value] : [];
                if (!currentValues.includes(newValue)) {
                  onChange({ value: [...currentValues, newValue] });
                }
              }}
              displayEmpty
              sx={{
                '& .MuiSelect-select': {
                  fontFamily: 'Poppins, sans-serif',
                }
              }}
            >
              <MenuItem value="" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                <em style={{ color: '#9ca3af' }}>
                  {selectedValues.length > 0 
                    ? `${selectedValues.length} selected` 
                    : "Select values..."
                  }
                </em>
              </MenuItem>
              {options?.map(option => (
                <MenuItem key={option.value} value={String(option.value)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Selected values as chips */}
          {selectedValues.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {selectedValues.map((val, idx) => {
                const option = options?.find(opt => String(opt.value) === String(val));
                return (
                  <Chip
                    key={idx}
                    label={option?.label || val}
                    onDelete={() => {
                      const newValues = selectedValues.filter((_, i) => i !== idx);
                      onChange({ value: newValues });
                    }}
                    size="small"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          )}
        </Box>
      );
    }

    // Default text input
    return (
      <TextField
        type="text"
        placeholder="Enter value"
        value={value || ''}
        onChange={(e) => onChange({ value: e.target.value })}
        size="small"
        sx={{ width: '200px', ...financeInputStyle }}
      />
    );
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      {/* Column Select */}
      <FormControl size="small" sx={{ minWidth: '200px', ...financeInputStyle }}>
        <Select
          value={condition.columnId}
          onChange={(e) => handleColumnChange(e.target.value)}
          displayEmpty
          startAdornment={
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, color: '#6b7280' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48ZM104,136H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
              </svg>
            </Box>
          }
          sx={{
            '& .MuiSelect-select': {
              fontFamily: 'Poppins, sans-serif',
              pl: 1,
            }
          }}
        >
          <MenuItem value="" disabled sx={{ fontFamily: 'Poppins, sans-serif' }}>
            <em style={{ color: '#9ca3af' }}>Select column...</em>
          </MenuItem>
          {columns.map(column => (
            <MenuItem key={column.id} value={column.id} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {column.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Operator Select */}
      <FormControl size="small" sx={{ minWidth: '140px', ...financeInputStyle }}>
        <Select
          value={condition.operator}
          onChange={(e) => handleOperatorChange(e.target.value as Operator)}
          displayEmpty
          startAdornment={
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, color: '#6b7280' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,32H184a8,8,0,0,0,0,16h16V208H184a8,8,0,0,0,0,16h24a8,8,0,0,0,8-8V40A8,8,0,0,0,208,32ZM72,32H48a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H56V48H72a8,8,0,0,0,0-16ZM164.49,76.49,137,104l27.52,27.51a12,12,0,0,1-17,17L120,121l-27.51,27.52a12,12,0,0,1-17-17L103,104,75.51,76.49a12,12,0,0,1,17-17L120,87l27.51-27.52a12,12,0,0,1,17,17Z"></path>
              </svg>
            </Box>
          }
          sx={{
            '& .MuiSelect-select': {
              fontFamily: 'Poppins, sans-serif',
              pl: 1,
            }
          }}
        >
          <MenuItem value="" disabled sx={{ fontFamily: 'Poppins, sans-serif' }}>
            <em style={{ color: '#9ca3af' }}>Select operator...</em>
          </MenuItem>
          {availableOperators.map(operator => (
            <MenuItem key={operator} value={operator} sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {getOperatorLabel(operator)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Value Editor */}
      <Box sx={{ flex: 1, minWidth: '150px' }}>
        {renderValueEditor()}
      </Box>

      {/* Delete Button */}
      <IconButton
        onClick={onRemove}
        size="small"
        sx={{
          color: '#6b7280',
          '&:hover': {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          }
        }}
      >
        <X size={16} />
      </IconButton>
    </Paper>
  );
};

// Helper function to get human-readable operator labels
const getOperatorLabel = (operator: Operator): string => {
  const labels: Record<Operator, string> = {
    contains: 'Contains',
    equals: 'Equals',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    '>': 'Greater than',
    '>=': 'Greater than or equal',
    '<': 'Less than',
    '<=': 'Less than or equal',
    between: 'Between',
    on: 'On',
    before: 'Before',
    after: 'After',
    between_dates: 'Between dates',
    is: 'Is',
    in: 'In',
    not_in: 'Not in'
  };
  
  return labels[operator] || operator;
};