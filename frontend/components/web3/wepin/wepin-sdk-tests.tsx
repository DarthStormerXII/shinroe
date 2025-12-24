'use client'

import { useState, useCallback } from 'react'
import {
  useAccount,
  useSignMessage,
  useSignTypedData,
  useSendTransaction,
  useSwitchChain,
  useChains,
  useWepinWidget,
  useWepinStatus,
  useWepinWidgetControl,
  useWepinAccounts,
  useWepinNFTs,
  useWepinUser,
  type WepinAccount,
} from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  Check,
  X,
  Copy,
  ExternalLink,
  Wallet,
  Send,
  FileSignature,
  Link2,
  LayoutGrid,
  User,
  RefreshCw,
} from 'lucide-react'
import { parseEther } from 'viem'
import { useTranslation } from '@/lib/i18n'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: unknown
}

export function WepinSdkTests() {
  const { t } = useTranslation()
  const { address, isConnected, chainId } = useAccount()
  const { signMessage, isPending: isSigningMessage } = useSignMessage()
  const { signTypedData, isPending: isSigningTypedData } = useSignTypedData()
  const { sendTransaction, isPending: isSendingTx } = useSendTransaction()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const { chains } = useChains()

  // Widget SDK hooks
  const { isWidgetInitialized } = useWepinWidget()
  const { status, refresh: refreshStatus } = useWepinStatus()
  const { open: openWidget, close: closeWidget, isOpen, isPending: isOpeningWidget } = useWepinWidgetControl()
  const { accounts, fetch: fetchAccounts, isLoading: isLoadingAccounts } = useWepinAccounts()
  const { nfts, fetch: fetchNFTs, isLoading: isLoadingNFTs } = useWepinNFTs()
  const { user, fetchUser, isLoading: isLoadingUser } = useWepinUser()

  const [results, setResults] = useState<TestResult[]>([])
  const [messageToSign, setMessageToSign] = useState(() => t('demoPrefill.signMessage'))
  const [recipientAddress, setRecipientAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f1eB2a')
  const [sendAmount, setSendAmount] = useState('0.001')

  const addResult = useCallback((result: TestResult) => {
    setResults((prev) => [...prev, result])
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  // Test: Sign Message
  const testSignMessage = async () => {
    addResult({ name: 'Sign Message', status: 'pending' })
    try {
      const signature = await signMessage(messageToSign)
      addResult({
        name: 'Sign Message',
        status: 'success',
        message: `Signature: ${signature.slice(0, 20)}...`,
        data: signature,
      })
    } catch (err) {
      addResult({
        name: 'Sign Message',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Sign Typed Data (EIP-712)
  const testSignTypedData = async () => {
    addResult({ name: 'Sign Typed Data (EIP-712)', status: 'pending' })
    try {
      const typedData = {
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'WEPIN Test',
          version: '1',
          chainId: chainId || 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC' as `0x${string}`,
        },
        message: {
          from: { name: 'Alice', wallet: address || '0x0000000000000000000000000000000000000000' },
          to: { name: 'Bob', wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' },
          contents: 'Hello from WEPIN!',
        },
      }

      const signature = await signTypedData(JSON.stringify(typedData))
      addResult({
        name: 'Sign Typed Data (EIP-712)',
        status: 'success',
        message: `Signature: ${signature.slice(0, 20)}...`,
        data: signature,
      })
    } catch (err) {
      addResult({
        name: 'Sign Typed Data (EIP-712)',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Send Transaction
  const testSendTransaction = async () => {
    if (!recipientAddress) {
      addResult({ name: 'Send Transaction', status: 'error', message: 'Please enter recipient address' })
      return
    }
    addResult({ name: 'Send Transaction', status: 'pending' })
    try {
      const hash = await sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(sendAmount),
      })
      addResult({
        name: 'Send Transaction',
        status: 'success',
        message: `TX Hash: ${hash.slice(0, 20)}...`,
        data: hash,
      })
    } catch (err) {
      addResult({
        name: 'Send Transaction',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Switch Chain
  const testSwitchChain = async (targetChainId: number) => {
    addResult({ name: `Switch to Chain ${targetChainId}`, status: 'pending' })
    try {
      await switchChain(targetChainId)
      addResult({
        name: `Switch to Chain ${targetChainId}`,
        status: 'success',
        message: `Successfully switched to chain ${targetChainId}`,
      })
    } catch (err) {
      addResult({
        name: `Switch to Chain ${targetChainId}`,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Widget SDK Status
  const testWidgetStatus = () => {
    refreshStatus()
    addResult({
      name: 'Get Widget Status',
      status: 'success',
      message: `Status: ${status}`,
      data: { status, isWidgetInitialized },
    })
  }

  // Test: Open/Close Widget
  const testWidgetControl = async () => {
    if (isOpen) {
      closeWidget()
      addResult({ name: 'Close Widget', status: 'success', message: 'Widget closed' })
    } else {
      addResult({ name: 'Open Widget', status: 'pending' })
      try {
        await openWidget()
        addResult({ name: 'Open Widget', status: 'success', message: 'Widget opened' })
      } catch (err) {
        addResult({
          name: 'Open Widget',
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
  }

  // Test: Get Accounts
  const testGetAccounts = async () => {
    addResult({ name: 'Get WEPIN Accounts', status: 'pending' })
    try {
      const accts = await fetchAccounts()
      addResult({
        name: 'Get WEPIN Accounts',
        status: 'success',
        message: `Found ${accts.length} accounts`,
        data: accts,
      })
    } catch (err) {
      addResult({
        name: 'Get WEPIN Accounts',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Get NFTs
  const testGetNFTs = async () => {
    addResult({ name: 'Get WEPIN NFTs', status: 'pending' })
    try {
      const nftList = await fetchNFTs(true)
      addResult({
        name: 'Get WEPIN NFTs',
        status: 'success',
        message: `Found ${nftList.length} NFTs`,
        data: nftList,
      })
    } catch (err) {
      addResult({
        name: 'Get WEPIN NFTs',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  // Test: Get Current User
  const testGetUser = async () => {
    addResult({ name: 'Get Current User', status: 'pending' })
    try {
      const currentUser = await fetchUser()
      if (currentUser) {
        addResult({
          name: 'Get Current User',
          status: 'success',
          message: `User: ${currentUser.userInfo?.email || 'N/A'}`,
          data: currentUser,
        })
      } else {
        addResult({ name: 'Get Current User', status: 'success', message: 'No user logged in' })
      }
    } catch (err) {
      addResult({
        name: 'Get Current User',
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
        <p className="text-muted-foreground">Connect your WEPIN wallet to test SDK features</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">WEPIN SDK Feature Tests</h2>
            <p className="text-sm text-muted-foreground">Test all WEPIN Provider and Widget SDK features</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${isWidgetInitialized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
            >
              Widget: {isWidgetInitialized ? 'Ready' : 'Initializing'}
            </span>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </div>

        <Tabs defaultValue="signatures" className="p-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="signatures" className="gap-1">
              <FileSignature className="h-4 w-4" /> Signatures
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1">
              <Send className="h-4 w-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="chains" className="gap-1">
              <Link2 className="h-4 w-4" /> Chains
            </TabsTrigger>
            <TabsTrigger value="widget" className="gap-1">
              <LayoutGrid className="h-4 w-4" /> Widget
            </TabsTrigger>
            <TabsTrigger value="user" className="gap-1">
              <User className="h-4 w-4" /> User
            </TabsTrigger>
          </TabsList>

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="message">Message to Sign</Label>
                <Input
                  id="message"
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  placeholder="Enter message..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={testSignMessage} disabled={isSigningMessage} className="flex-1">
                  {isSigningMessage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Sign Message (personal_sign)
                </Button>
                <Button onClick={testSignTypedData} disabled={isSigningTypedData} className="flex-1">
                  {isSigningTypedData && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Sign Typed Data (EIP-712)
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (ETH/Native)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.001"
                />
              </div>
              <Button onClick={testSendTransaction} disabled={isSendingTx} className="w-full">
                {isSendingTx && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Transaction
              </Button>
            </div>
          </TabsContent>

          {/* Chains Tab */}
          <TabsContent value="chains" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-2">Current Chain: {chainId}</div>
            <div className="grid grid-cols-2 gap-2">
              {chains.slice(0, 6).map((chain) => (
                <Button
                  key={chain.id}
                  variant={chainId === chain.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => testSwitchChain(chain.id)}
                  disabled={isSwitchingChain || chainId === chain.id}
                >
                  {isSwitchingChain && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {chain.name}
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* Widget Tab */}
          <TabsContent value="widget" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={testWidgetStatus}>
                <RefreshCw className="h-4 w-4 mr-2" /> Get Status
              </Button>
              <Button variant="outline" onClick={testWidgetControl} disabled={isOpeningWidget}>
                {isOpeningWidget && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isOpen ? 'Close Widget' : 'Open Widget'}
              </Button>
              <Button variant="outline" onClick={testGetAccounts} disabled={isLoadingAccounts}>
                {isLoadingAccounts && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Get Accounts
              </Button>
              <Button variant="outline" onClick={testGetNFTs} disabled={isLoadingNFTs}>
                {isLoadingNFTs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Get NFTs
              </Button>
            </div>
            {accounts.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Accounts ({accounts.length})</h4>
                <div className="space-y-1 text-xs font-mono">
                  {accounts.map((acc: WepinAccount, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{acc.network}</span>
                      <span>{acc.address.slice(0, 10)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* User Tab */}
          <TabsContent value="user" className="space-y-4 mt-4">
            <Button variant="outline" onClick={testGetUser} disabled={isLoadingUser} className="w-full">
              {isLoadingUser && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Get Current User
            </Button>
            {user && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{user.status}</span>
                </div>
                {user.userInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{user.userInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium">{user.userInfo.provider}</span>
                    </div>
                  </>
                )}
                {user.walletId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet ID:</span>
                    <span className="font-mono text-xs">{user.walletId.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Results Panel */}
      {results.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Test Results ({results.length})</h3>
          </div>
          <ScrollArea className="h-64">
            <div className="divide-y">
              {results.map((result, i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  <div className="mt-0.5">
                    {result.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {result.status === 'success' && <Check className="h-4 w-4 text-green-500" />}
                    {result.status === 'error' && <X className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{result.name}</div>
                    {result.message && (
                      <div className="text-xs text-muted-foreground truncate">{result.message}</div>
                    )}
                  </div>
                  {typeof result.data === 'string' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => navigator.clipboard.writeText(result.data as string)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
