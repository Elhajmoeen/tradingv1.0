# Account Types Usage Feature

This feature adds a "Clients" count column to the Account Types table that shows live client usage data.

## Feature Flag Control

The feature is controlled by a feature flag and is **disabled by default** to maintain backward compatibility.

### Enable the feature:

**Option 1: Environment Variable**
```bash
VITE_FF_ACCOUNT_TYPES_USAGE=1
```

**Option 2: Browser localStorage**
```javascript
localStorage.setItem('ff_account_types_usage', '1');
location.reload();
```

### Disable the feature:
```javascript
localStorage.removeItem('ff_account_types_usage');
location.reload();
```

## Backend Requirements

The feature expects one of these backend endpoints:

### Option 1 (Preferred): Single endpoint with counts
```http
GET /account-types?include=counts
```

Response:
```json
[
  {
    "id": "string",
    "name": "string", 
    "status": "ACTIVE|DISABLED",
    "createdAt": "ISO date string",
    "createdByName": "string",
    "clientsCount": 42,
    "leadsCount": 15
  }
]
```

### Option 2 (Fallback): Separate usage endpoint
```http
GET /account-types/usage?ids=id1,id2,id3
```

Response:
```json
[
  {
    "accountTypeId": "string",
    "clients": 42,
    "leads": 15
  }
]
```

## File Structure

```
src/
├── lib/flags.ts                                    # Feature flag function
├── features/accountTypes_next/
│   ├── types/accountType.ts                       # DTO interfaces
│   └── adapters/AccountTypesAdapter.tsx           # Data fetching adapter
├── state/services/accountTypesApi.ts              # RTK Query endpoints
├── features/accountTypes/accountTypeColumns.tsx   # Updated columns (added clientsCount)
└── pages/management/trading/AccountTypesPage.tsx  # Page with feature flag logic
```

## Cache Invalidation

The feature automatically invalidates RTK Query cache when:
- Clients are created/updated/deleted (tag: `Client`)
- Leads are created/updated/deleted (tag: `Lead`) 
- Account types are modified (tag: `AccountType`)

This ensures real-time count updates without manual refresh.

## QA Testing

1. **Default state**: Feature should be OFF, page unchanged
2. **Enable feature**: Run `localStorage.setItem('ff_account_types_usage','1'); location.reload()`
3. **Verify**: Clients column appears with badges showing client counts
4. **Data validation**: Counts should reflect real backend data, not mock data
5. **Layout**: No visual regressions in light/dark themes
6. **Empty state**: Column header visible even with 0 account types
7. **Responsiveness**: Column sizing adapts properly on different screen sizes

## Rollback

To completely disable the feature and revert to legacy behavior:
1. Set the feature flag to OFF 
2. The legacy implementation renders unchanged
3. No data migration or cleanup needed

The feature is 100% non-destructive and maintains full backward compatibility.