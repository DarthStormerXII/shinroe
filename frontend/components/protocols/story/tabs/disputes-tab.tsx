'use client'

import { useState } from 'react'
import { Address, parseEther } from 'viem'
import { StoryClient, DisputeTargetTag } from '@story-protocol/core-sdk'
import { Loader2, Gavel, FileUp, FileText, Upload, Eye, Plus, Trash2, Link2, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

import { STORY_CONTRACTS, DISPUTE_TAGS } from '@/constants/protocols/story'
import { DISPUTE_MODULE_ABI, ERC20_ALLOWANCE_ABI } from '@/lib/abis/story'
import type { DisputeEvidence, DisputeResult, StoryTabProps } from '@/lib/types/story'
import { usePublicClient } from '@/lib/web3'
import { CopyButton, TxLink } from '../shared'

export function DisputesTab({ getClient, address }: StoryTabProps) {
  const { t } = useTranslation()
  const { publicClient } = usePublicClient()
  const [loading, setLoading] = useState(false)
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [result, setResult] = useState<DisputeResult | null>(null)
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Form state
  const [targetIpId, setTargetIpId] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [disputeTag, setDisputeTag] = useState<string>('IMPROPER_REGISTRATION')
  const [evidenceCid, setEvidenceCid] = useState('')
  const [bondAmount, setBondAmount] = useState('0.1')
  const [livenessDays, setLivenessDays] = useState('30')
  const [useExactApproval, setUseExactApproval] = useState(true)

  // Evidence builder state - using translations for demo prefill
  const [evidenceTitle, setEvidenceTitle] = useState(() => t('demoPrefill.evidenceTitle'))
  const [evidenceDescription, setEvidenceDescription] = useState(() => t('demoPrefill.evidenceDescription'))
  const [originalWorkTitle, setOriginalWorkTitle] = useState(() => t('demoPrefill.originalWorkTitle'))
  const [originalWorkCreator, setOriginalWorkCreator] = useState(() => t('demoPrefill.originalWorkCreator'))
  const [originalWorkDate, setOriginalWorkDate] = useState('2024-01-15')
  const [originalWorkUrl, setOriginalWorkUrl] = useState('https://example.com/original-work')
  const [proofUrls, setProofUrls] = useState<string[]>(['https://example.com/proof-1'])
  const [additionalNotes, setAdditionalNotes] = useState(() => t('demoPrefill.additionalNotes'))

  const addProofUrl = () => setProofUrls([...proofUrls, ''])
  const removeProofUrl = (index: number) => setProofUrls(proofUrls.filter((_, i) => i !== index))
  const updateProofUrl = (index: number, value: string) => {
    const updated = [...proofUrls]
    updated[index] = value
    setProofUrls(updated)
  }

  const buildEvidenceJson = (): DisputeEvidence => {
    const evidence: DisputeEvidence = {
      title: evidenceTitle,
      description: evidenceDescription,
      disputeReason: DISPUTE_TAGS.find((t) => t.value === disputeTag)?.label || disputeTag,
      proofUrls: proofUrls.filter((url) => url.trim() !== ''),
      timestamp: new Date().toISOString(),
      disputant: address,
    }

    if (originalWorkTitle || originalWorkCreator || originalWorkDate || originalWorkUrl) {
      evidence.originalWorkDetails = {}
      if (originalWorkTitle) evidence.originalWorkDetails.title = originalWorkTitle
      if (originalWorkCreator) evidence.originalWorkDetails.creator = originalWorkCreator
      if (originalWorkDate) evidence.originalWorkDetails.creationDate = originalWorkDate
      if (originalWorkUrl) evidence.originalWorkDetails.registrationUrl = originalWorkUrl
    }

    if (additionalNotes) evidence.additionalNotes = additionalNotes

    return evidence
  }

  const resetEvidenceForm = () => {
    setEvidenceTitle('')
    setEvidenceDescription('')
    setOriginalWorkTitle('')
    setOriginalWorkCreator('')
    setOriginalWorkDate('')
    setOriginalWorkUrl('')
    setProofUrls([''])
    setAdditionalNotes('')
    setShowPreview(false)
  }

  const handleUploadEvidence = async () => {
    if (!evidenceTitle.trim() || !evidenceDescription.trim()) {
      toast.error('Please enter evidence title and description')
      return
    }

    setUploadingEvidence(true)
    try {
      const evidence = buildEvidenceJson()

      const response = await fetch('/api/ipfs/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: evidence,
          name: `dispute-evidence-${Date.now()}`,
          metadata: { type: 'dispute-evidence', disputeReason: disputeTag },
          cidVersion: 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to upload evidence')

      const result = await response.json()
      setEvidenceCid(result.ipfsHash)
      setEvidenceDialogOpen(false)
      toast.success('Evidence uploaded to IPFS!')
    } catch (error: any) {
      console.error('Failed to upload evidence:', error)
      toast.error(error.message || 'Failed to upload evidence')
    } finally {
      setUploadingEvidence(false)
    }
  }

  const handleRaiseDispute = async () => {
    const client = await getClient()
    if (!client) return

    if (!targetIpId) {
      toast.error('Please enter target IP ID')
      return
    }
    if (!evidenceCid) {
      toast.error('Please enter evidence CID')
      return
    }

    const bondValue = parseFloat(bondAmount)
    if (isNaN(bondValue) || bondValue < 0.1) {
      toast.error('Minimum bond is 0.1 WIP')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const livenessSeconds = parseInt(livenessDays) * 24 * 60 * 60
      const bondInWei = parseEther(bondAmount)

      // Handle exact approval if selected
      if (useExactApproval && publicClient) {
        const arbitrationPolicy = await publicClient.readContract({
          address: STORY_CONTRACTS.DISPUTE_MODULE,
          abi: DISPUTE_MODULE_ABI,
          functionName: 'baseArbitrationPolicy',
        })

        const currentAllowance = await publicClient.readContract({
          address: STORY_CONTRACTS.WIP_TOKEN,
          abi: ERC20_ALLOWANCE_ABI,
          functionName: 'allowance',
          args: [address as Address, arbitrationPolicy],
        })

        if (currentAllowance < bondInWei) {
          toast.info('Approving exact bond amount...')
          await client.wipClient.approve({
            spender: arbitrationPolicy,
            amount: bondInWei,
          })
          toast.success('Approval complete')
        }
      }

      const response = await client.dispute.raiseDispute({
        targetIpId: targetIpId as Address,
        cid: evidenceCid,
        targetTag: DisputeTargetTag[disputeTag as keyof typeof DisputeTargetTag],
        bond: bondInWei,
        liveness: livenessSeconds,
        wipOptions: {
          enableAutoWrapIp: true,
          enableAutoApprove: !useExactApproval,
        },
      })

      setResult({
        txHash: response.txHash,
        disputeId: response.disputeId?.toString(),
      })
      toast.success('Dispute raised successfully!')
    } catch (error: any) {
      console.error('Failed to raise dispute:', error)
      toast.error(error.message || 'Failed to raise dispute')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Raise Dispute */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Raise a Dispute
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Challenge an IP Asset that infringes existing IP or violates terms
        </p>

        <div className="space-y-4">
          <div>
            <Label>Target IP Asset ID *</Label>
            <Input
              placeholder="0x..."
              value={targetIpId}
              onChange={(e) => setTargetIpId(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Dispute Reason *</Label>
            <Select value={disputeTag} onValueChange={setDisputeTag}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_TAGS.map((tag) => (
                  <SelectItem key={tag.value} value={tag.value}>
                    {tag.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {DISPUTE_TAGS.find((t) => t.value === disputeTag)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Evidence CID (IPFS) *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Qm..."
                value={evidenceCid}
                onChange={(e) => setEvidenceCid(e.target.value)}
                className="flex-1"
              />
              <Dialog
                open={evidenceDialogOpen}
                onOpenChange={(open) => {
                  setEvidenceDialogOpen(open)
                  if (!open) resetEvidenceForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Build Evidence">
                    <FileUp className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Evidence Builder
                    </DialogTitle>
                    <DialogDescription>
                      Create structured evidence for your dispute
                    </DialogDescription>
                  </DialogHeader>

                  {!showPreview ? (
                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Evidence Title *</Label>
                          <Input
                            placeholder="e.g., Infringement Claim"
                            value={evidenceTitle}
                            onChange={(e) => setEvidenceTitle(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            placeholder="Describe why this IP should be disputed..."
                            value={evidenceDescription}
                            onChange={(e) => setEvidenceDescription(e.target.value)}
                            className="mt-1.5 min-h-[100px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Original Work Details (Optional)
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label className="text-xs">Original Title</Label>
                            <Input
                              value={originalWorkTitle}
                              onChange={(e) => setOriginalWorkTitle(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Creator</Label>
                            <Input
                              value={originalWorkCreator}
                              onChange={(e) => setOriginalWorkCreator(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Proof URLs</Label>
                          <Button variant="outline" size="sm" onClick={addProofUrl}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add URL
                          </Button>
                        </div>
                        {proofUrls.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="https://..."
                              value={url}
                              onChange={(e) => updateProofUrl(index, e.target.value)}
                              className="flex-1"
                            />
                            {proofUrls.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProofUrl(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                          disabled={!evidenceTitle || !evidenceDescription}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          onClick={handleUploadEvidence}
                          disabled={uploadingEvidence || !evidenceTitle || !evidenceDescription}
                          className="flex-1"
                        >
                          {uploadingEvidence ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload to IPFS
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg bg-muted p-4 overflow-x-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(buildEvidenceJson(), null, 2)}
                        </pre>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                          Back to Edit
                        </Button>
                        <Button onClick={handleUploadEvidence} disabled={uploadingEvidence} className="flex-1">
                          {uploadingEvidence ? 'Uploading...' : 'Upload to IPFS'}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            {evidenceCid && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="truncate font-mono text-xs">{evidenceCid}</span>
                <CopyButton text={evidenceCid} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Bond Amount (WIP) *</Label>
              <Input
                type="number"
                value={bondAmount}
                onChange={(e) => setBondAmount(e.target.value)}
                className="mt-1.5"
                step="0.01"
                min="0.1"
              />
              <p className="text-xs text-muted-foreground mt-1">Min: 0.1 WIP</p>
            </div>
            <div>
              <Label>Liveness Period (Days) *</Label>
              <Input
                type="number"
                value={livenessDays}
                onChange={(e) => setLivenessDays(e.target.value)}
                className="mt-1.5"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div>
              <Label className="text-sm font-medium">Exact Approval Only</Label>
              <p className="text-xs text-muted-foreground">
                {useExactApproval ? 'Approve only bond amount (secure)' : 'Unlimited approval'}
              </p>
            </div>
            <Switch checked={useExactApproval} onCheckedChange={setUseExactApproval} />
          </div>

          <Button onClick={handleRaiseDispute} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Raising Dispute...
              </>
            ) : (
              <>
                <Gavel className="mr-2 h-4 w-4" />
                Raise Dispute
              </>
            )}
          </Button>

          {result && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              {result.disputeId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dispute ID:</span>
                  <span className="font-semibold">{result.disputeId}</span>
                </div>
              )}
              {result.txHash && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction:</span>
                  <TxLink hash={result.txHash} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dispute Info */}
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">How Disputes Work</h3>
          <div className="space-y-4 text-sm">
            {[
              { step: '1', title: 'Raise Dispute', desc: 'Submit evidence and post a bond' },
              { step: '2', title: 'Liveness Period', desc: 'Target owner can counter-dispute' },
              { step: '3', title: 'Resolution', desc: "UMA's Oracle reviews and decides" },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                    {item.step}
                  </span>
                  {item.title}
                </h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Dispute Tags</h3>
          <div className="space-y-3">
            {DISPUTE_TAGS.map((tag) => (
              <div key={tag.value} className="p-3 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="text-xs mb-1">
                  {tag.label}
                </Badge>
                <p className="text-xs text-muted-foreground">{tag.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-medium mb-3">Important Notes</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Each evidence CID can only be used once</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>If rejected, you lose your bond</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>UMA&apos;s oracle resolves disputes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DisputesTab
