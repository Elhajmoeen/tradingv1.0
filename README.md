# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything's fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas

## Backend Configuration

### Environment Variables

Create `.env.local` with your backend endpoints:

```bash
# Staging Environment
VITE_API_URL=https://staging-api.yourcompany.com/api
VITE_WS_URL=wss://staging-ws.yourcompany.com/stream
VITE_AUTH_SCHEME=Bearer
VITE_FF_POSITIONS_NEXT=1

# Production Environment
VITE_API_URL=https://api.yourcompany.com/api
VITE_WS_URL=wss://ws.yourcompany.com/stream
VITE_AUTH_SCHEME=Bearer
VITE_FF_POSITIONS_NEXT=0
```

### Positions NEXT Feature

The positions management system supports both legacy Redux and modern RTK Query implementations:

- **Flag OFF (default)**: Uses existing Redux-based position management
- **Flag ON**: Uses RTK Query with real backend integration and WebSocket updates
- **DEV mode**: Additional diagnostics panel available for debugging

🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

## Feature Flags

### Auth Re-authentication

**VITE_FF_AUTH_REAUTH=0|1** or localStorage.setItem('ff_auth_reauth','1')

Enables automatic token refresh on 401 responses:
- **Flag OFF (default)**: 401 errors bubble up unchanged (existing behavior)
- **Flag ON**: Automatically attempts token refresh and retries failed request

**Refresh contract**: POST ${VITE_AUTH_REFRESH_PATH} → { token: string }

### Role-based Route Protection

ProtectedRoute component supports optional role restrictions:

```tsx
// Open to all authenticated users (existing behavior)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Restricted to specific roles
<ProtectedRoute allowedRoles={['Admin', 'Manager']}>
  <AdminPanel />
</ProtectedRoute>
```

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
