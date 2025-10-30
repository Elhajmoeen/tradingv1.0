import React, { Suspense, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAllEntities } from '@/state/entitiesSlice'

// Lazy load the actual LeadsPage with emergency patches applied first
const LazyLeadsPage = React.lazy(async () => {
  // CRITICAL: Import the patch BEFORE importing LeadsPage to fix temporal dead zone
  await import('./LeadsPagePatch')
  
  // Now safely import LeadsPage
  return import('./LeadsPage')
})

// Error Boundary class component
class LeadsErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LeadsPage Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <LeadsPageError error={this.state.error!} retry={this.props.onRetry} />
    }

    return this.props.children
  }
}

// Loading component
const LeadsPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-900">Loading Leads...</p>
      <p className="mt-1 text-sm text-gray-600">Initializing data and components</p>
    </div>
  </div>
)

// Error fallback component
const LeadsPageError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Leads Page</h2>
      <p className="text-sm text-gray-600 mb-4">
        There was an error loading the leads page. This might be due to missing dependencies or initialization issues.
      </p>
      <div className="space-y-2">
        <button 
          onClick={retry}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
      <details className="mt-4 text-left">
        <summary className="text-sm text-gray-500 cursor-pointer">Technical details</summary>
        <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
)

export default function LeadsPageWrapper() {
  const entities = useSelector(selectAllEntities)
  const [retryKey, setRetryKey] = useState(0)
  const [isInitialized, setIsInitialized] = useState(true)

  const handleRetry = () => {
    setRetryKey(prev => prev + 1)
    setIsInitialized(false)
    setTimeout(() => setIsInitialized(true), 100)
  }

  return (
    <Suspense key={retryKey} fallback={<LeadsPageLoading />}>
      <LeadsErrorBoundary onRetry={handleRetry}>
        <LazyLeadsPage />
      </LeadsErrorBoundary>
    </Suspense>
  )
}