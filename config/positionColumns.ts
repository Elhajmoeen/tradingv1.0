import type { EntityColumnDefinition } from '@/components/EntityTable'
import { ensureAllColumns } from '@/fields/mergeColumns'

// Column definitions for PositionsTab tables
export interface PositionColumnDefinition {
  id: string
  header: string
  path: string
  type: string
  defaultVisible: boolean
  isCustomDocument?: boolean
}

// Open Positions Table Columns
export const openPositionsColumns: PositionColumnDefinition[] = [
  { id: 'id', header: 'Position ID', path: 'id', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'type', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'money', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'currentPrice', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'money', defaultVisible: true },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'money', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: true },
  { id: 'openPnL', header: 'Open PnL', path: 'openPnL', type: 'money', defaultVisible: true },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'money', defaultVisible: true },
  { id: 'swap', header: 'Swap', path: 'swap', type: 'money', defaultVisible: true },
  { id: 'totalPnL', header: 'Total PnL', path: 'totalPnL', type: 'money', defaultVisible: true },
]

// Closed Positions Table Columns  
export const closedPositionsColumns: PositionColumnDefinition[] = [
  { id: 'id', header: 'Closed ID', path: 'id', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'type', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'money', defaultVisible: true },
  { id: 'closedPrice', header: 'Closed Price', path: 'closedPrice', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'money', defaultVisible: false },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'money', defaultVisible: false },
  { id: 'pnlWithout', header: 'PnL', path: 'pnlWithout', type: 'pnl', defaultVisible: true },
  { id: 'totalPnL', header: 'Total PnL', path: 'totalPnL', type: 'pnl', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'money', defaultVisible: true },
  { id: 'swap', header: 'Swap', path: 'swap', type: 'money', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: false },
  { id: 'closeReason', header: 'Close Reason', path: 'closeReason', type: 'text', defaultVisible: false },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: false },
  { id: 'closeVolume', header: 'Close Volume', path: 'closeVolume', type: 'money', defaultVisible: false },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: false },
  { id: 'closeIp', header: 'Close IP', path: 'closeIp', type: 'text', defaultVisible: false },
]

// Pending Positions Table Columns
export const pendingPositionsColumns: PositionColumnDefinition[] = [
  { id: 'id', header: 'Position ID', path: 'id', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'type', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openPrice', header: 'Limit Price', path: 'openPrice', type: 'money', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'currentPrice', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'money', defaultVisible: true },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'money', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: true },
  { id: 'expirationDate', header: 'Expiration Date', path: 'expirationDate', type: 'datetime', defaultVisible: true },
  { id: 'openedAt', header: 'Created At', path: 'openedAt', type: 'datetime', defaultVisible: true },
]

// EntityTable columns for pending positions page (Profile + Position fields joined)
export const pendingPositionsEntityColumns: EntityColumnDefinition[] = [
  // Profile fields - matching the selector's flat structure
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'clickable-accountId', defaultVisible: true },
  { id: 'profileCreatedAt', header: 'Profile Created At', path: 'createdAt', type: 'datetime', defaultVisible: true },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'text', defaultVisible: true },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: true },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: true },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'text', defaultVisible: true },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'text', defaultVisible: true },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'text', defaultVisible: true },
  { id: 'phone', header: 'Phone Number', path: 'phone', type: 'phone', defaultVisible: true },
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: false },
  { id: 'lastCommentAt', header: 'Last Comment At', path: 'lastCommentAt', type: 'datetime', defaultVisible: false },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: false },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: false },
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: false },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'text', defaultVisible: false },
  { id: 'retentionStatus', header: 'Retention Status', path: 'retentionStatus', type: 'text', defaultVisible: false },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'text', defaultVisible: true },

  // Pending position fields - matching the selector's naming
  { id: 'positionId', header: 'Position ID', path: 'positionId', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'positionType', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'positionAmount', type: 'number', defaultVisible: true },
  { id: 'limitPrice', header: 'Limit Price', path: 'positionOpenPrice', type: 'money', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'positionCurrentPrice', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'positionTakeProfit', type: 'money', defaultVisible: false },
  { id: 'stopLoss', header: 'Stop Loss', path: 'positionStopLoss', type: 'money', defaultVisible: false },
  { id: 'openReason', header: 'Open Reason', path: 'positionOpenReason', type: 'text', defaultVisible: false },
  { id: 'expirationDate', header: 'Expiration Date', path: 'positionExpirationDate', type: 'datetime', defaultVisible: true },
  { id: 'positionCreatedAt', header: 'Position Created At', path: 'positionOpenedAt', type: 'datetime', defaultVisible: true },
]

