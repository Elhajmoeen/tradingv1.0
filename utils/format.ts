export const fmtCurrency = (v?: number) => 
  v == null ? '-' : new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(v);

export const fmtNumber = (v?: number, d = 2) => 
  v == null ? '-' : new Intl.NumberFormat(undefined, {
    maximumFractionDigits: d
  }).format(v);

export const fmtPct = (v?: number, d = 1) => 
  v == null ? '-' : `${fmtNumber(v, d)}%`;