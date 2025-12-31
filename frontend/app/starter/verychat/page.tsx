'use client'

import { VeryChatAuthTest } from '@/components/verychat/verychat-auth-test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

const isVeryChatConfigured = !!process.env.NEXT_PUBLIC_VERYCHAT_PROJECT_ID

export default function VeryChatTestPage() {
  if (!isVeryChatConfigured) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">VeryChat Authentication Test</h1>
        <div className="max-w-2xl">
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                VeryChat Not Configured
              </CardTitle>
              <CardDescription>
                VeryChat integration is disabled because the required environment variable is not set.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To enable VeryChat, add the following to your <code className="bg-muted px-1 rounded">.env.local</code>:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                NEXT_PUBLIC_VERYCHAT_PROJECT_ID=your_project_id
              </pre>
              <p className="text-sm text-muted-foreground">
                Then restart the development server.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">VeryChat Authentication Test</h1>
      <div className="max-w-2xl">
        <VeryChatAuthTest />
      </div>
    </div>
  )
}
