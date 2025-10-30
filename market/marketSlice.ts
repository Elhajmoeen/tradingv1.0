import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Define RootState interface for the selectors
interface RootState {
  market: MarketState;
  [key: string]: any;
}

export interface Quote {
  ask: number;
  bid: number;
  last: number;
  timestamp: number;
}

export interface MockInstrument {
  id: string;
  symbol: string;
  name: string;
  precision: number;
  tickSize: number;
  contractSize: number;
}

interface MarketState {
  instruments: MockInstrument[];
  quotes: Record<string, Quote>;
}

const initialState: MarketState = {
  instruments: [],
  quotes: {},
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setInstruments: (state, action: PayloadAction<MockInstrument[]>) => {
      state.instruments = action.payload;
    },
    updateQuote: (state, action: PayloadAction<{ instrumentId: string; quote: Quote }>) => {
      const { instrumentId, quote } = action.payload;
      state.quotes[instrumentId] = quote;
    },
  },
});

export const { setInstruments, updateQuote } = marketSlice.actions;

// Selectors
export const selectQuotes = (state: RootState) => state.market?.quotes || {};
export const selectInstruments = (state: RootState) => state.market?.instruments || [];

export const selectQuoteByInstrument = createSelector(
  [selectQuotes, (_state: RootState, instrumentId: string) => instrumentId],
  (quotes, instrumentId) => quotes[instrumentId] || null
);

// Helper to get current ask/bid for an instrument
export const selectAskBidByInstrument = createSelector(
  [selectQuoteByInstrument],
  (quote) => quote ? { ask: quote.ask, bid: quote.bid } : null
);

export default marketSlice.reducer;