import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ListHeaderBar } from '@/components/ListHeaderBar'
import AccountTypesTable from '@/features/accountTypes/AccountTypesTable'
import AccountTypesAdapter from '@/features/accountTypes_next/adapters/AccountTypesAdapter'
import { isAccountTypeUsageEnabled } from '@/lib/flags'
import { addAccountType, seedDefaultsOnce } from '@/state/accountTypesSlice'

export default function AccountTypesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // Seed demo data on component mount - exactly like UsersPage
  useEffect(() => {
    dispatch(seedDefaultsOnce())
  }, [dispatch])

  const handleActions = {
    onNew: () => {
      // Navigate to new account type page instead of using prompt
      navigate('/management/trading/account-types/new')
    }
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0">
        <ListHeaderBar
          onSearch={setSearchQuery}
          actions={handleActions}
          entityNamePlural="account types"
        />
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        {isAccountTypeUsageEnabled() ? (
          <AccountTypesAdapter searchQuery={searchQuery} />
        ) : (
          <AccountTypesTable searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
}