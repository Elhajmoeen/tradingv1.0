import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import OpenPositionsTable from '@/components/positions/OpenPositionsTable'
import ClosedPositionsTable from '@/components/positions/ClosedPositionsTable'
import PendingPositionsTable from '@/components/positions/PendingPositionsTable'
import { ColumnsDrawer } from '@/components/ColumnsDrawer'
import { NewPositionModalAdapter } from '@/features/positions_next/adapters/NewPositionModalAdapter'
import EditPositionModal from '@/components/positions/EditPositionModal'
import ClosedPositionEditModal from '@/components/positions/ClosedPositionEditModal'
import ConfirmClosePositionsModal from '@/components/ConfirmClosePositionsModal'

import { useOpenPositionsByClient, useClosedPositionsByClient, usePendingPositionsByClient } from '@/state/positionsSlice'
import { openPositionsColumns, closedPositionsColumns, pendingPositionsColumns } from '@/config/positionColumns'


type TabKey = 'open' | 'closed' | 'pending'

export default function PositionsTab({ clientId }: { clientId: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>('open')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showNewPosition, setShowNewPosition] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [closedSelectedIds, setClosedSelectedIds] = useState<string[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [closedEditOpen, setClosedEditOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Direct Redux state access for debugging
  const positionsState = useSelector((state: any) => state.positions)
  const openRows = useOpenPositionsByClient(clientId)
  const closedRows = useClosedPositionsByClient(clientId)
  const pendingRows = usePendingPositionsByClient(clientId)

  // Column configurations per tab
  const columnsMap = {
    open: openPositionsColumns,
    closed: closedPositionsColumns,
    pending: pendingPositionsColumns,
  } as const

  // Per-tab column visibility and order state
  const [visibleColumnsByTab, setVisibleColumnsByTab] = useState<Record<TabKey, Record<string, boolean>>>({
    open: Object.fromEntries(columnsMap.open.map(c => [c.id, true])),
    closed: Object.fromEntries(columnsMap.closed.map(c => [c.id, true])),
    pending: Object.fromEntries(columnsMap.pending.map(c => [c.id, true])),
  })

  const [columnOrderByTab, setColumnOrderByTab] = useState<Record<TabKey, string[]>>({
    open: columnsMap.open.map(c => c.id),
    closed: columnsMap.closed.map(c => c.id),
    pending: columnsMap.pending.map(c => c.id),
  })



  // Current tab data
  const currentColumns = columnsMap[activeTab]
  const currentVisible = visibleColumnsByTab[activeTab]
  const currentOrder = columnOrderByTab[activeTab]
  const allRows = activeTab === 'open' ? openRows : activeTab === 'closed' ? closedRows : pendingRows

  // Handlers
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumnsByTab(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [columnId]: visible },
    }))
  }

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrderByTab(prev => ({ ...prev, [activeTab]: newOrder }))
  }



  // Export current view to CSV
  const handleExport = () => {
    const visibleCols = currentColumns.filter(c => currentVisible[c.id])
    const headers = visibleCols.map(c => c.header).join(',')
    
    const csvRows = allRows.map(row =>
      visibleCols
        .map(col => {
          const value = row[col.path ?? col.id]
          const stringValue = value == null ? '' : String(value)
          // Escape quotes by doubling them and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`
        })
        .join(',')
    )
    
    const csv = [headers, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `positions-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Debug logging
  console.log('=== POSITIONS DEBUG ===')
  console.log('clientId:', clientId)
  console.log('openRows:', openRows)
  console.log('openRows.length:', openRows?.length)

  return (
    <section className="h-full flex flex-col bg-background">
      {/* Header with Dropdown, Columns and Export buttons - Fixed height */}
      <div className="flex-shrink-0 flex items-center justify-between bg-background px-6 py-3">
        {/* Position Type Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            type="button"
          >
            {activeTab === 'open' ? `Open Positions (${openRows.length})` : 
             activeTab === 'closed' ? `Closed Positions (${closedRows.length})` : 
             `Pending Positions (${pendingRows.length})`}
            <svg 
              className={`w-2.5 h-2.5 ms-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 10 6"
            >
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="p-1">
                <button
                  onClick={() => {
                    setActiveTab('open')
                    setIsDropdownOpen(false)
                  }}
                  className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left ${activeTab === 'open' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                >
                  Open Positions ({openRows.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('closed')
                    setIsDropdownOpen(false)
                  }}
                  className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left ${activeTab === 'closed' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                >
                  Closed Positions ({closedRows.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pending')
                    setIsDropdownOpen(false)
                  }}
                  className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left ${activeTab === 'pending' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                >
                  Pending Positions ({pendingRows.length})
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowNewPosition(true)}
            className="px-3 py-2 text-[13px] bg-[#111827] hover:bg-[#1f2937] text-[#F0B90B] rounded-md transition-colors border border-[#F0B90B]/20"
          >
            + New Position
          </button>
          
          {/* Edit and Close buttons - only shown when positions are selected and on open tab */}
          {selectedIds.length > 0 && activeTab === 'open' && (
            <>
              <button
                onClick={() => setEditOpen(true)}
                className="px-3 py-2 text-[13px] bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Edit ({selectedIds.length})
              </button>
              <button
                onClick={() => setCloseConfirmOpen(true)}
                className="px-3 py-2 text-[13px] bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Close ({selectedIds.length})
              </button>
            </>
          )}

          {/* Edit and Cancel buttons for closed positions */}
          {closedSelectedIds.length > 0 && activeTab === 'closed' && (
            <>
              <button
                onClick={() => setClosedEditOpen(true)}
                disabled={closedSelectedIds.length !== 1}
                className="px-3 py-2 text-[13px] bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={closedSelectedIds.length !== 1 ? "Select a single position to edit" : "Edit selected position"}
              >
                Edit ({closedSelectedIds.length})
              </button>
              <button
                onClick={() => {
                  // Cancel action - no-op for now as specified
                  console.log('Cancel action - to be implemented later')
                }}
                className="px-3 py-2 text-[13px] bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Cancel ({closedSelectedIds.length})
              </button>
            </>
          )}
          
          <ColumnsDrawer
            columns={currentColumns.map(c => ({
              ...c,
              isCustomDocument: false,
            }))}
            visibleColumns={currentVisible}
            columnOrder={currentOrder}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onColumnOrderChange={handleColumnOrderChange}
            onSelectAll={() =>
              setVisibleColumnsByTab(prev => ({
                ...prev,
                [activeTab]: Object.fromEntries(currentColumns.map(c => [c.id, true])),
              }))
            }
            onClearAll={() =>
              setVisibleColumnsByTab(prev => ({
                ...prev,
                [activeTab]: Object.fromEntries(currentColumns.map(c => [c.id, false])),
              }))
            }
            onResetToDefault={() =>
              setVisibleColumnsByTab(prev => ({
                ...prev,
                [activeTab]: Object.fromEntries(currentColumns.map(c => [c.id, c.defaultVisible])),
              }))
            }
          >
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
              Columns
            </button>
          </ColumnsDrawer>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            Export
          </button>
        </div>
      </div>



      {/* Tables - Takes remaining height with proper constraints */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'open' && (
          <OpenPositionsTable 
            rows={allRows}
            visibleColumns={currentVisible}
            columnOrder={currentOrder}
            onColumnOrderChange={handleColumnOrderChange}
            onColumnFilter={(columnId) => {
              // Individual column filtering is handled by the table component
            }}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onModifyPosition={(position) => {
              setSelectedIds([position.id])
              setEditOpen(true)
            }}
            onClosePosition={(position) => {
              setSelectedIds([position.id])
              setCloseConfirmOpen(true)
            }}
          />
        )}
        {activeTab === 'closed' && (
          <ClosedPositionsTable 
            rows={allRows}
            visibleColumns={currentVisible}
            columnOrder={currentOrder}
            onColumnOrderChange={handleColumnOrderChange}
            onColumnFilter={(columnId) => {
              // Individual column filtering is handled by the table component
            }}
            selectedIds={closedSelectedIds}
            onSelectionChange={setClosedSelectedIds}
          />
        )}
        {activeTab === 'pending' && (
          <PendingPositionsTable 
            rows={allRows}
            visibleColumns={visibleColumnsByTab.pending}
            columnOrder={columnOrderByTab.pending}
            onColumnOrderChange={(newOrder) => {
              setColumnOrderByTab(prev => ({ ...prev, pending: newOrder }))
            }}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </div>

      {/* New Position Modal */}
      <NewPositionModalAdapter
        open={showNewPosition}
        onClose={() => setShowNewPosition(false)}
        accountId={clientId}
      />

      {/* Edit Position Modal */}
      <EditPositionModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setSelectedIds([]) // Clear selection after editing
        }}
        positionIds={selectedIds}
        theme="dark"
      />

      {/* Confirm Close Positions Modal */}
      <ConfirmClosePositionsModal
        open={closeConfirmOpen}
        count={selectedIds.length}
        onCancel={() => setCloseConfirmOpen(false)}
        onConfirm={() => {
          // TODO: implement actual close logic when Closed Positions is ready
          // For now, just close the modal and clear selection
          console.log('Closing positions:', selectedIds)
          setCloseConfirmOpen(false)
          setSelectedIds([])
        }}
        theme="dark"
      />

      {/* Closed Position Edit Modal */}
      <ClosedPositionEditModal
        open={closedEditOpen}
        onClose={() => {
          setClosedEditOpen(false)
          setClosedSelectedIds([]) // Clear selection after editing
        }}
        accountId={clientId}
        positionId={closedSelectedIds[0] || null}
        theme="dark"
      />

    </section>
  )
}