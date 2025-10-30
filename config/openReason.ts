export const OPEN_REASON_OPTIONS = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Broker', label: 'Broker' },
  { value: 'Take Profit', label: 'Take Profit' },
  { value: 'Stop Loss', label: 'Stop Loss' },
  { value: 'Auto', label: 'Auto' },
  { value: 'System', label: 'System' }
] as const;

export type OpenReasonValue = typeof OPEN_REASON_OPTIONS[number]['value'];