import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button as MUIButton } from '@mui/material'
import { Plus, DownloadSimple } from '@phosphor-icons/react'
import PaymentGatewaysTable from '@/features/paymentGateways/PaymentGatewaysTable'
import { AddGatewayModal, EditGatewayModal } from '@/features/paymentGateways/GatewayModals'
import { 
  selectGatewaysByQuery, 
  addGateway, 
  updateGateway, 
  seedIfEmpty,
  Gateway 
} from '@/state/paymentGatewaysSlice'
import type { RootState } from '@/state/store'

// CSV Export functionality
const exportFilteredGateways = (gateways: Gateway[], query: string) => {
  const headers = [
    'Name',
    'Provider', 
    'Currency',
    '500 Link',
    '1000 Link', 
    '2500 Link',
    '3000 Link',
    '5000 Link',
    'Updated On',
    'Status'
  ]

  const rows = gateways.map(gateway => [
    gateway.name,
    gateway.provider || '',
    gateway.currency || '',
    gateway.links.a500 || '',
    gateway.links.a1000 || '',
    gateway.links.a2500 || '',
    gateway.links.a3000 || '',
    gateway.links.a5000 || '',
    gateway.updatedOn ? new Date(gateway.updatedOn).toLocaleString() : '',
    gateway.isActive ? 'Active' : 'Disabled'
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  
  const fileName = query 
    ? `payment-gateways-search-${query.replace(/[^a-z0-9]/gi, '-')}.csv`
    : 'payment-gateways.csv'
  
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const getGatewayExportStats = (gateways: Gateway[]) => ({
  total: gateways.length,
  active: gateways.filter(g => g.isActive).length,
  inactive: gateways.filter(g => !g.isActive).length,
})

export default function PaymentGatewaysPage() {
  const dispatch = useDispatch()
  
  // State
  const [query, setQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data
  const filteredGateways = useSelector((state: RootState) => selectGatewaysByQuery(state, query))
  
  // Seed demo data on component mount
  useEffect(() => {
    dispatch(seedIfEmpty())
  }, [dispatch])

  // Export handler
  const handleExport = () => {
    try {
      exportFilteredGateways(filteredGateways, query)
      const stats = getGatewayExportStats(filteredGateways)
      toast.success(
        `Exported ${stats.total} payment gateways (${stats.active} active, ${stats.inactive} inactive)`
      )
    } catch (error) {
      toast.error('Failed to export payment gateways')
    }
  }

  // Add modal handlers
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setIsSubmitting(false)
  }

  const handleAddSubmit = async (values: {
    name: string
    provider?: string
    currency?: string
    links?: Partial<Gateway['links']>
  }) => {
    setIsSubmitting(true)
    try {
      dispatch(addGateway(values))
      toast.success(`Payment gateway "${values.name}" added successfully`)
      handleCloseAddModal()
    } catch (error) {
      toast.error('Failed to add payment gateway')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit modal handlers
  const handleOpenEditModal = (gateway: Gateway) => {
    setEditingGateway(gateway)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingGateway(null)
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (values: {
    name: string
    provider?: string
    currency?: string
    links?: Partial<Gateway['links']>
  }) => {
    if (!editingGateway) return
    
    setIsSubmitting(true)
    try {
      dispatch(updateGateway({ 
        id: editingGateway.id, 
        patch: values 
      }))
      toast.success(`Payment gateway "${values.name}" updated successfully`)
      handleCloseEditModal()
    } catch (error) {
      toast.error('Failed to update payment gateway')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage payment gateway configurations and settings
                </p>
              </div>
              <div className="max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search gateways..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                disabled={filteredGateways.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadSimple size={16} className="mr-2" />
                Export
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                New Gateway
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <PaymentGatewaysTable
          searchQuery={query}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
        />
      </div>

      {/* Modals */}
      <AddGatewayModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddSubmit}
        isLoading={isSubmitting}
      />

      <EditGatewayModal
        isOpen={isEditModalOpen}
        gateway={editingGateway}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}