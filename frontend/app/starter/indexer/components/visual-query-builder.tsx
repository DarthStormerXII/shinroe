'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  Copy,
  RefreshCw,
  AlertCircle,
  Download,
  Wand2,
  Code,
  Eye,
  Check,
  Settings2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SchemaExplorer } from './schema-explorer'
import type { IIndexerProvider, QueryResult } from '@/lib/indexer/types'

// Simple subgraph type for the builder (just the fields we need)
interface BuilderSubgraph {
  id: string
  name: string
  endpoint: string
  schemaContent?: string
}

interface VisualQueryBuilderProps {
  provider: IIndexerProvider
  subgraphs: BuilderSubgraph[]
}

interface QueryConfig {
  entity: string
  pluralName: string
  fields: string[]
  first: number
  skip: number
  orderBy: string
  orderDirection: 'asc' | 'desc'
  whereClause: string
}

// Convert JSON object to GraphQL object syntax (unquoted keys)
function jsonToGraphQL(obj: unknown): string {
  if (obj === null) return 'null'
  if (typeof obj === 'string') return `"${obj}"`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    return `[${obj.map(jsonToGraphQL).join(', ')}]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return `{${entries.map(([k, v]) => `${k}: ${jsonToGraphQL(v)}`).join(', ')}}`
  }
  return String(obj)
}

// Generate GraphQL query from config
function generateQuery(config: QueryConfig): string {
  const { pluralName, fields, first, skip, orderBy, orderDirection, whereClause } = config

  if (fields.length === 0) {
    return `# Select fields from the schema explorer to build your query`
  }

  const args: string[] = []
  if (first > 0) args.push(`first: ${first}`)
  if (skip > 0) args.push(`skip: ${skip}`)
  if (orderBy) args.push(`orderBy: ${orderBy}`)
  if (orderBy && orderDirection) args.push(`orderDirection: ${orderDirection}`)

  // Only add where clause if it has actual filters (not empty {})
  if (whereClause.trim() && whereClause.trim() !== '{}') {
    try {
      const parsed = JSON.parse(whereClause)
      // Check if the object has any keys
      if (Object.keys(parsed).length > 0) {
        // Convert JSON to GraphQL object syntax (unquoted keys)
        args.push(`where: ${jsonToGraphQL(parsed)}`)
      }
    } catch {
      // Invalid JSON, skip where clause
    }
  }

  const argsString = args.length > 0 ? `(${args.join(', ')})` : ''
  const fieldString = fields.map(f => `    ${f}`).join('\n')

  return `query {
  ${pluralName}${argsString} {
${fieldString}
  }
}`
}

