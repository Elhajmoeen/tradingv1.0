/**
 * Transactions adapter for "next" feature
 * Maps RTK Query data to current table row shape
 */

import React from 'react'
import { isTransactionsNextEnabled } from '@/lib/flags'
import { useListTransactionsQuery } from '../state/transactionsApi'
import type { TransactionDTO } from '../types/transaction'

interface TransactionsAdapterProps {
  accountId?: string
  clientId?: string  // Backward compatibility
  filters?: Record<string, any>
  className?: string
}

// Legacy table row shape (based on existing components)
interface LegacyTransactionRow {
  id: string
  'ACTION TYPE': string      // ← actionType
  'SUB TYPE': string         // ← subType
  'ACTION BY': string        // ← createdByName
  'AMOUNT': string           // ← amount + currency
  'DATE/TIME': string        // ← createdAt
  'TRANSACTION ID': string   // ← id (if needed)
}

/**
 * Transform TransactionDTO to legacy table row format
 */
function mapToLegacyRow(dto: TransactionDTO): LegacyTransactionRow {
  return {
    id: dto.id,
    'ACTION TYPE': dto.actionType,
    'SUB TYPE': dto.subType,
    'ACTION BY': dto.createdByName || 'System',
    'AMOUNT': `${dto.currency} ${dto.amount.toLocaleString()}`,
    'DATE/TIME': new Date(dto.createdAt).toLocaleDateString(),
    'TRANSACTION ID': dto.id,
  }
}

export function TransactionsAdapter({ accountId, clientId, filters, className }: TransactionsAdapterProps) {
  const flagEnabled = isTransactionsNextEnabled()
  
  // If flag is OFF, return null to let legacy component handle rendering
  if (!flagEnabled) {
    return null
  }

  // Use RTK Query for data fetching
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useListTransactionsQuery({
    filter: {
      ...(accountId && { accountId }),
      ...(clientId && !accountId && { clientId }), // Only use clientId if accountId not provided
      ...filters
    }
  })

  const transactions = response?.data || []
  const mappedRows = React.useMemo(() => 
    transactions.map(mapToLegacyRow), 
    [transactions]
  )

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Transactions</h3>
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
          
          {/* Table headers always visible */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">ACTION TYPE</th>
                  <th className="text-left p-3 font-medium">SUB TYPE</th>
                  <th className="text-left p-3 font-medium">AMOUNT</th>
                  <th className="text-left p-3 font-medium">DATE/TIME</th>
                  <th className="text-left p-3 font-medium">ACTION BY</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Transactions</h3>
            <button 
              onClick={() => refetch()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Retry
            </button>
          </div>
          
          {/* Table headers always visible */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">ACTION TYPE</th>
                  <th className="text-left p-3 font-medium">SUB TYPE</th>
                  <th className="text-left p-3 font-medium">AMOUNT</th>
                  <th className="text-left p-3 font-medium">DATE/TIME</th>
                  <th className="text-left p-3 font-medium">ACTION BY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-600">
                    Error loading transactions. Please try again.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Show data table
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Transactions</h3>
          <div className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* DEV indicator */}
        {import.meta.env.DEV && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            🚀 Transactions NEXT: RTK Query ({transactions.length} items)
          </div>
        )}
        
        {/* Table with headers always visible */}
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ACTION TYPE</th>
                <th className="text-left p-3 font-medium">SUB TYPE</th>
                <th className="text-left p-3 font-medium">AMOUNT</th>
                <th className="text-left p-3 font-medium">DATE/TIME</th>
                <th className="text-left p-3 font-medium">ACTION BY</th>
              </tr>
            </thead>
            <tbody>
              {mappedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                mappedRows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/25">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row['ACTION TYPE'] === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                        row['ACTION TYPE'] === 'WITHDRAW' ? 'bg-red-100 text-red-800' :
                        row['ACTION TYPE'] === 'CREDIT' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row['ACTION TYPE']}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row['SUB TYPE'] === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        row['SUB TYPE'] === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row['SUB TYPE']}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{row['AMOUNT']}</td>
                    <td className="p-3 text-muted-foreground">{row['DATE/TIME']}</td>
                    <td className="p-3">{row['ACTION BY']}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}