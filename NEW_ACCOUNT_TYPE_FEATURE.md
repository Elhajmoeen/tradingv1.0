# New Account Type Creation Flow

This feature adds a proper create flow for account types with a dedicated form page and API integration.

## How it Works

### 1. **List Page Integration**
- The "+ New account type" button now navigates to `/management/trading/account-types/new`
- Replaced the simple `window.prompt()` with a proper form-based flow

### 2. **Create Form Page**
- **URL**: `/management/trading/account-types/new`
- **Component**: `NewAccountTypePage`
- **Features**:
  - Responsive design (mobile-first, 2-col grid on desktop)
  - Dark/light theme support
  - Real-time validation
  - Loading states during submission
  - Error handling with toast notifications

### 3. **Form Fields**
**Basic Information:**
- Name (required)
- Status (Active/Disabled)

**Account Settings:**
- Trading Permissions: Allow Trading, Allow Trade Out
- Financial Operations: Allow Deposits, Allow Withdrawals  
- Notifications: Block Notifications
- Risk Management: Margin Call Level (%)

### 4. **API Integration**
- **Backend Contract**: `POST /account-types`
- **Request Body**:
```json
{
  "name": "string",
  "status": "ACTIVE|DISABLED", 
  "settings": {
    "blockNotifications": boolean,
    "allowedToTrade": boolean,
    "allowDeposit": boolean,
    "allowWithdraw": boolean,
    "tradeOut": boolean,
    "marginCall": number
  }
}
```

- **Response**: Returns new account type with `id` field
- **Cache**: Automatically invalidates account types list for immediate UI updates

### 5. **Post-Creation Flow**
- On success: Redirects to `/management/trading/account-types/{id}/settings`
- On error: Shows error message via toast, stays on form
- Cache invalidation triggers list refresh when user navigates back

## File Structure

```
src/
├── state/services/accountTypesApi.ts              # Extended with create/getById endpoints
├── features/accountTypes_next/
│   └── components/AccountTypeForm.tsx             # Reusable form component
├── pages/settings/account-types/
│   └── NewAccountTypePage.tsx                     # Create page with header/navigation
├── pages/management/trading/AccountTypesPage.tsx  # Updated button to navigate
└── App.tsx                                        # Added new route
```

## Backward Compatibility

- **No breaking changes** to existing functionality
- Legacy account type creation (if any) still works
- Form reuses existing account type settings structure
- API endpoints are additive (create/getById added, others unchanged)

## UX Details

### Responsive Design
- **Mobile**: Single column layout, full-width inputs
- **Desktop**: 2-column grid for better space usage
- **Settings**: Grouped in bordered cards for visual organization

### Form Validation
- Name field is required
- Margin call must be 0-100%
- Submit button disabled while loading or if name is empty

### Navigation
- Back button in header returns to account types list
- Cancel button in form returns to account types list  
- Breadcrumb-style navigation with visual indicators

### Error Handling
- Network errors shown via toast notifications
- Form validation prevents invalid submissions
- Loading states prevent duplicate submissions

## Testing

### Manual Test Flow
1. Go to Account Types list (`/management/trading/account-types`)
2. Click "+ New account type" → should navigate to create page
3. Fill out form with test data
4. Click "Create Account Type" → should show loading state
5. On success → should redirect to settings page for new account type
6. Navigate back to list → new account type should appear

### Backend Requirements
- `POST /account-types` endpoint must exist
- Must return account type with `id` field for redirect
- Should validate required fields (name)
- Should handle status and settings fields properly

## Future Enhancements

- **Form validation**: Add field-level validation
- **Settings reuse**: Extract existing settings form from edit page
- **Bulk creation**: Support creating multiple account types
- **Templates**: Pre-fill form with common configurations