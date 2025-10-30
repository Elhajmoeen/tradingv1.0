// Utility function to generate dynamic options from Redux entity data
export const getUniqueValuesFromEntities = (entities: any[], fieldPath: string): string[] => {
  const values = new Set<string>();
  
  entities.forEach(entity => {
    const value = getNestedValue(entity, fieldPath);
    // Only include meaningful values (exclude null, undefined, empty strings)
    if (value !== null && 
        value !== undefined && 
        value !== '' && 
        value !== 'null' && 
        value !== 'undefined' &&
        String(value).trim() !== '') {
      values.add(String(value).trim());
    }
  });
  
  return Array.from(values).sort();
};

// Helper function to get nested values from objects
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Convert unique values to option format for Material UI Select
export const generateOptionsFromEntities = (entities: any[], fieldPath: string, fallbackOptions: Array<{label: string, value: string}> = []): Array<{label: string, value: string}> => {
  const uniqueValues = getUniqueValuesFromEntities(entities, fieldPath);
  
  // If no dynamic values found, use fallback options
  if (uniqueValues.length === 0) {
    return fallbackOptions;
  }
  
  return uniqueValues.map(value => ({
    label: value,
    value: value
  }));
};