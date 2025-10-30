# Account Type Assets Settings Feature

This feature adds comprehensive assets management to Account Type create and edit flows with proper feature flag gating.

## Feature Flag Control

The feature is controlled by a feature flag and is **disabled by default** to maintain backward compatibility.

### Enable the feature:

**Option 1: Environment Variable**
```bash
VITE_FF_ACCOUNT_TYPE_ASSET_RULES=1
```

**Option 2: Browser localStorage**
```javascript
localStorage.setItem('ff_account_type_asset_rules', '1');
location.reload();
```

### Disable the feature:
```javascript
localStorage.removeItem('ff_account_type_asset_rules');
location.reload();
```

## Features Added

### **1. Create Flow (NewAccountTypePage)**
- **Assets Configuration Section**: Appears after Account Type Defaults
- **Add Asset Button**: Opens drawer for multi-select asset addition  
- **Editable Table**: Configure leverage, spreads, lot sizes, commissions, swaps
- **Staged Rules**: Assets are staged locally until account type is created
- **Bulk Save**: All staged assets saved to API after account type creation

### **2. Edit Flow (AccountTypeSettingsPage)**  
- **Assets Configuration Section**: Added after existing Account Type Defaults panel
- **Live API Integration**: Real-time loading, editing, and saving
- **Add Asset Button**: Add new assets with immediate API persistence
- **Inline Editing**: Click any numeric field to edit with debounced auto-save
- **Status Toggle**: Enable/disable assets with toggle buttons
- **Remove Assets**: Delete asset rules with confirmation

### **3. Assets Table Features**
- **Responsive Design**: Horizontal scroll on mobile, full layout on desktop
- **Editable Cells**: Click to edit numeric fields (leverage, spread, etc.)
- **Auto-save**: 500ms debounced save on edit completion
- **Status Management**: Visual status badges with toggle functionality
- **Empty States**: Clean UI when no assets configured

### **4. Add Asset Drawer**
- **Master Assets List**: Fetches from `/assets` endpoint
- **Search & Filter**: Real-time search by name, filter by category
- **Multi-select**: Checkbox-based selection with count display
- **Duplicate Prevention**: Hides already-added assets
- **Default Values**: Sensible defaults for new asset rules

## Backend Requirements

The feature expects these backend endpoints:

### **Assets Master List**
```http
GET /assets
```
Response:
```json
[
  {
    "id": "string",
    "name": "string", 
    "category": "Forex|Indices|Stocks|Commodities|Crypto"
  }
]
```

### **Account Type Asset Rules**
```http
GET /account-types/:id/assets
```
Response:
```json
[
  {
    "id": "string",
    "accountTypeId": "string", 
    "assetId": "string",
    "assetName": "string",
    "category": "string",
    "leverage": 50,
    "spread": 20,
    "defaultLot": 0.1,
    "jump": 0.01,
    "minDeal": 0.01,
    "maxDeal": 100,
    "commission": 0,
    "swapLong": -1,
    "swapShort": -1,
    "status": "ACTIVE|DISABLED"
  }
]
```

### **Bulk Upsert Rules**
```http
PUT /account-types/:id/assets
Content-Type: application/json

{
  "rules": [/* array of AccountTypeAssetRule objects */]
}
```

### **Delete Single Rule**
```http
DELETE /account-types/:id/assets/:ruleId
```

## File Structure

```
src/
├── lib/flags.ts                                           # Added isAccountTypeAssetRulesEnabled()
├── features/accountTypes_next/
│   ├── types/
│   │   ├── accountTypeAssetRule.ts                       # DTO interfaces
│   │   └── accountTypeAssetRule.schema.ts                # Zod validation schemas
│   ├── state/
│   │   └── accountTypeAssetsApi.ts                       # RTK Query endpoints
│   └── components/
│       ├── AccountTypeAssetsTable.tsx                    # Main editable table
│       └── AddAssetDrawer.tsx                           # Asset selection drawer
├── pages/settings/account-types/
│   └── NewAccountTypePage.tsx                           # Updated create flow
├── features/accountTypes/
│   └── AccountTypeSettingsPage.tsx                     # Updated edit flow
└── integration/baseApi.ts                               # Added Asset & AccountTypeAssetRule tags
```

## Data Flow

### **Create Flow**
1. User adds assets via AddAssetDrawer → staged in local state
2. User edits asset rules in table → updates local state  
3. User clicks "Create Account Type" → creates account type first
4. If successful and assets exist → bulk upserts staged rules
5. Redirects to settings page with new account type

### **Edit Flow**
1. Assets table loads existing rules via `useListRulesQuery`
2. Add Asset saves immediately via `useUpsertRulesMutation` 
3. Inline edits auto-save after 500ms debounce
4. Status toggles save immediately
5. Delete operations require confirmation

### **Cache Management**
- Tags: `['Asset', 'AccountType', 'AccountTypeAssetRule']`
- Auto-invalidation on mutations keeps data fresh
- Optimistic updates for better UX

## QA Testing

### **Default State (Flag OFF)**
- ✅ Create page: Only shows Account Type Defaults (no assets section)
- ✅ Edit page: Shows existing account type rules table (legacy behavior)
- ✅ No API calls to new endpoints
- ✅ No visual changes to existing UI

### **Feature Enabled (Flag ON)**
```javascript
localStorage.setItem('ff_account_type_asset_rules', '1');
location.reload();
```

### **Create Flow Testing**
1. Navigate to `/management/trading/account-types/new`
2. Verify Assets Configuration section appears after Account Type Defaults
3. Click "Add Asset" → drawer opens with master assets list
4. Search and filter assets → verify real-time filtering
5. Select multiple assets → click "Add" → verify table populated with defaults
6. Edit numeric fields → verify inline editing works
7. Toggle status → verify visual feedback
8. Remove assets → verify confirmation and removal
9. Fill account type basics → click "Create Account Type"
10. Verify account type created AND assets saved

### **Edit Flow Testing**
1. Navigate to existing account type settings page
2. Verify Assets Configuration section appears after defaults
3. Verify existing assets load in table (if any)
4. Test adding new assets via "Add Asset" button
5. Test inline editing of existing rules
6. Test status toggles and removals
7. Verify auto-save functionality (check network tab)

### **Error Handling**
- Network errors → toast notifications
- Validation errors → prevent invalid saves
- Loading states → proper UI feedback
- Empty states → informative messages

## Backward Compatibility

- **100% non-destructive**: Existing functionality unchanged
- **Existing account types**: Continue to work exactly as before
- **API compatibility**: Only additive endpoints, no changes to existing
- **Cache invalidation**: Proper tagging ensures data consistency
- **Type safety**: Zod validation for runtime safety

## Performance Considerations

- **Debounced saves**: Prevents excessive API calls on rapid editing
- **Efficient queries**: Only loads data when needed
- **Cache optimization**: RTK Query handles request deduplication
- **Responsive design**: Horizontal scroll prevents layout issues on mobile