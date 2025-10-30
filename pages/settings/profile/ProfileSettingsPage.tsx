import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectCurrentUser } from '@/state/authSlice'
import UserEditPage from '@/pages/UserEditPage'

/**
 * Profile Settings page
 * Renders the User Management profile edit page in self mode for the logged-in user
 * Shows read-only fields except for avatar upload
 */
export default function ProfileSettingsPage() {
  const currentUser = useSelector(selectCurrentUser)

  if (!currentUser?.id) {
    // If no user is logged in, redirect to login
    return <Navigate to="/login" replace />
  }
  
  // Render UserEditPage in self mode
  return <UserEditPage mode="self" userId={currentUser.id} />
}