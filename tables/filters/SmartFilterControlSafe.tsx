import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import type { NormalizedFilter } from '@/filters/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type Props<T> = {
  column: Column<T, unknown>;
  schema?: any;
  onApply: (nf: NormalizedFilter) => void;
  onClose?: () => void;
  tableData?: T[]; // Add table data to get real values
};

// Enhanced smart field type detection for all columns
const detectFieldType = (columnId: string, tableData?: any[]) => {
  const id = columnId.toLowerCase();
  
  // First, try data-driven detection if we have sample data
  if (tableData && tableData.length > 0) {
    const sampleValues = tableData
      .slice(0, 10) // Check first 10 rows
      .map(row => row[columnId])
      .filter(val => val != null && val !== '');
      
    if (sampleValues.length > 0) {
      const dataType = analyzeDataType(sampleValues);
      if (dataType !== 'unknown') {
        console.log(`🔍 Data-driven detection: '${dataType}' for column: ${columnId}`);
        return dataType;
      }
    }
  }
  
  // Fallback to pattern-based detection
  
  // SELECT FIELDS (categorical data)
  if (id === 'leadstatus' || id === 'country' || id === 'accounttype' || 
      id === 'gender' || id === 'language' || id === 'kycstatus' ||
      id === 'currency' || id === 'region' || id === 'category' ||
      id === 'priority' || id === 'source' || id === 'campaign' ||
      id === 'desk' || id === 'branch' || id === 'office' ||
      id.endsWith('status') || id.endsWith('type') || id.endsWith('category') ||
      id.includes('status') || (id.includes('type') && !id.includes('typeof')) ||
      id.includes('level') || id.includes('grade') || id.includes('tier')) {
    console.log(`🔍 Pattern-based detection: 'select' for column: ${columnId}`);
    return 'select';
  }
  
  // DATE FIELDS
  if (id.includes('date') || id.includes('time') || id.includes('at') ||
      id === 'createdat' || id === 'updatedat' || id === 'deletedat' ||
      id.includes('birth') || id.includes('expire') || id.includes('due') ||
      id.includes('start') || id.includes('end') || id.includes('last') ||
      id.includes('next') || id.includes('schedule') || id.includes('deadline')) {
    console.log(`🔍 Pattern-based detection: 'date' for column: ${columnId}`);
    return 'date';
  }
  
  // BOOLEAN FIELDS
  if (id.startsWith('is') || id.startsWith('has') || id.startsWith('can') ||
      id.startsWith('should') || id.startsWith('will') || 
      id.includes('enabled') || id.includes('active') || id.includes('verified') ||
      id.includes('approved') || id.includes('confirmed') || id.includes('valid') ||
      id.includes('locked') || id.includes('banned') || id.includes('deleted') ||
      id.includes('visible') || id.includes('public') || id.includes('private')) {
    console.log(`🔍 Pattern-based detection: 'boolean' for column: ${columnId}`);
    return 'boolean';
  }
  
  // NUMBER FIELDS
  if (id.includes('amount') || id.includes('price') || id.includes('cost') ||
      id.includes('fee') || id.includes('rate') || id.includes('count') || 
      id.includes('number') || id.includes('age') || id.includes('year') ||
      id.includes('balance') || id.includes('volume') || id.includes('weight') ||
      id.includes('height') || id.includes('width') || id.includes('length') ||
      id.includes('size') || id.includes('limit') || id.includes('max') ||
      id.includes('min') || id.includes('total') || id.includes('sum') ||
      id.includes('avg') || id.includes('score') || id.includes('rating') ||
      id.includes('percent') || id.includes('ratio') || id.includes('index') ||
      (id.includes('id') && id !== 'id' && !id.includes('video'))) {
    console.log(`🔍 Pattern-based detection: 'number' for column: ${columnId}`);
    return 'number';
  }
  
  // Default to text for everything else
  console.log(`🔍 Pattern-based detection: 'text' for column: ${columnId}`);
  return 'text';
};

