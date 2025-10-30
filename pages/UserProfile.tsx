import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { User, Envelope, ShieldCheck, Calendar } from '@phosphor-icons/react'
import { selectCurrentUser, setAvatarUrl } from '@/state/authSlice'
import AvatarUploadAdapter from '@/features/profile/avatar/AvatarUploadAdapter'

export default function UserProfilePage() {
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Please log in to view your profile.</div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {/* Avatar Section */}
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <AvatarUploadAdapter
                  onUpdated={(url) => {
                    dispatch(setAvatarUrl(url))
                  }}
                >
                  {({ onClick, uploading }) => (
                    <div className="relative group">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover cursor-pointer group-hover:opacity-75 transition-opacity"
                          onClick={onClick}
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full border-4 border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold flex items-center justify-center cursor-pointer group-hover:opacity-75 transition-opacity"
                          onClick={onClick}
                        >
                          {getInitials(currentUser.fullName)}
                        </div>
                      )}
                      
                      {/* Upload overlay */}
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={onClick}
                      >
                        <User size={24} className="text-white" />
                      </div>
                      
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  )}
                </AvatarUploadAdapter>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{currentUser.fullName}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click your avatar to upload a new profile picture
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Full Name */}
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-400" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentUser.fullName}</dd>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <Envelope size={20} className="text-gray-400" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentUser.email}</dd>
              </div>
            </div>

            {/* Permission Level */}
            <div className="flex items-center space-x-3">
              <ShieldCheck size={20} className="text-gray-400" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Permission Level</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentUser.permission === 'Admin' 
                      ? 'bg-red-100 text-red-800'
                      : currentUser.permission === 'Manager'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentUser.permission}
                  </span>
                </dd>
              </div>
            </div>

            {/* Account ID */}
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{currentUser.id}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Security</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: Recently
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}