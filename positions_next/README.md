# Positions Next (RTK Query Implementation)

## Overview

The **positions_next** feature is a complete RTK Query-based positions management system designed to gradually replace the existing Redux-based position management. It provides modern API state management with automatic caching, real-time updates, and backward compatibility.

## Feature Flag

The system is controlled by the `isPositionsNextEnabled()` feature flag:

```typescript
// Enable via environment variable
VITE_FF_POSITIONS_NEXT=1

// Enable via localStorage (development)
localStorage.setItem('ff_positions_next', 'true')

// Enable via URL parameter (development)
?ff_positions_next=1
```

## Architecture

### Core Components

1. **Feature Flag System** (`src/lib/flags.ts`)
   - Environment variable support
   - localStorage override (dev only)
   - URL parameter override (dev only)

2. **RTK Query API** (`src/features/positions_next/state/positionsApi.ts`)
   - Complete CRUD operations
   - Automatic cache invalidation
   - Zod validation for responses
   - TypeScript-first design

3. **Type System** (`src/features/positions_next/types/`)
   - `position.ts`: Core interfaces and request/response types
   - `position.schema.ts`: Zod schemas for runtime validation

4. **Adapter Layer** (`src/features/positions_next/adapters/`)
   - Backward compatibility with existing components
   - Data transformation between DTO and legacy formats
   - Graceful feature flag fallbacks

5. **WebSocket Integration** (`src/features/positions_next/integration/websocket.ts`)
   - Real-time position updates
   - Cache invalidation on WebSocket messages
   - Feature flag aware

## API Endpoints

### Queries

- `listOpen(params?)` - Get open positions
- `listPending(params?)` - Get pending positions  
- `listClosed(params?)` - Get closed positions
- `getById(id)` - Get single position by ID

### Mutations

- `create(data)` - Create new position
- `update({id, body})` - Update existing position
- `close({id, body})` - Close position
- `cancel({id, body?})` - Cancel position
- `reopen({id, body})` - Reopen closed position

### Query Parameters

All list endpoints support:
```typescript
interface ListQueryParams {
  page?: number
  pageSize?: number  
  sort?: string
  filter?: Record<string, string | number | boolean>
  clientId?: string
}
```

## Usage Examples

### In Components

```typescript
import { useListOpenQuery, useCloseMutation } from '@/features/positions_next/state/positionsApi'

// Query data
const { data: positions, isLoading, error } = useListOpenQuery({ clientId: 'client123' })

// Mutations
const [closePosition, { isLoading: isClosing }] = useCloseMutation()

const handleClose = async (positionId: string) => {
  try {
    await closePosition({ 
      id: positionId, 
      body: { closePrice: 1.2345, closeReason: 'User requested' }
    }).unwrap()
  } catch (error) {
    console.error('Failed to close position:', error)
  }
}
```

### Via Adapters (Legacy Components)

```typescript
import { tableAdapter, modalAdapter } from '@/features/positions_next/adapters'

// For existing table components
const positions = await tableAdapter.getOpenPositions(clientId)

// For existing modal components  
const newPosition = await modalAdapter.createPosition(formData)
```

## Data Flow

### Request Flow
1. Component calls RTK Query hook
2. RTK Query checks cache first
3. If cache miss, makes HTTP request via `baseApi`
4. Response validated with Zod schemas
5. Cached data returned to component

### Real-time Updates
1. WebSocket message received
2. `handlePositionWebSocketMessage()` processes message
3. Position data validated with Zod
4. RTK Query cache updated via `updateQueryData()`
5. Components automatically re-render with new data

### Backward Compatibility
1. Existing components call adapter functions
2. Adapter checks feature flag
3. If enabled: Uses RTK Query and transforms data
4. If disabled: Falls back to existing Redux logic
5. Consistent interface for all components

## Type Safety

### DTO Types (API Layer)
```typescript
interface PositionDTO {
  id: string
  clientId: string
  instrument: string
  side: 'BUY' | 'SELL'
  amountUnits: number
  openPrice: number
  status: 'OPEN' | 'PENDING' | 'CLOSED' | 'CANCELLED'
  // ... additional fields
}
```

