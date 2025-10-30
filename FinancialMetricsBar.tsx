import * as React from 'react'
import { useSelector } from 'react-redux'
import { selectEntityById } from '@/state/entitiesSlice'
// Removed positions selectors - starting fresh
// import { selectAccountFinanceKPIs } from '@/features/positions/selectors'
import { fmtCurrency, fmtNumber } from '@/utils/format'

interface FinancialMetricsBarProps {
  entityId: string
}

export function FinancialMetricsBar({ entityId }: FinancialMetricsBarProps) {
  const entity = useSelector(selectEntityById(entityId))
  const accountKPIs = useSelector((state: any) => 
    entity?.accountId ? selectAccountFinanceKPIs(state, entity.accountId) : {
      balance: 0, equity: 0, freeMargin: 0, marginLevel: 0, openPnL: 0, margin: 0, openVolume: 0
    }
  )

  if (!entity) {
    return null
  }

  const items = [
    { key: 'balance', label: 'Balance', fmt: fmtCurrency, source: 'entity' as const },
    { key: 'marginLevel', label: 'Margin Level', fmt: (v?: number) => v == null ? '-' : `${fmtNumber(v, 1)}%`, source: 'entity' as const },
    { key: 'openPnl', label: 'Open PnL', fmt: fmtCurrency, pnl: true, source: 'entity' as const },
    { key: 'totalPnl', label: 'Total PnL', fmt: fmtCurrency, pnl: true, source: 'entity' as const },
    { key: 'freeMargin', label: 'Free Margin', fmt: fmtCurrency, source: 'entity' as const },
    { key: 'margin', label: 'Total Margin', fmt: fmtCurrency, source: 'kpis' as const },
    { key: 'equity', label: 'Equity', fmt: fmtCurrency, source: 'entity' as const },
    { key: 'openVolume', label: 'Open Volume', fmt: (v?: number) => fmtNumber(v, 2), source: 'entity' as const },
  ]

  const metrics = items.map(item => {
    // Get value from either entity or accountKPIs based on source
    const value = item.source === 'kpis' 
      ? accountKPIs[item.key as keyof typeof accountKPIs] as number
      : entity[item.key as keyof typeof entity] as number

    return {
      key: item.key,
      label: item.label,
      value: item.fmt(value),
      isPnl: item.pnl
    }
  })

  return (
    <div 
      className="w-full bg-white py-3"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="flex items-center w-full overflow-x-auto">
        {metrics.map((metric, index) => (
          <React.Fragment key={metric.key}>
            <div className="flex items-center gap-2 px-3 py-2 min-w-[140px] flex-1">
              <span 
                className="text-xs text-gray-500 truncate"
                style={{ 
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {metric.label}:
              </span>
              <span 
                className={`text-xs font-semibold whitespace-nowrap ${
                  metric.isPnl 
                    ? (entity[metric.key as keyof typeof entity] as number) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                    : 'text-gray-800'
                }`}
                style={{ 
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {metric.value}
              </span>
            </div>
            {index < metrics.length - 1 && (
              <div 
                className="w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent h-8 mx-1"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, #D1D5DB 20%, #9CA3AF 50%, #D1D5DB 80%, transparent 100%)'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}