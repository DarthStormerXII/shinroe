'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Play
} from 'lucide-react'
import { getProvider, isValidProvider } from '@/lib/indexer'
import type {
  IIndexerProvider,
  GraphQLEntity,
  QueryResult,
  ConnectionStatus
} from '@/lib/indexer/types'
import { getSubgraphsByProvider, type SubgraphConfig as ConstantsSubgraphConfig, type IndexedContract } from '@/constants/subgraphs'
import { EntityDataTable } from '../components/entity-data-table'
import { QueryPlayground } from '../components/query-playground'

// Simplified SubgraphConfig for UI display (not the full indexer type)
interface ExtendedSubgraphConfig {
  id: string
  name: string
  endpoint: string
  network: string
  schemaContent: string
  provider: 'thegraph' | 'goldsky'
  createdAt: Date
  updatedAt: Date
  contracts: IndexedContract[]
  description?: string
}

// Convert constants subgraph to indexer SubgraphConfig format
function convertConstantsSubgraph(config: ConstantsSubgraphConfig, provider: 'thegraph' | 'goldsky'): ExtendedSubgraphConfig {
  const endpoint = provider === 'goldsky' ? config.goldsky.endpoint : config.thegraph.endpoint
  // Derive network from contracts
  const networks = [...new Set(config.contracts.map(c => c.chainName))]
  const chainIds = [...new Set(config.contracts.map(c => c.chainId))]
  const network = networks.length === 1 ? networks[0] : `${networks.length} chains`
  // Create unique ID using name and chain IDs to avoid duplicates
  const chainIdSuffix = chainIds.sort().join('-')

  return {
    id: `preconfigured-${config.name}-${chainIdSuffix}`,
    name: config.name,
    endpoint,
    network,
    schemaContent: config.schemaContent || '',
    provider,
    createdAt: new Date(),
    updatedAt: new Date(),
    contracts: config.contracts,
    description: config.description,
  }
}

// Load subgraphs from constants only (no localStorage)
function useSubgraphStore(providerId: string) {
  const [configs, setConfigs] = useState<ExtendedSubgraphConfig[]>([])

  useEffect(() => {
    const preconfigured = getSubgraphsByProvider(providerId as 'thegraph' | 'goldsky')
      .map(c => convertConstantsSubgraph(c, providerId as 'thegraph' | 'goldsky'))
      .filter(c => c.endpoint)
    setConfigs(preconfigured)
  }, [providerId])

  return { configs }
}