export function VisualQueryBuilder({ provider, subgraphs }: VisualQueryBuilderProps) {
  const [selectedSubgraph, setSelectedSubgraph] = useState<string>('')
  const [selectedFields, setSelectedFields] = useState<Map<string, Set<string>>>(new Map())
  const [activeEntity, setActiveEntity] = useState<string>('')

  // Query options
  const [first, setFirst] = useState(10)
  const [skip, setSkip] = useState(0)
  const [orderBy, setOrderBy] = useState('')
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc')
  const [whereClause, setWhereClause] = useState('{}')

  // Results
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'builder' | 'query'>('builder')

  const selectedConfig = subgraphs.find(s => s.id === selectedSubgraph)

  // Get plural name for active entity (camelCase with first char lowercase)
  // The Graph Protocol uses specific pluralization rules:
  // - Entity names ending in 's' use '_collection' suffix (e.g., DailyStats -> dailyStats_collection)
  // - Other entities use standard pluralization (e.g., Transfer -> transfers)
  const getEntityPluralName = useCallback((entityName: string) => {
    if (!entityName) return ''

    // Convert first char to lowercase, keep rest as-is
    const lcFirst = entityName.charAt(0).toLowerCase() + entityName.slice(1)

    // The Graph uses _collection suffix for entities ending in 's'
    if (entityName.endsWith('s')) {
      return lcFirst + '_collection'
    }
    // Standard pluralization for 'y' ending (consonant + y -> ies)
    if (entityName.endsWith('y') && !entityName.endsWith('ay') && !entityName.endsWith('ey') && !entityName.endsWith('oy') && !entityName.endsWith('uy')) {
      return lcFirst.slice(0, -1) + 'ies'
    }
    return lcFirst + 's'
  }, [])

  // Available fields for ordering (from current selection)
  const availableOrderByFields = useMemo(() => {
    if (!activeEntity || !selectedFields.has(activeEntity)) return []
    return Array.from(selectedFields.get(activeEntity) || [])
  }, [activeEntity, selectedFields])

  // Generate current query
  const currentQuery = useMemo(() => {
    if (!activeEntity || !selectedFields.has(activeEntity)) {
      return '# Select an entity and fields from the schema explorer'
    }

    const fields = Array.from(selectedFields.get(activeEntity) || [])
    if (fields.length === 0) {
      return '# Select fields from the schema explorer to build your query'
    }

    return generateQuery({
      entity: activeEntity,
      pluralName: getEntityPluralName(activeEntity),
      fields,
      first,
      skip,
      orderBy,
      orderDirection,
      whereClause,
    })
  }, [activeEntity, selectedFields, first, skip, orderBy, orderDirection, whereClause, getEntityPluralName])

  // Handle field toggle
  const handleFieldToggle = useCallback((entity: string, field: string, add: boolean) => {
    setSelectedFields(prev => {
      const newMap = new Map(prev)
      const entityFields = new Set(newMap.get(entity) || [])

      if (add) {
        entityFields.add(field)
        setActiveEntity(entity)
      } else {
        entityFields.delete(field)
      }

      if (entityFields.size === 0) {
        newMap.delete(entity)
        if (entity === activeEntity) {
          // Find another entity with fields
          const nextEntity = Array.from(newMap.keys())[0] || ''
          setActiveEntity(nextEntity)
        }
      } else {
        newMap.set(entity, entityFields)
      }

      return newMap
    })
  }, [activeEntity])

  // Handle entity select (for schema explorer callback)
  const handleEntitySelect = useCallback((entity: { name: string }) => {
    setActiveEntity(entity.name)
  }, [])

  // Reset order by when entity changes
  useEffect(() => {
    if (!availableOrderByFields.includes(orderBy)) {
      const defaultOrder = availableOrderByFields.find(f =>
        ['blockTimestamp', 'blockNumber', 'timestamp', 'createdAt', 'id'].includes(f)
      ) || ''
      setOrderBy(defaultOrder)
    }
  }, [availableOrderByFields, orderBy])

  // Execute query
  const executeQuery = async () => {
    if (!selectedConfig || !currentQuery.includes('{')) return

    setLoading(true)
    setResult(null)
    const startTime = Date.now()

    try {
      const queryResult = await provider.query(selectedConfig.endpoint, currentQuery)
      setExecutionTime(Date.now() - startTime)
      setResult(queryResult)
    } catch (error) {
      setExecutionTime(Date.now() - startTime)
      setResult({
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Query failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyQuery = () => {
    navigator.clipboard.writeText(currentQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadResult = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query-result.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (subgraphs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No subgraphs configured</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Subgraph selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedSubgraph} onValueChange={(v) => {
          setSelectedSubgraph(v)
          setSelectedFields(new Map())
          setActiveEntity('')
        }}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select subgraph" />
          </SelectTrigger>
          <SelectContent>
            {subgraphs.map((subgraph) => (
              <SelectItem key={subgraph.id} value={subgraph.id}>
                {subgraph.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 border rounded-md p-1">
          <Button
            variant={viewMode === 'builder' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('builder')}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Builder
          </Button>
          <Button
            variant={viewMode === 'query' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('query')}
          >
            <Code className="h-4 w-4 mr-1" />
            Query
          </Button>
        </div>
      </div>

      {selectedConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Schema Explorer */}
          <div className="lg:col-span-1">
            <SchemaExplorer
              schemaContent={selectedConfig.schemaContent || ''}
              selectedFields={selectedFields}
              onFieldToggle={handleFieldToggle}
              onEntitySelect={handleEntitySelect}
            />
          </div>

          {/* Query Builder / Preview */}
          <div className="lg:col-span-2 space-y-4">
            {viewMode === 'builder' ? (
              <>
                {/* Query Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Query Options
                      {activeEntity && (
                        <Badge variant="outline" className="ml-2">
                          {activeEntity}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">First (limit)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={first}
                          onChange={(e) => setFirst(parseInt(e.target.value) || 10)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Skip (offset)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={skip}
                          onChange={(e) => setSkip(parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Order By</Label>
                        <Select value={orderBy || '_none'} onValueChange={(v) => setOrderBy(v === '_none' ? '' : v)}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">None</SelectItem>
                            {availableOrderByFields.map(field => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Direction</Label>
                        <Select
                          value={orderDirection}
                          onValueChange={(v) => setOrderDirection(v as 'asc' | 'desc')}
                          disabled={!orderBy}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Where clause */}
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs">Where Filter (JSON)</Label>
                      <Input
                        value={whereClause}
                        onChange={(e) => setWhereClause(e.target.value)}
                        placeholder='{ "field": "value" }'
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Query Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Generated Query
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyQuery}
                          className="h-7"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={executeQuery}
                          disabled={loading || !selectedConfig || !currentQuery.includes('{')}
                          className="h-7"
                        >
                          {loading ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 mr-1" />
                          )}
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted/50 p-4 rounded-md font-mono text-sm overflow-auto max-h-[200px]">
                      {currentQuery}
                    </pre>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Full Query Editor Mode */
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Query Editor</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyQuery}
                        className="h-7"
                      >
                        {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={executeQuery}
                        disabled={loading || !selectedConfig}
                        className="h-7"
                      >
                        {loading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 p-4 rounded-md font-mono text-sm overflow-auto min-h-[300px]">
                    {currentQuery}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">
                        {result.error ? 'Error' : 'Results'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {result.error
                          ? 'Query execution failed'
                          : `${Array.isArray(result.data) ? result.data.length : 1} result(s)`
                        }
                        {executionTime !== null && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            {executionTime}ms
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {!result.error && (
                      <Button variant="outline" size="sm" onClick={downloadResult} className="h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <pre className="font-mono text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
