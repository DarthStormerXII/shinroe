// VeryChat Authentication Service
// Provides VeryChat member authentication for testing

import type { VeryChatTokens, VeryChatUser, VeryChatIdentitySignals } from './verychat-types'

const VERYCHAT_API_URL = process.env.NEXT_PUBLIC_VERYCHAT_API_URL || 'https://gapi.veryapi.io'
const PROJECT_ID = process.env.NEXT_PUBLIC_VERYCHAT_PROJECT_ID

class VeryChatService {
  private projectId: string

  constructor() {
    if (!PROJECT_ID) {
      console.warn('VeryChat PROJECT_ID not configured')
    }
    this.projectId = PROJECT_ID || ''
  }

  /**
   * Normalize handleId by removing @ prefix if present
   */
  private normalizeHandleId(handleId: string): string {
    return handleId.replace(/^@/, '')
  }

  /**
   * Request a verification code to be sent via VeryChat
   * The code is sent as a push notification and private message
   */
  async requestVerificationCode(handleId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${VERYCHAT_API_URL}/auth/request-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: this.projectId,
        handleId: this.normalizeHandleId(handleId),
      }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Verification code sent' : 'Failed to send code'),
    }
  }

  /**
   * Verify code only (no token issuance)
   * Use for simple possession authentication
   */
  async verifyCode(handleId: string, verificationCode: number): Promise<boolean> {
    const response = await fetch(`${VERYCHAT_API_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: this.projectId,
        handleId: this.normalizeHandleId(handleId),
        verificationCode,
      }),
    })

    return response.ok
  }

  /**
   * Verify code and get tokens for authenticated session
   */
  async getTokens(handleId: string, verificationCode: number): Promise<VeryChatTokens> {
    const response = await fetch(`${VERYCHAT_API_URL}/auth/get-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: this.projectId,
        handleId: this.normalizeHandleId(handleId),
        verificationCode,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get tokens')
    }

    return response.json()
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(handleId: string, refreshToken: string): Promise<VeryChatTokens> {
    const response = await fetch(`${VERYCHAT_API_URL}/auth/refresh-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: this.projectId,
        handleId: this.normalizeHandleId(handleId),
        refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to refresh tokens')
    }

    return response.json()
  }

  /**
   * Validate an access token
   */
  async validateToken(accessToken: string): Promise<{ valid: boolean; payload?: unknown }> {
    const response = await fetch(`${VERYCHAT_API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        projectId: this.projectId,
      }),
    })

    if (!response.ok) {
      return { valid: false }
    }

    const data = await response.json()
    return {
      valid: data.data?.valid || false,
      payload: data.data?.payload,
    }
  }

  /**
   * Check if VeryChat is configured
   */
  isConfigured(): boolean {
    return !!this.projectId
  }

  /**
   * Get identity signals for reputation scoring
   * Returns null if the user is not found or API fails
   */
  async getIdentitySignals(_handleId: string): Promise<VeryChatIdentitySignals | null> {
    // TODO: Implement when VeryChat API supports identity signals
    // For now, return null to indicate no signals available
    return null
  }

}

export const verychatService = new VeryChatService()

// Re-export types for convenience
export type { VeryChatTokens, VeryChatUser, VeryChatError, VeryChatAuthState, VeryChatIdentitySignals } from './verychat-types'
