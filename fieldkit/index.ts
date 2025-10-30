// Field Kit - Unified field system for consistent data management across all components
// Barrel export for easy imports: @/fieldkit

export { default as FieldRenderer } from './FieldRenderer'
export { useProfileField } from './useProfileField'
export { optionsByKey, getOptionLabel, getFieldOptions } from './options'
export { normalizeOnChange, normalizeOnCommit } from './normalize'
export type { Option, FieldValueMap, EntityFieldKey, FieldConfig } from './types'

// Feature flag for gradual rollout
export const FIELDKIT_UNIFIED = true

// Development warnings for migration
export const deprecatedFieldInput = (componentName: string) => {
  if (typeof window !== 'undefined') {
    console.warn(
      `[FIELDKIT] ${componentName} uses legacy field input. ` +
      `Migrate to <FieldRenderer /> for consistency.`
    )
  }
}