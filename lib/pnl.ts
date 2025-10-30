export type Side = 'BUY'|'SELL';

export interface InstrumentMeta {
  contractSize?: number;   // multiplier per 1 unit per 1 price move
  digits?: number;         // optional price precision
}

export function resolveInstrumentMeta(symbol: string): InstrumentMeta {
  // TODO: read from assetsSlice or config; keep safe defaults
  return { contractSize: 1, digits: 5 };
}

export function priceFromAmount(params: {
  openPrice: number;
  side: Side;
  amountUnits: number;
  targetPnLAbs: number;         // positive number (profit or loss)
  isProfit: boolean;            // true = TP, false = SL
  symbol: string;
}) {
  const { openPrice, side, amountUnits, targetPnLAbs, isProfit, symbol } = params;
  const { contractSize = 1, digits = 5 } = resolveInstrumentMeta(symbol);

  // pnl = ( (price - openPrice) * sign ) * amountUnits * contractSize
  // sign = +1 for BUY, -1 for SELL
  const sideSign = side === 'BUY' ? 1 : -1;
  // For TP: desired pnl = +targetPnLAbs; for SL: -targetPnLAbs
  const desiredPnL = isProfit ? targetPnLAbs : -targetPnLAbs;

  const delta = desiredPnL / (amountUnits * contractSize * sideSign);
  const targetPrice = openPrice + delta;

  const factor = Math.pow(10, digits);
  return Math.round(targetPrice * factor) / factor; // round to instrument precision
}

export function amountFromPrice(params: {
  openPrice: number;
  side: Side;
  amountUnits: number;
  targetPrice: number;
  symbol: string;
}) {
  const { openPrice, side, amountUnits, targetPrice, symbol } = params;
  const { contractSize = 1 } = resolveInstrumentMeta(symbol);
  const sideSign = side === 'BUY' ? 1 : -1;
  const pnl = (targetPrice - openPrice) * sideSign * amountUnits * contractSize;
  return pnl; // positive = profit, negative = loss
}