// EntityTable columns for open positions page (Profile + Position fields joined)
export const openPositionsEntityColumns: EntityColumnDefinition[] = ensureAllColumns('positions', [
  // Profile fields (1-24)
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'clickable-accountId', defaultVisible: true },
  { id: 'createdAt', header: 'Created At', path: 'createdAt', type: 'datetime', defaultVisible: true },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'text', defaultVisible: true },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: true },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'text', defaultVisible: true },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'text', defaultVisible: true },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: true },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'text', defaultVisible: true },
  { id: 'phone', header: 'Phone Number', path: 'phone', type: 'phone', defaultVisible: true },
  { id: 'lastContactAt', header: 'Last Contact At', path: 'lastContactAt', type: 'datetime', defaultVisible: true },
  { id: 'firstTradedAt', header: 'First Traded At', path: 'firstTradedAt', type: 'datetime', defaultVisible: true },
  { id: 'lastTradedAt', header: 'Last Traded At', path: 'lastTradedAt', type: 'datetime', defaultVisible: true },
  { id: 'lastActivityAt', header: 'Last Activity At', path: 'lastActivityAt', type: 'datetime', defaultVisible: true },
  { id: 'followUpAt', header: 'Follow Up At', path: 'followUpAt', type: 'datetime', defaultVisible: true },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'text', defaultVisible: true },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'text', defaultVisible: true },
  { id: 'retentionStatus', header: 'Retention Status', path: 'retentionStatus', type: 'text', defaultVisible: true },
  { id: 'balance', header: 'Balance', path: 'balance', type: 'money', defaultVisible: true },
  { id: 'marginLevel', header: 'Margin Level', path: 'marginLevel', type: 'number', defaultVisible: true },
  { id: 'freeMargin', header: 'Free Margin', path: 'freeMargin', type: 'money', defaultVisible: true },
  { id: 'totalMargin', header: 'Total Margin', path: 'totalMargin', type: 'money', defaultVisible: true },
  { id: 'equity', header: 'Equity', path: 'equity', type: 'money', defaultVisible: true },
  
  // Position fields (25-39)
  { id: 'positionId', header: 'Position ID', path: 'positionId', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'positionType', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'money', defaultVisible: true },
  { id: 'currentPrice', header: 'Current Price', path: 'currentPrice', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'money', defaultVisible: true },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'money', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: true },
  { id: 'openPnl', header: 'Open PnL', path: 'openPnL', type: 'money', defaultVisible: true },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'money', defaultVisible: true },
  { id: 'swap', header: 'Swap', path: 'swap', type: 'money', defaultVisible: true },
  { id: 'totalPnl', header: 'Total PnL', path: 'totalPnL', type: 'money', defaultVisible: true },
]);

// Closed Positions Entity Columns (for EntityTable use)
export const closedPositionsEntityColumns: EntityColumnDefinition[] = [
  { id: 'id', header: 'Closed ID', path: 'id', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'type', header: 'Type', path: 'type', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'price', defaultVisible: true },
  { id: 'closedPrice', header: 'Closed Price', path: 'closedPrice', type: 'price', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'price', defaultVisible: false },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'price', defaultVisible: false },
  { id: 'pnlWithout', header: 'PnL', path: 'pnlWithout', type: 'pnl', defaultVisible: true },
  { id: 'totalPnL', header: 'Total PnL', path: 'totalPnL', type: 'pnl', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'money', defaultVisible: true },
  { id: 'swap', header: 'Swap', path: 'swap', type: 'money', defaultVisible: true },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: false },
  { id: 'closeReason', header: 'Close Reason', path: 'closeReason', type: 'text', defaultVisible: false },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: false },
  { id: 'closeVolume', header: 'Close Volume', path: 'closeVolume', type: 'money', defaultVisible: false },
  { id: 'openIp', header: 'Open IP', path: 'openIp', type: 'text', defaultVisible: false },
  { id: 'closeIp', header: 'Close IP', path: 'closeIp', type: 'text', defaultVisible: false },
];

