// Local status store using Zustand for Status Manager
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LookupCategoryKey = "kycStatus" | "leadStatus" | "retentionStatus";

interface LookupValue {
  id: string;
  key: string;
  label: string;
  color?: string | null;
  order: number;
  active: boolean;
  deprecatedAt?: string | null;
  usageCount?: number;
}

interface StatusStore {
  // Data
  kycStatus: LookupValue[];
  leadStatus: LookupValue[];
  retentionStatus: LookupValue[];
  
  // Actions
  addValue: (category: LookupCategoryKey, value: Omit<LookupValue, 'id' | 'order'>) => void;
  updateValue: (category: LookupCategoryKey, id: string, updates: Partial<LookupValue>) => void;
  toggleActive: (category: LookupCategoryKey, id: string, active: boolean) => void;
  reorder: (category: LookupCategoryKey, fromIndex: number, toIndex: number) => void;
  deprecate: (category: LookupCategoryKey, id: string) => void;
  
  // Getters
  getOptions: (category: LookupCategoryKey, includeDeprecated?: boolean) => { value: string; label: string; color?: string }[];
}

// Initial demo data
const initialData: Pick<StatusStore, 'kycStatus' | 'leadStatus' | 'retentionStatus'> = {
  kycStatus: [
    { id: '1', key: 'approved', label: 'Approved', color: '#10b981', order: 1, active: true, usageCount: 45 },
    { id: '2', key: 'pending', label: 'Pending', color: '#f59e0b', order: 2, active: true, usageCount: 23 },
    { id: '3', key: 'rejected', label: 'Rejected', color: '#ef4444', order: 3, active: true, usageCount: 12 },
    { id: '4', key: 'expired', label: 'Expired', color: '#6b7280', order: 4, active: true, usageCount: 5 },
  ],
  leadStatus: [
    { id: '5', key: 'new', label: 'New Lead', color: '#3b82f6', order: 1, active: true, usageCount: 156 },
    { id: '6', key: 'warm', label: 'Warm Prospect', color: '#f59e0b', order: 2, active: true, usageCount: 89 },
    { id: '7', key: 'hot', label: 'Hot Lead', color: '#ef4444', order: 3, active: true, usageCount: 67 },
    { id: '8', key: 'qualified', label: 'Qualified', color: '#10b981', order: 4, active: true, usageCount: 34 },
    { id: '9', key: 'cold', label: 'Cold Lead', color: '#6b7280', order: 5, active: true, usageCount: 78 },
  ],
  retentionStatus: [
    { id: '10', key: 'new', label: 'New Client', color: '#3b82f6', order: 1, active: true, usageCount: 234 },
    { id: '11', key: 'active', label: 'Active', color: '#10b981', order: 2, active: true, usageCount: 567 },
    { id: '12', key: 'at_risk', label: 'At Risk', color: '#f59e0b', order: 3, active: true, usageCount: 89 },
    { id: '13', key: 'churned', label: 'Churned', color: '#ef4444', order: 4, active: true, usageCount: 45 },
  ],
};

export const useStatusStore = create<StatusStore>()(
  devtools((set, get) => ({
    // Initial data
    ...initialData,
    
    // Add new value
    addValue: (category, value) => {
      set((state) => {
        const existingItems = state[category];
        const newOrder = Math.max(0, ...existingItems.map(item => item.order)) + 1;
        const newValue: LookupValue = {
          ...value,
          id: Date.now().toString(),
          order: newOrder,
        };
        
        return {
          ...state,
          [category]: [...existingItems, newValue],
        };
      }, false, `addValue/${category}`);
      
      // PATCH: begin broadcast local change
      window.dispatchEvent(new CustomEvent("status-updated", { detail: { category } }));
      // PATCH: end broadcast local change
    },
    
    // Update existing value
    updateValue: (category, id, updates) => {
      set((state) => ({
        ...state,
        [category]: state[category].map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      }), false, `updateValue/${category}/${id}`);
      
      // PATCH: begin broadcast local change
      window.dispatchEvent(new CustomEvent("status-updated", { detail: { category } }));
      // PATCH: end broadcast local change
    },
    
    // Toggle active status
    toggleActive: (category, id, active) => {
      set((state) => ({
        ...state,
        [category]: state[category].map(item => 
          item.id === id ? { ...item, active } : item
        ),
      }), false, `toggleActive/${category}/${id}`);
      
      // PATCH: begin broadcast local change
      window.dispatchEvent(new CustomEvent("status-updated", { detail: { category } }));
      // PATCH: end broadcast local change
    },
    
    // Reorder items
    reorder: (category, fromIndex, toIndex) => {
      set((state) => {
        const items = [...state[category]].sort((a, b) => a.order - b.order);
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);
        
        // Update order values
        items.forEach((item, index) => {
          item.order = index + 1;
        });
        
        return {
          ...state,
          [category]: items,
        };
      }, false, `reorder/${category}`);
      
      // PATCH: begin broadcast local change
      window.dispatchEvent(new CustomEvent("status-updated", { detail: { category } }));
      // PATCH: end broadcast local change
    },
    
    // Deprecate (soft delete)
    deprecate: (category, id) => {
      set((state) => ({
        ...state,
        [category]: state[category].map(item => 
          item.id === id 
            ? { ...item, active: false, deprecatedAt: new Date().toISOString() }
            : item
        ),
      }), false, `deprecate/${category}/${id}`);
      
      // PATCH: begin broadcast local change
      window.dispatchEvent(new CustomEvent("status-updated", { detail: { category } }));
      // PATCH: end broadcast local change
    },
    
    // Get options for selects
    getOptions: (category, includeDeprecated = false) => {
      const state = get();
      const items = state[category] || [];
      
      // PATCH: begin verify local store content
      console.debug("[StatusStore] getOptions", category, items);
      // PATCH: end verify local store content
      
      const filtered = includeDeprecated 
        ? items 
        : items.filter(v => v.active && !v.deprecatedAt);
        
      return filtered
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(v => ({ 
          value: v.key, 
          label: v.label, 
          color: v.color ?? undefined 
        }));
    },
  }))
);

// Hook for easy access to options
export function useLocalLookupOptions(category: LookupCategoryKey, includeDeprecated = false) {
  const getOptions = useStatusStore(state => state.getOptions);
  const options = getOptions(category, includeDeprecated);
  
  // PATCH: begin log lookup options source
  console.debug("[useLocalLookupOptions]", category, "options:", options);
  // PATCH: end log lookup options source
  
  return { options, isLoading: false };
}