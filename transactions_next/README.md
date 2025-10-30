# Transactions NEXT

Modern RTK Query-based transaction management system for the CRM application.

## Overview

The `transactions_next` feature provides a complete RTK Query-based implementation for transaction management, following the same proven pattern as `positions_next`. This enables gradual migration from Redux-based state to modern RTK Query API state management while maintaining full backward compatibility.

## Features

- **RTK Query API**: Full CRUD operations with caching and automatic re-fetching
- **Feature Flag Control**: Safe gradual rollout via `isTransactionsNextEnabled()`
- **Backward Compatibility**: Adapter pattern preserves existing UI components
- **WebSocket Integration**: Real-time transaction updates (infrastructure ready)
- **Type Safety**: Complete TypeScript coverage with Zod validation
- **Developer Experience**: Dev tools integration and debugging utilities

## Architecture

```
src/features/transactions_next/
├── api/
│   └── transactionsApi.ts         # RTK Query API endpoints
├── adapters/
│   └── TransactionsAdapter.tsx    # Legacy compatibility layer
├── components/
│   └── TransactionsTable.tsx      # RTK Query-powered table
├── integration/
│   └── websocket.ts               # WebSocket message handlers
├── types/
│   ├── transaction.ts             # TypeScript interfaces
│   └── transaction.schema.ts      # Zod validation schemas
└── index.ts                       # Public API exports
```

## Usage

### Basic Integration

```tsx
import { TransactionsAdapter } from '@/features/transactions_next'

// Automatically routes between legacy and RTK Query based on feature flag
<TransactionsAdapter clientId={clientId} />
```

### Direct RTK Query Usage

```tsx
import { useGetTransactionsQuery } from '@/features/transactions_next'

const { data: transactions, isLoading, error } = useGetTransactionsQuery({ clientId })
```

### Feature Flag Control

```tsx
import { isTransactionsNextEnabled } from '@/lib/flags'

// Enable via environment variable
VITE_ENABLE_TRANSACTIONS_NEXT=true

// Or enable via localStorage (for testing)
localStorage.setItem('enableTransactionsNext', 'true')
```

## Data Flow

1. **RTK Query**: Manages API calls, caching, and state synchronization
2. **Zod Validation**: Ensures runtime type safety for API responses
3. **Adapter Layer**: Transforms DTOs to legacy format for UI compatibility
4. **WebSocket**: Real-time updates (when feature flag enabled)

## API Endpoints

- `GET /transactions/{clientId}` - List transactions for client
- `GET /transactions/single/{transactionId}` - Get single transaction
- `POST /transactions` - Create new transaction
- `PUT /transactions/{transactionId}` - Update transaction
- `DELETE /transactions/{transactionId}` - Delete transaction
- `GET /transactions/filter` - Filtered transaction search

## WebSocket Events

- `TRANSACTION_UPDATE` - Transaction modified
- `TRANSACTION_CREATED` - New transaction added
- `TRANSACTION_APPROVED` - Transaction approved
- `TRANSACTION_DECLINED` - Transaction declined

## Development

The feature is fully feature-flagged and ready for development/testing:

1. Enable feature flag: `localStorage.setItem('enableTransactionsNext', 'true')`
2. Check browser dev tools for "🚀 RTK Query" indicators
3. Monitor Redux DevTools for RTK Query actions
4. Use WebSocket dev tools for real-time update testing

## Migration Notes

- Maintains 100% UI compatibility via adapter pattern
- Existing Redux `transactionsSlice` remains untouched
- Feature flag allows instant rollback if needed
- No breaking changes to existing components

## Integration Points

- **FinanceTab**: Transaction history section uses adapter
- **Store Configuration**: RTK Query API auto-injected into store
- **WebSocket**: Handlers ready for integration with main WebSocket service
- **Type System**: Fully integrated with existing TypeScript types