'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getChainMetadata } from '@/lib/web3/assets'
import type { Transaction } from '@/lib/types/web3/web3'

interface TransactionFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  chainFilter: string
  onChainChange: (value: string) => void
  transactions: Transaction[]
  enableSearch?: boolean
  enableFilters?: boolean
}

export function TransactionFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  chainFilter,
  onChainChange,
  transactions,
  enableSearch = true,
  enableFilters = true
}: TransactionFiltersProps) {
  // Get unique chains from transactions
  const uniqueChains = Array.from(new Set(transactions.map(tx => tx.chainId)))
  
  // Get unique types from transactions
  const uniqueTypes = Array.from(new Set(
    transactions
      .map(tx => tx.type)
      .filter(type => type !== undefined)
  )) as string[]
  
  return (
    <div className="space-y-3">
      {enableSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hash, description, or method..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      
      {enableFilters && (
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          {uniqueTypes.length > 0 && (
            <Select value={typeFilter} onValueChange={onTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.includes('transfer') && <SelectItem value="transfer">Transfer</SelectItem>}
                {uniqueTypes.includes('swap') && <SelectItem value="swap">Swap</SelectItem>}
                {uniqueTypes.includes('mint') && <SelectItem value="mint">Mint</SelectItem>}
                {uniqueTypes.includes('burn') && <SelectItem value="burn">Burn</SelectItem>}
                {uniqueTypes.includes('approve') && <SelectItem value="approve">Approve</SelectItem>}
                {uniqueTypes.includes('contract') && <SelectItem value="contract">Contract Call</SelectItem>}
              </SelectContent>
            </Select>
          )}
          
          {uniqueChains.length > 1 && (
            <Select value={chainFilter} onValueChange={onChainChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {uniqueChains.map(chainId => {
                  const metadata = getChainMetadata(chainId)
                  return (
                    <SelectItem key={chainId} value={chainId.toString()}>
                      {metadata?.name || `Chain ${chainId}`}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  )
}