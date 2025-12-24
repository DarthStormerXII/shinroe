'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAccount, useWalletClient } from '@/lib/web3'
import { SignatureDialogProps, SignatureType } from '@/lib/types/web3/components'
import { toast } from 'sonner'
import { 
  PenTool, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Shield,
  Hash
} from 'lucide-react'

export function SignatureDialog({
  open,
  onOpenChange,
  type,
  message,
  typedData,
  purpose,
  context,
  chainId,
  onSuccess,
  onError
}: SignatureDialogProps) {
  const { address } = useAccount()
  const { walletClient } = useWalletClient()
  
  const [activeTab, setActiveTab] = useState('summary')
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSign = async () => {
    if (!walletClient || !address) return
    
    setSigning(true)
    setError(null)
    
    try {
      let signature: string
      
      if (type === SignatureType.MESSAGE) {
        if (!message) throw new Error('No message to sign')
        
        signature = await walletClient.signMessage({
          account: address,
          message
        })
      } else {
        if (!typedData) throw new Error('No typed data to sign')
        
        signature = await walletClient.signTypedData({
          account: address,
          ...typedData
        })
      }
      
      onSuccess?.(signature)
      onOpenChange(false)
      
      toast.success('Signature successful', {
        description: `Signed ${type === SignatureType.MESSAGE ? 'message' : 'typed data'}`
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      
      toast.error('Signature failed', {
        description: errorMessage
      })
    } finally {
      setSigning(false)
    }
  }
  
  const getMessagePreview = () => {
    if (type === SignatureType.MESSAGE) {
      return message || ''
    }
    
    if (type === SignatureType.TYPED_DATA && typedData) {
      // Show a simplified view of the typed data
      return JSON.stringify(typedData.message, null, 2)
    }
    
    return ''
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Signature Request
          </DialogTitle>
          <DialogDescription>
            Review the details before signing with your wallet
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {/* Purpose Card */}
            {purpose && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Purpose
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{purpose}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Signature Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signature Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">
                    {type === SignatureType.MESSAGE ? 'Personal Message' : 'EIP-712 Typed Data'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <code className="text-xs">{address?.slice(0, 10)}...{address?.slice(-8)}</code>
                </div>
                {chainId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chain ID</span>
                    <span className="text-sm">{chainId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Message Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-32">
                  {getMessagePreview()}
                </pre>
              </CardContent>
            </Card>
            
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Hash className="h-4 w-4" />
                  Full Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {type === SignatureType.MESSAGE ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Message</p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-96">
                        {message}
                      </pre>
                    </div>
                  ) : (
                    typedData && (
                      <>
                        <div>
                          <p className="text-sm font-medium mb-1">Domain</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(typedData.domain, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Types</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(typedData.types, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Values</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(typedData.message, null, 2)}
                          </pre>
                        </div>
                      </>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {type === SignatureType.MESSAGE
                  ? "You're about to sign a personal message. This signature can be used to verify your identity."
                  : "You're about to sign typed structured data. This signature follows the EIP-712 standard for enhanced security."
                }
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={signing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSign}
            disabled={signing || !walletClient || !address}
          >
            {signing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              'Sign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}