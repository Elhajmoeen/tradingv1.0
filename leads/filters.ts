// Data types and operators for the filter system
export type DataType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';

export type Operator =
  | 'contains' | 'equals' | 'startsWith' | 'endsWith'
  | '>' | '>=' | '<' | '<=' | 'between'
  | 'on' | 'before' | 'after' | 'between_dates'
  | 'is' | 'in' | 'not_in';

export interface FilterCondition {
  id: string;
  fieldId: string;
  columnId: string;
  operator: Operator;
  value: any;
  label: string;
  options?: { label: string; value: any }[];
}

// Alias for backward compatibility
export type Condition = FilterCondition;

export interface ColumnDef {
  id: string;
  label: string;
  dataType: DataType;
  type: DataType;
  operators: Operator[];
  accessor?: string;
  options?: { label: string; value: any }[];
  }

export interface ColumnDefinition {
}

export interface FilterState {
  conditions: FilterCondition[];
}

export interface ViewConfig {
  id: string;
  name: string;
  filterState: FilterState;
  visibleColumnIds: string[];
}

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const defaultOperatorsByType: Record<DataType, Operator[]> = {
  text: ['contains', 'equals', 'startsWith', 'endsWith'],
  number: ['equals', '>', '>=', '<', '<=', 'between'],
  date: ['on', 'before', 'after', 'between_dates'],
  boolean: ['is'],
  select: ['equals', 'in', 'not_in'],
  multiselect: ['in', 'not_in'],
};

// Storage key for saved views
export const VIEWS_STORAGE_KEY = 'leads.views.v1';

export const evaluateCondition = (value: any, condition: FilterCondition): boolean => {
  const { operator, value: conditionValue } = condition;

  switch (operator) {
    case 'contains':
      return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'equals':
      return value === conditionValue;
    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(conditionValue).toLowerCase());
    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(conditionValue).toLowerCase());
    case '>':
      return Number(value) > Number(conditionValue);
    case '>=':
      return Number(value) >= Number(conditionValue);
    case '<':
      return Number(value) < Number(conditionValue);
    case '<=':
      return Number(value) <= Number(conditionValue);
    case 'between':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const [min, max] = conditionValue;
        return Number(value) >= Number(min) && Number(value) <= Number(max);
      }
      return false;
    case 'on':
      return new Date(value).toDateString() === new Date(conditionValue).toDateString();
    case 'before':
      return new Date(value) < new Date(conditionValue);
    case 'after':
      return new Date(value) > new Date(conditionValue);
    case 'between_dates':
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const [fromDate, toDate] = conditionValue;
        const date = new Date(value);
        return date >= new Date(fromDate) && date <= new Date(toDate);
      }
      return false;
    case 'is':
      return Boolean(value) === Boolean(conditionValue);
    case 'in':
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(value);
      }
      return false;
    case 'not_in':
      if (Array.isArray(conditionValue)) {
        return !conditionValue.includes(value);
      }
      return false;
    default:
      return false;
  }
};

// Apply filters to data
export const applyFilters = <T extends Record<string, any>>(
  data: T[],
  filterState: FilterState,
  columnDefs: ColumnDef[]
): T[] => {
  if (!filterState.conditions.length) {
    return data;
  }

  return data.filter(item => {
    return filterState.conditions.every(condition => {
      const columnDef = columnDefs.find(col => col.id === condition.columnId);
      if (!columnDef) return true;
      
      const value = item[columnDef.accessor || columnDef.id];
      return evaluateCondition(value, condition);
    });
  });
};

// Load views from localStorage - alias for backward compatibility
export const loadSavedViews = (): ViewConfig[] => {
  return loadViews();
};

// Save views to localStorage - alias for backward compatibility  
export const saveSavedViews = (views: ViewConfig[]): void => {
  saveViews(views);
};

// Load views from localStorage
export const loadViews = (): ViewConfig[] => {
  try {
    const stored = localStorage.getItem(VIEWS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load views:', error);
    return [];
  }
};

// Save views to localStorage
export const saveViews = (views: ViewConfig[]): void => {
  try {
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views));
  } catch (error) {
    console.error('Failed to save views:', error);
  }
};