import React from 'react'
import { useGetClientTransactionsQuery } from '../../state/clientsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCardIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'

interface FinanceTabNextProps {
  clientId: string
}

export const FinanceTabNext: React.FC<FinanceTabNextProps> = ({ clientId }) => {
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useGetClientTransactionsQuery(clientId)

  if (isLoading) {
    return (
      <div className="space-y-6">
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
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive text-center">Failed to load financial data</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate financial metrics
  const deposits = transactions.filter(t => t.actionType === 'DEPOSIT')
  const withdrawals = transactions.filter(t => t.actionType === 'WITHDRAW')
  const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0)
  const netPosition = totalDeposits - totalWithdrawals

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getTransactionIcon = (actionType: string) => {
    switch (actionType) {
      case 'DEPOSIT':
        return <TrendingUpIcon className="h-4 w-4 text-green-600" />
      case 'WITHDRAW':
        return <TrendingDownIcon className="h-4 w-4 text-red-600" />
      default:
        return <DollarSignIcon className="h-4 w-4 text-blue-600" />
    }
  }

  const getTransactionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'DEPOSIT':
        return 'bg-green-100 text-green-800'
      case 'WITHDRAW':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDeposits)}
            </div>
            <p className="text-xs text-muted-foreground">
              {deposits.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              {withdrawals.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netPosition)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest financial activity for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.actionType)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {transaction.actionType.charAt(0).toUpperCase() + transaction.actionType.slice(1).toLowerCase()}
                        </span>
                        <Badge className={getTransactionBadgeColor(transaction.actionType)}>
                          {transaction.subType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    {transaction.method && (
                      <p className="text-xs text-muted-foreground">
                        via {transaction.method}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}