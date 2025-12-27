'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Check, Upload, RefreshCw } from 'lucide-react'
import type { IIndexerProvider, SubgraphConfig } from '@/lib/indexer/types'

interface AddSubgraphDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: IIndexerProvider
  onAdd: (config: Omit<SubgraphConfig, 'id' | 'createdAt' | 'updatedAt' | 'provider'>) => void
}

export function AddSubgraphDialog({ open, onOpenChange, provider, onAdd }: AddSubgraphDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    version: '1.0.0',
    network: '',
    endpoint: '',
    schemaContent: '',
    description: '',
    isActive: true
  })

  const [schemaSource, setSchemaSource] = useState<'manual' | 'file' | 'introspect'>('manual')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [schemaValid, setSchemaValid] = useState<boolean | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null)

  const networks = provider.getNetworks()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = 'Endpoint URL is required'
    } else {
      try {
        new URL(formData.endpoint)
      } catch {
        newErrors.endpoint = 'Invalid URL format'
      }
    }

    if (!formData.schemaContent.trim()) {
      newErrors.schemaContent = 'Schema content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSchema = (content: string) => {
    if (!content.trim()) {
      setSchemaValid(null)
      return
    }

    try {
      // Simple validation: check for type definitions with @entity
      const hasEntities = /type\s+\w+\s*@entity/.test(content) ||
        /type\s+\w+\s*\{/.test(content)
      setSchemaValid(hasEntities)
    } catch {
      setSchemaValid(false)
    }
  }

  const handleSchemaChange = (value: string) => {
    setFormData(prev => ({ ...prev, schemaContent: value }))
    validateSchema(value)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFormData(prev => ({ ...prev, schemaContent: content }))
        setSchemaSource('file')
        validateSchema(content)
      }
      reader.readAsText(file)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.endpoint) {
      setErrors(prev => ({ ...prev, endpoint: 'Enter endpoint URL first' }))
      return
    }

    setTestingConnection(true)
    setConnectionResult(null)

    try {
      const status = await provider.testConnection(formData.endpoint)
      setConnectionResult({
        success: status.connected,
        message: status.connected
          ? `Connected successfully (${status.latency}ms)`
          : status.error || 'Connection failed'
      })
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleIntrospect = async () => {
    if (!formData.endpoint) {
      setErrors(prev => ({ ...prev, endpoint: 'Enter endpoint URL first' }))
      return
    }

    setLoading(true)
    try {
      const schema = await provider.introspectSchema(formData.endpoint)
      if (schema) {
        setFormData(prev => ({ ...prev, schemaContent: schema }))
        setSchemaSource('introspect')
        setSchemaValid(true)
      } else {
        setErrors(prev => ({ ...prev, schemaContent: 'Could not introspect schema' }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        schemaContent: error instanceof Error ? error.message : 'Introspection failed'
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      onAdd({
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
        version: formData.version.trim() || '1.0.0',
        network: formData.network,
        endpoint: formData.endpoint.trim(),
        schemaContent: formData.schemaContent.trim(),
        description: formData.description.trim(),
        status: 'unknown',
        isActive: formData.isActive
      })

      // Reset form
      setFormData({
        name: '',
        slug: '',
        version: '1.0.0',
        network: '',
        endpoint: '',
        schemaContent: '',
        description: '',
        isActive: true
      })
      setErrors({})
      setSchemaValid(null)
      setConnectionResult(null)
      onOpenChange(false)
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to add subgraph'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      version: '1.0.0',
      network: '',
      endpoint: '',
      schemaContent: '',
      description: '',
      isActive: true
    })
    setErrors({})
    setSchemaValid(null)
    setConnectionResult(null)
    setSchemaSource('manual')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {provider.name} Subgraph</DialogTitle>
          <DialogDescription>
            Configure a new subgraph endpoint to query blockchain data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Subgraph"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value) => setFormData(prev => ({ ...prev, network: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name} {network.isTestnet && '(Testnet)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL *</Label>
            <div className="flex gap-2">
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, endpoint: e.target.value }))
                  setConnectionResult(null)
                }}
                placeholder={provider.id === 'thegraph'
                  ? 'https://api.studio.thegraph.com/query/...'
                  : 'https://api.goldsky.com/api/public/...'
                }
                className={errors.endpoint ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
            {errors.endpoint && (
              <p className="text-sm text-red-500">{errors.endpoint}</p>
            )}
            {connectionResult && (
              <p className={`text-sm ${connectionResult.success ? 'text-green-500' : 'text-red-500'}`}>
                {connectionResult.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of this subgraph"
            />
          </div>

          {/* Schema Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>GraphQL Schema *</Label>
              {schemaValid !== null && (
                <div className="flex items-center space-x-1">
                  {schemaValid ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Valid schema</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">Invalid schema</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Tabs value={schemaSource} onValueChange={(v) => setSchemaSource(v as typeof schemaSource)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual Input</TabsTrigger>
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="introspect">Introspect</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-2">
                <Textarea
                  value={formData.schemaContent}
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  placeholder="Paste your schema.graphql content here..."
                  className={`min-h-[200px] font-mono text-sm ${errors.schemaContent ? 'border-red-500' : ''}`}
                />
              </TabsContent>

              <TabsContent value="file" className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="schema-file" className="cursor-pointer">
                    <span className="text-sm text-primary hover:underline">
                      Click to upload schema.graphql file
                    </span>
                    <Input
                      id="schema-file"
                      type="file"
                      accept=".graphql,.gql"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
                {formData.schemaContent && (
                  <Textarea
                    value={formData.schemaContent}
                    onChange={(e) => handleSchemaChange(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                )}
              </TabsContent>

              <TabsContent value="introspect" className="space-y-2">
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Fetch schema directly from the endpoint using GraphQL introspection
                  </p>
                  <Button
                    type="button"
                    onClick={handleIntrospect}
                    disabled={loading || !formData.endpoint}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Introspecting...
                      </>
                    ) : (
                      'Introspect Schema'
                    )}
                  </Button>
                </div>
                {formData.schemaContent && (
                  <Textarea
                    value={formData.schemaContent}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-muted"
                  />
                )}
              </TabsContent>
            </Tabs>

            {errors.schemaContent && (
              <p className="text-sm text-red-500">{errors.schemaContent}</p>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="active">Active (enable queries)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || schemaValid === false}>
              {loading ? 'Adding...' : 'Add Subgraph'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
