# Field Audit Tool Documentation

## Overview

The Field Audit Tool is a DEV-only utility that scans the codebase to inventory all field keys and classify them as either **Static** (schema-locked) or **Dynamic** (presentation-configurable).

## Quick Start

```bash
# Install dependencies (if not already installed)
npm i -D tsx glob

# Run the audit
npm run audit:fields
```

## What It Does

The tool automatically:

1. **Scans Files** - Searches for field definitions in:
   - Zod schemas: `src/**/types/**/*.schema.ts`
   - Column configs: `src/config/**/*Columns.ts`
   - FieldKit configs: `src/fieldkit/**/*.{ts,tsx}`
   - Adapters & tables: `src/features/**/*Adapter*.tsx`, `src/components/**/*Table*.tsx`
   - State slices: `src/state/**/*Slice.ts`
   - Field configurations: `src/config/fields.ts`

2. **Extracts Field Keys** using regex patterns:
   - Zod schemas: property names before `: z.`
   - Config objects: `key: "name"` or `id: "name"`
   - Object properties: general field patterns

3. **Classifies Fields** as Static or Dynamic:
   - **Static**: Core business data (IDs, amounts, timestamps, enums)
   - **Dynamic**: UI configuration (labels, visibility, formatting)

4. **Groups by Domain** based on file paths:
   - positions, transactions, leads, clients, documents, users, etc.

## Output Files

The tool generates two reports at the project root:

### `fields-audit.md`
- Human-readable markdown report
- Summary statistics by domain
- Detailed tables showing each field with classification and sources
- Perfect for documentation and reviews

### `fields-audit.json`
- Machine-readable JSON format
- Structured data for tooling integration
- Includes source file locations and type information

## Classification Rules

Fields are classified as **Static** if they match any of these patterns:

```typescript
/^id$/i                           // Core identifiers
/accountId|clientId/i             // Account references
/(created|updated|open|close).*At/i // Timestamps
/status|state/i                   // Business state
/actionType|subType/i             // Business logic types
/instrument|side/i                // Trading data
/currency/i                       // Currency fields
/amount|price|balance|pnl|commission|swap/i // Financial amounts
/(user|owner|reviewer).*Id/i      // Ownership
/kyc|risk/i                       // Compliance
/ip|cidr/i                        // Network data
/utm\./i                          // UTM parameters
/finance\./i                      // Finance metrics
/address\./i                      // Address fields
/owners\./i                       // Owner assignments
```

All other fields are classified as **Dynamic**.

## Customization

### Override Classification Rules

Edit `STATIC_RULES` in `tools/fields-audit.ts`:

```typescript
const STATIC_RULES = [
  // Add your custom patterns here
  /^myCustomField$/i,
  /specialPattern/i,
  // ... existing rules
]
```

### Use Locked Keys Config

If you have a `src/config/lockedKeys.ts` file, the tool will automatically include those keys as Static:

```typescript
// src/config/lockedKeys.ts
export const STATIC_FIELDS = {
  IDENTIFIERS: ['id', 'accountId'],
  FINANCIAL: ['amount', 'balance'],
  // ...
}
```

## Integration Examples

### CI/CD Pipeline
```yaml
# .github/workflows/audit.yml
- name: Field Audit
  run: |
    npm i -D tsx glob
    npm run audit:fields
    git add fields-audit.md fields-audit.json
```

### Pre-commit Hook
```bash
#!/bin/sh
npm run audit:fields
git add fields-audit.md fields-audit.json
```

### Code Review Automation
```typescript
// Use fields-audit.json for automated checks
import auditData from './fields-audit.json'

// Validate no new static fields without approval
// Check for field classification changes
// Generate reports for PR reviews
```

## Benefits

- ✅ **Visibility**: Complete inventory of all field usage
- ✅ **Consistency**: Clear Static vs Dynamic boundaries
- ✅ **Documentation**: Always up-to-date field reference
- ✅ **Validation**: Detect schema-UI misalignments
- ✅ **Non-destructive**: Read-only analysis, never modifies code
- ✅ **Idempotent**: Safe to run multiple times

## Troubleshooting

### Common Issues

**Tool fails with transform errors:**
- Ensure you're using the latest tsx version
- Check for syntax errors in scanned files

**Missing fields:**
- Add file patterns to `patterns` array in the tool
- Verify field naming follows expected conventions

**Incorrect classifications:**
- Update `STATIC_RULES` regex patterns
- Use `src/config/lockedKeys.ts` for explicit overrides

### Debug Mode

Add console logging to see what files are being processed:

```typescript
// In tools/fields-audit.ts
console.log('Processing file:', filePath)
console.log('Extracted fields:', extractedFields)
```

## Architecture

The tool uses a pipeline approach:

1. **File Discovery** → glob patterns find relevant files
2. **Content Extraction** → regex patterns extract field keys
3. **Classification** → rules engine determines Static vs Dynamic
4. **Domain Grouping** → file paths determine business domains
5. **Report Generation** → markdown and JSON outputs

This ensures comprehensive coverage while maintaining performance and accuracy.