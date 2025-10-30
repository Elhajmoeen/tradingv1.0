# Mock Service Worker (MSW) Setup

This directory contains a comprehensive MSW harness that enables the app to run fully without a backend. The mocking is **DEV-only** and **feature-flag gated** for safe operation.

## 🎯 Purpose

- Enable development and testing without a real backend
- Provide realistic mock data for all domains
- Support gradual rollout via feature flags
- Non-destructive and idempotent operation

## 🚩 Feature Flag Activation

MSW starts **only** when these conditions are met:

1. **Development mode**: `import.meta.env.DEV === true`
2. **Any "next" feature flag enabled**:
   - `localStorage.getItem('ff_positions_next') === '1'`
   - `localStorage.getItem('ff_transactions_next') === '1'`
   - `localStorage.getItem('ff_leads_next') === '1'` 
   - `localStorage.getItem('ff_profile_next') === '1'`
   - **OR** corresponding `VITE_FF_*` environment variables

## 📁 Structure

```
src/mocks/
├── browser.ts              # MSW worker setup
├── utils.ts                # Query parsing and data processing utilities
├── data/                   # Realistic seed data
│   ├── positionsSeed.ts    # Mock positions (30 items)
│   ├── transactionsSeed.ts # Mock transactions (60 items)
│   ├── leadsSeed.ts        # Mock leads (60 items)
│   ├── clientsSeed.ts      # Mock clients (50 items)
│   └── documentsSeed.ts    # Mock documents (60 items)
└── handlers/               # MSW request handlers
    ├── positions.ts        # Positions API endpoints
    ├── transactions.ts     # Transactions API endpoints
    ├── leads.ts           # Leads API endpoints
    ├── clients.ts         # Clients API endpoints
    └── documents.ts       # Documents API endpoints
```

## 🔌 API Coverage

### Positions API
- `GET /api/positions/{open|pending|closed}`
- `GET /api/positions/:id`
- `POST /api/positions`
- `PATCH /api/positions/:id`
- `POST /api/positions/:id/{close|cancel|reopen}`
- `DELETE /api/positions/:id`

### Transactions API
- `GET /api/transactions/:clientId`
- `GET /api/transactions/single/:id`
- `GET /api/transactions/filter`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/:id/{approve|decline}`

### Leads API
- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PATCH /api/leads/:id`
- `DELETE /api/leads/:id`
- `POST /api/leads/:id/{convert|assign}`

### Clients API
- `GET /api/clients`
- `GET /api/clients/:id`
- `PATCH /api/clients/:id`
- `GET /api/clients/:id/{positions|transactions}`
- `POST /api/clients`
- `POST /api/clients/:id/{activate|deactivate}`

### Documents API
- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents`
- `PATCH /api/documents/:id`
- `POST /api/documents/:id/{approve|reject}`
- `DELETE /api/documents/:id`
- `GET /api/documents/download/:id`

## 🧪 Testing Instructions

### Enable MSW:
```javascript
// Set any feature flag
localStorage.setItem('ff_transactions_next', '1')

// Or via environment
VITE_FF_TRANSACTIONS_NEXT=1
```

### Verify MSW is Active:
1. Open browser dev tools console
2. Look for: `🚀 MSW: Mock Service Worker started`
3. Network requests to `/api/*` will show `[MSW]` in dev tools

### Disable MSW:
```javascript
// Remove all feature flags
localStorage.removeItem('ff_transactions_next')
localStorage.removeItem('ff_positions_next')
// ... etc

// Or set to '0'
localStorage.setItem('ff_transactions_next', '0')
```

## 📊 Mock Data Features

- **Realistic relationships**: Clients have matching positions and transactions
- **Proper distributions**: Status distributions mirror real usage patterns
- **Consistent IDs**: Cross-references between entities work correctly
- **Pagination support**: All endpoints support query parameters
- **Search/filter**: Full text search and field filtering
- **Sorting**: Multi-field sorting with proper type handling

## 🛠 Query Parameters

All list endpoints support:
- `page` - Page number (1-based)
- `pageSize` - Items per page
- `sort` - Field to sort by
- `order` - Sort direction (`asc`|`desc`)
- `clientId` - Filter by client
- Any field name for filtering

## 🔄 Data Persistence

- Mock data is **in-memory only**
- Changes persist during the session
- **Resets on page refresh**
- No real data is modified

## 🚨 Safety Features

- **DEV-only**: Never runs in production
- **Feature-gated**: Only activates when explicitly enabled
- **Bypass unhandled**: Real API calls pass through if not mocked
- **Error handling**: App continues to work if MSW fails to load

## 🎛 Development Controls

```javascript
// Check current status
console.log('MSW active:', Boolean(window.__MSW_WORKER__))

// View mock data
import { positionsSeed, transactionsSeed } from '@/mocks'
console.log('Positions:', positionsSeed.length)
console.log('Transactions:', transactionsSeed.length)

// Test API directly
fetch('/api/positions/open').then(r => r.json()).then(console.log)
```

This MSW setup provides a complete backend simulation for development and testing! 🎯