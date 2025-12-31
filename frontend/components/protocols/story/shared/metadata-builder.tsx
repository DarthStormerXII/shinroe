'use client'

import { useState, useCallback } from 'react'
import { Loader2, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { IP_TYPES, type IPType } from '@/constants/protocols/story'
import type { IpCreator, IpMetadata, NftMetadata } from '@/lib/types/story'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

interface MetadataBuilderProps {
  ipMetadataUri: string
  setIpMetadataUri: (uri: string) => void
  nftMetadataUri: string
  setNftMetadataUri: (uri: string) => void
  ipImageUri: string
  setIpImageUri: (uri: string) => void
  ipMediaUri: string
  setIpMediaUri: (uri: string) => void
}

export function MetadataBuilder({
  ipMetadataUri,
  setIpMetadataUri,
  nftMetadataUri,
  setNftMetadataUri,
  ipImageUri,
  setIpImageUri,
  ipMediaUri,
  setIpMediaUri,
}: MetadataBuilderProps) {
  const { t } = useTranslation()
  const [useMetadataBuilder, setUseMetadataBuilder] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  // Metadata form state - using translations for demo prefill
  const [ipTitle, setIpTitle] = useState(() => t('demoPrefill.ipTitle'))
  const [ipDescription, setIpDescription] = useState(() => t('demoPrefill.ipDescription'))
  const [ipType, setIpType] = useState<IPType>('Art')
  const [tags, setTags] = useState<string[]>(['demo', 'artwork', 'nft'])
  const [tagInput, setTagInput] = useState('')
  const [creators, setCreators] = useState<IpCreator[]>(() => [
    { name: t('demoPrefill.creatorName'), address: '0x742d35Cc6634C0532925a3b844Bc9e7595f1eB2a', contributionPercent: 100, description: 'Lead creator', role: t('demoPrefill.creatorRole') },
  ])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const addCreator = () => {
    setCreators([
      ...creators,
      { name: '', address: '', contributionPercent: 0, description: '', role: '' },
    ])
  }

  const removeCreator = (index: number) => {
    setCreators(creators.filter((_, i) => i !== index))
  }

  const updateCreator = (index: number, field: keyof IpCreator, value: string | number) => {
    const updated = [...creators]
    updated[index] = { ...updated[index], [field]: value }
    setCreators(updated)
  }

  const handleImageUpload = useCallback(async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', `ip-image-${Date.now()}`)

      const response = await fetch('/api/ipfs/file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const result = await response.json()
      setIpImageUri(result.url)
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }, [setIpImageUri])

  const handleMediaUpload = useCallback(async (file: File) => {
    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', `ip-media-${Date.now()}`)

      const response = await fetch('/api/ipfs/file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload media')
      }

      const result = await response.json()
      setIpMediaUri(result.url)
      toast.success('Media uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload media:', error)
      toast.error(error.message || 'Failed to upload media')
    } finally {
      setUploadingMedia(false)
    }
  }, [setIpMediaUri])

  const handleUploadMetadata = useCallback(async () => {
    if (!ipTitle.trim()) {
      toast.error('Please enter an IP title')
      return
    }

    setUploading(true)
    try {
      // Build IP metadata
      const ipMetadata: IpMetadata = {
        title: ipTitle,
        description: ipDescription || undefined,
        createdAt: new Date().toISOString(),
        ipType,
        image: ipImageUri || undefined,
        mediaUrl: ipMediaUri || undefined,
        creators: creators.filter((c) => c.name && c.address).length > 0
          ? creators.filter((c) => c.name && c.address)
          : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }

      // Build NFT metadata (ERC-721 compatible)
      const nftMetadata: NftMetadata = {
        name: ipTitle,
        description: ipDescription || undefined,
        image: ipImageUri || undefined,
        attributes: [
          { trait_type: 'IP Type', value: ipType },
          ...(tags.map((tag) => ({ trait_type: 'Tag', value: tag }))),
        ],
      }

      // Upload both to IPFS
      const [ipResponse, nftResponse] = await Promise.all([
        fetch('/api/ipfs/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: ipMetadata,
            name: `ip-metadata-${Date.now()}`,
            cidVersion: 0,
          }),
        }),
        fetch('/api/ipfs/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: nftMetadata,
            name: `nft-metadata-${Date.now()}`,
            cidVersion: 0,
          }),
        }),
      ])

      if (!ipResponse.ok) {
        throw new Error('Failed to upload IP metadata')
      }
      if (!nftResponse.ok) {
        throw new Error('Failed to upload NFT metadata')
      }

      const ipResult = await ipResponse.json()
      const nftResult = await nftResponse.json()

      setIpMetadataUri(ipResult.url)
      setNftMetadataUri(nftResult.url)
      toast.success('Metadata uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload metadata:', error)
      toast.error(error.message || 'Failed to upload metadata')
    } finally {
      setUploading(false)
    }
  }, [
    ipTitle,
    ipDescription,
    ipType,
    ipImageUri,
    ipMediaUri,
    creators,
    tags,
    setIpMetadataUri,
    setNftMetadataUri,
  ])

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">IP Metadata</h3>
          <p className="text-sm text-muted-foreground">
            Build or provide metadata for your IP Asset
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="metadata-toggle" className="text-sm">
            {useMetadataBuilder ? 'Build Metadata' : 'Manual URIs'}
          </Label>
          <Switch
            id="metadata-toggle"
            checked={!useMetadataBuilder}
            onCheckedChange={(checked) => setUseMetadataBuilder(!checked)}
          />
        </div>
      </div>

      {useMetadataBuilder ? (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="ipTitle">Title *</Label>
                <Input
                  id="ipTitle"
                  placeholder="My Awesome IP"
                  value={ipTitle}
                  onChange={(e) => setIpTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ipType">IP Type</Label>
                <Select value={ipType} onValueChange={(v) => setIpType(v as IPType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {IP_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ipDescription">Description</Label>
              <Textarea
                id="ipDescription"
                placeholder="Describe your intellectual property..."
                value={ipDescription}
                onChange={(e) => setIpDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Creators */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Creators</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCreator}>
                <Plus className="h-4 w-4 mr-1" />
                Add Creator
              </Button>
            </div>
            <div className="space-y-3">
              {creators.map((creator, index) => (
                <div key={index} className="grid gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Creator {index + 1}</span>
                    {creators.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCreator(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Creator name"
                        value={creator.name}
                        onChange={(e) => updateCreator(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Address</Label>
                      <Input
                        placeholder="0x..."
                        value={creator.address}
                        onChange={(e) => updateCreator(index, 'address', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Contribution %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={creator.contributionPercent}
                        onChange={(e) =>
                          updateCreator(index, 'contributionPercent', parseInt(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Input
                        placeholder="Artist, Writer, etc."
                        value={creator.role || ''}
                        onChange={(e) => updateCreator(index, 'role', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Cover Image</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                className="flex-1"
                disabled={uploadingImage}
              />
              {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {ipImageUri && (
              <div className="mt-2 p-2 rounded bg-muted text-xs font-mono break-all">
                {ipImageUri}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <Label>Media File (Optional)</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleMediaUpload(file)
                }}
                className="flex-1"
                disabled={uploadingMedia}
              />
              {uploadingMedia && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {ipMediaUri && (
              <div className="mt-2 p-2 rounded bg-muted text-xs font-mono break-all">
                {ipMediaUri}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleUploadMetadata} disabled={uploading || !ipTitle} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Metadata...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Metadata to IPFS
                </>
              )}
            </Button>

            {(ipMetadataUri || nftMetadataUri) && (
              <div className="mt-3 space-y-2">
                {ipMetadataUri && (
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">IP Metadata URI:</p>
                    <p className="text-xs font-mono break-all">{ipMetadataUri}</p>
                  </div>
                )}
                {nftMetadataUri && (
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">NFT Metadata URI:</p>
                    <p className="text-xs font-mono break-all">{nftMetadataUri}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="ipMetadataUri">IP Metadata URI</Label>
            <Input
              id="ipMetadataUri"
              placeholder="ipfs://... or https://..."
              value={ipMetadataUri}
              onChange={(e) => setIpMetadataUri(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="nftMetadataUri">NFT Metadata URI</Label>
            <Input
              id="nftMetadataUri"
              placeholder="ipfs://... or https://..."
              value={nftMetadataUri}
              onChange={(e) => setNftMetadataUri(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MetadataBuilder
