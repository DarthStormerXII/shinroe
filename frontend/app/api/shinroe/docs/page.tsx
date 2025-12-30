'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, ExternalLink } from 'lucide-react'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/shinroe/score/{address}',
    description: 'Get Shinroe score for an Ethereum address',
    headers: { 'x-api-key': 'your-api-key (optional for internal requests)' },
    response: {
      address: '0x...',
      score: 750,
      tier: 'excellent',
      verified: true,
      timestamp: 1703520000000,
    },
  },
  {
    method: 'POST',
    path: '/api/shinroe/verify',
    description: 'Verify a claimed score against on-chain data',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key (optional for internal requests)',
    },
    body: { address: '0x...', claimedScore: 750, salt: 'optional-salt' },
    response: { verified: true, address: '0x...', timestamp: 1703520000000 },
  },
  {
    method: 'GET',
    path: '/api/shinroe/endorsements/{address}',
    description: 'Get endorsement data for an address',
    headers: { 'x-api-key': 'your-api-key (optional for internal requests)' },
    response: {
      received: 5,
      given: 3,
      totalWeight: '1500000000000000000',
      endorsements: [{ type: 'general', stake: '100000000000000000', from: '0x...', createdAt: 1703520000 }],
    },
  },
]

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm border">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

function EndpointCard({ endpoint }: { endpoint: (typeof ENDPOINTS)[0] }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-mono ${
              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono">{endpoint.path}</code>
        </CardTitle>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Headers</h4>
          <CodeBlock code={JSON.stringify(endpoint.headers, null, 2)} />
        </div>
        {'body' in endpoint && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Request Body</h4>
            <CodeBlock code={JSON.stringify(endpoint.body, null, 2)} />
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Response</h4>
          <CodeBlock code={JSON.stringify(endpoint.response, null, 2)} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ApiDocsPage() {
  const [testAddress, setTestAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f1eB2a')

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shinroe API Documentation</h1>
        <p className="text-muted-foreground">
          REST API endpoints for querying Shinroe reputation scores. Use these endpoints to integrate reputation data
          into your dApp.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>API key required for external requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Include the <code className="px-1 py-0.5 rounded bg-muted">x-api-key</code> header with your API key for
            external requests. Internal requests from localhost are allowed without an API key.
          </p>
          <div>
            <h4 className="text-sm font-medium mb-2">Rate Limits</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>100 requests per minute per API key</li>
              <li>Rate limit headers included in response</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        {ENDPOINTS.map((endpoint, i) => (
          <EndpointCard key={i} endpoint={endpoint} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Test</CardTitle>
          <CardDescription>Test the score endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter address..."
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              className="font-mono"
            />
            <Button
              onClick={() => window.open(`/api/shinroe/score/${testAddress}`, '_blank')}
              className="flex items-center gap-2"
            >
              Test <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <CodeBlock code={`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/shinroe/score/${testAddress}" \\
  -H "x-api-key: your-api-key"`} language="bash" />
        </CardContent>
      </Card>
    </div>
  )
}