// Analyze actual data to determine type
const analyzeDataType = (values: any[]): string => {
  if (values.length === 0) return 'unknown';
  
  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  const uniqueValues = new Set(values.map(v => String(v).toLowerCase()));
  
  for (const value of values) {
    // Check if it's a boolean
    const strVal = String(value).toLowerCase();
    if (['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(strVal)) {
      booleanCount++;
    }
    
    // Check if it's a number
    const numVal = Number(value);
    if (!isNaN(numVal) && isFinite(numVal)) {
      numberCount++;
    }
    
    // Check if it's a date
    const dateVal = new Date(value);
    if (!isNaN(dateVal.getTime()) && String(value).length > 5) {
      dateCount++;
    }
  }
  
  const total = values.length;
  
  // If most values are booleans
  if (booleanCount / total > 0.8) return 'boolean';
  
  // If most values are numbers
  if (numberCount / total > 0.8) return 'number';
  
  // If most values are dates
  if (dateCount / total > 0.8) return 'date';
  
  // If few unique values (likely categorical)
  if (uniqueValues.size <= Math.max(3, total * 0.3)) return 'select';
  
  return 'unknown';
};

export function SmartFilterControlSafe<T>({ column, onApply, onClose, tableData }: Props<T>) {
  const fieldKey = String(column.id);
  const fieldName = typeof column.columnDef.header === 'string' ? column.columnDef.header : fieldKey;
  const fieldType = detectFieldType(fieldKey, tableData);
  
  // Determine if field should use multi-select checkboxes
  const shouldUseMultiSelect = (fieldKey: string) => {
    const key = fieldKey.toLowerCase();
    return key.includes('accounttype') || key.includes('desk') || 
           key.includes('status') || key.includes('category') ||
           key.includes('type') || key.includes('source') ||
           key.includes('campaign') || key.includes('branch');
  };
  
  const isMultiSelect = shouldUseMultiSelect(fieldKey);
  
  // State for different input types
  const [textValue, setTextValue] = React.useState('');
  const [numberMin, setNumberMin] = React.useState('');
  const [numberMax, setNumberMax] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [boolValue, setBoolValue] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState('');
  const [multiSelectValues, setMultiSelectValues] = React.useState<string[]>([]);

  const handleApply = () => {
    let filter: NormalizedFilter | null = null;
    console.log(`🎯 Applying ${fieldType} filter for column: ${fieldKey}`);
    
    switch (fieldType) {
      case 'text':
        if (textValue.trim()) {
          filter = { kind: 'text', op: 'contains', value: textValue.trim() };
        }
        break;
        
      case 'number':
        if (numberMin && numberMax) {
          filter = { 
            kind: 'number', 
            op: 'between', 
            value: [parseFloat(numberMin), parseFloat(numberMax)]
          };
        } else if (numberMin) {
          filter = { kind: 'number', op: 'gte', value: parseFloat(numberMin) };
        } else if (numberMax) {
          filter = { kind: 'number', op: 'lte', value: parseFloat(numberMax) };
        }
        break;
        
      case 'date':
        if (dateFrom && dateTo) {
          filter = {
            kind: 'date',
            op: 'between',
            value: [dateFrom, dateTo]
          };
        } else if (dateFrom) {
          filter = { kind: 'date', op: 'gte', value: dateFrom };
        } else if (dateTo) {
          filter = { kind: 'date', op: 'lte', value: dateTo };
        }
        break;
        
      case 'boolean':
        filter = { kind: 'boolean', op: 'eq', value: boolValue };
        break;
        
      case 'select':
        if (isMultiSelect && multiSelectValues.length > 0) {
          filter = { kind: 'enum', op: 'in', value: multiSelectValues };
        } else if (selectValue) {
          filter = { kind: 'text', op: 'eq', value: selectValue };
        } else if (textValue.trim()) {
          // Fallback to text filter if no select value but text entered
          filter = { kind: 'text', op: 'contains', value: textValue.trim() };
        }
        break;
    }
    
    if (filter) {
      console.log(`✅ Generated filter:`, filter);
      onApply(filter);
    } else {
      console.log(`❌ No filter generated - missing values`);
    }
    onClose?.();
  };

  const handleClear = () => {
    column.setFilterValue(undefined);
    setTextValue('');
    setNumberMin('');
    setNumberMax('');
    setDateFrom('');
    setDateTo('');
    setBoolValue(false);
    setSelectValue('');
    setMultiSelectValues([]);
    onClose?.();
  };

  const renderFilterInput = () => {
    switch (fieldType) {
      case 'text':
        return (
          <div>
            <label className="text-xs text-gray-600 block mb-1">Text contains</label>
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text..."
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-xs text-gray-600 block">Number range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={numberMin}
                onChange={(e) => setNumberMin(e.target.value)}
                placeholder="Min"
              />
              <Input
                type="number"
                value={numberMax}
                onChange={(e) => setNumberMax(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <label className="text-xs text-gray-600 block">Date range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bool-filter"
              checked={boolValue}
              onCheckedChange={(checked) => setBoolValue(checked === true)}
            />
            <label htmlFor="bool-filter" className="text-sm">
              True/Active/Enabled
            </label>
          </div>
        );
        
      case 'select':
        // Get real unique values from table data with smart filtering
        const getRealSelectOptions = () => {
          if (!tableData || !Array.isArray(tableData)) {
            console.log('❌ No table data available for select options');
            return [];
          }
          
          // Extract and clean unique values
          const valueMap = new Map<string, number>();
          
          tableData.forEach((row: any) => {
            const cellValue = row[fieldKey];
            if (cellValue != null && cellValue !== '') {
              let stringValue = String(cellValue).trim();
              
              // Clean up common variations
              if (stringValue.toLowerCase() === 'true' || stringValue === '1') stringValue = 'Yes';
              if (stringValue.toLowerCase() === 'false' || stringValue === '0') stringValue = 'No';
              
              if (stringValue) {
                valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
              }
            }
          });
          
          // Convert to options and sort by frequency then alphabetically
          const options = Array.from(valueMap.entries())
            .filter(([value, count]) => {
              // Filter out values that appear only once if we have many options
              return valueMap.size <= 20 || count > 1;
            })
            .sort((a, b) => {
              // Sort by frequency first, then alphabetically
              if (a[1] !== b[1]) return b[1] - a[1];
              return a[0].localeCompare(b[0]);
            })
            .slice(0, 50) // Limit to 50 options max
            .map(([value]) => ({
              value: value,
              label: value
            }));
            
          console.log(`📊 Found ${options.length} unique values for ${fieldKey}:`, options.slice(0, 10).map(o => o.value));
          return options;
        };
        
        const options = getRealSelectOptions();
        
        if (options.length === 0) {
          return (
            <div>
              <label className="text-xs text-gray-600 block mb-1">No values found</label>
              <Input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter value manually..."
              />
            </div>
          );
        }
        
        // Multi-select with checkboxes for specific fields
        if (isMultiSelect) {
          const handleCheckboxChange = (optionValue: string, checked: boolean) => {
            if (checked) {
              setMultiSelectValues(prev => [...prev, optionValue]);
            } else {
              setMultiSelectValues(prev => prev.filter(v => v !== optionValue));
            }
          };
          
          return (
            <div>
              <label className="text-xs text-gray-600 block mb-2">
                Select multiple from {options.length} values
              </label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 space-y-2">
                {options.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${option.value}`}
                      checked={multiSelectValues.includes(option.value)}
                      onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)}
                    />
                    <label 
                      htmlFor={`checkbox-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {multiSelectValues.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  Selected: {multiSelectValues.join(', ')}
                </div>
              )}
            </div>
          );
        }
        
        // Single select dropdown for other fields
        return (
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Select from {options.length} values
            </label>
            <select
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Choose option...</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      default:
        return (
          <div>
            <label className="text-xs text-gray-600 block mb-1">Value</label>
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter value..."
            />
          </div>
        );
    }
  };

  return (
    <div className="p-4 w-80 relative z-10">
      <div className="text-sm font-medium mb-3 flex items-center gap-2">
        <span>Filter: {fieldName}</span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {fieldType}
        </span>
      </div>
      <div className="space-y-3">
        {renderFilterInput()}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}