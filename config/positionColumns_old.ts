import type { EntityColumnDefinition } from '@/components/EntityTable'

// EntityTable columns for open positions page (Profile + Position fields joined)
export const openPositionsEntityColumns: EntityColumnDefinition[] = [
  // Profile fields (1-24)
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'text', defaultVisible: true },
  { id: 'createdAt', header: 'Created At', path: 'createdAt', type: 'datetime', defaultVisible: true },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'text', defaultVisible: true },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: true },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'text', defaultVisible: true },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'text', defaultVisible: true },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: true },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'text', defaultVisible: true },
  { id: 'phone', header: 'Phone Number', path: 'phone', type: 'text', defaultVisible: true },
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: true },
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: true },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: true },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: true },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: true },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'text', defaultVisible: true },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'text', defaultVisible: true },
  { id: 'retentionStatus', header: 'Retention Status', path: 'retentionStatus', type: 'text', defaultVisible: true },
  { id: 'balance', header: 'Balance', path: 'balance', type: 'currency', defaultVisible: true },
  { id: 'marginLevel', header: 'Margin Level', path: 'marginLevel', type: 'number', defaultVisible: true },
  { id: 'freeMargin', header: 'Free Margin', path: 'freeMargin', type: 'currency', defaultVisible: true },
  { id: 'totalMargin', header: 'Total Margin', path: 'totalMargin', type: 'currency', defaultVisible: true },
  { id: 'equity', header: 'Equity', path: 'equity', type: 'currency', defaultVisible: true },
  
  // Position fields (25-39)
  { id: 'positionId', header: 'Position ID', path: 'position.id', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'position.instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'position.type', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'currency', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'currency', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'currentPrice', type: 'currency', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'currency', defaultVisible: true },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'currency', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: true },
  { 
    id: 'openPnL', 
    header: 'Open PnL', 
    path: 'openPnL', 
    type: 'custom', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="font-semibold tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'currency', defaultVisible: true },
  { 
    id: 'swap', 
    header: 'Swap', 
    path: 'swap', 
    type: 'currency', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  { 
    id: 'totalPnL', 
    header: 'Total PnL', 
    path: 'totalPnL', 
    type: 'custom', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="font-semibold tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
];

// Position-only columns (matching Profile tabs display)
export const positionOnlyColumns = [
  { id: 'positionId', header: 'Position ID', path: 'positionId', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { 
    id: 'positionType', 
    header: 'Type', 
    path: 'positionType', 
    type: 'custom', 
    defaultVisible: true,
    render: (value: 'Buy' | 'Sell') => `
      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
        value === 'Buy' 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-red-50 text-red-700 border-red-200'
      }">
        ${value}
      </span>
    `
  },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'currency', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'currency', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'currentPrice', type: 'currency', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'currency', defaultVisible: true },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'currency', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: true },
  { 
    id: 'openPnL', 
    header: 'Open PnL', 
    path: 'openPnL', 
    type: 'custom', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="font-semibold tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'currency', defaultVisible: true },
  { 
    id: 'swap', 
    header: 'Swap', 
    path: 'swap', 
    type: 'currency', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  { 
    id: 'totalPnL', 
    header: 'Total PnL', 
    path: 'totalPnL', 
    type: 'custom', 
    defaultVisible: true,
    render: (value: number) => `
      <span class="font-semibold tabular-nums ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
];

// Basic configuration for EntityTable
export const openPositionsConfig = {
  columns: openPositionsEntityColumns,
  defaultSort: { field: 'positionId', direction: 'desc' as const },
  pageSize: 25,
  entityType: 'position',
  entityNameSingular: 'Position',
  entityNamePlural: 'Positions',
  storageKey: 'positions.open.columns',
};

// Profile-specific configuration (filtered by accountId)
export const profileOpenPositionsConfig = {
  ...openPositionsConfig,
  storageKey: 'positions.profile.columns',
};

// Additional configs that components expect
export const closedPositionsConfig = {
  ...openPositionsConfig,
  entityNameSingular: 'Closed Position',
  entityNamePlural: 'Closed Positions',
  storageKey: 'positions.closed.columns',
};

export const pendingPositionsConfig = {
  ...openPositionsConfig,
  entityNameSingular: 'Pending Order',
  entityNamePlural: 'Pending Orders',
  storageKey: 'positions.pending.columns',
};

// Compact Profile Position Columns (no client identifiers)
export const profilePositionColumns = (status: 'open' | 'closed' | 'pending') => [
  {
    id: 'id',
    label: 'Position ID',
    path: 'id',
    defaultVisible: true,
    sortable: true,
    className: 'text-left font-mono text-[13px]'
  },
  {
    id: 'instrument',
    label: 'Instrument',
    path: 'instrument',
    defaultVisible: true,
    sortable: true,
    className: 'text-left font-semibold text-[13px]'
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    defaultVisible: true,
    sortable: true,
    render: (value: 'Buy' | 'Sell') => `
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        value === 'Buy' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }">
        ${value}
      </span>
    `
  },
  {
    id: 'amount',
    label: 'Amount',
    path: 'amount',
    defaultVisible: true,
    sortable: true,
    format: 'number',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'openVolume',
    label: 'Open Volume',
    path: 'openVolume',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'openPrice',
    label: 'Open Price',
    path: 'openPrice',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'currentPrice',
    label: 'Current Price',
    path: 'currentPrice',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'takeProfit',
    label: 'Take Profit',
    path: 'takeProfit',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'stopLoss',
    label: 'Stop Loss',
    path: 'stopLoss',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'openReason',
    label: 'Open Reason',
    path: 'openReason',
    defaultVisible: true,
    sortable: true,
    className: 'text-left text-[13px] max-w-[220px] truncate'
  },
  {
    id: 'openPnL',
    label: 'Open PnL',
    path: 'openPnL',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]',
    render: (value: number) => `
      <span class="font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  {
    id: 'openIp',
    label: 'Open IP',
    path: 'openIp',
    defaultVisible: true,
    sortable: true,
    className: 'text-left font-mono text-[13px]'
  },
  {
    id: 'commission',
    label: 'Commission',
    path: 'commission',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]'
  },
  {
    id: 'swap',
    label: 'Swap',
    path: 'swap',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]',
    render: (value: number) => `
      <span class="${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  },
  {
    id: 'totalPnL',
    label: 'Total PnL',
    path: 'totalPnL',
    defaultVisible: true,
    sortable: true,
    format: 'currency',
    className: 'text-right tabular-nums text-[13px]',
    render: (value: number) => `
      <span class="font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}">
        ${value >= 0 ? '+' : ''}${value?.toFixed(2) || '0.00'}
      </span>
    `
  }
];

// Profile Position Configs
export const profileTabOpenPositionsConfig = {
  columns: profilePositionColumns('open'),
  tableId: 'profile.positions.open',
  defaultSort: { field: 'openedAt', direction: 'desc' as const },
  pageSize: 25,
  entityType: 'position',
  entityNameSingular: 'Position',
  entityNamePlural: 'Open Positions',
  dense: true,
  stickyHeader: true
};

export const profileTabClosedPositionsConfig = {
  columns: profilePositionColumns('closed'),
  tableId: 'profile.positions.closed',
  defaultSort: { field: 'closedAt', direction: 'desc' as const },
  pageSize: 25,
  entityType: 'position',
  entityNameSingular: 'Position',
  entityNamePlural: 'Closed Positions',
  dense: true,
  stickyHeader: true
};

export const profileTabPendingPositionsConfig = {
  columns: profilePositionColumns('pending'),
  tableId: 'profile.positions.pending',
  defaultSort: { field: 'openedAt', direction: 'desc' as const },
  pageSize: 25,
  entityType: 'position',
  entityNameSingular: 'Position',
  entityNamePlural: 'Pending Positions',
  dense: true,
  stickyHeader: true
};