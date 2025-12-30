// VeryChat API Types

export interface VeryChatUser {
  profileId: string
  profileName: string
  profileImage: string
}

export interface VeryChatTokens {
  accessToken: string
  refreshToken: string
  user: VeryChatUser
}

export interface VeryChatError {
  statusCode: number
  message: string
}

export interface RequestVerificationCodeParams {
  handleId: string
}

export interface VerifyCodeParams {
  handleId: string
  verificationCode: number
}

export interface GetTokensParams {
  handleId: string
  verificationCode: number
}

export interface RefreshTokensParams {
  handleId: string
  refreshToken: string
}

export interface VeryChatAuthState {
  isAuthenticated: boolean
  user: VeryChatUser | null
  accessToken: string | null
  refreshToken: string | null
  error: string | null
}

// Identity signals for reputation scoring
export interface VeryChatIdentitySignals {
  kycLevel: number // 0-3: None, Basic, Standard, Full
  accountAge: number // Days since account creation
  verifiedEmail: boolean
  verifiedPhone: boolean
  profileComplete: boolean
}

