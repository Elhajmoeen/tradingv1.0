import React from 'react'

interface TestProps {
  open: boolean
}

export default function NewPositionModalTest({ open }: TestProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="w-full max-w-2xl bg-white">
        <div className="p-8">
          <h2>Test Modal</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg">
              Buy
            </button>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg">
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}