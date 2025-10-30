/**
 * Test file to validate the positions_next RTK Query implementation
 * Run this in browser console to test the system
 */

import { store } from '@/state/store'
import { positionsApi } from '@/features/positions_next/state/positionsApi'
import { isPositionsNextEnabled } from '@/lib/flags'
import { mockPositionWebSocketMessage } from '@/features/positions_next/integration/websocket'

/**
 * Test the feature flag system
 */
export const testFeatureFlag = () => {
  console.log('🏁 Testing feature flag system...')
  
  const isEnabled = isPositionsNextEnabled()
  console.log(`Feature flag status: ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}`)
  
  if (!isEnabled) {
    console.log('💡 To enable: Set VITE_FF_POSITIONS_NEXT=1 or add ?ff_positions_next=1 to URL')
  }
  
  return isEnabled
}

/**
 * Test RTK Query API endpoints
 */
export const testRTKQueryAPI = async () => {
  console.log('🔄 Testing RTK Query API endpoints...')
  
  if (!isPositionsNextEnabled()) {
    console.log('❌ Feature flag disabled - skipping API tests')
    return
  }
  
  try {
    // Test fetching open positions
    console.log('📋 Testing listOpen endpoint...')
    const openResult = await store.dispatch(
      positionsApi.endpoints.listOpen.initiate()
    )
    
    if (openResult.isSuccess) {
      console.log('✅ Open positions fetched successfully:', openResult.data?.length, 'positions')
    } else {
      console.log('⚠️ Open positions fetch failed:', openResult.error)
    }
    
    // Test fetching pending positions
    console.log('⏳ Testing listPending endpoint...')
    const pendingResult = await store.dispatch(
      positionsApi.endpoints.listPending.initiate()
    )
    
    if (pendingResult.isSuccess) {
      console.log('✅ Pending positions fetched successfully:', pendingResult.data?.length, 'positions')
    } else {
      console.log('⚠️ Pending positions fetch failed:', pendingResult.error)
    }
    
    // Test fetching closed positions
    console.log('📁 Testing listClosed endpoint...')
    const closedResult = await store.dispatch(
      positionsApi.endpoints.listClosed.initiate()
    )
    
    if (closedResult.isSuccess) {
      console.log('✅ Closed positions fetched successfully:', closedResult.data?.length, 'positions')
    } else {
      console.log('⚠️ Closed positions fetch failed:', closedResult.error)
    }
    
    return {
      open: openResult.isSuccess,
      pending: pendingResult.isSuccess,
      closed: closedResult.isSuccess
    }
    
  } catch (error) {
    console.error('❌ RTK Query API test failed:', error)
    return { open: false, pending: false, closed: false }
  }
}

/**
 * Test adapter layer
 */
export const testAdapters = async () => {
  console.log('🔧 Testing adapter layer...')
  
  if (!isPositionsNextEnabled()) {
    console.log('❌ Feature flag disabled - skipping adapter tests')
    return
  }
  
  try {
    const { tableAdapter, modalAdapter } = await import('@/features/positions_next/adapters')
    
    // Test table adapter
    console.log('📊 Testing table adapter...')
    const openPositions = await tableAdapter.getOpenPositions()
    console.log('✅ Table adapter getOpenPositions:', openPositions.length, 'positions')
    
    const pendingPositions = await tableAdapter.getPendingPositions()
    console.log('✅ Table adapter getPendingPositions:', pendingPositions.length, 'positions')
    
    const closedPositions = await tableAdapter.getClosedPositions()
    console.log('✅ Table adapter getClosedPositions:', closedPositions.length, 'positions')
    
    // Test getting specific position if any exist
    if (openPositions.length > 0) {
      const firstPosition = await tableAdapter.getPositionById(openPositions[0].id)
      console.log('✅ Table adapter getPositionById:', firstPosition ? 'success' : 'failed')
    }
    
    console.log('✅ Modal adapter available:', typeof modalAdapter.createPosition === 'function')
    
    return true
    
  } catch (error) {
    console.error('❌ Adapter test failed:', error)
    return false
  }
}

