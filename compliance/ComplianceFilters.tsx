import { useState } from 'react'
import { Funnel } from '@phosphor-icons/react'

export default function ComplianceFilters() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Funnel size={16} />
        Filters
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter Popover */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Filter Compliance</h3>
              </div>

              {/* Desk Filter */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Desk</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">All Desks</option>
                  <option value="Sales">Sales</option>
                  <option value="Retention">Retention</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* KYC Status Filter */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">KYC Status</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Account Type Filter */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Account Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="">All Types</option>
                  <option value="Demo">Demo</option>
                  <option value="Live">Live</option>
                  <option value="Real">Real</option>
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  placeholder="Search country..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Created Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    placeholder="From"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="To"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <button
                  onClick={() => {
                    // Reset filters
                    setIsOpen(false)
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    // Apply filters
                    setIsOpen(false)
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
