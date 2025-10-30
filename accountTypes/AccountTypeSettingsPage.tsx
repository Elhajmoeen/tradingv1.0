import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { ArrowLeft, Plus, ChevronDown, Check } from 'lucide-react'
import { Listbox } from '@headlessui/react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'

import { accountTypeRuleColumns, ACCOUNT_TYPE_RULES_TABLE_ID } from './accountTypeRuleColumns'
import {
  selectRulesForAccountType,
  upsertRule,
  setRuleEnabled,
  removeRule,
  updateRuleField,
  createDefaultRule,
} from '@/state/accountTypeAssetRulesSlice'
import { selectAccountTypes, updateAccountTypeDefaults, AccountType } from '@/state/accountTypesSlice'
import { selectAssetOptions, selectAssetById } from '@/state/assetsSlice'
import { validateRule } from '@/selectors/tradingRules'
import { isAccountTypeAssetRulesEnabled } from '@/lib/flags'
import AccountTypeAssetsTable from '@/features/accountTypes_next/components/AccountTypeAssetsTable'
import { AddAssetButton } from '@/features/accountTypes_next/components/AddAssetDrawer'
import { useUpsertRulesMutation as useUpsertAssetRulesMutation } from '@/features/accountTypes_next/state/accountTypeAssetsApi'

