// Quick localStorage debugging script
console.log('=== DEBUGGING REDUX LOCALSTORAGE ===')

const rtkState = localStorage.getItem('rtk-state')
if (rtkState) {
  try {
    const parsed = JSON.parse(rtkState)
    console.log('Found rtk-state in localStorage:', {
      hasPositions: !!parsed.positions,
      positionsLength: parsed.positions?.open?.length || 0,
      hasEntities: !!parsed.entities,
      entitiesLength: Object.keys(parsed.entities?.items || {}).length
    })
    console.log('Full parsed state:', parsed)
  } catch (e) {
    console.error('Failed to parse rtk-state:', e)
  }
} else {
  console.log('No rtk-state found in localStorage')
}

console.log('All localStorage keys:', Object.keys(localStorage))