// Comprehensive Closed Positions with Profile Data (for CRM Admin page)
export const closedPositionsAllColumns: EntityColumnDefinition[] = [
  // Profile fields (1-24)
  { id: 'accountId', header: 'Account ID', path: 'accountId', type: 'text', defaultVisible: true },
  { id: 'createdAt', header: 'Created At', path: 'createdAt', type: 'date', defaultVisible: false },
  { id: 'desk', header: 'Desk', path: 'desk', type: 'text', defaultVisible: true },
  { id: 'retentionManager', header: 'Retention Manager', path: 'retentionManager', type: 'text', defaultVisible: true },
  { id: 'accountType', header: 'Account Type', path: 'accountType', type: 'text', defaultVisible: false },
  { id: 'regulation', header: 'Regulation', path: 'regulation', type: 'text', defaultVisible: false },
  { id: 'retentionOwner', header: 'Retention Owner', path: 'retentionOwner', type: 'text', defaultVisible: false },
  { id: 'firstName', header: 'First Name', path: 'firstName', type: 'text', defaultVisible: true },
  { id: 'lastName', header: 'Last Name', path: 'lastName', type: 'text', defaultVisible: true },
  { id: 'email', header: 'Email', path: 'email', type: 'text', defaultVisible: true },
  { id: 'phoneNumber', header: 'Phone', path: 'phoneNumber', type: 'text', defaultVisible: false },
  { id: 'lastContactAt', header: 'Last Contact', path: 'lastContactAt', type: 'date', defaultVisible: false },
  { id: 'firstTradedAt', header: 'First Traded', path: 'firstTradedAt', type: 'date', defaultVisible: false },
  { id: 'lastTradedAt', header: 'Last Traded', path: 'lastTradedAt', type: 'date', defaultVisible: false },
  { id: 'lastActivityAt', header: 'Last Activity', path: 'lastActivityAt', type: 'date', defaultVisible: false },
  { id: 'followUpAt', header: 'Follow Up', path: 'followUpAt', type: 'date', defaultVisible: false },
  { id: 'kycStatus', header: 'KYC Status', path: 'kycStatus', type: 'text', defaultVisible: false },
  { id: 'retentionReview', header: 'Retention Review', path: 'retentionReview', type: 'text', defaultVisible: false },
  { id: 'retentionStatus', header: 'Retention Status', path: 'retentionStatus', type: 'text', defaultVisible: false },
  { id: 'balance', header: 'Balance', path: 'balance', type: 'money', defaultVisible: true },
  { id: 'marginLevel', header: 'Margin Level', path: 'marginLevel', type: 'number', defaultVisible: false },
  { id: 'freeMargin', header: 'Free Margin', path: 'freeMargin', type: 'money', defaultVisible: false },
  { id: 'totalMargin', header: 'Total Margin', path: 'totalMargin', type: 'money', defaultVisible: false },
  { id: 'equity', header: 'Equity', path: 'equity', type: 'money', defaultVisible: false },

  // Position fields (25-42)
  { id: 'closedId', header: 'Closed ID', path: 'closedId', type: 'text', defaultVisible: true },
  { id: 'instrument', header: 'Instrument', path: 'instrument', type: 'text', defaultVisible: true },
  { id: 'positionType', header: 'Type', path: 'positionType', type: 'text', defaultVisible: true },
  { id: 'amount', header: 'Amount', path: 'amount', type: 'number', defaultVisible: true },
  { id: 'openVolume', header: 'Open Volume', path: 'openVolume', type: 'money', defaultVisible: false },
  { id: 'openPrice', header: 'Open Price', path: 'openPrice', type: 'price', defaultVisible: true },
  { id: 'closedPrice', header: 'Closed Price', path: 'closedPrice', type: 'price', defaultVisible: true },
  { id: 'closeVolume', header: 'Close Volume', path: 'closeVolume', type: 'money', defaultVisible: false },
  { id: 'pnlWithout', header: 'PnL', path: 'pnlWithout', type: 'pnl', defaultVisible: true },
  { id: 'totalPnL', header: 'Total PnL', path: 'totalPnL', type: 'pnl', defaultVisible: true },
  { id: 'commission', header: 'Commission', path: 'commission', type: 'money', defaultVisible: true },
  { id: 'swap', header: 'Swap', path: 'swap', type: 'money', defaultVisible: true },
  { id: 'takeProfit', header: 'Take Profit', path: 'takeProfit', type: 'price', defaultVisible: false },
  { id: 'stopLoss', header: 'Stop Loss', path: 'stopLoss', type: 'price', defaultVisible: false },
  { id: 'openReason', header: 'Open Reason', path: 'openReason', type: 'text', defaultVisible: false },
  { id: 'closeReason', header: 'Close Reason', path: 'closeReason', type: 'text', defaultVisible: false },
  { id: 'closedAt', header: 'Closed At', path: 'closedAt', type: 'date', defaultVisible: false },
  { id: 'closeIp', header: 'Close IP', path: 'closeIp', type: 'text', defaultVisible: false },
];