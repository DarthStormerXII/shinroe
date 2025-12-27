'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, Copy, RefreshCw, AlertCircle, Download, Wand2, Code } from 'lucide-react'
import type { IIndexerProvider, QueryResult } from '@/lib/indexer/types'
import { VisualQueryBuilder } from './visual-query-builder'

// Simple subgraph type for the playground (just the fields we need)
interface PlaygroundSubgraph {
  id: string
  name: string
  endpoint: string
  schemaContent?: string
}

interface QueryPlaygroundProps {
  provider: IIndexerProvider
  subgraphs: PlaygroundSubgraph[]
}

const EXAMPLE_QUERIES = {
  basic: `query {
  # Replace 'entities' with your entity name (plural, lowercase)
  entities(first: 10) {
    id
    # Add your fields here
  }
}`,
  withOrdering: `query {
  entities(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    timestamp
    # Add more fields
  }
}`,
  withFilter: `query {
  entities(
    first: 10
    where: { status: "active" }
  ) {
    id
    status
    # Add more fields
  }
}`,
  pagination: `query GetEntities($first: Int!, $skip: Int!) {
  entities(first: $first, skip: $skip) {
    id
    # Add your fields
  }
}`,
  meta: `query {
  _meta {
    block {
      number
      hash
      timestamp
    }
    deployment
    hasIndexingErrors
  }
}`
}

export function QueryPlayground({ provider, subgraphs }: QueryPlaygroundProps) {
  const [mode, setMode] = useState<'visual' | 'raw'>('visual')
  const [selectedSubgraph, setSelectedSubgraph] = useState<string>('')
  const [query, setQuery] = useState(EXAMPLE_QUERIES.basic)
  const [variables, setVariables] = useState('{}')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const selectedConfig = subgraphs.find(s => s.id === selectedSubgraph)

  const executeQuery = async () => {
    if (!selectedConfig) return

    setLoading(true)
    setResult(null)

    const startTime = Date.now()

    try {
      let parsedVariables = {}
      try {
        parsedVariables = JSON.parse(variables)
      } catch {
        // Invalid JSON, use empty object
      }

      const queryResult = await provider.query(
        selectedConfig.endpoint,
        query,
        parsedVariables
      )

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

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))
    }
  }

  const downloadResult = () => {
    if (result) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'query-result.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const loadExample = (example: keyof typeof EXAMPLE_QUERIES) => {
    setQuery(EXAMPLE_QUERIES[example])
    if (example === 'pagination') {
      setVariables(JSON.stringify({ first: 10, skip: 0 }, null, 2))
    } else {
      setVariables('{}')
    }
  }

  return (
    <div className="space-y-6">
      {subgraphs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No subgraphs configured</p>
              <p className="text-sm">Add a subgraph first to use the query playground</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 border rounded-md p-1 w-fit">
            <Button
              variant={mode === 'visual' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('visual')}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Visual Builder
            </Button>
            <Button
              variant={mode === 'raw' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('raw')}
            >
              <Code className="h-4 w-4 mr-1" />
              Raw Query
            </Button>
          </div>

          {mode === 'visual' ? (
            /* Visual Query Builder Mode */
            <VisualQueryBuilder provider={provider} subgraphs={subgraphs} />
          ) : (
            /* Raw Query Editor Mode */
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>GraphQL Query</CardTitle>
                      <CardDescription>
                        Write and execute GraphQL queries against your subgraph
                      </CardDescription>
                    </div>
                    <Select value={selectedSubgraph} onValueChange={setSelectedSubgraph}>
                      <SelectTrigger className="w-[250px]">
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
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Example Queries */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Examples:</span>
                    <Button variant="outline" size="sm" onClick={() => loadExample('basic')}>
                      Basic Query
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadExample('withOrdering')}>
                      With Ordering
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadExample('withFilter')}>
                      With Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadExample('pagination')}>
                      Pagination
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => loadExample('meta')}>
                      Subgraph Meta
                    </Button>
                  </div>

                  {/* Query Input */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-sm font-medium">Query</label>
                      <Textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter your GraphQL query..."
                        className="font-mono text-sm min-h-[300px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Variables (JSON)</label>
                      <Textarea
                        value={variables}
                        onChange={(e) => setVariables(e.target.value)}
                        placeholder="{}"
                        className="font-mono text-sm min-h-[300px]"
                      />
                    </div>
                  </div>

                  {/* Execute Button */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={executeQuery}
                      disabled={loading || !selectedSubgraph}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Execute Query
                        </>
                      )}
                    </Button>
                    {executionTime !== null && (
                      <Badge variant="secondary">
                        {executionTime}ms
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {result.error ? 'Error' : 'Results'}
                        </CardTitle>
                        <CardDescription>
                          {result.error
                            ? 'Query execution failed'
                            : `${Array.isArray(result.data) ? result.data.length : 1} result(s)`
                          }
                        </CardDescription>
                      </div>
                      {!result.error && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={copyResult}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadResult}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
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
                      <div className="rounded-md border bg-muted/50 p-4 overflow-auto max-h-[500px]">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
