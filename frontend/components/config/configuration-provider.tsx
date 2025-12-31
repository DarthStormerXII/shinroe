'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { EnvValidationDialog } from './env-validation-dialog'
import {
  type EnvConfig,
  type ServerValidationResult,
  parseEnvConfig,
  validateConfig,
  validateFullEnvironment,
  getClientEnvStatus,
  DEFAULT_CONFIG
} from '@/lib/config/env-config'
import { toast } from 'sonner'

interface ConfigurationContextType {
  config: EnvConfig
  isConfigured: boolean
  isInitializing: boolean
  showConfigDialog: () => void
  hideConfigDialog: () => void
  updateConfig: (newConfig: Partial<EnvConfig>) => void
  missingVars: string[]
  recommendedVars: string[]
  serverValidation?: ServerValidationResult
  refreshServerValidation: (config?: EnvConfig) => Promise<void>
  isValidatingServer: boolean
  clientEnvStatus: { present: string[]; missing: string[]; values: Record<string, string> }
}

const ConfigurationContext = createContext<ConfigurationContextType | null>(null)

export function useConfiguration() {
  const context = useContext(ConfigurationContext)
  if (!context) {
    throw new Error('useConfiguration must be used within ConfigurationProvider')
  }
  return context
}

interface ConfigurationProviderProps {
  children: ReactNode
}

// Always use DEFAULT_CONFIG for initial render to avoid hydration mismatch
// Client-side config is loaded in useEffect after hydration
const initialValidation = validateConfig(DEFAULT_CONFIG)

export function ConfigurationProvider({ children }: ConfigurationProviderProps) {
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG)
  const [showDialog, setShowDialog] = useState(false)
  const [missingVars, setMissingVars] = useState<string[]>(initialValidation.missing)
  const [recommendedVars, setRecommendedVars] = useState<string[]>(initialValidation.recommended)
  const [isConfigured, setIsConfigured] = useState(initialValidation.valid)
  const [isInitializing, setIsInitializing] = useState(true)
  const [serverValidation, setServerValidation] = useState<ServerValidationResult>()
  const [isValidatingServer, setIsValidatingServer] = useState(false)
  const [clientEnvStatus, setClientEnvStatus] = useState<{ present: string[]; missing: string[]; values: Record<string, string> }>({
    present: [],
    missing: [],
    values: {}
  })

  const refreshServerValidation = async (configToUse?: EnvConfig) => {
    if (typeof window === 'undefined') return // Skip on server

    setIsValidatingServer(true)
    try {
      const currentConfig = configToUse || config
      const fullValidation = await validateFullEnvironment(currentConfig)
      setServerValidation(fullValidation.serverSide)
    } catch (error) {
      console.warn('Failed to validate server environment:', error)
      setServerValidation(undefined)
    } finally {
      setIsValidatingServer(false)
    }
  }

  // Initialize configuration on mount (after hydration)
  useEffect(() => {
    const initializeConfig = async () => {
      // Parse env config on client after hydration
      const envConfig = parseEnvConfig()
      const envValidation = validateConfig(envConfig)

      // Check localStorage for saved config first
      const savedConfig = localStorage.getItem('web3-app-config')
      let configToUse = envConfig
      let validation = envValidation

      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig) as EnvConfig
          const savedValidation = validateConfig(parsedConfig)
          if (savedValidation.valid) {
            configToUse = parsedConfig
            validation = savedValidation
          }
        } catch (error) {
          console.warn('Failed to parse saved configuration:', error)
          localStorage.removeItem('web3-app-config')
        }
      }

      // Update state with resolved config
      setConfig(configToUse)
      setMissingVars(validation.missing)
      setRecommendedVars(validation.recommended)
      setIsConfigured(validation.valid)

      const clientStatus = getClientEnvStatus()
      setClientEnvStatus(clientStatus)

      // Show dialog if not configured and not using defaults
      if (!validation.valid && !configToUse.isDefaults) {
        setShowDialog(true)
      }

      // Load server-side validation in background (non-blocking)
      refreshServerValidation(configToUse).finally(() => {
        setIsInitializing(false)
      })
    }

    initializeConfig()
  }, [])

  const showConfigDialog = () => {
    setShowDialog(true)
  }

  const hideConfigDialog = () => {
    setShowDialog(false)
  }

  const updateConfig = (newConfig: Partial<EnvConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    const validation = validateConfig(updatedConfig)

    setConfig(updatedConfig)
    setMissingVars(validation.missing)
    setRecommendedVars(validation.recommended)
    setIsConfigured(validation.valid)

    if (validation.valid) {
      toast.success('Configuration updated successfully!')

      // Store configuration in localStorage for development
      if (typeof window !== 'undefined') {
        localStorage.setItem('web3-app-config', JSON.stringify(updatedConfig))
      }
    } else {
      toast.error(`Configuration incomplete: ${validation.missing.join(', ')}`)
    }
  }

  const contextValue: ConfigurationContextType = useMemo(() => ({
    config,
    isConfigured,
    isInitializing,
    showConfigDialog,
    hideConfigDialog,
    updateConfig,
    missingVars,
    recommendedVars,
    serverValidation,
    refreshServerValidation,
    isValidatingServer,
    clientEnvStatus
  }), [config, isConfigured, isInitializing, missingVars, recommendedVars, serverValidation, isValidatingServer, clientEnvStatus])

  // Render children immediately - no blocking
  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}

      {/* Environment Validation Dialog */}
      <EnvValidationDialog
        open={showDialog}
        onClose={hideConfigDialog}
        serverValidation={serverValidation}
        clientEnvStatus={clientEnvStatus}
      />
    </ConfigurationContext.Provider>
  )
}