export default function AccountTypeSettingsPage() {
  const { accountTypeId } = useParams<{ accountTypeId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Get account type info
  const accountTypes = useSelector(selectAccountTypes)
  const accountType = accountTypes.find(at => at.id === accountTypeId)

  // Get rules and assets
  const rules = useSelector((state: any) => 
    accountTypeId ? selectRulesForAccountType(state, accountTypeId) : []
  )
  const assetOptions = useSelector(selectAssetOptions)

  // State for mass operations
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    leverage: '',
    spread: '',
    defaultSize: '',
    stepSize: '',
    minSize: '',
    maxSize: '',
    commissionValue: '',
    swapLong: '',
    swapShort: '',
    disable: false,
    remove: false,
  })

  // State for single edit mode
  const [singleEditOpen, setSingleEditOpen] = useState(false)
  const [singleEditData, setSingleEditData] = useState<any>(null)

  // State for add asset mode
  const [addAssetOpen, setAddAssetOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string>('')

  // State for draggable modal
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  // State for filtering
  const [columnFilters, setColumnFilters] = useState<any[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Feature flag for new assets table
  const ffAssets = isAccountTypeAssetRulesEnabled()
  const [upsertAssetRules] = useUpsertAssetRulesMutation()

  // Filter options
  const CATEGORIES = ['Forex', 'Crypto', 'Metals', 'Indices', 'Energies', 'Stocks', 'ETFs', 'Commodities', 'Bonds']
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'disabled', label: 'Disabled' }
  ]

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'assetName', desc: false }
  ])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  })

  // Handle back navigation
  const handleBack = () => {
    navigate('/management/trading/account-types')
  }

  // Sync filters with TanStack Table
  useEffect(() => {
    const filters: any[] = []
    
    if (categoryFilter !== 'all') {
      filters.push({ id: 'category', value: categoryFilter })
    }
    
    if (statusFilter !== 'all') {
      filters.push({ id: 'status', value: statusFilter })
    }
    
    setColumnFilters(filters)
  }, [categoryFilter, statusFilter])

  // Handle row selection
  const handleRowSelect = (assetId: string, selected: boolean) => {
    const newSelected = new Set(selectedRows)
    if (selected) {
      newSelected.add(assetId)
    } else {
      newSelected.delete(assetId)
    }
    setSelectedRows(newSelected)
  }

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(rules.map(rule => rule.assetId)))
    } else {
      setSelectedRows(new Set())
    }
  }

  // Handle bulk edit
  const handleMassChange = () => {
    if (selectedRows.size === 0) {
      toast.error('No rows selected')
      return
    }

    // Get selected rules
    const selectedRules = rules.filter(rule => selectedRows.has(rule.assetId))
    
    // Check for common values or show dash for differences
    const getCommonValueOrDash = (field: keyof typeof selectedRules[0]) => {
      if (selectedRules.length === 0) return ''
      const firstValue = selectedRules[0][field]
      const allSame = selectedRules.every(rule => rule[field] === firstValue)
      return allSame ? String(firstValue || '') : '-'
    }

    // Populate bulk edit data with common values or dashes
    setBulkEditData({
      leverage: getCommonValueOrDash('leverage'),
      spread: getCommonValueOrDash('spread'),
      defaultSize: getCommonValueOrDash('defaultSize'),
      stepSize: getCommonValueOrDash('stepSize'),
      minSize: getCommonValueOrDash('minSize'),
      maxSize: getCommonValueOrDash('maxSize'),
      commissionValue: getCommonValueOrDash('commissionValue'),
      swapLong: getCommonValueOrDash('swapLong'),
      swapShort: getCommonValueOrDash('swapShort'),
      disable: false,
      remove: false,
    })

    setBulkEditOpen(true)
  }

  // Validation helper
  const validateBulkFields = (data: typeof bulkEditData) => {
    const errors: string[] = []
    
    const minSize = data.minSize ? Number(data.minSize) : 0
    const defaultSize = data.defaultSize ? Number(data.defaultSize) : 0
    const maxSize = data.maxSize ? Number(data.maxSize) : 0
    const stepSize = data.stepSize ? Number(data.stepSize) : 0

    if (minSize && defaultSize && maxSize) {
      if (!(minSize <= defaultSize && defaultSize <= maxSize)) {
        errors.push('Invalid size range: minSize ≤ defaultSize ≤ maxSize')
      }
    }

    if (stepSize && stepSize <= 0) {
      errors.push('Step size must be greater than 0')
    }

    if (stepSize && defaultSize && minSize) {
      if ((defaultSize - minSize) % stepSize !== 0) {
        errors.push('(defaultSize - minSize) must be divisible by stepSize')
      }
    }

    return errors
  }

  // Handle bulk edit submit
  const handleBulkEditSubmit = () => {
    if (!accountTypeId) return
    
    // Validate fields
    const validationErrors = validateBulkFields(bulkEditData)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error))
      return
    }

    // Build patch object (ignore empty fields and dash values)
    const patch: any = {}
    if (bulkEditData.leverage !== '' && bulkEditData.leverage !== '-') patch.leverage = Number(bulkEditData.leverage)
    if (bulkEditData.spread !== '' && bulkEditData.spread !== '-') patch.spread = Number(bulkEditData.spread)
    if (bulkEditData.defaultSize !== '' && bulkEditData.defaultSize !== '-') patch.defaultSize = Number(bulkEditData.defaultSize)
    if (bulkEditData.stepSize !== '' && bulkEditData.stepSize !== '-') patch.stepSize = Number(bulkEditData.stepSize)
    if (bulkEditData.minSize !== '' && bulkEditData.minSize !== '-') patch.minSize = Number(bulkEditData.minSize)
    if (bulkEditData.maxSize !== '' && bulkEditData.maxSize !== '-') patch.maxSize = Number(bulkEditData.maxSize)
    if (bulkEditData.commissionValue !== '' && bulkEditData.commissionValue !== '-') patch.commissionValue = Number(bulkEditData.commissionValue)
    if (bulkEditData.swapLong !== '' && bulkEditData.swapLong !== '-') patch.swapLong = Number(bulkEditData.swapLong)
    if (bulkEditData.swapShort !== '' && bulkEditData.swapShort !== '-') patch.swapShort = Number(bulkEditData.swapShort)

    // Apply patch updates
    if (Object.keys(patch).length > 0) {
      selectedRows.forEach(assetId => {
        dispatch(upsertRule({ 
          accountTypeId, 
          rule: { assetId, ...patch } 
        }))
      })
    }

    // Handle disable toggle
    if (bulkEditData.disable) {
      selectedRows.forEach(assetId => {
        dispatch(setRuleEnabled({ accountTypeId, assetId, enabled: false }))
      })
    }

    // Handle remove toggle
    if (bulkEditData.remove) {
      selectedRows.forEach(assetId => {
        // TODO: Add canRemoveRule validation if needed
        dispatch(removeRule({ accountTypeId, assetId }))
      })
    }

    const actionCount = selectedRows.size
    const actions: string[] = []
    if (Object.keys(patch).length > 0) actions.push('updated')
    if (bulkEditData.disable) actions.push('disabled')
    if (bulkEditData.remove) actions.push('removed')

    toast.success(`${actions.join(' and ')} ${actionCount} asset rules`)
    
    // Reset state
    setBulkEditOpen(false)
    setSelectedRows(new Set())
    setBulkEditData({
      leverage: '',
      spread: '',
      defaultSize: '',
      stepSize: '',
      minSize: '',
      maxSize: '',
      commissionValue: '',
      swapLong: '',
      swapShort: '',
      disable: false,
      remove: false,
    })
  }

  // Handle single asset edit
  const handleRowClick = (row: any) => {
    const rule = row.original
    setSingleEditData(rule)
    setSingleEditOpen(true)
  }

  const handleSingleEditSubmit = () => {
    if (!accountTypeId || !singleEditData) return
    
    // Validate fields
    const validationErrors = validateBulkFields(singleEditData)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error))
      return
    }

    // Update the rule
    dispatch(upsertRule({ 
      accountTypeId, 
      rule: singleEditData 
    }))

    toast.success(`Updated asset rule for ${singleEditData.assetName}`)
    
    // Reset state
    setSingleEditOpen(false)
    setSingleEditData(null)
  }

  // Handle add asset
  const handleAddAsset = () => {
    if (!accountTypeId || !selectedAsset) return
    
    // Create default rule for the selected asset
    const asset = assetOptions.find(a => a.value === selectedAsset)
    if (!asset) return
    
    const rule = createDefaultRule(
      selectedAsset,
      asset.label.split(' (')[0], // Extract name from "BTCUSD (Crypto)" format
      asset.category 
    )
    
    dispatch(upsertRule({ 
      accountTypeId, 
      rule 
    }))

    toast.success(`Added ${asset.label.split(' (')[0]} to account type`)
    
    // Reset state
    setAddAssetOpen(false)
    setSelectedAsset('')
  }

  // Handle modal dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle account type defaults updates
  const handleDefaultsUpdate = (patch: Partial<AccountType['defaults']>) => {
    if (!accountTypeId) return
    dispatch(updateAccountTypeDefaults({ id: accountTypeId, patch }))
  }

  // Meta handlers for table
  const meta = React.useMemo(() => ({
    selectedRows,
    onRowSelect: handleRowSelect,
    onSelectAll: handleSelectAll,
    onFieldChange: (assetId: string, patch: Partial<any>) => {
      if (!accountTypeId) return

      // Get current rule to merge with patch
      const currentRule = rules.find(r => r.assetId === assetId)
      if (!currentRule) return

      const updatedRule = { ...currentRule, ...patch }
      const validation = validateRule(updatedRule)
      
      if (!validation.ok) {
        toast.error(validation.error)
        return
      }

      try {
        dispatch(upsertRule({ accountTypeId, rule: updatedRule }))
        toast.success('Rule updated')
      } catch (error) {
        toast.error('Failed to update rule')
      }
    },
    onToggleEnabled: (assetId: string, currentEnabled: boolean) => {
      if (!accountTypeId) return

      try {
        dispatch(setRuleEnabled({ accountTypeId, assetId, enabled: !currentEnabled }))
        toast.success(`Rule ${!currentEnabled ? 'enabled' : 'disabled'}`)
      } catch (error) {
        toast.error('Failed to update rule status')
      }
    },
    onRemove: (assetId: string) => {
      if (!accountTypeId) return

      try {
        dispatch(removeRule({ accountTypeId, assetId }))
        toast.success('Asset rule removed')
      } catch (error) {
        toast.error('Failed to remove rule')
      }
    },
  }), [dispatch, accountTypeId, rules, selectedRows, handleRowSelect, handleSelectAll])

  // Configure table
  const table = useReactTable({
    data: rules,
    columns: accountTypeRuleColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection: Object.fromEntries(Array.from(selectedRows).map(id => [rules.findIndex(r => r.assetId === id), true])),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: () => {}, // Handled via our custom handlers
    enableColumnResizing: false,
    columnResizeMode: 'onChange',
    meta,
    initialState: {
      columnSizing: {
        _select: 44,
        assetName: 120,
        category: 120,
        leverage: 110,
        spread: 110,
        defaultSize: 120,
        stepSize: 110,
        minSize: 120,
        maxSize: 120,
        commission: 130,
        swapLong: 110,
        swapShort: 110,
        status: 110,
        actions: 170,
      }
    }
  })

  if (!accountType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">Account type not found</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>

          {/* Add Asset Button */}
          <button
            onClick={() => setAddAssetOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </button>

          {/* Mass Change Button */}
          {selectedRows.size > 0 && (
            <button
              onClick={handleMassChange}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300"
            >
              Mass Change ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* Account Type Settings Panel */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between w-full pb-3">
              <h2 className="text-lg font-semibold text-gray-900 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {accountType?.name} - Account Type Defaults
                <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              
              {/* Block Notifications */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r lg:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Block Notifications:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {accountType?.defaults?.blockNotifications ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={accountType?.defaults?.blockNotifications || false}
                        onChange={(e) => handleDefaultsUpdate({ blockNotifications: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allowed to Trade */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allowed to Trade:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {accountType?.defaults?.allowedToTrade ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={accountType?.defaults?.allowedToTrade || false}
                        onChange={(e) => handleDefaultsUpdate({ allowedToTrade: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allow Deposit */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r lg:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allow Deposit:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {accountType?.defaults?.allowDeposit ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={accountType?.defaults?.allowDeposit || false}
                        onChange={(e) => handleDefaultsUpdate({ allowDeposit: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allow Withdraw */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-b sm:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allow Withdraw:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {accountType?.defaults?.allowWithdraw ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={accountType?.defaults?.allowWithdraw || false}
                        onChange={(e) => handleDefaultsUpdate({ allowWithdraw: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Out */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r lg:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Trade Out:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {accountType?.defaults?.tradeOut ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={accountType?.defaults?.tradeOut || false}
                        onChange={(e) => handleDefaultsUpdate({ tradeOut: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Call */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r sm:border-r-0 sm:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Margin Call:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <input
                        type="number"
                        className="text-sm text-gray-600 bg-transparent border-none focus:ring-0 p-0 flex-1"
                        style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}
                        value={accountType?.defaults?.marginCall || 80}
                        onChange={(e) => handleDefaultsUpdate({ marginCall: Number(e.target.value) })}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Assets Section - only when feature flag enabled */}
      {ffAssets && (
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Assets Configuration
              <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
            </h3>
            <AddAssetButton 
              onAdd={async (newRules) => {
                if (accountTypeId) {
                  try {
                    await upsertAssetRules({ 
                      accountTypeId, 
                      rules: newRules.map(rule => ({ ...rule, accountTypeId }))
                    }).unwrap();
                    toast.success(`Added ${newRules.length} asset${newRules.length > 1 ? 's' : ''}`);
                  } catch (error: any) {
                    toast.error(error?.data?.message || 'Failed to add assets');
                  }
                }
              }}
              accountTypeId={accountTypeId}
            />
          </div>
          <AccountTypeAssetsTable accountTypeId={accountTypeId} />
        </div>
      )}

      {/* Filters Section */}
      {rules.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              
              <input
                type="text"
                placeholder="Asset name..."
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={(table.getColumn('assetName')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('assetName')?.setFilterValue(e.target.value)}
              />

              {/* Category Dropdown */}
              <Listbox value={categoryFilter} onChange={setCategoryFilter}>
                <div className="relative">
                  <Listbox.Button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {categoryFilter === 'all' ? 'Category' : categoryFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                    <Listbox.Option
                      value="all"
                      className={({ active }) =>
                        `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm cursor-pointer ${
                          active ? 'bg-gray-100' : ''
                        }`
                      }
                    >
                      All Categories
                    </Listbox.Option>
                    {CATEGORIES.map((category) => (
                      <Listbox.Option
                        key={category}
                        value={category}
                        className={({ active }) =>
                          `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm cursor-pointer ${
                            active ? 'bg-gray-100' : ''
                          }`
                        }
                      >
                        {category}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              {/* Status Dropdown */}
              <Listbox value={statusFilter} onChange={setStatusFilter}>
                <div className="relative">
                  <Listbox.Button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
                    <ChevronDown className="h-4 w-4" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                    {STATUS_OPTIONS.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className={({ active }) =>
                          `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm cursor-pointer ${
                            active ? 'bg-gray-100' : ''
                          }`
                        }
                      >
                        {option.label}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            
            {(categoryFilter !== 'all' || statusFilter !== 'all' || (table.getColumn('assetName')?.getFilterValue() as string)) && (
              <button
                onClick={() => {
                  setCategoryFilter('all')
                  setStatusFilter('all')
                  table.getColumn('assetName')?.setFilterValue('')
                  setColumnFilters([])
                  table.resetColumnFilters()
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <col 
                  key={header.id} 
                  style={{ 
                    width: `${header.getSize()}px` 
                  }} 
                />
              ))}
            </colgroup>
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                      style={{ 
                        width: `${header.getSize()}px`
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-1'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'desc' ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 h-10 cursor-pointer"
                  onClick={(e) => {
                    // Don't trigger row click if clicking on checkbox or other controls
                    const target = e.target as HTMLElement
                    if (target.tagName === 'INPUT' || target.closest('button')) {
                      return
                    }
                    handleRowClick(row)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1.5 text-sm border-r border-gray-200 last:border-r-0 overflow-hidden"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No asset rules configured for this account type.</p>
              <p className="text-sm mt-1">Add your first asset using the Add Asset button.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {rules.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
                {table.getFilteredRowModel().rows.length} assets
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Edit Modal */}
      {bulkEditOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
            <div 
              className="relative inline-block bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl border border-gray-700 w-full max-w-2xl"
              style={{
                transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
                cursor: isDragging ? 'grabbing' : 'default'
              }}
            >
              {/* Header with CRM background */}
              <div 
                className="bg-gray-700 px-6 py-4 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Mass Edit ({selectedRows.size} selected)
                  </h3>
                  <button
                    onClick={() => setBulkEditOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 px-6 pt-6 pb-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Leverage</label>
                    <input
                      type="number"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.leverage}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, leverage: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Spread</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.spread}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, spread: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.defaultSize}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, defaultSize: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Jump</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.stepSize}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, stepSize: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0.001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mini Deal</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.minSize}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, minSize: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0.001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Deal</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.maxSize}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, maxSize: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Commission</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.commissionValue}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, commissionValue: e.target.value }))}
                      placeholder="Leave empty to skip"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Swap Long</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.swapLong}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, swapLong: e.target.value }))}
                      placeholder="Leave empty to skip"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Swap Short</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkEditData.swapShort}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, swapShort: e.target.value }))}
                      placeholder="Leave empty to skip"
                    />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bulk-disable"
                      className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      checked={bulkEditData.disable}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, disable: e.target.checked }))}
                    />
                    <label htmlFor="bulk-disable" className="ml-2 text-sm text-gray-300">Disable selected</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bulk-remove"
                      className="w-4 h-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                      checked={bulkEditData.remove}
                      onChange={(e) => setBulkEditData(prev => ({ ...prev, remove: e.target.checked }))}
                    />
                    <label htmlFor="bulk-remove" className="ml-2 text-sm text-red-400 font-medium">Remove selected</label>
                  </div>
                </div>
              </div>

              {/* Footer with dark theme */}
              <div className="bg-gray-900 px-6 py-3 flex justify-end gap-3 border-t border-gray-700">
                <button
                  onClick={() => setBulkEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-red-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkEditSubmit}
                  className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-2 focus:outline-none focus:ring-yellow-500 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Single Edit Modal */}
      {singleEditOpen && singleEditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative inline-block bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl border border-gray-700 transform transition-all w-full max-w-2xl">
              {/* Header with Binance-style gradient */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">
                    Edit Asset: {singleEditData.assetName}
                  </h3>
                  <button
                    onClick={() => setSingleEditOpen(false)}
                    className="text-black hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 px-6 pt-6 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Leverage</label>
                    <input
                      type="number"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.leverage || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, leverage: Number(e.target.value) || null }))}
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Spread</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.spread || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, spread: Number(e.target.value) || null }))}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.defaultSize || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, defaultSize: Number(e.target.value) || null }))}
                      min="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Jump</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.stepSize || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, stepSize: Number(e.target.value) || null }))}
                      min="0.001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mini Deal</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.minSize || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, minSize: Number(e.target.value) || null }))}
                      min="0.001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Deal</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.maxSize || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, maxSize: Number(e.target.value) || null }))}
                      min="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Commission</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.commissionValue || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, commissionValue: Number(e.target.value) || null }))}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Swap Long</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.swapLong || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, swapLong: Number(e.target.value) || null }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Swap Short</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-9 px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={singleEditData.swapShort || ''}
                      onChange={(e) => setSingleEditData(prev => ({ ...prev, swapShort: Number(e.target.value) || null }))}
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="single-enabled"
                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                        checked={singleEditData.enabled !== false}
                        onChange={(e) => setSingleEditData(prev => ({ ...prev, enabled: e.target.checked }))}
                      />
                      <label htmlFor="single-enabled" className="ml-2 text-sm text-gray-300">Enabled</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with dark theme */}
              <div className="bg-gray-900 px-6 py-3 flex justify-end gap-3 border-t border-gray-700">
                <button
                  onClick={() => setSingleEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-red-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSingleEditSubmit}
                  className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-2 focus:outline-none focus:ring-yellow-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {addAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative inline-block bg-gray-800 rounded-lg text-left overflow-hidden shadow-2xl border border-gray-700 transform transition-all w-full max-w-md">
              {/* Header with Binance-style gradient */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">
                    Add Asset
                  </h3>
                  <button
                    onClick={() => setAddAssetOpen(false)}
                    className="text-black hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 px-6 pt-6 pb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                  >
                    <option value="">Choose an asset...</option>
                    {assetOptions
                      .filter(asset => !rules.some(rule => rule.assetId === asset.value))
                      .map(asset => (
                        <option key={asset.value} value={asset.value}>
                          {asset.label}
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Only showing assets not already added to this account type
                  </p>
                </div>
              </div>

              {/* Footer with dark theme */}
              <div className="bg-gray-900 px-6 py-3 flex justify-end gap-3 border-t border-gray-700">
                <button
                  onClick={() => setAddAssetOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-red-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAsset}
                  disabled={!selectedAsset}
                  className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-2 focus:outline-none focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Asset
                </button>
              </div>
            </div>
        </div>
      )}

    </div>
  )
}