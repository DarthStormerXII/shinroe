'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/lib/web3'
import { getContractsForChain, type Contract } from '@/constants/contracts'
import { getChainById } from '@/lib/config/chains'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileCode2, ExternalLink, ChevronRight, AlertCircle } from 'lucide-react'

export default function ContractsPage() {
  const router = useRouter()
  const { isConnected, chainId } = useAccount()

  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const chainConfig = chainId ? getChainById(chainId) : undefined

  useEffect(() => {
    async function loadContracts() {
      if (!chainId) {
        setContracts([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const loadedContracts = await getContractsForChain(chainId)
        setContracts(loadedContracts)
      } catch (error) {
        console.error('Failed to load contracts:', error)
        setContracts([])
      } finally {
        setLoading(false)
      }
    }

    loadContracts()
  }, [chainId])

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const countFunctions = (contract: Contract) => {
    const readFns = contract.abi.filter(
      (item) => item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
    ).length
    const writeFns = contract.abi.filter(
      (item) => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
    ).length
    return { read: readFns, write: writeFns }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileCode2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Please connect your wallet to view and interact with contracts</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Contracts</h1>
          <p className="text-lg text-muted-foreground">
            Test and interact with smart contracts on {chainConfig?.name || 'the connected network'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5" />
                  Available Contracts
                </CardTitle>
                <CardDescription>
                  {loading
                    ? 'Loading contracts...'
                    : contracts.length > 0
                    ? `${contracts.length} contract${contracts.length > 1 ? 's' : ''} configured for this chain`
                    : 'No contracts configured for this chain'}
                </CardDescription>
              </div>
              {chainConfig && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <img
                    src={chainConfig.iconUrl}
                    alt={chainConfig.name}
                    className="w-4 h-4 rounded-full"
                  />
                  {chainConfig.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Contracts Available</h3>
                <p className="text-muted-foreground mb-4">
                  No contracts are configured for {chainConfig?.name || 'this chain'}.
                </p>
                <p className="text-sm text-muted-foreground">
                  Add contracts to{' '}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    constants/contracts/{chainId}/
                  </code>
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Functions</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => {
                    const { read, write } = countFunctions(contract)
                    return (
                      <TableRow
                        key={contract.name}
                        className="cursor-pointer"
                        onClick={() => router.push(`/contracts/${contract.name}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{contract.name}</p>
                            {contract.description && (
                              <p className="text-sm text-muted-foreground">{contract.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">{truncateAddress(contract.address)}</code>
                            {chainConfig?.explorerUrl && (
                              <a
                                href={`${chainConfig.explorerUrl}/address/${contract.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {read} read
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {write} write
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
