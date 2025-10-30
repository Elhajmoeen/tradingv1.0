import { ColumnDefinition } from '@/components/ColumnsDrawer';
import { ColumnDef, DataType, defaultOperatorsByType } from './filters';
import { optionsByKey } from '@/fieldkit/options';
import type { RootState } from '@/state/store';
import { store } from '@/state/store';

// Get real options from fieldkit system for consistent data
const getFieldkitOptions = (columnId: string): { label: string; value: any }[] => {
  try {
    const state = store.getState();
    return optionsByKey(state, columnId as any);
  } catch (error) {
    console.warn(`Failed to get fieldkit options for ${columnId}:`, error);
    return [];
  }
};

// Map existing column types to our filter types
// Most categorical fields should be multiselect for multi-value filtering
const typeMapping: Record<string, DataType> = {
  'text': 'multiselect',      // Text fields containing categorical data (names, statuses, etc.)
  'email': 'multiselect',     // Allow filtering by multiple email addresses
  'phone': 'multiselect',     // Allow filtering by multiple phone numbers
  'number': 'number',         // Numeric fields keep number filtering
  'money': 'number',
  'rating': 'number',
  'calculated': 'number',
  'date': 'date',            // Date fields keep date filtering
  'datetime': 'date',
  'boolean': 'boolean',       // Boolean fields keep boolean filtering
  'select': 'multiselect'     // All select fields become multiselect
};

// Helper function to get nested values from objects
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
};

// Get predefined options for select fields (fallback for legacy fields only)
const getSelectOptions = (columnId: string): { label: string; value: any }[] => {
  switch (columnId) {
    case 'salesReview':
      return [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' }
      ];
    case 'regulation':
      return [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ];
    default:
      return [];
  }
};

export function convertToFilterColumnDef(existingColumn: ColumnDefinition, data: any[] = []): ColumnDef {
  const dataType = typeMapping[existingColumn.type] || 'text';
  
  // Generate options based on priority:
  // 1. Unified fieldkit options (ensures consistency with Profile page)
  // 2. Static predefined options from column definition (for fields like boolean, specific enums)
  // 3. Dynamic options from actual data (for multiselect fields - most text and select fields)
  // 4. Hardcoded fallback options for legacy fields
  let options: { label: string; value: any }[] | undefined;
  
  // First check for unified fieldkit options
  const fieldkitOptions = getFieldkitOptions(existingColumn.id);
  if (fieldkitOptions && fieldkitOptions.length > 0) {
    options = fieldkitOptions;
  } else if (existingColumn.options && existingColumn.options.length > 0) {
    // Use static options from column definition (for predefined enums)
    options = existingColumn.options;
  } else if ((dataType === 'multiselect' || dataType === 'select') && data.length > 0) {
    // Generate dynamic options from actual data for multiselect/select fields
    const fieldPath = existingColumn.path || existingColumn.id;
    const dynamicOptions = getUniqueValuesFromData(data, fieldPath);
    options = dynamicOptions.length > 0 ? dynamicOptions : undefined;
  } else {
    // Fallback to hardcoded options for legacy fields
    const fallbackOptions = getSelectOptions(existingColumn.id);
    options = fallbackOptions.length > 0 ? fallbackOptions : undefined;
  }
  
  return {
    id: existingColumn.id,
    label: existingColumn.header,
    dataType: dataType,
    type: dataType,
    operators: defaultOperatorsByType[dataType],
    accessor: existingColumn.path || existingColumn.id,
    options: options
  };
}

// Helper function to get unique values from data for a given field path
const getUniqueValuesFromData = (data: any[], fieldPath: string): { label: string; value: any }[] => {
  const values = new Set<string>();
  
  data.forEach(item => {
    const value = getNestedValue(item, fieldPath);
    // Only include meaningful values (exclude null, undefined, empty strings, and common invalid values)
    if (value !== null && 
        value !== undefined && 
        value !== '' && 
        value !== 'null' && 
        value !== 'undefined' &&
        String(value).trim() !== '') {
      values.add(String(value).trim());
    }
  });
  
  // Don't create dropdowns with too many options (> 50 unique values)
  // This prevents performance issues and UI clutter for fields like descriptions, IDs, etc.
  const uniqueValues = Array.from(values).filter(value => value.length > 0);
  if (uniqueValues.length > 50) {
    return [];
  }
  
  return uniqueValues
    .sort()
    .map(value => ({ label: value, value: value }));
};

export function convertToFilterColumnDefs(existingColumns: ColumnDefinition[], data: any[] = []): ColumnDef[] {
  return existingColumns.map(column => convertToFilterColumnDef(column, data));
}