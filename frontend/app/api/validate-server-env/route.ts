import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'
import {
  REQUIRED_SERVER_ENV_VARS,
  OPTIONAL_SERVER_ENV_VARS
} from '@/lib/config/env-config'

// Server environment variable descriptions and categories
const SERVER_ENV_VAR_INFO: Record<string, { description: string; category: string }> = {
  // AI Features
  GEMINI_API_KEY: {
    description: 'Google Gemini AI API key for transaction summaries',
    category: 'AI Features'
  },
  GEMINI_MODEL: {
    description: 'Gemini model to use (default: gemini-2.0-flash-lite)',
    category: 'AI Features'
  },
  DISABLE_AI_SUMMARIES: {
    description: 'Disable AI transaction summaries',
    category: 'AI Features'
  },

  // Blockchain Analysis
  TENDERLY_ACCESS_TOKEN: {
    description: 'Tenderly access token for transaction simulation',
    category: 'Blockchain Analysis'
  },

  // File Storage
  PINATA_JWT: {
    description: 'Pinata JWT token for IPFS file storage',
    category: 'File Storage'
  },

  // Database
  DATABASE_URL: {
    description: 'Database connection string',
    category: 'Database'
  },
  MONGODB_URI: {
    description: 'MongoDB connection URI',
    category: 'Database'
  },

  // Authentication
  NEXTAUTH_SECRET: {
    description: 'NextAuth.js secret for session encryption',
    category: 'Authentication'
  },
  NEXTAUTH_URL: {
    description: 'NextAuth.js canonical URL',
    category: 'Authentication'
  }
}

type ServerEnvVarKey = typeof REQUIRED_SERVER_ENV_VARS[number] | typeof OPTIONAL_SERVER_ENV_VARS[number]
type AssetValidationResult = {
  valid: boolean
  missing: string[]
  present: string[]
  warnings: string[]
}

type ValidationResult = {
  valid: boolean
  missing: ServerEnvVarKey[]
  configured: ServerEnvVarKey[]
  warnings: string[]
  assets: AssetValidationResult
  categories: Record<string, {
    configured: number
    total: number
    vars: Array<{
      name: string
      configured: boolean
      description: string
    }>
  }>
}

// Required static assets for the application
const REQUIRED_ASSETS = {
  // Chain logos
  '/chain-logos/base.png': 'Base chain logo',
  '/chain-logos/polygon.png': 'Polygon chain logo',
  '/chain-logos/flow.png': 'Flow chain logo',

  // Token logos
  '/token-logos/usdc.png': 'USDC token logo',
  '/token-logos/usdt.png': 'USDT token logo',
  '/token-logos/dai.png': 'DAI token logo',
  '/token-logos/weth.png': 'WETH token logo',
  '/token-logos/wbtc.png': 'WBTC token logo',

  // Generic fallback images
  '/images/chains/generic-chain.svg': 'Generic chain fallback icon',
  '/images/tokens/generic-token.svg': 'Generic token fallback icon'
} as const

function validateStaticAssets(): AssetValidationResult {
  const missing: string[] = []
  const present: string[] = []
  const warnings: string[] = []

  Object.entries(REQUIRED_ASSETS).forEach(([assetPath, description]) => {
    const fullPath = join(process.cwd(), 'public', assetPath)

    if (existsSync(fullPath)) {
      present.push(assetPath)
    } else {
      missing.push(assetPath)
      warnings.push(`Missing asset: ${assetPath} (${description})`)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
    present,
    warnings
  }
}

function validateServerEnvironment(): ValidationResult {
  const missing: ServerEnvVarKey[] = []
  const configured: ServerEnvVarKey[] = []
  const warnings: string[] = []
  const categories: ValidationResult['categories'] = {}

  // Process required server variables
  REQUIRED_SERVER_ENV_VARS.forEach(varName => {
    const key = varName as ServerEnvVarKey
    const value = process.env[varName]
    const isConfigured = Boolean(value && value.trim() !== '')
    const info = SERVER_ENV_VAR_INFO[varName]

    if (!isConfigured) {
      missing.push(key)
    } else {
      configured.push(key)
    }

    if (info) {
      // Organize by category
      if (!categories[info.category]) {
        categories[info.category] = {
          configured: 0,
          total: 0,
          vars: []
        }
      }

      categories[info.category].total++
      if (isConfigured) {
        categories[info.category].configured++
      }

      categories[info.category].vars.push({
        name: varName,
        configured: isConfigured,
        description: info.description
      })
    }
  })

  // Process optional server variables
  OPTIONAL_SERVER_ENV_VARS.forEach(varName => {
    const key = varName as ServerEnvVarKey
    const value = process.env[varName]
    const isConfigured = Boolean(value && value.trim() !== '')
    const info = SERVER_ENV_VAR_INFO[varName]

    if (isConfigured) {
      configured.push(key)
    }

    if (info) {
      // Organize by category
      if (!categories[info.category]) {
        categories[info.category] = {
          configured: 0,
          total: 0,
          vars: []
        }
      }

      categories[info.category].total++
      if (isConfigured) {
        categories[info.category].configured++
      }

      categories[info.category].vars.push({
        name: varName,
        configured: isConfigured,
        description: info.description
      })
    }
  })

  // Add specific warnings
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_MODEL) {
    warnings.push('GEMINI_MODEL not set, using default: gemini-2.0-flash-lite')
  }

  if (process.env.TENDERLY_ACCESS_TOKEN && (!process.env.NEXT_PUBLIC_TENDERLY_USERNAME || !process.env.NEXT_PUBLIC_TENDERLY_PROJECT_SLUG)) {
    warnings.push('Tenderly access token configured but missing public Tenderly project info')
  }

  // Validate static assets
  const assets = validateStaticAssets()

  return {
    valid: missing.length === 0 && assets.valid,
    missing,
    configured,
    warnings: [...warnings, ...assets.warnings],
    assets,
    categories
  }
}

export async function GET() {
  try {
    const validation = validateServerEnvironment()

    return NextResponse.json({
      success: true,
      serverEnv: validation,
      assets: validation.assets,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Server environment validation error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate server environment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optionally support POST for specific validation requests
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { checkCategory } = body

    const validation = validateServerEnvironment()

    // Filter by category if specified
    if (checkCategory && validation.categories[checkCategory]) {
      return NextResponse.json({
        success: true,
        category: checkCategory,
        result: validation.categories[checkCategory],
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      serverEnv: validation,
      assets: validation.assets,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Server environment validation error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate server environment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}