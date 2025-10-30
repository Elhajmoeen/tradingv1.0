import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CaretDown, CaretRight, Users, UserPlus, ShieldCheck, Lock, Envelope, CreditCard, UserGear } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AppDrawer() {
  const [isClientsExpanded, setIsClientsExpanded] = useState(true)
  const [isAdministrationExpanded, setIsAdministrationExpanded] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-64 bg-card border-r border-border p-4 space-y-2">
      <div className="space-y-1">
        {/* Clients parent item */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 p-2 h-auto",
            "hover:bg-muted"
          )}
          onClick={() => setIsClientsExpanded(!isClientsExpanded)}
        >
          {isClientsExpanded ? (
            <CaretDown size={16} />
          ) : (
            <CaretRight size={16} />
          )}
          <Users size={16} />
          <span>Clients</span>
        </Button>

        {/* Clients submenu */}
        {isClientsExpanded && (
          <div className="ml-6 space-y-1">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-2 h-auto",
                isActive('/clients/leads') 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
            >
              <Link to="/clients/leads">
                <UserPlus size={16} />
                <span>Leads</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-2 h-auto",
                isActive('/clients/active') 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
            >
              <Link to="/clients/active">
                <Users size={16} />
                <span>Active Clients</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Administration parent item */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 p-2 h-auto",
            location.pathname.includes('/settings/administration')
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "hover:bg-muted"
          )}
          onClick={() => setIsAdministrationExpanded(!isAdministrationExpanded)}
        >
          {isAdministrationExpanded ? (
            <CaretDown size={16} />
          ) : (
            <CaretRight size={16} />
          )}
          <ShieldCheck size={16} />
          <span>Administration</span>
        </Button>

        {/* Administration submenu */}
        {isAdministrationExpanded && (
          <div className="ml-6 space-y-1">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-2 h-auto",
                isActive('/settings/administration/allow-ip') 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
            >
              <Link to="/settings/administration/allow-ip">
                <Lock size={16} />
                <span>IP Management</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-2 h-auto",
                isActive('/settings/administration/email-templates') 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
            >
              <Link to="/settings/administration/email-templates">
                <Envelope size={16} />
                <span>Email Templates</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 p-2 h-auto",
                isActive('/settings/administration/payment-gateways') 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
            >
              <Link to="/settings/administration/payment-gateways">
                <CreditCard size={16} />
                <span>Payment Gateways</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}