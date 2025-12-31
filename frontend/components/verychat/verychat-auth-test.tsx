'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageCircle, CheckCircle, XCircle, RefreshCw, LogOut } from 'lucide-react'
import { useVeryChatAuth } from '@/lib/hooks/use-verychat-auth'
import { useTranslation } from '@/lib/i18n'

export function VeryChatAuthTest() {
  const { t } = useTranslation()
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    step,
    requestCode,
    verifyAndGetTokens,
    logout,
    clearError,
    accessToken,
    refreshSession,
    validateSession,
    isConfigured,
  } = useVeryChatAuth()

  const [handleId, setHandleId] = useState(() => t('demoPrefill.veryChatHandle'))
  const [verificationCode, setVerificationCode] = useState('')
  const [validationResult, setValidationResult] = useState<boolean | null>(null)

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            VeryChat Auth Test
          </CardTitle>
          <CardDescription>Test VeryChat member authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              VeryChat is not configured. Set NEXT_PUBLIC_VERYCHAT_PROJECT_ID in your .env file.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const handleRequestCode = async () => {
    if (!handleId.trim()) return
    await requestCode(handleId.trim())
  }

  const handleVerify = async () => {
    if (!verificationCode.trim()) return
    const code = parseInt(verificationCode, 10)
    if (isNaN(code)) return
    await verifyAndGetTokens(handleId.trim(), code)
  }

  const handleValidate = async () => {
    const result = await validateSession()
    setValidationResult(result)
    setTimeout(() => setValidationResult(null), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              VeryChat Auth Test
            </CardTitle>
            <CardDescription>Test VeryChat member authentication API</CardDescription>
          </div>
          <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            {/* Step 1: Enter Handle ID */}
            <div className="space-y-2">
              <Label htmlFor="handleId">VeryChat Handle ID</Label>
              <div className="flex gap-2">
                <Input
                  id="handleId"
                  placeholder="@username or username"
                  value={handleId}
                  onChange={(e) => setHandleId(e.target.value)}
                  disabled={step === 'verifying' || isLoading}
                />
                <Button
                  onClick={handleRequestCode}
                  disabled={!handleId.trim() || isLoading || step === 'verifying'}
                >
                  {isLoading && step === 'requesting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send Code'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A verification code will be sent via VeryChat push notification
              </p>
            </div>

            {/* Step 2: Enter Verification Code */}
            {step === 'verifying' && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <Button onClick={handleVerify} disabled={verificationCode.length !== 6 || isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to your VeryChat
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Authenticated State */}
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Authenticated as <strong>{user?.profileName || user?.profileId}</strong>
              </AlertDescription>
            </Alert>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {user.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.profileName}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.profileName}</p>
                  <p className="text-sm text-muted-foreground">@{user.profileId}</p>
                </div>
              </div>
            )}

            {/* Token Info */}
            <div className="space-y-2">
              <Label>Access Token</Label>
              <code className="block p-2 bg-muted rounded text-xs overflow-x-auto">
                {accessToken?.slice(0, 50)}...
              </code>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleValidate} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Validate Token
              </Button>
              <Button variant="outline" onClick={refreshSession} disabled={isLoading}>
                Refresh Token
              </Button>
              <Button variant="destructive" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {validationResult !== null && (
              <Alert variant={validationResult ? 'default' : 'destructive'}>
                {validationResult ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  Token is {validationResult ? 'valid' : 'invalid or expired'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
