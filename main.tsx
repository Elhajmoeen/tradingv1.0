import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import TestApp from './TestApp.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// MSW initialization for development
async function initializeMSW() {
  if (import.meta.env.DEV) {
    // Check if any "next" feature flags are enabled
    const useMSW =
      localStorage.getItem('ff_positions_next') === '1' ||
      localStorage.getItem('ff_transactions_next') === '1' ||
      localStorage.getItem('ff_leads_next') === '1' ||
      localStorage.getItem('ff_profile_next') === '1' ||
      // PATCH: begin MSW for Status Manager
      localStorage.getItem('ff_status_manager') === '1' ||
      window.location.pathname === '/admin/status-manager' || // Auto-enable for Status Manager page
      // PATCH: end MSW for Status Manager
      import.meta.env.VITE_FF_POSITIONS_NEXT === '1' ||
      import.meta.env.VITE_FF_TRANSACTIONS_NEXT === '1' ||
      import.meta.env.VITE_FF_LEADS_NEXT === '1' ||
      import.meta.env.VITE_FF_PROFILE_NEXT === '1';
    
    if (useMSW) {
      try {
        const { worker } = await import("@/mocks/browser");
        await worker.start({ onUnhandledRequest: "bypass" });
        console.log('🚀 MSW: Mock Service Worker started');
      } catch (error) {
        console.warn('⚠️ MSW: Failed to start Mock Service Worker:', error);
      }
    } else {
      console.log('📡 MSW: No feature flags enabled, using real API');
    }
  }
}

// Initialize MSW then render the app
initializeMSW().then(() => {
  createRoot(document.getElementById('root')!).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  )
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  // Render app anyway if MSW fails
  createRoot(document.getElementById('root')!).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  )
})
