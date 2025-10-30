import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { RootState } from '../state/store'

interface TransactionHistoryProps {
  entityId: string
}

export function TransactionHistory({ entityId }: TransactionHistoryProps) {
  const transactions = useSelector((state: RootState) => state.transactions?.byClientId?.[entityId] || [])
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 6

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

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Transaction Type
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Amount
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Transaction Date
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Description
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Payment Method
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                FTD
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Created By
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500 
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td 
                  colSpan={8} 
                  className="py-8 px-4 text-center text-gray-500"
                  style={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400 
                  }}
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td 
                    className="py-3 px-4 text-gray-900"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400 
                    }}
                  >
                    {transaction.kind}
                  </td>
                  <td 
                    className="py-3 px-4 text-gray-900"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500 
                    }}
                  >
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td 
                    className="py-3 px-4 text-gray-600"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400 
                    }}
                  >
                    {new Date(transaction.createdAtISO).toLocaleString()}
                  </td>
                  <td 
                    className="py-3 px-4 text-gray-600"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400 
                    }}
                  >
                    {transaction.description || '—'}
                  </td>
                  <td 
                    className="py-3 px-4 text-gray-600"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400 
                    }}
                  >
                    {transaction.paymentMethod || '—'}
                  </td>
                  <td 
                    className="py-3 px-4"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500 
                    }}
                  >
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      transaction.ftd 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {transaction.ftd ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td 
                    className="py-3 px-4 text-gray-600"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400 
                    }}
                  >
                    {transaction.createdBy === 'CRM' 
                      ? (transaction.createdByName || 'CRM') 
                      : 'Client'
                    }
                  </td>
                  <td className="py-3 px-4">
                    <TransactionActionButtons transactionId={transaction.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {transactions.length > transactionsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Showing{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(endIndex, transactions.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{transactions.length}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                    currentPage === 1
                      ? 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                    currentPage === totalPages
                      ? 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Action button components for future use
export function TransactionActionButtons({ transactionId }: { transactionId: string }) {
  const handleApprove = () => {
    console.log('Approve transaction:', transactionId)
  }

  const handleDecline = () => {
    console.log('Decline transaction:', transactionId)
  }

  const handleCancel = () => {
    console.log('Cancel transaction:', transactionId)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Approve
      </button>
      <button
        onClick={handleDecline}
        className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Decline
      </button>
      <button
        onClick={handleCancel}
        className="px-3 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded transition-colors"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Cancel
      </button>
    </div>
  )
}