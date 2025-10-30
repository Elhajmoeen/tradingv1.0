import * as React from 'react'
import { useState, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '@/state/store'
import { selectEntityById, selectDisplayNameById, updateEntityField, selectEntityStatus } from '@/state/entitiesSlice'
import { profileTabs } from '@/config/fields'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GeneralTab from './GeneralTab'
import FinanceTab from './FinanceTab'
import DocumentsTab from './DocumentsTab'
import MarketingTab from './MarketingTab'
import SettingsTab from './SettingsTab'
import LogsTab from '@/components/profile/LogsTab'
import { ChangePasswordDrawer } from '@/components/ChangePasswordDrawer'
import ConversationOwnerDrawer from '@/components/conversations/ConversationOwnerDrawer'
import RetentionOwnerDrawer from '@/components/conversations/RetentionOwnerDrawer'
import ConvertLeadDialog from '@/components/profile/ConvertLeadDialog'
import FinanceDrawer from '@/components/FinanceDrawer'
import { EmailDrawer } from '@/features/email'
import { CommentsDrawer } from '@/features/comments'
// Feature flag and new adapter imports
import { isProfileNextEnabled } from '@/lib/flags'
import { ClientProfileAdapter } from '@/features/profile_next/adapters/ClientProfileAdapter'
// Removed positions feature imports - starting fresh
// import { selectAccountFinanceKPIs, selectPositionCounts, selectClosedAggregates } from '@/features/positions/selectors'
// import { formatMoney } from '@/features/positions/lib'

// Simple helper function to replace formatMoney
const formatMoney = (value: number) => `$${value.toLocaleString()}`
import { Box, Typography, IconButton, Popover, Badge } from '@mui/material'
import { 
  Phone, 
  Envelope, 
  ChatCircle, 
  VideoCamera, 
  CurrencyCircleDollar, 
  Eye, 
  ArrowsCounterClockwise,
  Upload,
  WhatsappLogo,
  ArrowLeft,
  Chat,
  User,
  CreditCard,
  FileText,
  MegaphoneSimple,
  Gear,
  ChartLine,
  CaretDown
} from '@phosphor-icons/react'

// Lazy load the heavy PositionsTab for better performance
const PositionsTab = React.lazy(() => import('./PositionsTab'))

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>()
    
    // Feature flag check - use new adapter if enabled
    if (isProfileNextEnabled()) {
        if (!id) {
            return (
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        No client ID provided
                    </div>
                </div>
            )
        }
        
        return <ClientProfileAdapter clientId={id} />
    }
    
    // Legacy ProfilePage implementation below
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const [avatarImage, setAvatarImage] = useState<string>('')
    const [pwdOpen, setPwdOpen] = useState(false)
    const [conversationOwnerOpen, setConversationOwnerOpen] = useState(false)
    const [retentionOwnerOpen, setRetentionOwnerOpen] = useState(false)
    const [emailDrawerOpen, setEmailDrawerOpen] = useState(false)
    const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    
    // Popover state for additional financial metrics
    const [metricsAnchorEl, setMetricsAnchorEl] = useState<HTMLButtonElement | null>(null)
    const metricsOpen = Boolean(metricsAnchorEl)
    
    const entity = useSelector(selectEntityById(id || ''))
    const fullName = useSelector((state: RootState) => selectDisplayNameById(state, id || ''))
    // Simple placeholder data - positions feature removed
    const accountKPIs = {
      balance: 0, equity: 0, freeMargin: 0, marginLevel: 0, openPnL: 0, margin: 0, openVolume: 0
    }
    
    // Additional metrics placeholders
    const positionCounts = { openCount: 0, closedCount: 0, pendingCount: 0 }
    const closedAggregates = { totalCommission: 0, totalSwap: 0, closedVolume: 0 }
    
    // Online status selector
    const status = useSelector((state: RootState) => selectEntityStatus(state, id || ''))

    if (!id) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    No client ID provided
                </div>
            </div>
        )
    }

    if (!entity) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    Client not found
                </div>
            </div>
        )
    }


    const initials = `${entity.firstName?.[0] || ''}${entity.lastName?.[0] || ''}`.toUpperCase() || '??'
    const displayAvatar = entity.avatarUrl || avatarImage

    // Handle avatar upload (placeholder for future functionality)
    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const base64 = e.target?.result as string
                setAvatarImage(base64)
            }
            reader.readAsDataURL(file)
        }
    }

    // Navigation handlers
    const handleBack = () => navigate(-1)

    // CTA handlers (placeholders for future integration)
    const handleCall = () => console.log('Calling client:', fullName)
    const handleEmail = () => setEmailDrawerOpen(true)
    const handleWhatsApp = () => console.log('WhatsApp to:', entity.phoneNumber)
    const handleChat = () => console.log('Starting chat with:', fullName)
    const handlePopup = () => console.log('Pop up for:', fullName)
    const handleComments = () => setCommentsDrawerOpen(true)
    const handleConvert = () => setConvertDialogOpen(true)
    const handleFinance = () => console.log('Finance view for:', fullName)
    
    // Financial metrics popover handlers
    const handleMetricsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMetricsAnchorEl(event.currentTarget)
    }

    const handleMetricsClose = () => {
        setMetricsAnchorEl(null)
    }
    const handleView = () => console.log('Viewing client details:', fullName)

    // Tab icons mapping
    const tabIcons = {
        general: <User className="h-4 w-4" />,
        finance: <CreditCard className="h-4 w-4" />,
        documents: <FileText className="h-4 w-4" />,
        marketing: <MegaphoneSimple className="h-4 w-4" />,
        settings: <Gear className="h-4 w-4" />,
        positions: <ChartLine className="h-4 w-4" />
    }

    return (
        <div className="h-screen flex flex-col w-full overflow-hidden bg-background">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-background p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Back Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleBack}
                        className="h-9 w-9 bg-background hover:bg-muted border-border"
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Badge
                                variant="dot"
                                color={status === 'online' ? "success" : "default"}
                                sx={{
                                    '& .MuiBadge-dot': {
                                        backgroundColor: status === 'online' ? '#10b981' : '#6b7280',
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        border: '2px solid #ffffff'
                                    }
                                }}
                            >
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={displayAvatar} alt={fullName} />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Badge>
                            <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                                <Button size="sm" variant="outline" className="h-6 w-6 p-0 rounded-full">
                                    <Upload className="h-3 w-3" />
                                </Button>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                        </div>
                        
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                            <div className="flex items-center gap-2" style={{ 
                                fontSize: '12px !important', 
                                fontFamily: 'Poppins, Helvetica, Arial, sans-serif !important',
                                color: '#6b7280 !important'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                    color: '#6b7280'
                                }}>Account ID: </span>
                                <button 
                                    className="inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 outline-none rounded-md h-auto p-0 font-normal hover:bg-accent hover:text-foreground"
                                    style={{
                                        fontSize: '12px',
                                        fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                        color: '#6b7280',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setPwdOpen(true)}
                                    aria-label="Change password"
                                >
                                    {entity.accountId || '-'}
                                </button>
                                <span className="mx-1" style={{
                                    fontSize: '12px',
                                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                    color: '#6b7280'
                                }}>•</span>
                                <span style={{
                                    fontSize: '12px',
                                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                    color: '#6b7280'
                                }}>Conv. Owner: </span>
                                <button 
                                    className="inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 outline-none rounded-md h-auto p-0 font-normal hover:text-primary hover:underline"
                                    style={{
                                        fontSize: '12px',
                                        fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                        color: '#6b7280',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setConversationOwnerOpen(true)}
                                    aria-label="Assign conversation owner"
                                >
                                    {entity.conversationOwner === 'CO Removed' 
                                        ? 'CO Removed'
                                        : entity.conversationOwner 
                                        ? entity.conversationOwner
                                        : 'Unassigned'
                                    }
                                </button>
                                <span className="mx-1" style={{
                                    fontSize: '12px',
                                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                    color: '#6b7280'
                                }}>•</span>
                                <span style={{
                                    fontSize: '12px',
                                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                    color: '#6b7280'
                                }}>Retention Owner: </span>
                                <button 
                                    className="inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 outline-none rounded-md h-auto p-0 font-normal hover:text-primary hover:underline"
                                    style={{
                                        fontSize: '12px',
                                        fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                                        color: '#6b7280',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setRetentionOwnerOpen(true)}
                                    aria-label="Assign retention owner"
                                >
                                    {entity.retentionOwner === 'RO Removed' 
                                        ? 'RO Removed'
                                        : entity.retentionOwner 
                                        ? entity.retentionOwner
                                        : entity.salesManager || 'Unassigned'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide md:ml-auto">
                        <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handleCall}>
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handleEmail}>
                            <Envelope className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handleChat}>
                            <ChatCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handleComments}>
                            <Chat className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handlePopup}>
                            <VideoCamera className="h-4 w-4" />
                        </Button>
                        {entity.type === 'lead' && (
                            <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200" onClick={handleConvert}>
                                <ArrowsCounterClockwise className="h-4 w-4" />
                            </Button>
                        )}
                        <FinanceDrawer clientId={id}>
                            <Button size="sm" className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200">
                                <CurrencyCircleDollar className="h-4 w-4" />
                            </Button>
                        </FinanceDrawer>
                    </div>
                </div>
            </div>

            {/* Trading Metrics Section */}
            <Box sx={{ 
                flexShrink: 0, 
                borderBottom: '1px solid #e5e7eb', 
                backgroundColor: '#fafbfc', 
                width: '100%',
                px: 0, 
                py: 2,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.3) 0%, rgba(243, 244, 246, 0.2) 100%)',
                    pointerEvents: 'none'
                }
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-evenly',
                    width: '100%',
                    px: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Balance:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#111827',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.balance)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Margin Level:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#111827',
                            fontWeight: 600
                        }}>
                            {accountKPIs.marginLevel === Infinity ? '∞' : `${accountKPIs.marginLevel.toFixed(1)}%`}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', sm: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Open PnL:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: accountKPIs.openPnL >= 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.openPnL)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', md: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Total PnL:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: accountKPIs.openPnL >= 0 ? '#10b981' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.openPnL)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', md: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Free Margin:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: accountKPIs.freeMargin >= 0 ? '#111827' : '#ef4444',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.freeMargin)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', lg: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Total Margin:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#111827',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.margin)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', lg: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Equity:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#111827',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.equity)}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        width: '1px', 
                        height: '16px', 
                        background: '#d1d5db',
                        mx: 1,
                        display: { xs: 'none', lg: 'block' }
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontWeight: 500
                        }}>
                            Open Volume:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.75rem',
                            color: '#111827',
                            fontWeight: 600
                        }}>
                            {formatMoney(accountKPIs.openVolume)}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleMetricsClick}
                            sx={{ 
                                minWidth: '20px',
                                width: '20px',
                                height: '20px',
                                padding: '2px',
                                ml: 0.5,
                                color: '#6b7280',
                                '&:hover': {
                                    color: '#374151',
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <CaretDown size={12} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Body - Scrollable Tabs */}
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="general" className="h-full flex flex-col gap-0">
                    <TabsList className="flex-shrink-0 w-full justify-start bg-background border-b rounded-none h-12">
                        {profileTabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className="px-4 flex items-center gap-2">
                                {tabIcons[tab.id as keyof typeof tabIcons]}
                                <span>{tab.title}</span>
                            </TabsTrigger>
                        ))}
                        <TabsTrigger value="positions" className="px-4 flex items-center gap-2">
                            {tabIcons.positions}
                            <span>Positions</span>
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="px-4 flex items-center gap-2">
                            <ChatCircle size={16} />
                            <span>Activity Logs</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="flex-1 overflow-auto p-6 m-0">
                        <GeneralTab clientId={id} />
                    </TabsContent>

                    {/* Finance Tab */}
                    <TabsContent value="finance" className="flex-1 overflow-auto p-6 m-0">
                        <FinanceTab clientId={id} />
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="flex-1 overflow-auto p-6 m-0">
                        <DocumentsTab clientId={id} />
                    </TabsContent>

                    {/* Marketing Tab */}
                    <TabsContent value="marketing" className="flex-1 overflow-auto p-6 m-0">
                        <MarketingTab clientId={id} />
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="flex-1 overflow-auto p-6 m-0">
                        <SettingsTab clientId={id} />
                    </TabsContent>

                    {/* Positions Tab */}
                    <TabsContent value="positions" className="flex-1 overflow-hidden m-0">
                        <Suspense fallback={<div className="text-center text-muted-foreground py-8">Loading positions...</div>}>
                            <PositionsTab entityId={id} />
                        </Suspense>
                    </TabsContent>

                    {/* Activity Logs Tab */}
                    <TabsContent value="logs" className="flex-1 overflow-auto p-6 m-0">
                        <LogsTab 
                            entityId={id || ''} 
                            entityType={entity?.type || 'client'} 
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Change Password Drawer */}
                        <ChangePasswordDrawer 
                open={pwdOpen} 
                onClose={() => setPwdOpen(false)} 
                clientId={id} 
            />

            {/* Conversation Owner Drawer */}
            <ConversationOwnerDrawer 
                open={conversationOwnerOpen}
                onOpenChange={setConversationOwnerOpen}
                clientId={id}
                currentOwnerId={entity.conversationOwnerId}
                onAssigned={(owner) => {
                    // Update is handled by the drawer via Redux dispatch
                    console.log('Conversation owner assigned:', owner)
                }}
            />

            {/* Retention Owner Drawer */}
            <RetentionOwnerDrawer 
                open={retentionOwnerOpen}
                onOpenChange={setRetentionOwnerOpen}
                clientId={id}
                currentOwnerId={entity.retentionOwnerId}
                onAssigned={(owner) => {
                    // Update is handled by the drawer via Redux dispatch
                    console.log('Retention owner assigned:', owner)
                }}
            />

            {/* Email Drawer */}
            <EmailDrawer 
                open={emailDrawerOpen}
                onClose={() => setEmailDrawerOpen(false)}
                entityContext={entity ? { id: entity.id, type: entity.type } : undefined}
            />

            {/* Comments Drawer */}
            <CommentsDrawer
                open={commentsDrawerOpen}
                onOpenChange={setCommentsDrawerOpen}
                entityId={id}
                entityType={entity.type}
            />

            {/* Additional Financial Metrics Popover */}
            <Popover
                open={metricsOpen}
                anchorEl={metricsAnchorEl}
                onClose={handleMetricsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                slotProps={{
                    paper: { 
                        sx: {
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #e2e8f0',
                            p: 2,
                            fontFamily: 'Poppins, sans-serif',
                            backgroundColor: '#f8fafc'
                        }
                    }
                }}
            >
                <Box sx={{ minWidth: '220px', fontSize: '0.875rem', color: '#374151' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Commissions</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {formatMoney(closedAggregates.totalCommission)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Total Swaps</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {formatMoney(closedAggregates.totalSwap)}
                        </Typography>
                    </Box>
                    <Box sx={{ my: 1, borderTop: '1px solid #e5e7eb' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Closed Volume</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {closedAggregates.closedVolume.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>#Open Positions</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {positionCounts.openCount}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>#Closed Positions</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {positionCounts.closedCount}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>#Pending Positions</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {positionCounts.pendingCount}
                        </Typography>
                    </Box>
                </Box>
            </Popover>

            {/* Convert Lead Dialog */}
            {entity && entity.type === 'lead' && (
                <ConvertLeadDialog
                    open={convertDialogOpen}
                    onClose={() => setConvertDialogOpen(false)}
                    leadId={id || ''}
                />
            )}
        </div>
    )
}