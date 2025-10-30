# Status Manager Integration Guide

The Status Manager now provides dynamic status options that are automatically updated across the entire CRM system. Here's how it works and where it's integrated:

## 🔄 System Architecture

### 1. **Status Store (Zustand)**
- **Location**: `src/features/lookups/state/useStatusStore.ts`
- **Purpose**: Central source of truth for all status values
- **Categories**: `kycStatus`, `leadStatus`, `retentionStatus`
- **Features**: CRUD operations, ordering, deprecation, usage tracking

### 2. **Integration Points**

#### ✅ **Form Fields**
- **KYCStatusField**: `src/components/KYCStatusField.tsx`
- **LeadStatusField**: `src/components/LeadStatusField.tsx`
- **Integration**: Uses `useLookupOptions()` hook that reads from Status Store
- **Reactivity**: Automatically updates when status options change

#### ✅ **FieldRenderer System**
- **Location**: `src/fieldkit/FieldRenderer.tsx`
- **Integration**: Updated `optionsByKey()` function
- **Components**: All forms using FieldRenderer (NewLeadDrawer, ProfilePage, etc.)
- **Reactivity**: Uses Zustand store for status fields

#### ✅ **Table Columns**
- **Location**: `src/config/columns.ts`
- **Integration**: Column definitions updated to use dynamic options
- **Helper**: `src/utils/columnHelpers.ts` provides updated column definitions
- **Usage**: Tables automatically get latest status options

#### ✅ **Filter Systems**
- **Advanced Filters**: `src/features/leads_next/types/leadFilters.ts`
- **Table Filters**: Column-based filtering in LeadsTable
- **Compliance Filters**: ComplianceFilters component
- **Integration**: `src/features/lookups/filterIntegration.ts` provides helpers

#### ✅ **Mass Update Operations**
- **Bulk Status Changes**: Uses `useStatusMassUpdate()` hook
- **Validation**: Ensures selected status values exist
- **Options**: Always shows current available statuses

## 🚀 How It Works

### When You Add/Edit/Delete a Status:

1. **Status Manager** updates the Zustand store
2. **Broadcast Event** is emitted (`status-updated`)
3. **All Components** using status options are automatically re-rendered
4. **New Options** appear immediately in:
   - Form dropdowns
   - Filter dropdowns
   - Table column filters
   - Mass update selectors
   - Profile field editors

### Auto-Update Components:

```typescript
// ✅ These components auto-update:
- KYCStatusField / LeadStatusField (profile editing)
- FieldRenderer (all forms using fieldKey="kycStatus")
- NewLeadDrawer (lead creation form)
- EntityTable (inline editing)
- LeadsTable (column filters)
- FilterModal (advanced filtering)
- ComplianceFilters (compliance page filters)
- Mass update dropdowns
```

## 📋 Usage Examples

### 1. **Adding New Status Options**
```typescript
// In Status Manager, click "Add Status"
// ✅ Immediately available in all dropdowns across CRM
```

### 2. **Using in Custom Components**
```typescript
import { useLookupOptions } from '@/features/lookups/hooks'

function MyCustomComponent() {
  const { options } = useLookupOptions('kycStatus')
  // ✅ Always gets latest status options
}
```

### 3. **Table Column Integration**
```typescript
import { useTableFilterOptions } from '@/features/lookups/filterIntegration'

function MyTableColumn() {
  const options = useTableFilterOptions('leadStatus')
  // ✅ Always gets latest status options for filtering
}
```

### 4. **Mass Update Integration**
```typescript
import { useStatusMassUpdate } from '@/features/lookups/filterIntegration'

function BulkUpdateModal() {
  const { getAvailableStatuses } = useStatusMassUpdate()
  const kycOptions = getAvailableStatuses('kycStatus')
  // ✅ Always shows current available status options
}
```

## 🔧 Technical Details

### Event System
- **Custom Events**: `window.dispatchEvent('status-updated')`
- **React Hooks**: Automatic re-rendering via Zustand subscriptions
- **Performance**: Memoized selectors prevent unnecessary updates

### Backward Compatibility
- **Legacy Components**: Still work with static configs as fallback
- **Migration Path**: Gradually move components to use dynamic system
- **No Breaking Changes**: Existing functionality preserved

### Data Flow
```
Status Manager → Zustand Store → Broadcast Event → Component Re-render → Updated Options
```

## 🎯 Benefits

1. **Real-time Updates**: Changes appear immediately across all components
2. **Consistency**: Single source of truth for all status values
3. **No Manual Refresh**: Components update automatically
4. **Performance**: Optimized with memoization and selective updates
5. **Extensibility**: Easy to add new status categories

## 🛠️ Future Enhancements

- [ ] **Backend Integration**: Connect to real API when ready
- [ ] **Audit Trail**: Track who changed what status values
- [ ] **Permissions**: Role-based status management
- [ ] **Categories**: Add more status types (document status, etc.)
- [ ] **Templates**: Predefined status sets for different business units

---

**Result**: When you add a new status in the Status Manager, it's immediately available in all forms, filters, tables, and bulk operations throughout the CRM without any page refresh or manual updates needed! 🎉