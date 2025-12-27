'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Copy, Check, Terminal, Info, ExternalLink } from 'lucide-react'
import type { IIndexerProvider, DeploymentStep } from '@/lib/indexer/types'

interface DeploymentGuideProps {
  provider: IIndexerProvider
}

export function DeploymentGuide({ provider }: DeploymentGuideProps) {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)
  const steps = provider.getDeploymentSteps()

  const copyCommand = (command: string, stepId: string) => {
    navigator.clipboard.writeText(command)
    setCopiedStep(stepId)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Guide</CardTitle>
          <CardDescription>
            Follow these steps to deploy a subgraph to {provider.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Prerequisites:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Node.js 16+ installed</li>
                <li>Contract ABI file (JSON)</li>
                <li>Contract address and network</li>
                <li>Start block number (recommended for faster indexing)</li>
                {provider.id === 'thegraph' && (
                  <li>
                    Subgraph Studio account -{' '}
                    <a
                      href="https://thegraph.com/studio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Sign up here
                    </a>
                  </li>
                )}
                {provider.id === 'goldsky' && (
                  <li>
                    Goldsky account -{' '}
                    <a
                      href="https://app.goldsky.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Sign up here
                    </a>
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {steps.map((step, index) => (
              <AccordionItem key={step.id} value={step.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{step.title}</span>
                    {step.isOptional && (
                      <Badge variant="outline" className="ml-2">Optional</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 space-y-4">
                    <p className="text-muted-foreground">{step.description}</p>
                    {step.command && (
                      <div className="relative">
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-4 font-mono text-sm">
                          <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <code className="flex-1 overflow-x-auto">{step.command}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCommand(step.command!, step.id)}
                            className="flex-shrink-0"
                          >
                            {copiedStep === step.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Additional context for specific steps */}
                    {step.id === 'init' && provider.id === 'thegraph' && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This will prompt you to select the protocol (Ethereum/contract),
                          enter your contract address, and choose which events to index.
                        </AlertDescription>
                      </Alert>
                    )}
                    {step.id === 'deploy-abi' && provider.id === 'goldsky' && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Instant subgraphs automatically generate indexing code from your ABI.
                          Perfect for quick prototyping without writing AssemblyScript.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Start Template */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Commands</CardTitle>
          <CardDescription>
            Copy and run these commands to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">1. Install CLI</label>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
              <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <code className="flex-1">{provider.getCliInstallCommand()}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCommand(provider.getCliInstallCommand(), 'cli-install')}
              >
                {copiedStep === 'cli-install' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {provider.id === 'thegraph' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">2. Initialize Subgraph</label>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
                  <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1">graph init --studio my-subgraph</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand('graph init --studio my-subgraph', 'init')}
                  >
                    {copiedStep === 'init' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">3. Build & Deploy</label>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
                  <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1">graph codegen && graph build && graph deploy --studio my-subgraph</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand('graph codegen && graph build && graph deploy --studio my-subgraph', 'deploy')}
                  >
                    {copiedStep === 'deploy' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {provider.id === 'goldsky' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">2. Login</label>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
                  <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1">goldsky login</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand('goldsky login', 'login')}
                  >
                    {copiedStep === 'login' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">3. Deploy (choose one)</label>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">From source code:</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
                    <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <code className="flex-1">goldsky subgraph deploy my-subgraph/1.0.0 --path .</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCommand('goldsky subgraph deploy my-subgraph/1.0.0 --path .', 'deploy-source')}
                    >
                      {copiedStep === 'deploy-source' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Instant subgraph from ABI:</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm">
                    <Terminal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <code className="flex-1 overflow-x-auto">goldsky subgraph deploy my-subgraph/1.0.0 --from-abi ./abi.json --address 0x... --network mainnet</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCommand('goldsky subgraph deploy my-subgraph/1.0.0 --from-abi ./abi.json --address 0x... --network mainnet', 'deploy-abi')}
                    >
                      {copiedStep === 'deploy-abi' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={provider.info.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Terminal className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Official Documentation</p>
                <p className="text-sm text-muted-foreground">Complete guides and API reference</p>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>

            {provider.id === 'thegraph' && (
              <>
                <a
                  href="https://thegraph.com/docs/en/subgraphs/developing/creating-a-subgraph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Terminal className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Creating a Subgraph</p>
                    <p className="text-sm text-muted-foreground">Step-by-step tutorial</p>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://thegraph.com/docs/en/subgraphs/developing/assemblyscript-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Terminal className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">AssemblyScript API</p>
                    <p className="text-sm text-muted-foreground">Mapping functions reference</p>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </>
            )}

            {provider.id === 'goldsky' && (
              <>
                <a
                  href="https://docs.goldsky.com/subgraphs/deploying-subgraphs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Terminal className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Deployment Guide</p>
                    <p className="text-sm text-muted-foreground">Detailed deployment instructions</p>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://docs.goldsky.com/subgraphs/instant-subgraphs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Terminal className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Instant Subgraphs</p>
                    <p className="text-sm text-muted-foreground">Deploy without writing code</p>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