/**
 * Test WebSocket integration
 */
export const testWebSocket = () => {
  console.log('🌐 Testing WebSocket integration...')
  
  if (!isPositionsNextEnabled()) {
    console.log('❌ Feature flag disabled - skipping WebSocket tests')
    return
  }
  
  try {
    // Test mock WebSocket message
    const mockPositionData = {
      id: 'test-position-123',
      clientId: 'client-456',
      instrument: 'EURUSD',
      side: 'BUY',
      amountUnits: 10000,
      openPrice: 1.0850,
      currentPrice: 1.0855,
      status: 'OPEN',
      openTime: new Date().toISOString()
    }
    
    console.log('📡 Sending mock WebSocket message...')
    mockPositionWebSocketMessage('POSITION_UPDATE', mockPositionData)
    console.log('✅ Mock WebSocket message processed successfully')
    
    return true
    
  } catch (error) {
    console.error('❌ WebSocket test failed:', error)
    return false
  }
}

/**
 * Test Redux store integration
 */
export const testStoreIntegration = () => {
  console.log('🏪 Testing Redux store integration...')
  
  try {
    const state = store.getState()
    
    // Check if baseApi is in the store
    const hasBaseApi = 'api' in state
    console.log('✅ Base API in store:', hasBaseApi ? 'yes' : 'no')
    
    // Check RTK Query state
    if (hasBaseApi) {
      const apiState = (state as any).api
      const hasQueries = 'queries' in apiState
      const hasMutations = 'mutations' in apiState
      
      console.log('✅ RTK Query queries:', hasQueries ? 'available' : 'not available')
      console.log('✅ RTK Query mutations:', hasMutations ? 'available' : 'not available')
    }
    
    return hasBaseApi
    
  } catch (error) {
    console.error('❌ Store integration test failed:', error)
    return false
  }
}

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Running positions_next validation tests...\n')
  
  const results = {
    featureFlag: testFeatureFlag(),
    storeIntegration: testStoreIntegration(),
    webSocket: testWebSocket(),
    rtqQuery: null as any,
    adapters: null as any
  }
  
  if (results.featureFlag) {
    results.rtqQuery = await testRTKQueryAPI()
    results.adapters = await testAdapters()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`Feature Flag: ${results.featureFlag ? '✅' : '❌'}`)
  console.log(`Store Integration: ${results.storeIntegration ? '✅' : '❌'}`)
  console.log(`WebSocket: ${results.webSocket ? '✅' : '❌'}`)
  
  if (results.rtqQuery) {
    console.log(`RTK Query Open: ${results.rtqQuery.open ? '✅' : '❌'}`)
    console.log(`RTK Query Pending: ${results.rtqQuery.pending ? '✅' : '❌'}`)
    console.log(`RTK Query Closed: ${results.rtqQuery.closed ? '✅' : '❌'}`)
  } else {
    console.log('RTK Query: ⏸️ (feature disabled)')
  }
  
  console.log(`Adapters: ${results.adapters ? '✅' : results.featureFlag ? '❌' : '⏸️ (feature disabled)'}`)
  
  const allPassed = results.featureFlag && results.storeIntegration && results.webSocket &&
                   (!results.featureFlag || (results.rtqQuery?.open && results.rtqQuery?.pending && results.rtqQuery?.closed && results.adapters))
  
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed - check logs above'))
  
  return results
}

// Make tests available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testPositionsNext = {
    runAllTests,
    testFeatureFlag,
    testRTKQueryAPI,
    testAdapters,
    testWebSocket,
    testStoreIntegration
  }
  
  console.log('🧪 Positions Next tests available at: window.testPositionsNext')
  console.log('💡 Run: testPositionsNext.runAllTests()')
}