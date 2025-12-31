'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, usePublicClient } from '@/lib/web3'
import { formatEther, parseEther, parseUnits, type AbiFunction, type Abi } from 'viem'
import { getContractByName, type Contract } from '@/constants/contracts'
import { getChainById } from '@/lib/config/chains'
import { TransactionDialog } from '@/components/web3/transactions/transaction-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  FileCode2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  BookOpen,
  Edit3,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'

interface FunctionResult {
  functionName: string
  result: unknown
  error?: string
  loading: boolean
}

export default function ContractDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params)
  const router = useRouter()
  const { publicClient } = usePublicClient()
  const { address, isConnected, chainId } = useAccount()

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Transaction dialog state
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txParams, setTxParams] = useState<{
    address: `0x${string}`
    abi: Abi
    functionName: string
    args: unknown[]
    value?: bigint
  } | null>(null)

  // Function inputs state
  const [functionInputs, setFunctionInputs] = useState<Record<string, Record<string, string>>>({})
  const [functionResults, setFunctionResults] = useState<Record<string, FunctionResult>>({})
  const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({})


  const chainConfig = chainId ? getChainById(chainId) : undefined

  useEffect(() => {
    async function loadContract() {
      if (!chainId) {
        setContract(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const loadedContract = await getContractByName(chainId, name)
        setContract(loadedContract)

        // Initialize expanded state for all functions
        if (loadedContract) {
          const initialExpanded: Record<string, boolean> = {}
          loadedContract.abi.forEach((item) => {
            if (item.type === 'function') {
              initialExpanded[item.name] = false
            }
          })
          setExpandedFunctions(initialExpanded)
        }
      } catch (error) {
        console.error('Failed to load contract:', error)
        setContract(null)
      } finally {
        setLoading(false)
      }
    }

    loadContract()
  }, [chainId, name])

  const copyAddress = async () => {
    if (!contract) return
    await navigator.clipboard.writeText(contract.address)
    setCopied(true)
    toast.success('Address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFunction = (fnName: string) => {
    setExpandedFunctions((prev) => ({
      ...prev,
      [fnName]: !prev[fnName],
    }))
  }

  const getReadFunctions = (): AbiFunction[] => {
    if (!contract) return []
    return contract.abi.filter(
      (item): item is AbiFunction =>
        item.type === 'function' &&
        (item.stateMutability === 'view' || item.stateMutability === 'pure')
    )
  }

  const getWriteFunctions = (): AbiFunction[] => {
    if (!contract) return []
    return contract.abi.filter(
      (item): item is AbiFunction =>
        item.type === 'function' &&
        item.stateMutability !== 'view' &&
        item.stateMutability !== 'pure'
    )
  }

  const handleInputChange = (fnName: string, inputName: string, value: string) => {
    setFunctionInputs((prev) => ({
      ...prev,
      [fnName]: {
        ...prev[fnName],
        [inputName]: value,
      },
    }))
  }

  const parseArgValue = (value: string, type: string): unknown => {
    if (!value || value.trim() === '') return undefined

    // Handle arrays
    if (type.endsWith('[]')) {
      try {
        return JSON.parse(value)
      } catch {
        return value.split(',').map((v) => v.trim())
      }
    }

    // Handle different types
    if (type.startsWith('uint') || type.startsWith('int')) {
      return BigInt(value)
    }
    if (type === 'bool') {
      return value.toLowerCase() === 'true'
    }
    if (type.startsWith('bytes')) {
      return value.startsWith('0x') ? value : `0x${value}`
    }
    if (type === 'address') {
      return value as `0x${string}`
    }

    return value
  }

  const multiplyByPower = (fnName: string, inputName: string, power: number) => {
    const currentValue = functionInputs[fnName]?.[inputName] || '0'
    const numValue = parseFloat(currentValue) || 0
    const multiplied = BigInt(Math.floor(numValue)) * BigInt(10 ** power)
    handleInputChange(fnName, inputName, multiplied.toString())
  }

  const renderMultiplierButtons = (fnName: string, inputName: string) => (
    <div className="flex gap-1 mt-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 text-xs px-2"
        onClick={() => multiplyByPower(fnName, inputName, 8)}
      >
        ×10⁸
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 text-xs px-2"
        onClick={() => multiplyByPower(fnName, inputName, 12)}
      >
        ×10¹²
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 text-xs px-2"
        onClick={() => multiplyByPower(fnName, inputName, 18)}
      >
        ×10¹⁸
      </Button>
    </div>
  )

  const isUintType = (type: string): boolean => {
    return type.startsWith('uint') || type.startsWith('int')
  }

  const formatResult = (result: unknown): string => {
    if (result === undefined || result === null) return 'null'
    if (typeof result === 'bigint') return result.toString()
    if (typeof result === 'object') {
      return JSON.stringify(
        result,
        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    }
    return String(result)
  }

  const executeRead = async (fn: AbiFunction) => {
    if (!publicClient || !contract) return

    const fnName = fn.name
    setFunctionResults((prev) => ({
      ...prev,
      [fnName]: { functionName: fnName, result: null, loading: true },
    }))

    try {
      const inputs = functionInputs[fnName] || {}
      const args = fn.inputs.map((input) => {
        const value = inputs[input.name || ''] || ''
        return parseArgValue(value, input.type)
      })

      const result = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: fnName,
        args: args.filter((arg) => arg !== undefined),
      })

      setFunctionResults((prev) => ({
        ...prev,
        [fnName]: { functionName: fnName, result, loading: false },
      }))
    } catch (error) {
      console.error(`Read error for ${fnName}:`, error)
      setFunctionResults((prev) => ({
        ...prev,
        [fnName]: {
          functionName: fnName,
          result: null,
          error: error instanceof Error ? error.message : 'Read failed',
          loading: false,
        },
      }))
    }
  }

  const openWriteDialog = (fn: AbiFunction) => {
    if (!contract) return

    const inputs = functionInputs[fn.name] || {}
    const args = fn.inputs.map((input) => {
      const value = inputs[input.name || ''] || ''
      return parseArgValue(value, input.type)
    })

    // Check for payable functions - look for value input
    let value: bigint | undefined
    if (fn.stateMutability === 'payable') {
      const valueInput = inputs['_value'] || inputs['value'] || ''
      if (valueInput) {
        try {
          value = parseEther(valueInput)
        } catch {
          value = BigInt(valueInput)
        }
      }
    }

    setTxParams({
      address: contract.address,
      abi: contract.abi,
      functionName: fn.name,
      args: args.filter((arg) => arg !== undefined),
      value,
    })
    setTxDialogOpen(true)
  }

  const renderFunctionCard = (fn: AbiFunction, isWrite: boolean) => {
    const fnName = fn.name
    const isExpanded = expandedFunctions[fnName]
    const result = functionResults[fnName]
    const hasInputs = fn.inputs.length > 0 || (isWrite && fn.stateMutability === 'payable')

    return (
      <Card key={fnName} className="transition-all duration-200">
        <CardHeader
          className="cursor-pointer py-4"
          onClick={() => toggleFunction(fnName)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base font-mono">{fnName}</CardTitle>
              <div className="flex gap-1">
                {fn.stateMutability === 'payable' && (
                  <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                    payable
                  </Badge>
                )}
                {fn.inputs.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {fn.inputs.length} input{fn.inputs.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {fn.outputs && fn.outputs.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    → {fn.outputs.map((o) => o.type).join(', ')}
                  </Badge>
                )}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* Inputs */}
            {hasInputs && (
              <div className="space-y-3">
                {fn.inputs.map((input, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <Label className="text-sm">
                      {input.name || `arg${idx}`}
                      <span className="text-muted-foreground ml-2 font-mono text-xs">
                        ({input.type})
                      </span>
                    </Label>
                    <Input
                      placeholder={`Enter ${input.type}...`}
                      value={functionInputs[fnName]?.[input.name || ''] || ''}
                      onChange={(e) =>
                        handleInputChange(fnName, input.name || '', e.target.value)
                      }
                    />
                    {isUintType(input.type) && renderMultiplierButtons(fnName, input.name || '')}
                  </div>
                ))}
                {/* Value input for payable functions */}
                {isWrite && fn.stateMutability === 'payable' && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">
                      Value (ETH)
                      <span className="text-muted-foreground ml-2 font-mono text-xs">
                        (payable amount)
                      </span>
                    </Label>
                    <Input
                      placeholder="0.0"
                      value={functionInputs[fnName]?.['_value'] || ''}
                      onChange={(e) => handleInputChange(fnName, '_value', e.target.value)}
                    />
                    {renderMultiplierButtons(fnName, '_value')}
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => (isWrite ? openWriteDialog(fn) : executeRead(fn))}
              disabled={result?.loading}
              variant={isWrite ? 'default' : 'secondary'}
              className="w-full"
            >
              {result?.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isWrite ? 'Preparing...' : 'Reading...'}
                </>
              ) : isWrite ? (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Write
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read
                </>
              )}
            </Button>

            {/* Result Display (for read functions) */}
            {!isWrite && result && !result.loading && (
              <div className="space-y-2">
                {result.error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      <p className="text-sm">{result.error}</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Result</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 text-sm bg-muted p-2 rounded overflow-x-auto max-h-40">
                        {formatResult(result.result)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileCode2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to interact with contracts
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (!contract) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push('/contracts')} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>

          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Contract Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The contract &quot;{name}&quot; is not configured for {chainConfig?.name || 'this chain'}.
            </p>
            <Button onClick={() => router.push('/contracts')}>View All Contracts</Button>
          </div>
        </div>
      </main>
    )
  }

  const readFunctions = getReadFunctions()
  const writeFunctions = getWriteFunctions()

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/contracts')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>

        {/* Contract Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <FileCode2 className="h-6 w-6" />
                  {contract.name}
                </CardTitle>
                {contract.description && (
                  <CardDescription className="mt-2">{contract.description}</CardDescription>
                )}
              </div>
              {chainConfig && (
                <Badge variant="secondary" className="w-fit flex items-center gap-1">
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
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded flex-1 overflow-x-auto">
                {contract.address}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {chainConfig?.explorerUrl && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`${chainConfig.explorerUrl}/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <Badge variant="outline">
                {readFunctions.length} read function{readFunctions.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                {writeFunctions.length} write function{writeFunctions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Function Tabs */}
        <Tabs defaultValue="read" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Read ({readFunctions.length})
            </TabsTrigger>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Write ({writeFunctions.length})
            </TabsTrigger>
          </TabsList>

          {/* Read Functions */}
          <TabsContent value="read" className="space-y-4">
            {readFunctions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No read functions available</p>
                </CardContent>
              </Card>
            ) : (
              readFunctions.map((fn) => renderFunctionCard(fn, false))
            )}
          </TabsContent>

          {/* Write Functions */}
          <TabsContent value="write" className="space-y-4">
            {writeFunctions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No write functions available</p>
                </CardContent>
              </Card>
            ) : (
              writeFunctions.map((fn) => renderFunctionCard(fn, true))
            )}
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        {txParams && chainId && (
          <TransactionDialog
            open={txDialogOpen}
            onOpenChange={setTxDialogOpen}
            params={txParams}
            chainId={chainId}
            onSuccess={(receipt) => {
              toast.success('Transaction successful!', {
                description: `Hash: ${receipt.transactionHash.slice(0, 10)}...`,
                action: {
                  label: 'View',
                  onClick: () =>
                    window.open(
                      `${chainConfig?.explorerUrl}/tx/${receipt.transactionHash}`,
                      '_blank'
                    ),
                },
              })
            }}
            onError={(error) => {
              toast.error('Transaction failed', {
                description: error.message,
              })
            }}
          />
        )}
      </div>
    </main>
  )
}
