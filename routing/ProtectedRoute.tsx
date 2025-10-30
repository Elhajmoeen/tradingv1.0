import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectCurrentUser, selectAuthLoading } from '../../state/authSlice'
import { readUserRoles } from '@/integration/auth'

type ProtectedRouteProps = {
  children?: React.ReactNode;
  allowedRoles?: Array<'Manager' | 'Admin' | 'Agent' | 'Backoffice'>;
};

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, allowedRoles } = props;
  const currentUser = useSelector(selectCurrentUser)
  const isLoading = useSelector(selectAuthLoading)
  const location = useLocation()
  const state = useSelector((s) => s as any);
  const roles: string[] = readUserRoles(state);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length) {
    const ok = roles.some(r => allowedRoles.includes(r as any));
    if (!ok) {
      // preserve your existing redirect pattern; fallback to "/"
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated, render the protected route
  return children ? <>{children}</> : <Outlet />
}