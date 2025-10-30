import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, selectCurrentUser, setAvatarUrl } from '@/state/authSlice'
import AvatarUploadAdapter from '@/features/profile/avatar/AvatarUploadAdapter'
import { 
  List, 
  MagnifyingGlass, 
  Bell, 
  Gear, 
  X, 
  House,
  Users,
  UserPlus,
  ChartLineUp,
  FileText,
  CaretDown,
  CaretRight,
  Lock,
  User,
  SignOut,
  Download,
  ShieldCheck,
  Envelope,
  CreditCard,
  UserGear,
  // PATCH: begin Status Manager icon
  Tag
  // PATCH: end Status Manager icon
} from '@phosphor-icons/react'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { cn } from "@/lib/utils"

export function Header() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isClientsExpanded, setIsClientsExpanded] = useState(true)
  const [isPositionsExpanded, setIsPositionsExpanded] = useState(true)
  const [isTradingSettingsExpanded, setIsTradingSettingsExpanded] = useState(false)
  const [isAdministrationExpanded, setIsAdministrationExpanded] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const location = useLocation()
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    dispatch(logout())
    setIsProfileDropdownOpen(false)
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-expand/collapse sections based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/management/trading')) {
      setIsTradingSettingsExpanded(true)
    } else {
      setIsTradingSettingsExpanded(false)
    }
    
    // PATCH: begin Status Manager route detection
    if (location.pathname.includes('/settings/administration') || location.pathname.includes('/admin/status-manager')) {
      setIsAdministrationExpanded(true)
    } else {
      setIsAdministrationExpanded(false)
    }
    // PATCH: end Status Manager route detection
  }, [location.pathname])

  // Handle clicking outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const menuItems = [
    { name: 'Dashboard', icon: House, path: '/', active: location.pathname === '/' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <nav className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu and Search */}
        <div className="flex items-center">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="ml-4 mr-2 p-3 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
          >
            <List size={22} />
          </button>
          
          {/* Backdrop Overlay */}
          {isDrawerOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* Enhanced Drawer */}
          <div 
            className={`fixed top-0 left-0 z-50 h-screen overflow-y-auto transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            } bg-white w-80 shadow-2xl dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}
          >
            {/* Drawer Header with Enhanced Design */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center">
                  <div className="w-8 h-8 me-3 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">CRM Hub</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Management Portal</p>
                  </div>
                </div>
                
                {/* Enhanced Close Button */}
                <button 
                  type="button" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 rounded-lg p-2 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>
            </div>
            
            {/* Enhanced Navigation Content */}
            <div className="px-4 py-2 space-y-2">
              {/* Main Menu Items */}
              {menuItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      item.active
                        ? 'text-white bg-gray-900 dark:bg-gray-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent size={18} className="me-3" />
                    {item.name}
                  </Link>
                )
              })}

              {/* Enhanced Clients Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsClientsExpanded(!isClientsExpanded)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname.startsWith('/clients')
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Users size={18} className="me-3" />
                    Clients
                  </div>
                  <div className={`transition-transform duration-200 ${isClientsExpanded ? 'rotate-180' : ''}`}>
                    <CaretDown size={14} />
                  </div>
                </button>

                {/* Enhanced Clients Submenu */}
                {isClientsExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                    <Link
                      to="/clients/leads"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/clients/leads')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <UserPlus size={16} className="me-3" />
                      Leads
                    </Link>
                    <Link
                      to="/clients/active"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/clients/active')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Users size={16} className="me-3" />
                      Active Clients
                    </Link>
                  </div>
                )}
              </div>

              {/* Enhanced Positions Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsPositionsExpanded(!isPositionsExpanded)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname.startsWith('/positions')
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <ChartLineUp size={18} className="me-3" />
                    Positions
                  </div>
                  <div className={`transition-transform duration-200 ${isPositionsExpanded ? 'rotate-180' : ''}`}>
                    <CaretDown size={14} />
                  </div>
                </button>

                {/* Enhanced Positions Submenu */}
                {isPositionsExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                    <Link
                      to="/positions/open"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/positions/open')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <ChartLineUp size={16} className="me-3" />
                      Open Positions
                    </Link>
                    <Link
                      to="/positions/closed"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/positions/closed')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <FileText size={16} className="me-3" />
                      Closed Positions
                    </Link>
                    <Link
                      to="/positions/pending"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/positions/pending')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Gear size={16} className="me-3" />
                      Pending Positions
                    </Link>
                  </div>
                )}
              </div>

              {/* Enhanced Transactions Section */}
              <div className="space-y-1">
                <Link
                  to="/transactions"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/transactions')
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <FileText size={18} className="me-3" />
                  Transactions
                </Link>
              </div>

              {/* Enhanced Compliance Section */}
              <div className="space-y-1">
                <Link
                  to="/compliance"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive('/compliance')
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ShieldCheck size={18} className="me-3" />
                  Compliance
                </Link>
              </div>

              {/* Enhanced Divider */}
              <div className="mx-4 my-6 border-t border-gray-200 dark:border-gray-700"></div>

              {/* Enhanced Management Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsTradingSettingsExpanded(!isTradingSettingsExpanded)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname.startsWith('/management/trading')
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Gear size={18} className="me-3" />
                    Trading Settings
                  </div>
                  <div className={`transition-transform duration-200 ${isTradingSettingsExpanded ? 'rotate-180' : ''}`}>
                    <CaretDown size={14} />
                  </div>
                </button>

                {/* Enhanced Trading Settings Submenu */}
                {isTradingSettingsExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                    <Link
                      to="/management/trading/account-types"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/management/trading/account-types')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <UserGear size={16} className="me-3" />
                      Account Types
                    </Link>
                  </div>
                )}
              </div>

              {/* Enhanced Administration Section */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsAdministrationExpanded(!isAdministrationExpanded)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    (location.pathname.includes('/settings/administration') || location.pathname.includes('/admin/status-manager'))
                      ? 'text-white bg-gray-900 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <ShieldCheck size={18} className="me-3" />
                    Administration
                  </div>
                  <div className={`transition-transform duration-200 ${isAdministrationExpanded ? 'rotate-180' : ''}`}>
                    <CaretDown size={14} />
                  </div>
                </button>

                {/* Enhanced Administration Submenu */}
                {isAdministrationExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                    <Link
                      to="/settings/administration/allow-ip"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/settings/administration/allow-ip')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Lock size={16} className="me-3" />
                      IP Management
                    </Link>
                    
                    <Link
                      to="/settings/administration/email-templates"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/settings/administration/email-templates')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Envelope size={16} className="me-3" />
                      Email Templates
                    </Link>
                    
                    <Link
                      to="/settings/administration/payment-gateways"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/settings/administration/payment-gateways')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <CreditCard size={16} className="me-3" />
                      Payment Gateways
                    </Link>
                    
                    <Link
                      to="/settings/administration/users"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/settings/administration/users')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Users size={16} className="me-3" />
                      Users Management
                    </Link>
                    
                    {/* PATCH: begin nav Status Manager */}
                    <Link
                      to="/admin/status-manager"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive('/admin/status-manager')
                          ? 'text-white bg-gray-800 dark:bg-gray-600'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Tag size={16} className="me-3" />
                      Status Manager
                    </Link>
                    {/* PATCH: end nav Status Manager */}
                  </div>
                )}
              </div>

            </div>

            {/* Enhanced Footer Section */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 mt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Powered by CRM Hub
                </p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>



          {/* Global Search */}
          <div className="flex items-center ml-6">
            <GlobalSearch />
          </div>
        </div>

        {/* Center - Empty space for balance */}
        <div className="flex-grow"></div>

        {/* Right side - Enhanced Icons and Profile */}
        <div className="flex items-center gap-2 mr-6">
          {/* Time Display with Seconds */}
          <div className="px-3 py-1.5 text-gray-700 dark:text-white/90 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-md text-xs font-mono tracking-wide backdrop-blur-sm">
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: true 
            })}
          </div>

          {/* Lock Icon */}
          <button className="p-2 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105">
            <Lock size={20} />
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105">
            <div className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </div>
          </button>



          {/* Settings */}
          <button className="p-2 text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105">
            <Gear size={20} />
          </button>

          {/* Enhanced Profile Dropdown */}
          {currentUser && (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="p-2 flex items-center rounded-lg text-gray-900 dark:text-white text-sm font-medium border border-gray-300 dark:border-white/20 outline-none hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-all duration-200"
              >
                <AvatarUploadAdapter
                  onUpdated={(url) => {
                    // Optimistically update auth slice
                    try { 
                      dispatch(setAvatarUrl(url)); 
                    } catch (err) {
                      console.error('Failed to update avatar in store:', err);
                    }
                  }}
                >
                  {({ onClick, uploading }) => (
                    <div className="relative">
                      {currentUser.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt="Profile" 
                          className="w-7 h-7 rounded-full border border-gray-300 dark:border-white/30 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={onClick}
                        />
                      ) : (
                        <div 
                          className="w-7 h-7 rounded-full border border-gray-300 dark:border-white/30 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={onClick}
                        >
                          {getInitials(currentUser.fullName)}
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/30 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  )}
                </AvatarUploadAdapter>
                <span className="ml-2 hidden sm:block text-gray-900 dark:text-white">
                  {currentUser.fullName}
                </span>
                <CaretDown 
                  size={12} 
                  className={`ml-2 text-gray-700 dark:text-white/70 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {isProfileDropdownOpen && (
                <ul className="absolute right-0 shadow-lg border border-gray-200 bg-white p-2 mt-2 z-[1000] min-w-full w-56 rounded-xl max-h-96 overflow-auto">
                  <li className="px-4 py-2 border-b border-gray-100 mb-2">
                    <div className="text-sm font-medium text-gray-900">{currentUser.fullName}</div>
                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                    <div className="text-xs text-blue-600 font-medium">{currentUser.permission}</div>
                  </li>
                  <li>
                    <Link 
                      to="/settings/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="py-2.5 px-4 flex items-center hover:bg-gray-50 rounded-lg text-slate-600 font-medium text-sm cursor-pointer transition-colors duration-200"
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </Link>
                  </li>
                  <li className="py-2.5 px-4 flex items-center hover:bg-gray-50 rounded-lg text-slate-600 font-medium text-sm cursor-pointer transition-colors duration-200">
                    <Gear size={16} className="mr-3" />
                    Account Settings
                  </li>
                  <li className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 px-4 flex items-center hover:bg-red-50 rounded-lg text-red-600 font-medium text-sm cursor-pointer transition-colors duration-200"
                    >
                      <SignOut size={16} className="mr-3" />
                      Log Out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}