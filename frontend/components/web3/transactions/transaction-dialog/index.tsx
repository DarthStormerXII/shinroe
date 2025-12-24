'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccount, usePublicClient, useWalletClient, useGasPrice, useSwitchChain } from '@/lib/web3'
import { formatEther, formatGwei, encodeFunctionData } from 'viem'
import type { TransactionReceipt } from 'viem'
import { 
  simulateContractCall, 
  writeContract, 
  estimateGas,
  type ContractCallParams,
  type SimulationResult 
} from '@/lib/web3/contracts'
import { isTenderlySupported } from '@/lib/web3/tenderly'
import { 
  simulateETHTransfer, 
  transferETH, 
  estimateETHTransferGas 
} from '@/lib/web3/eth-transfer'
import { generateTransactionSummary } from '@/lib/ai/gemini'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/config/chains'
import { useTranslation } from '@/lib/i18n'
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Fuel, 
  DollarSign,
  Loader2,
  FileText,
  TrendingUp,
  Hash
} from 'lucide-react'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  params: ContractCallParams
  chainId: number
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: Error) => void
}

// Helper to serialize BigInt values
function stringifyWithBigInt(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'bigint') {
      return value.toString() + 'n'
    }
    return value
  }, 2)
}

export function TransactionDialog({
  open,
  onOpenChange,
  params,
  chainId: targetChainId,
  onSuccess,
  onError
}: TransactionDialogProps) {
  const { address, chain } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const { gasPrice } = useGasPrice()
  const { switchChain } = useSwitchChain()
  const { t } = useTranslation()
  
  const [activeTab, setActiveTab] = useState('summary')
  const [simulating, setSimulating] = useState(false)
  const [estimatingGas, setEstimatingGas] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [switchingChain, setSwitchingChain] = useState(false)
  
  const [simulation, setSimulation] = useState<SimulationResult | undefined>(undefined)
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  // Use ref to track if we've already loaded data for this dialog session
  const hasLoadedRef = useRef(false)
  
  const currentChainId = chain?.id
  const explorerUrl = targetChainId ? getExplorerUrl(targetChainId) : null
  const isOnCorrectChain = currentChainId === targetChainId
  
  // Check if this is an ETH transfer
  const isETHTransfer = params?.abi?.length === 0 && params?.functionName === 'transfer' && params?.value
  
  // Get encoded function data
  const getEncodedData = () => {
    if (isETHTransfer || !params?.abi || !params?.functionName) {
      return undefined
    }
    try {
      return encodeFunctionData({
        abi: params.abi,
        functionName: params.functionName,
        args: params.args || []
      })
    } catch (error) {
      console.error('Failed to encode function data:', error)
      return '0x' // Return empty data on error
    }
  }
  
  const estimateGasUsage = useCallback(async (simulationResult?: SimulationResult) => {
    if (!address || !publicClient || !chain || !params) return
    
    setEstimatingGas(true)
    try {
      let gas
      
      if (isETHTransfer) {
        // Handle ETH transfer gas estimation with simulation result
        gas = await estimateETHTransferGas(
          publicClient,
          address,
          {
            to: params.address,
            value: params.value!
          },
          simulationResult
        )
      } else {
        // Handle contract call gas estimation with simulation result
        gas = await estimateGas(publicClient, address, params, chain, simulationResult)
      }
      
      setGasEstimate(gas)
      
      // Calculate estimated cost
      if (gasPrice && gas) {
        const costInWei = gas * gasPrice
        const costInEth = formatEther(costInWei)
        setEstimatedCost(costInEth)
      }
    } catch (error) {
      console.error('Gas estimation failed:', error)
    } finally {
      setEstimatingGas(false)
    }
  }, [address, publicClient, chain, params, isETHTransfer, gasPrice])
  
  const generateAISummary = useCallback(async () => {
    if (!chain || !params) return
    
    setGeneratingAI(true)
    try {
      const summary = await generateTransactionSummary({
        functionName: isETHTransfer ? 'ETH Transfer' : params.functionName,
        contractAddress: params.address,
        args: isETHTransfer ? [] : (params.args as any[]),
        value: params.value ? formatEther(params.value) : undefined,
        gasEstimate: gasEstimate ? gasEstimate.toString() : undefined,
        estimatedCost: estimatedCost || undefined,
        chainName: chain.name
      })
      setAiSummary(summary)
    } catch (error) {
      console.error('AI summary generation failed:', error)
      setAiSummary('AI summary unavailable')
    } finally {
      setGeneratingAI(false)
    }
  }, [chain, params, isETHTransfer, gasEstimate, estimatedCost])
  
  const loadTransactionData = useCallback(async () => {
    if (!address || !publicClient || !chain || !isOnCorrectChain || !params) {
      setIsLoadingData(false)
      return
    }
    
    try {
      // First run simulation
      setSimulating(true)
      let simulationResult: SimulationResult | null = null
      
      try {
        if (isETHTransfer) {
          // Handle ETH transfer simulation
          simulationResult = await simulateETHTransfer(
            publicClient,
            address,
            {
              to: params.address,
              value: params.value!
            },
            targetChainId
          ) as SimulationResult
        } else {
          // Handle contract call simulation
          simulationResult = await simulateContractCall(
            publicClient,
            address,
            params,
            chain
          )
        }
        
        setSimulation(simulationResult)
      } catch (error) {
        console.error('Simulation failed:', error)
        simulationResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Simulation failed'
        }
        setSimulation(simulationResult)
      } finally {
        setSimulating(false)
      }
      
      // Then run gas estimation and AI summary in parallel, passing the simulation result
      await Promise.allSettled([
        estimateGasUsage(simulationResult),
        generateAISummary()
      ])
    } finally {
      setIsLoadingData(false)
    }
  }, [address, publicClient, chain, isOnCorrectChain, params, isETHTransfer, targetChainId, estimateGasUsage, generateAISummary])
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      if (!hasLoadedRef.current) {
        setActiveTab('summary')
        setSimulation(undefined)
        setGasEstimate(null)
        setAiSummary(null)
        setEstimatedCost(null)
        setSimulating(false)
        setEstimatingGas(false)
        setGeneratingAI(false)
        setSwitchingChain(false)
        
        // Only load data if on correct chain
        if (isOnCorrectChain && !isLoadingData) {
          setIsLoadingData(true)
          hasLoadedRef.current = true
          loadTransactionData()
        }
      }
    } else {
      // Reset when dialog closes
      hasLoadedRef.current = false
      setIsLoadingData(false)
    }
  }, [open, isOnCorrectChain, isLoadingData, loadTransactionData])
  
  const handleChainSwitch = async () => {
    if (!switchChain) return
    
    setSwitchingChain(true)
    try {
      await switchChain(targetChainId)
      // Data will be loaded via useEffect when chain changes
    } catch (error) {
      console.error('Failed to switch chain:', error)
      toast.error(t('transaction.switchChainFailed'))
    } finally {
      setSwitchingChain(false)
    }
  }
  
  const executeTransaction = async () => {
    if (!publicClient || !walletClient || !address || !chain || !isOnCorrectChain) return

    // IMPORTANT: Close the dialog BEFORE executing the transaction
    // This is necessary because WEPIN (and some other wallet providers) open their own
    // confirmation popup/widget, and our dialog's overlay would block user interaction with it
    onOpenChange(false)

    // Show loading toast
    const toastId = toast.loading(t('transaction.waitingConfirmation'))

    try {
      let result

      if (isETHTransfer) {
        // Handle ETH transfer with simulation result
        result = await transferETH(
          publicClient,
          walletClient,
          address,
          {
            to: params.address,
            value: params.value!
          },
          simulation
        )
      } else {
        // Handle contract call with simulation result
        result = await writeContract(
          publicClient,
          walletClient,
          address,
          params,
          chain,
          simulation
        )
      }

      // Success
      toast.dismiss(toastId)
      onSuccess?.(result.receipt)

      toast.success(t('transaction.success'), {
        description: `Transaction: ${result.hash.slice(0, 10)}...`,
        action: explorerUrl ? {
          label: t('transaction.view'),
          onClick: () => window.open(`${explorerUrl}/tx/${result.hash}`, '_blank')
        } : undefined
      })
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.dismiss(toastId)

      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
      toast.error(t('transaction.failed'), {
        description: err.message || t('transaction.errorOccurred')
      })
    }
  }
  
  // Early return if params is not provided
  if (!params) {
    return null
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Preview
          </DialogTitle>
          <DialogDescription>
            Review all transaction details before confirming
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="simulation">Tenderly</TabsTrigger>
            <TabsTrigger value="gas">Gas & Cost</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {/* Chain Switch Card - Show when on wrong chain */}
            {!isOnCorrectChain && (
              <Card className="border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    Wrong Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    This transaction requires you to be on {chain?.name || 'the correct network'}. 
                    Please switch to continue.
                  </p>
                  <Button 
                    onClick={handleChainSwitch} 
                    disabled={switchingChain}
                    className="w-full"
                  >
                    {switchingChain ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Switching Network...
                      </>
                    ) : (
                      `Switch to ${chain?.name || 'Required Network'}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image 
                    src="/google.svg" 
                    alt="Google" 
                    width={16} 
                    height={16} 
                    className="w-4 h-4"
                  />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatingAI ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-2">
                    <p className="text-sm">{aiSummary}</p>
                  
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">AI summary unavailable</p>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tx Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{isETHTransfer ? 'Transaction Type' : 'Function'}</span>
                  <Badge variant="outline">{isETHTransfer ? 'ETH Transfer' : params.functionName}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{isETHTransfer ? 'Recipient' : 'Contract'}</span>
                  <code className="text-xs">{params.address.slice(0, 10)}...{params.address.slice(-8)}</code>
                </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Value</span>
                    <span className="text-sm font-medium">{formatEther(params.value||BigInt("0"))} ETH</span>
                  </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm">{chain?.name || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Simulation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Image 
                    src="/tenderly.svg" 
                    alt="Tenderly" 
                    width={16} 
                    height={16} 
                    className="w-4 h-4"
                  />
                  Tenderly Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Check if Tenderly is supported for this chain */}
                {!isTenderlySupported(targetChainId) ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Tenderly simulation not supported for this network</span>
                  </div>
                ) : simulating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Running simulation...</span>
                  </div>
                ) : simulation ? (
                  <div className="flex items-center gap-2">
                    {simulation.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Simulation failed: {simulation.error}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No simulation data</span>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-4">
            {/* Check if Tenderly is supported for this chain */}
            {!isTenderlySupported(targetChainId) ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <p className="text-sm text-orange-600">Tenderly simulation is not supported for this network</p>
                    <p className="text-xs text-muted-foreground">Standard transaction simulation was used instead</p>
                  </div>
                </CardContent>
              </Card>
            ) : simulation ? (
              <>
                {/* Tenderly Simulation Results */}
                {simulation.stateChanges && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        State Changes ({simulation.stateChanges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
                        {stringifyWithBigInt(simulation.stateChanges)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
                
                {simulation.assetChanges && simulation.assetChanges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Asset Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
                        {stringifyWithBigInt(simulation.assetChanges)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
                
                {simulation.logs && simulation.logs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Event Logs ({simulation.logs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
                        {stringifyWithBigInt(simulation.logs)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
                
                {/* Raw Simulation Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                    Full Simulation Data
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <pre className="text-xs overflow-x-auto max-h-60 overflow-y-auto bg-muted p-2 rounded">
                    {stringifyWithBigInt(simulation)}
                  </pre>
                </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  {simulating ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Running simulation...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No simulation data available</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Gas & Cost Tab */}
          <TabsContent value="gas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Gas Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current Gas Price */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Gas Price</span>
                  {gasPrice ? (
                    <span className="text-sm font-mono">{formatGwei(gasPrice)} gwei</span>
                  ) : (
                    <Skeleton className="h-4 w-20" />
                  )}
                </div>
                
                {/* Estimated Gas */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Gas</span>
                  {estimatingGas ? (
                    <Skeleton className="h-4 w-24" />
                  ) : gasEstimate ? (
                    <span className="text-sm font-mono">{gasEstimate.toString()}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
                
                {/* Tenderly Gas Used */}
                {simulation?.gasUsed && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tenderly Gas Estimate</span>
                    <span className="text-sm font-mono">{simulation.gasUsed}</span>
                  </div>
                )}
                
                {/* Estimated Cost */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Transaction Cost</span>
                    {estimatedCost ? (
                      <div className="text-right">
                        <p className="text-sm font-medium">{estimatedCost} ETH</p>
                        <p className="text-xs text-muted-foreground">
                          + {params.value ? formatEther(params.value) : '0'} ETH value
                        </p>
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-24" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Cost Breakdown */}
            {estimatedCost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Total Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gas Fee</span>
                      <span>{estimatedCost} ETH</span>
                    </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction Value</span>
                        <span>{formatEther(params.value||BigInt("0"))} ETH</span>
                      </div>
                    <div className="pt-2 border-t flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">
                        {formatEther(
                          (gasEstimate && gasPrice ? gasEstimate * gasPrice : 0n) + 
                          (params.value || 0n)
                        )} ETH
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">{isETHTransfer ? 'Recipient Address' : 'Contract Address'}</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {params.address}
                    </code>
                  </div>
                  {!isETHTransfer && (
                    <div>
                      <p className="text-sm font-medium mb-1">Function</p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        {params.functionName}
                      </code>
                    </div>
                  )}
                  {params.args && params.args.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Arguments</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {stringifyWithBigInt(params.args)}
                      </pre>
                    </div>
                  )}
                  {params.value && params.value > 0n && (
                    <div>
                      <p className="text-sm font-medium mb-1">Value</p>
                      <code className="text-xs bg-muted p-2 rounded block">
                        {params.value.toString()} wei ({formatEther(params.value)} ETH)
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Transaction Request Data */}
            <details className="rounded-lg bg-muted p-4">
              <summary className="text-sm font-medium cursor-pointer">
                Transaction Request Data
              </summary>
              <pre className="text-xs overflow-x-auto mt-2">
                {stringifyWithBigInt({
                  to: params.address,
                  data: getEncodedData(),
                  value: params.value ? params.value.toString() : '0',
                  ...(gasEstimate && gasPrice ? {
                    gas: gasEstimate.toString(),
                    gasPrice: gasPrice.toString(),
                    maxFeePerGas: gasPrice.toString(),
                    maxPriorityFeePerGas: '1000000000' // 1 gwei
                  } : {}),
                  chainId: targetChainId,
                  from: address,
                  type: '0x2' // EIP-1559 transaction
                })}
              </pre>
            </details>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={executeTransaction}
            disabled={
              (!simulation?.success && isTenderlySupported(targetChainId)) || // Allow execution for chains without Tenderly support
              !address ||
              !walletClient ||
              !isOnCorrectChain
            }
          >
            Execute Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}