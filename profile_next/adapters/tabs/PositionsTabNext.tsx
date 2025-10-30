import React, { useState } from 'react'
import { useGetClientPositionsQuery } from '../../state/clientsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3Icon, TrendingUpIcon, TrendingDownIcon, CircleIcon } from 'lucide-react'
import type { PositionDTO } from '@/features/positions_next/types/position'

interface PositionsTabNextProps {
  clientId: string
}

export const PositionsTabNext: React.FC<PositionsTabNextProps> = ({ clientId }) => {
  const {
    data: allPositions = [],
    isLoading,
    error,
  } = useGetClientPositionsQuery(clientId)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive text-center">Failed to load positions data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter positions by status
  const openPositions = allPositions.filter(p => p.status === 'OPEN')
  const pendingPositions = allPositions.filter(p => p.status === 'PENDING')
  const closedPositions = allPositions.filter(p => p.status === 'CLOSED')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getPositionBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-600'
    if (pnl < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const PositionCard: React.FC<{ position: PositionDTO }> = ({ position }) => {
    // Calculate P&L for open positions
    const calculatePnL = () => {
      if (position.status !== 'OPEN' || !position.currentPrice) return 0
      const priceDiff = position.currentPrice - position.openPrice
      const multiplier = position.side === 'BUY' ? 1 : -1
      return priceDiff * multiplier * position.amountUnits
    }

    const pnl = calculatePnL()

    return (
      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{position.instrument}</span>
            <Badge className={getPositionBadgeColor(position.status)}>
              {position.status}
            </Badge>
            <Badge variant="outline" className={position.side === 'BUY' ? 'text-green-600' : 'text-red-600'}>
              {position.side}
            </Badge>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">{formatCurrency(position.amountUnits)}</div>
            <div className="text-xs text-muted-foreground">Units</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Open Price</div>
            <div className="font-mono">{position.openPrice}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current Price</div>
            <div className="font-mono">{position.currentPrice || position.openPrice}</div>
          </div>
          <div>
            <div className="text-muted-foreground">P&L</div>
            <div className={`font-mono ${getPnLColor(pnl)}`}>
              {formatCurrency(pnl)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Opened</div>
            <div>{new Date(position.openTime).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <CircleIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openPositions.length}</div>
              <p className="text-xs text-muted-foreground">
                Active trades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <CircleIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPositions.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allPositions.length}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="open" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="open" className="flex items-center gap-2">
                <CircleIcon className="w-4 h-4 text-green-600" />
                Open ({openPositions.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <CircleIcon className="w-4 h-4 text-yellow-600" />
                Pending ({pendingPositions.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex items-center gap-2">
                <CircleIcon className="w-4 h-4 text-gray-600" />
                Closed ({closedPositions.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="open" className="flex-1 overflow-auto p-6 m-0">
            {openPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No open positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="flex-1 overflow-auto p-6 m-0">
            {pendingPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CircleIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No pending orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed" className="flex-1 overflow-auto p-6 m-0">
            {closedPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CircleIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No closed positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {closedPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}