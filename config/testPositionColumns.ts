// Test columns with direct field paths instead of nested paths
import { EntityColumnDefinition, EntityTableConfig } from '@/components/EntityTable'

export const testPositionColumns: EntityColumnDefinition[] = [
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'text', defaultVisible: true },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'positionId', header: 'Position ID', path: 'positionId', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
]

export const testPositionConfig: EntityTableConfig = {
  entityType: 'position',
  entityNameSingular: 'test position',
  entityNamePlural: 'test positions', 
  columns: testPositionColumns,
  storageKey: 'test.positions'
}