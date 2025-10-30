import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../state/store'

interface TransactionHistoryTableProps {
  clientId: string
}

export default function TransactionHistoryTable({ clientId }: TransactionHistoryTableProps) {
  const rows = useSelector((s: RootState) => s.transactions.byClientId[clientId] ?? [])

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Transaction History
      </h2>
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
          <tbody className="[&>tr]:border-b last:[&>tr]:border-0">
            {rows.length === 0 && (
              <tr>
                <td className="py-4 text-gray-500" colSpan={8}>
                  No transactions yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="py-2">{r.kind}</td>
                <td className="py-2">${r.amount.toLocaleString()}</td>
                <td className="py-2">
                  {new Date(r.createdAtISO).toLocaleString()}
                </td>
                <td className="py-2">{r.description || '—'}</td>
                <td className="py-2">{r.paymentMethod || '—'}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    r.ftd 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {r.ftd ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-2">
                  {r.createdBy === 'CRM' ? (r.createdByName || 'CRM') : 'Client'}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded-md border text-xs hover:bg-emerald-50 transition-colors">
                      Approve
                    </button>
                    <button className="px-2 py-1 rounded-md border text-xs hover:bg-rose-50 transition-colors">
                      Decline
                    </button>
                    <button className="px-2 py-1 rounded-md border text-xs hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}