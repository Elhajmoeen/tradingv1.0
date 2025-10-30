/**
 * Transactions table component that works with RTK Query data
 * Provides the same interface as the existing TransactionHistory component
 * but powered by RTK Query instead of Redux state
 */

import React, { useState, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useGetTransactionsQuery } from '../api/transactionsApi'
import { toLegacyFormat } from '../types/transaction.schema'

interface TransactionsTableProps {
  clientId: string
}

export function TransactionsTable({ clientId }: TransactionsTableProps) {
  const { data: transactionsData = [], isLoading, error } = useGetTransactionsQuery({ clientId })
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 6

  // Convert DTOs to legacy format for compatibility
  const transactions = useMemo(() => {
    return transactionsData.map(toLegacyFormat)
  }, [transactionsData])

  // Calculate pagination data
  const totalPages = Math.ceil(transactions.length / transactionsPerPage)
  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = startIndex + transactionsPerPage
  const currentTransactions = useMemo(() => 
    transactions.slice(startIndex, endIndex), 
    [transactions, startIndex, endIndex]
  )

  // Reset to page 1 when transactions change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Transaction History
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    console.error('Failed to load transactions:', error)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Transaction History
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Failed to load transactions. Please try again.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Transaction History
        </h2>
        
        {/* Dev indicator */}
        {import.meta.env.DEV && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            🚀 RTK Query ({transactionsData.length} transactions)
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found for this client.
        </div>
      ) : (
        <>
          {/* Transactions table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <thead className="border-b">
                <tr className="[&>th]:text-left [&>th]:py-2">
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Transaction Date</th>
                  <th>Description</th>
                  <th>Payment Method</th>
                  <th>FTD</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.kind === 'Deposit' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.kind === 'Withdraw'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.kind}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.currency} {Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(transaction.createdAtISO).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-2">
                      {transaction.paymentMethod || '-'}
                    </td>
                    <td className="py-2">
                      {transaction.ftd ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-2">
                      {transaction.createdBy}
                    </td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TransactionsTable