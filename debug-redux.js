// Run this in browser console to debug Redux state

console.log('=== REDUX STATE DEBUGGING ===')

// Check if there's anything in localStorage
const rtkState = localStorage.getItem('rtk-state')
if (rtkState) {
  try {
    const parsed = JSON.parse(rtkState)
    console.log('localStorage rtk-state:', {
      positions: parsed.positions,
      entities: parsed.entities
    })
  } catch (e) {
    console.error('Failed to parse rtk-state:', e)
  }
} else {
  console.log('No rtk-state found in localStorage')
}

// Check current Redux state
if (window.store) {
  const state = window.store.getState()
  console.log('Current Redux state:', {
    positions: state.positions,
    entities: state.entities
  })
}

// Function to clear localStorage and refresh
window.debugClearAndReload = () => {
  localStorage.removeItem('rtk-state')
  console.log('Cleared rtk-state, reloading...')
  window.location.reload()
}

console.log('Available functions:')
console.log('- window.clearReduxState() - Clear Redux localStorage')
console.log('- window.debugClearAndReload() - Clear and reload page')
console.log('===============================')