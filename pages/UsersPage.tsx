import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import UsersTable from '../components/UsersTable'
import { seedIfEmpty } from '../state/usersSlice'

export default function UsersPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Seed demo data on component mount
  useEffect(() => {
    dispatch(seedIfEmpty())
  }, [dispatch])

  // Handle add user navigation
  const handleAddUser = () => {
    navigate('/settings/administration/users/new')
  }

  return (
    <div className="flex flex-col w-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage CRM user accounts and permissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container - takes remaining height, full width */}
      <div className="flex-1 overflow-hidden w-full">
        <UsersTable />
      </div>
    </div>
  )
}