// Schema parser (simplified)
function parseSchema(schemaContent: string): GraphQLEntity[] {
  const entities: GraphQLEntity[] = []
  // Remove comments but preserve structure for regex parsing
  const cleanSchema = schemaContent.replace(/#[^\n]*/g, '')
  const typeRegex = /type\s+(\w+)\s*(@entity[^{]*)?\s*\{([^}]+)\}/g
  let match

  while ((match = typeRegex.exec(cleanSchema)) !== null) {
    const [, typeName, directives = '', fieldsString] = match

    if (['Query', 'Mutation', 'Subscription', '_'].some(t => typeName.startsWith(t))) {
      continue
    }

    // Use regex to extract all field definitions
    const fieldRegex = /(\w+)\s*:\s*(\[?\w+!?\]?!?)/g
    const fields: GraphQLEntity['fields'] = []
    let fieldMatch

    while ((fieldMatch = fieldRegex.exec(fieldsString)) !== null) {
      const [, name, typeStr] = fieldMatch
      fields.push({
        name,
        type: typeStr.replace(/[\[\]!]/g, ''),
        baseType: typeStr.replace(/[\[\]!]/g, ''),
        isRequired: typeStr.endsWith('!'),
        isArray: typeStr.startsWith('['),
        isRelation: false
      })
    }

    const pluralName = typeName.endsWith('s') ? typeName :
      typeName.endsWith('y') ? typeName.slice(0, -1) + 'ies' :
        typeName + 's'

    entities.push({
      name: typeName,
      pluralName: pluralName.charAt(0).toLowerCase() + pluralName.slice(1),
      fields,
      isTimeseries: directives.includes('timeseries'),
      isImmutable: directives.includes('immutable'),
      directives: directives.match(/@\w+[^@]*/g)?.map(d => d.trim()) || []
    })
  }

  return entities
}

export default function ProviderDashboard() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.provider as string

  const [provider, setProvider] = useState<IIndexerProvider | null>(null)
  const [selectedSubgraph, setSelectedSubgraph] = useState<string | null>(null)
  const [entities, setEntities] = useState<GraphQLEntity[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [entityData, setEntityData] = useState<QueryResult<Record<string, unknown>> | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({})
  const [loading, setLoading] = useState(false)
  const [showPlayground, setShowPlayground] = useState(false)

  const { configs } = useSubgraphStore(providerId)

  // Initialize provider
  useEffect(() => {
    if (!isValidProvider(providerId)) {
      router.push('/indexer')
      return
    }
    setProvider(getProvider(providerId as 'thegraph' | 'goldsky'))
  }, [providerId, router])

  // Auto-select first subgraph if available
  useEffect(() => {
    if (configs.length > 0 && !selectedSubgraph) {
      setSelectedSubgraph(configs[0].id)
    }
  }, [configs, selectedSubgraph])

  // Parse entities when subgraph is selected
  useEffect(() => {
    if (selectedSubgraph) {
      const config = configs.find(c => c.id === selectedSubgraph)
      if (config?.schemaContent) {
        try {
          const parsed = parseSchema(config.schemaContent)
          setEntities(parsed)
          setSelectedEntity(null)
          setEntityData(null)
        } catch {
          setEntities([])
        }
      }
    } else {
      setEntities([])
      setSelectedEntity(null)
      setEntityData(null)
    }
  }, [selectedSubgraph, configs])

  // Test connection for each subgraph
  const testConnection = useCallback(async (config: ExtendedSubgraphConfig) => {
    if (!provider) return
    const status = await provider.testConnection(config.endpoint)
    setConnectionStatus(prev => ({ ...prev, [config.id]: status }))
  }, [provider])

  useEffect(() => {
    configs.forEach(config => {
      if (!connectionStatus[config.id]) {
        testConnection(config)
      }
    })
  }, [configs, connectionStatus, testConnection])

  // Fetch entity data
  const fetchEntityData = async (entity: GraphQLEntity) => {
    if (!selectedSubgraph || !provider) return

    const config = configs.find(c => c.id === selectedSubgraph)
    if (!config) return

    setLoading(true)
    try {
      const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'BigInt', 'BigDecimal', 'Bytes']
      const scalarFields = entity.fields.filter(f => scalarTypes.includes(f.type))

      if (scalarFields.length === 0) {
        setEntityData({
          data: [],
          loading: false,
          error: 'No queryable fields found in entity'
        })
        return
      }

      const fieldSelections = scalarFields.map(f => f.name).join('\n            ')

      // Check if we have an orderBy field (prefer blockTimestamp or blockNumber)
      const orderByField = scalarFields.find(f => f.name === 'blockTimestamp')?.name ||
                          scalarFields.find(f => f.name === 'blockNumber')?.name ||
                          scalarFields.find(f => f.name === 'id')?.name || 'id'

      const query = `
        query Get${entity.name}s {
          ${entity.pluralName}(first: 20, orderBy: ${orderByField}, orderDirection: desc) {
            ${fieldSelections}
          }
        }
      `

      const result = await provider.query<Record<string, unknown>>(config.endpoint, query)
      setEntityData({
        data: result.data,
        loading: result.loading,
        error: result.error,
        metadata: { entityName: entity.name }
      })
    } catch (error) {
      setEntityData({
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle entity selection
  useEffect(() => {
    if (selectedEntity) {
      const entity = entities.find(e => e.name === selectedEntity)
      if (entity) {
        fetchEntityData(entity)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntity])

  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint)
  }

  if (!provider) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{provider.name}</h1>
            <a
              href={provider.info.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-muted-foreground">
            {configs.length} subgraph{configs.length !== 1 ? 's' : ''} deployed
          </p>
        </div>
        <Button
          variant={showPlayground ? "default" : "outline"}
          onClick={() => setShowPlayground(!showPlayground)}
        >
          <Play className="h-4 w-4 mr-2" />
          {showPlayground ? 'Hide Playground' : 'Query Playground'}
        </Button>
      </div>

      {/* Query Playground (toggleable) */}
      {showPlayground && (
        <div className="mb-8">
          <QueryPlayground
            provider={provider}
            subgraphs={configs}
          />
        </div>
      )}

      {/* Main Content */}
      {configs.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Subgraphs Deployed</CardTitle>
            <CardDescription>
              Deploy a subgraph using the <code className="bg-muted px-1.5 py-0.5 rounded">/deploy-subgraphs</code> command
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subgraph List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Subgraphs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {configs.map((config) => {
                const status = connectionStatus[config.id]
                return (
                  <div
                    key={config.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSubgraph === config.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                      }`}
                    onClick={() => setSelectedSubgraph(config.id)}
                  >
                    {/* Subgraph Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{config.name}</p>
                        {status?.connected ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                        ) : status?.error ? (
                          <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        ) : (
                          <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin flex-shrink-0" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyEndpoint(config.endpoint)
                        }}
                        title="Copy endpoint"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Indexed Contracts */}
                    {config.contracts && config.contracts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium">
                          Indexed Contracts
                        </p>
                        {config.contracts.map((contract) => (
                          <div
                            key={`${contract.chainId}-${contract.address}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                                {contract.chainName}
                              </Badge>
                              <span className="text-muted-foreground truncate">
                                {contract.name}
                              </span>
                            </div>
                            <a
                              href={contract.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary shrink-0 ml-1"
                              onClick={(e) => e.stopPropagation()}
                              title={`View ${contract.name} on explorer`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSubgraph ? (
              <div className="space-y-6">
                {/* Entity Cards */}
                {entities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entities.map((entity) => (
                      <Card
                        key={entity.name}
                        className={`cursor-pointer transition-colors ${selectedEntity === entity.name
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                          }`}
                        onClick={() => setSelectedEntity(entity.name)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{entity.name}</CardTitle>
                            {entity.isImmutable && (
                              <Badge variant="outline">immutable</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {entity.fields.length} fields
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {entity.fields.slice(0, 3).map((field) => (
                              <div key={field.name} className="text-sm text-muted-foreground">
                                {field.name}: {field.type}
                                {field.isRequired && ' !'}
                                {field.isArray && ' []'}
                              </div>
                            ))}
                            {entity.fields.length > 3 && (
                              <div className="text-sm text-muted-foreground">
                                +{entity.fields.length - 3} more fields
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Database className="h-8 w-8 mx-auto mb-2" />
                        <p>No entities found in schema</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Entity Data Table */}
                {selectedEntity && entityData && (
                  <EntityDataTable
                    entityData={entityData}
                    loading={loading}
                    onRefresh={() => {
                      const entity = entities.find(e => e.name === selectedEntity)
                      if (entity) fetchEntityData(entity)
                    }}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg">Select a subgraph to explore</p>
                    <p>Choose from the list on the left to browse entities and data</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