### Legacy Types (Component Layer)
```typescript  
interface Position {
  id: string
  clientId: string
  instrument: string
  type: 'Buy' | 'Sell'
  amount: number
  openPrice: number
  status: 'open' | 'closed' | 'pending'
  // ... legacy fields
}
```

### Runtime Validation
- All API responses validated with Zod schemas
- Automatic type coercion for numbers
- Graceful error handling with fallbacks
- Development-only validation logging

## Error Handling

### API Errors
- RTK Query provides built-in retry logic
- Error states accessible via hooks (`error`, `isError`)
- Automatic error serialization for network issues

### Validation Errors  
- Zod validation catches malformed responses
- DEV-only console logging for debugging
- Graceful fallbacks to prevent crashes

### WebSocket Errors
- Try-catch around all WebSocket message handling
- Errors logged but don't break application flow
- Feature flag can disable problematic features

## Performance Optimizations

### Caching Strategy
- Automatic cache invalidation with tags
- Position-specific cache updates via WebSocket
- Optimistic updates for mutations

### Bundle Size
- Tree-shakable RTK Query endpoints
- Conditional imports based on feature flags
- Zod schemas only bundled when feature enabled

### Memory Management
- Cache automatically cleaned by RTK Query
- WebSocket listeners properly cleaned up
- Feature flag prevents unnecessary work

## Migration Strategy

### Phase 1: Foundation ✅
- Feature flag system
- Base RTK Query configuration  
- Type definitions and schemas

### Phase 2: Core Implementation ✅
- Complete RTK Query endpoints
- Adapter layer for backward compatibility
- WebSocket integration scaffolding

### Phase 3: Integration (Next)
- Update existing components to use adapters
- Add WebSocket message handlers to app
- Performance testing and optimization

### Phase 4: Migration (Future)  
- Gradually remove adapter layer
- Update components to use RTK Query directly
- Remove legacy Redux position state

## Debugging & Development

### Browser DevTools
```javascript
// Access RTK Query state
window.store.getState().api

// Clear RTK Query cache
window.store.dispatch(positionsApi.util.resetApiState())

// Mock WebSocket messages
import { mockPositionWebSocketMessage } from './websocket'
mockPositionWebSocketMessage('POSITION_UPDATE', positionData)
```

### Environment Variables
```bash
# Enable feature flag
VITE_FF_POSITIONS_NEXT=1

# API endpoint
VITE_API_URL=http://localhost:3000/api

# WebSocket endpoint  
VITE_WS_URL=ws://localhost:8080
```

### Logging
- Feature flag status logged on initialization
- WebSocket message processing (DEV only)
- Zod validation errors (DEV only)
- Cache invalidation events (DEV only)

## Testing Strategy

### Unit Tests
- RTK Query endpoint definitions
- Zod schema validation  
- Adapter data transformations
- Feature flag logic

### Integration Tests
- End-to-end API workflows
- WebSocket message handling
- Cache invalidation scenarios
- Backward compatibility

### Manual Testing
- Feature flag toggling
- Real-time update behavior
- Error handling scenarios
- Performance under load

## Production Readiness

### Checklist
- [ ] Feature flag properly configured
- [ ] API endpoints tested with real backend
- [ ] WebSocket integration connected
- [ ] Error handling validated
- [ ] Performance benchmarked
- [ ] Backward compatibility verified
- [ ] Documentation complete
- [ ] Tests passing

### Rollout Strategy
1. Deploy with feature flag disabled
2. Enable for internal users first
3. A/B test with subset of production users
4. Monitor performance and error rates
5. Full rollout once validated
6. Legacy system deprecation planning

## Future Enhancements

### Planned Features
- Optimistic updates for better UX
- Offline support with conflict resolution
- Advanced filtering and sorting
- Bulk operations support
- Real-time performance metrics

### Technical Debt
- Remove adapter layer after migration
- Consolidate position type definitions
- Optimize bundle size further
- Enhanced TypeScript integration
- Improved error boundary handling

## Support & Maintenance

### Common Issues
- Feature flag not working: Check environment variables
- WebSocket not updating: Verify connection and message format
- Type errors: Ensure proper DTO to Position mapping
- Cache stale: Use RTK Query invalidation tools

### Monitoring
- RTK Query cache hit rates
- API response times
- WebSocket connection stability  
- Error rates by endpoint
- Feature flag adoption metrics