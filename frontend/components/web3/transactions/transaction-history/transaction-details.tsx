'use client'

import { Button } from '@/components/ui/button'
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
  ExternalLink,
  Copy,
  Fuel
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAddress, formatBalance } from '@/lib/web3/format'
import { getExplorerUrl } from '@/lib/config/chains'
import { getChainMetadata } from '@/lib/web3/assets'
import type { Transaction } from '@/lib/types/web3/web3'
import { toast } from 'sonner'

interface TransactionDetailsProps {
  transaction: Transaction
}

// Transaction type icon (same as row)
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

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const Icon = getTransactionIcon(transaction)
  const chainMetadata = getChainMetadata(transaction.chainId)
  const explorerUrl = getExplorerUrl(transaction.chainId)
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-3 rounded-full bg-muted",
          getTransactionTypeColor(transaction)
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            {transaction.description || transaction.method || 'Transaction'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatTimestamp(transaction.timestamp)} on {chainMetadata?.name}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge className={cn(
            transaction.status === 'confirmed' && 'bg-green-500/10 text-green-500',
            transaction.status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
            transaction.status === 'failed' && 'bg-red-500/10 text-red-500'
          )}>
            {transaction.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">Transaction Hash</span>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono">
              {formatAddress(transaction.hash, true, 6)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(transaction.hash)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            {explorerUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => window.open(`${explorerUrl}/tx/${transaction.hash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground">From</span>
          <code className="text-xs font-mono">
            {formatAddress(transaction.from, true, 6)}
          </code>
        </div>
        
        {transaction.to && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">To</span>
            <code className="text-xs font-mono">
              {formatAddress(transaction.to, true, 6)}
            </code>
          </div>
        )}
        
        {transaction.value && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="font-medium">
              {transaction.value} {transaction.tokenSymbol || 'ETH'}
            </span>
          </div>
        )}
        
        {transaction.tokenAmount && !transaction.value && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Token Amount</span>
            <span className="font-medium">
              {transaction.tokenAmount} {transaction.tokenSymbol}
            </span>
          </div>
        )}
        
        {transaction.method && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Method</span>
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {transaction.method}
            </code>
          </div>
        )}
        
        {transaction.contractName && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Contract</span>
            <span className="text-sm">{transaction.contractName}</span>
          </div>
        )}
        
        {transaction.gasUsed && transaction.gasPrice && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Gas Fee</span>
            <div className="text-right">
              <span className="font-medium">
                {formatBalance(
                  (BigInt(transaction.gasUsed) * BigInt(transaction.gasPrice)).toString(),
                  18,
                  6
                )} ETH
              </span>
              <p className="text-xs text-muted-foreground">
                {parseInt(transaction.gasUsed).toLocaleString()} gas @ {parseInt(transaction.gasPrice) / 1e9} gwei
              </p>
            </div>
          </div>
        )}
        
        {transaction.nonce !== undefined && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Nonce</span>
            <span className="font-mono text-sm">{transaction.nonce}</span>
          </div>
        )}
        
        {transaction.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{transaction.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}