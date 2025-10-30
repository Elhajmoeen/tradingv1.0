// Copy this entire script and paste it into your browser console
// Press F12 → Console tab → Paste this code → Press Enter

console.log('🚀 Enabling Account Type Assets Feature...');

// Enable the feature flag
localStorage.setItem('ff_account_type_asset_rules', '1');

// Verify it was set
const flagValue = localStorage.getItem('ff_account_type_asset_rules');
console.log('✅ Feature flag set to:', flagValue);

// Check if we're on the right page
const currentPath = window.location.pathname;
console.log('📍 Current page:', currentPath);

if (currentPath.includes('/account-types/new')) {
    console.log('🔄 Reloading page to show Assets table...');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
} else {
    console.log('📝 Navigate to: http://localhost:5173/management/trading/account-types/new');
    console.log('   Then refresh the page to see the Assets Configuration section');
}