export const CLOSE_REASON_OPTIONS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Broker', label: 'Broker' },
  { value: 'Take Profit', label: 'Take Profit' },
  { value: 'Stop Loss', label: 'Stop Loss' },
  { value: 'Trade Out', label: 'Trade Out' },
  { value: 'System', label: 'System' }
] as const;

export type CloseReasonValue = typeof CLOSE_REASON_OPTIONS[number]['value'];