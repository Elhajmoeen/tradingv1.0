import React, { useState, useEffect } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import AllowIpTable from '../../../features/allowIp/AllowIpTable'
import AllowIpForm from '../../../features/allowIp/AllowIpForm'
import { useListAllowIpsQuery, useDeleteAllowIpMutation, useUpdateAllowIpMutation } from '../../../features/allowIp/api/allowIpApi'
import type { AllowIp } from '../../../features/allowIp/types/allowIp.schema'

export default function AllowIpPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAllowIp, setEditingAllowIp] = useState<AllowIp | null>(null)

  // Handle add IP
  const handleAddIp = () => {
    setEditingAllowIp(null)
    setIsFormOpen(true)
  }

  // Handle edit IP
  const handleEditIp = (allowIp: AllowIp) => {
    setEditingAllowIp(allowIp)
    setIsFormOpen(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingAllowIp(null)
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IP Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage allowed IP addresses and access control
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddIp}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add IP
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <AllowIpTable onEdit={handleEditIp} />
      </div>

      {/* Form Modal */}
      <AllowIpForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        allowIp={editingAllowIp}
      />
    </div>
  )
}