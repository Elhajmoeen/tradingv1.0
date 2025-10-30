# CRM Client Profile - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: Provide a comprehensive, responsive client profile interface for CRM users to view and edit all client data efficiently
- **Success Indicators**: Users can quickly scan, edit, and save client information with clear visual feedback and responsive design across all devices
- **Experience Qualities**: Professional, efficient, responsive

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Acting and Interacting - users primarily edit and view client data

## Thought Process for Feature Selection
- **Core Problem Analysis**: CRM users need a clean, organized way to view and edit comprehensive client profiles with immediate feedback
- **User Context**: Business users managing client relationships need quick access to all client data in a structured format
- **Critical Path**: Navigate to client → view organized data → edit fields → see saving status → continue workflow
- **Key Moments**: Field editing with immediate validation, saving indicators, responsive layout adaptation

## Essential Features

### Dynamic Field System
- **Functionality**: All fields rendered from profileTabs registry configuration
- **Purpose**: Enables easy addition of new fields without code changes
- **Success Criteria**: Adding a field to profileTabs automatically appears in UI

### Responsive Field Rows
- **Functionality**: FieldRow component with adaptive layout (label | value on desktop, stacked on mobile)
- **Purpose**: Consistent data presentation across all screen sizes
- **Success Criteria**: Clean layout on mobile/tablet/desktop with proper spacing

### Real-time Saving Indicators
- **Functionality**: Shows "Saving..." when fields are dirty, "All changes saved" when complete
- **Purpose**: Provides user confidence that data is being persisted
- **Success Criteria**: Immediate feedback on field changes with clear saving status

### Positions DataGrid (Enhanced)
- **Functionality**: Full-width, compact trading positions table with Open/Closed/Pending views
- **Purpose**: Professional financial data presentation with optimal readability
- **Success Criteria**: Clean 2025 design with Poppins font, readable numbers, and responsive layout

### Avatar Management
- **Functionality**: Click-to-upload avatar with instant preview
- **Purpose**: Visual client identification and personalization
- **Success Criteria**: File picker opens on click, image displays immediately after selection

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence, organized efficiency
- **Design Personality**: Clean, business-focused, trustworthy
- **Visual Metaphors**: Form-based data entry, structured information hierarchy
- **Simplicity Spectrum**: Clean minimal interface with clear information hierarchy

### Color Strategy
- **Color Scheme Type**: Monochromatic with subtle accent colors
- **Primary Color**: Professional blue (oklch(47% 0.13 230)) for actions and focus states
- **Secondary Colors**: Neutral grays for backgrounds and borders
- **Accent Color**: Green for success states, red for required fields and errors
- **Color Psychology**: Blue conveys trust and professionalism, green indicates success
- **Foreground/Background Pairings**: 
  - Light background (oklch(98% 0 0)) with dark text (oklch(15% 0 0))
  - White cards (oklch(100% 0 0)) with dark text
  - Primary blue backgrounds with white text

### Typography System
- **Font Pairing Strategy**: Single font family (Poppins) with varied weights
- **Typographic Hierarchy**: Bold for headings, medium for labels, normal for values
- **Font Personality**: Modern, clean, highly legible
- **Typography Consistency**: Consistent sizing and spacing throughout

### Visual Hierarchy & Layout
- **Attention Direction**: Section headers → field labels → field values → actions
- **White Space Philosophy**: Generous spacing between sections, compact within field rows
- **Grid System**: Two-column field layout on desktop, single column on mobile
- **Responsive Approach**: Mobile-first with progressive enhancement
- **Content Density**: Balanced - comprehensive data without overwhelming users

### UI Elements & Component Selection
- **Component Usage**: 
  - FieldRow for consistent label/value pairs
  - Tabs for organizing related field groups
  - Buttons for actions with appropriate variants
  - Avatar with upload functionality
  - Enhanced DataGrid with clean 2025 styling
- **DataGrid Enhancement**: Custom styled MUI DataGrid with professional aesthetics
  - Poppins font family throughout for consistency
  - Subtle borders and hover states without gradients
  - Full-width layout with compact density (44px row height)
  - Enhanced typography hierarchy with proper font weights
  - Monospace numbers for financial data alignment
  - Professional color-coded PnL indicators (green/red)
  - Improved pagination (10/25/50 rows options)
- **Component States**: Clear hover, focus, and disabled states for all interactive elements
- **Spacing System**: Consistent padding using Tailwind spacing scale

## Implementation Considerations

### Dynamic Field System
- Fields defined in profileTabs configuration automatically render
- Support for all field types: text, email, phone, select, date, textarea, boolean, rating, calculated
- Nested field support with dot notation (e.g., 'address.city')

### State Management
- useKV for persistent client data storage
- Real-time dirty state tracking for saving indicators
- Debounced save simulation with user feedback

### Responsive Design
- FieldRow component handles responsive layout
- 240px fixed label width on desktop, stacked on mobile
- Full-width support for textarea fields
- Mobile-optimized button layouts

### Accessibility
- aria-label attributes on all form inputs
- Proper label associations
- Keyboard navigation support
- Screen reader friendly structure

## Edge Cases & Problem Scenarios
- **Missing Entity Data**: Graceful handling when client not found
- **Network Issues**: Local state preservation with retry indicators
- **Large Data Sets**: Efficient rendering with proper scrolling
- **Field Validation**: Clear error states and recovery paths

## Reflection
This approach creates a professional, efficient client profile interface that scales with business needs while maintaining excellent user experience across all devices. The dynamic field system ensures future-proofing while the responsive design provides accessibility for all users.