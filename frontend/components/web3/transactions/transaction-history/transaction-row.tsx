'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Repeat,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  ChevronRight,
  Fuel,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  formatTxHash, 
  formatTimeAgo, 
  getStatusBgColor,
  formatAddress,
  formatBalance
} from '@/lib/web3/format'
import { getExplorerUrl } from '@/lib/config/chains'
import { getChainMetadata } from '@/lib/web3/assets'
import type { Transaction } from '@/lib/types/web3/web3'

interface TransactionRowProps {
  transaction: Transaction
  onClick?: () => void
  showStatus?: boolean
  compact?: boolean
}

// Transaction type icon
const getTransactionIcon = (transaction: Transaction) => {
  if (transaction.type) {
    switch (transaction.type) {
      case 'transfer':
        return transaction.from === transaction.to ? ArrowDownLeft : ArrowUpRight
      case 'swap':
        return Repeat
      case 'mint':
        return Coins
      case 'burn':
        return XCircle
      case 'approve':
        return CheckCircle
      case 'contract':
        return FileText
      default:
        return Activity
    }
  }
  
  // Fallback to guessing based on data
  if (transaction.method) return FileText
  if (transaction.tokenSymbol && transaction.tokenAmount) return Coins
  if (transaction.value) return Send
  return Activity
}

// Transaction type color
const getTransactionTypeColor = (transaction: Transaction) => {
  if (transaction.type) {
    switch (transaction.type) {
      case 'transfer':
        return 'text-blue-500'
      case 'swap':
        return 'text-purple-500'
      case 'mint':
        return 'text-green-500'
      case 'burn':
        return 'text-red-500'
      case 'approve':
        return 'text-yellow-500'
      case 'contract':
        return 'text-gray-500'
      default:
        return 'text-muted-foreground'
    }
  }
  return 'text-muted-foreground'
}

export function TransactionRow({ 
  transaction, 
  onClick,
  showStatus = true,
  compact = false
}: TransactionRowProps) {
  const Icon = getTransactionIcon(transaction)
  const chainMetadata = getChainMetadata(transaction.chainId)
  const explorerUrl = getExplorerUrl(transaction.chainId)
  
  if (compact) {
    // Compact view for list mode
    return (
      <div
        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "p-1.5 rounded-full bg-muted",
            getTransactionTypeColor(transaction)
          )}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {transaction.description || transaction.method || 'Transaction'}
              </span>
              {showStatus && (
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", 
                    transaction.status === 'confirmed' && 'bg-green-500/10 text-green-500',
                    transaction.status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
                    transaction.status === 'failed' && 'bg-red-500/10 text-red-500'
                  )}
                >
                  {transaction.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTimeAgo(transaction.timestamp)}</span>
              <span>•</span>
              <span>{formatTxHash(transaction.hash)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(transaction.value || transaction.tokenAmount) && (
            <span className="text-sm font-medium">
              {transaction.value || transaction.tokenAmount} {transaction.tokenSymbol || 'ETH'}
            </span>
          )}
          {explorerUrl && (
            <ExternalLink 
              className="h-3.5 w-3.5 text-muted-foreground" 
              onClick={(e) => {
                e.stopPropagation()
                window.open(`${explorerUrl}/tx/${transaction.hash}`, '_blank')
              }}
            />
          )}
        </div>
      </div>
    )
  }
  
  // Full view for sheet mode
  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full bg-muted",
          getTransactionTypeColor(transaction)
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {transaction.description || transaction.method || 'Transaction'}
            </p>
            {showStatus && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs", 
                  transaction.status === 'confirmed' && 'bg-green-500/10 text-green-500',
                  transaction.status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
                  transaction.status === 'failed' && 'bg-red-500/10 text-red-500'
                )}
              >
                {transaction.status}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTimeAgo(transaction.timestamp)}</span>
            <span>•</span>
            <span>{chainMetadata?.name || `Chain ${transaction.chainId}`}</span>
            {transaction.contractName && (
              <>
                <span>•</span>
                <span>{transaction.contractName}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {(transaction.value || transaction.tokenAmount) && (
          <div className="text-right">
            <p className="font-medium text-sm">
              {transaction.value || transaction.tokenAmount} {transaction.tokenSymbol || 'ETH'}
            </p>
            {transaction.gasUsed && transaction.gasPrice && (
              <p className="text-xs text-muted-foreground">
                <Fuel className="inline h-3 w-3 mr-1" />
                {formatBalance(
                  (BigInt(transaction.gasUsed) * BigInt(transaction.gasPrice)).toString(),
                  18,
                  4
                )} ETH
              </p>
            )}
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}