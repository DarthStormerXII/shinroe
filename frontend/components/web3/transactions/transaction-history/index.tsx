'use client'

import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  formatBalance
} from '@/lib/web3/format'
import type { TransactionHistoryProps } from '@/lib/types/web3/components'
import type { Transaction } from '@/lib/types/web3/web3'
import { TransactionRow } from './transaction-row'
import { TransactionDetails } from './transaction-details'
import { TransactionFilters } from './transaction-filters'

interface TransactionHistoryPropsExtended extends TransactionHistoryProps {
  // View mode: list or sheet
  viewMode?: 'list' | 'sheet'
  // Sheet-specific props
  sheetTrigger?: React.ReactNode
  sheetPosition?: 'left' | 'right'
  // Enable search and filters
  enableSearch?: boolean
  enableFilters?: boolean
  // Enable stats display
  showStats?: boolean
  // Data source for demo
  useMockData?: boolean
  // User address for mock data generation
  address?: string
}

// Mock data generator (from sheet component)
const generateMockTransactions = (address?: string): Transaction[] => {
  const now = Date.now()
  const userAddress = address || '0x0000000000000000000000000000000000000000'
  
  return [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'confirmed',
      chainId: 1,
      from: userAddress,
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
      value: '1.5',
      tokenSymbol: 'ETH',
      gasUsed: '21000',
      gasPrice: '30',
      timestamp: now - 1000 * 60 * 5,
      type: 'transfer',
      description: 'Sent 1.5 ETH'
    },
    {
      hash: '0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef2345',
      status: 'confirmed',
      chainId: 1,
      from: userAddress,
      tokenAmount: '1000',
      tokenSymbol: 'USDC',
      value: '0.5',
      gasUsed: '150000',
      gasPrice: '35',
      timestamp: now - 1000 * 60 * 15,
      type: 'swap',
      description: 'Swapped 1000 USDC for 0.5 ETH',
      contractName: 'Uniswap V3'
    },
    {
      hash: '0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef3456789012',
      status: 'pending',
      chainId: 11155111,
      from: userAddress,
      to: '0xab11cda079c613eFA68C35dC46e4C05E0b1e1645',
      tokenAmount: '100',
      tokenSymbol: 'TEST',
      timestamp: now - 1000 * 60 * 2,
      type: 'mint',
      description: 'Minting 100 TEST tokens',
      contractName: 'Test Token'
    },
    {
      hash: '0x4567890123def4567890123def4567890123def4567890123def4567890123def4',
      status: 'failed',
      chainId: 1,
      from: userAddress,
      to: '0x1234567890123456789012345678901234567890',
      gasUsed: '100000',
      gasPrice: '40',
      timestamp: now - 1000 * 60 * 60,
      type: 'contract',
      method: 'incrementCounter',
      contractName: 'Counter',
      error: 'Transaction reverted: Counter overflow'
    }
  ] as Transaction[]
}

export function TransactionHistory({
  transactions: providedTransactions,
  onTransactionClick,
  loading = false,
  emptyMessage = 'No transactions found',
  showStatus = true,
  className,
  // Extended props
  viewMode = 'list',
  sheetTrigger,
  sheetPosition = 'right',
  enableSearch = false,
  enableFilters = false,
  showStats = false,
  useMockData = false,
  address
}: TransactionHistoryPropsExtended) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [chainFilter, setChainFilter] = useState<string>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  // Generate mock data (always call the hook to satisfy React rules)
  const mockTransactions = useMemo(() => generateMockTransactions(address), [address])
  
  // Use mock data if requested
  const transactions = useMockData ? mockTransactions : providedTransactions
  
  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!enableSearch && !enableFilters) return transactions
    
    return transactions.filter(tx => {
      // Search filter
      if (enableSearch && searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !tx.hash.toLowerCase().includes(query) &&
          !(tx.description?.toLowerCase().includes(query)) &&
          !(tx.contractName?.toLowerCase().includes(query)) &&
          !(tx.method?.toLowerCase().includes(query))
        ) {
          return false
        }
      }
      
      // Status filter
      if (enableFilters) {
        if (statusFilter !== 'all' && tx.status !== statusFilter) {
          return false
        }
        
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false
        }
        
        // Chain filter
        if (chainFilter !== 'all' && tx.chainId !== parseInt(chainFilter)) {
          return false
        }
      }
      
      return true
    })
  }, [transactions, searchQuery, statusFilter, typeFilter, chainFilter, enableSearch, enableFilters])
  
  // Transaction stats
  const stats = useMemo(() => {
    if (!showStats) return null
    
    const pending = transactions.filter(tx => tx.status === 'pending').length
    const failed = transactions.filter(tx => tx.status === 'failed').length
    const totalGas = transactions.reduce((acc, tx) => {
      if (tx.gasUsed && tx.gasPrice && tx.status === 'confirmed') {
        return acc + BigInt(tx.gasUsed) * BigInt(tx.gasPrice)
      }
      return acc
    }, BigInt(0))
    
    return { pending, failed, totalGas }
  }, [transactions, showStats])
  
  const handleTransactionClick = (tx: Transaction) => {
    if (viewMode === 'sheet') {
      setSelectedTransaction(tx)
    } else if (onTransactionClick) {
      onTransactionClick(tx)
    }
  }
  
  // List view content
  const listContent = (
    <div className={cn('space-y-2', className)}>
      {/* Search and filters for list view */}
      {(enableSearch || enableFilters) && (
        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          chainFilter={chainFilter}
          onChainChange={setChainFilter}
          transactions={transactions}
          enableSearch={enableSearch}
          enableFilters={enableFilters}
        />
      )}
      
      {/* Stats for list view */}
      {showStats && stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{transactions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-500">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-lg font-bold text-red-500">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Transactions list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx, index) => (
            <TransactionRow
              key={tx.hash || index}
              transaction={tx}
              onClick={() => handleTransactionClick(tx)}
              showStatus={showStatus}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </div>
  )
  
  // Return list view if not sheet mode
  if (viewMode === 'list') {
    return listContent
  }
  
  // Sheet view
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        {sheetTrigger || (
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Transaction History
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent 
        side={sheetPosition} 
        className="w-full sm:w-[540px] sm:max-w-[540px] p-0"
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Transaction History</SheetTitle>
          <SheetDescription>
            View all transactions made through this application
          </SheetDescription>
        </SheetHeader>
        
        {/* Stats */}
        {showStats && stats && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="px-6 pb-4">
          <TransactionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            chainFilter={chainFilter}
            onChainChange={setChainFilter}
            transactions={transactions}
            enableSearch={true}
            enableFilters={true}
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedTransaction ? (
            <div className="p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
                className="mb-4"
              >
                ← Back to list
              </Button>
              <TransactionDetails transaction={selectedTransaction} />
            </div>
          ) : (
            <div className="overflow-y-auto h-[calc(100vh-380px)]">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{emptyMessage}</p>
                </div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.hash || index}
                    transaction={transaction}
                    onClick={() => setSelectedTransaction(transaction)}
                    showStatus={showStatus}
                    compact={false}
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {stats && (
          <div className="p-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Total gas spent: {formatBalance(stats.totalGas.toString(), 18, 4)} ETH
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}