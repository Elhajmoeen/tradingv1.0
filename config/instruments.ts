export interface Instrument {
  id: string
  symbol: string
  name: string
  precision: number
  tickSize: number
  contractSize: number
}

export const instruments: Instrument[] = [
  { 
    id: 'EURUSD', 
    symbol: 'EUR/USD', 
    name: 'Euro / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'GBPUSD', 
    symbol: 'GBP/USD', 
    name: 'British Pound / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'USDJPY', 
    symbol: 'USD/JPY', 
    name: 'US Dollar / Japanese Yen',
    precision: 2,
    tickSize: 0.01,
    contractSize: 100000,
  },
  { 
    id: 'AUDUSD', 
    symbol: 'AUD/USD', 
    name: 'Australian Dollar / US Dollar',
    precision: 4,
    tickSize: 0.0001,
    contractSize: 100000,
  },
  { 
    id: 'XAUUSD', 
    symbol: 'XAU/USD', 
    name: 'Gold / US Dollar',
    precision: 2,
    tickSize: 0.01,
    contractSize: 100,
  },
  { 
    id: 'BTCUSD', 
    symbol: 'BTC/USD', 
    name: 'Bitcoin / US Dollar',
    precision: 2,
    tickSize: 0.01,
    contractSize: 1,
  },
  { 
    id: 'ETHUSD', 
    symbol: 'ETH/USD', 
    name: 'Ethereum / US Dollar',
    precision: 2,
    tickSize: 0.01,
    contractSize: 1,
  },
]

export default instruments