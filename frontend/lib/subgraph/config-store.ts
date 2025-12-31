'use client'

import { SubgraphConfig } from './types'

const STORAGE_KEY = 'subgraph_configs'

export class SubgraphConfigStore {
  private static instance: SubgraphConfigStore
  private configs: SubgraphConfig[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): SubgraphConfigStore {
    if (!SubgraphConfigStore.instance) {
      SubgraphConfigStore.instance = new SubgraphConfigStore()
    }
    return SubgraphConfigStore.instance
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.configs = JSON.parse(stored).map((config: any) => ({
          ...config,
          createdAt: new Date(config.createdAt),
          updatedAt: new Date(config.updatedAt)
        }))
      }
    } catch (error) {
      console.error('Failed to load subgraph configs from storage:', error)
      this.configs = []
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.configs))
    } catch (error) {
      console.error('Failed to save subgraph configs to storage:', error)
    }
  }

  getAllConfigs(): SubgraphConfig[] {
    return [...this.configs]
  }

  getActiveConfigs(): SubgraphConfig[] {
    return this.configs.filter(config => config.isActive)
  }

  getConfigById(id: string): SubgraphConfig | undefined {
    return this.configs.find(config => config.id === id)
  }

  addConfig(config: Omit<SubgraphConfig, 'id' | 'createdAt' | 'updatedAt'>): SubgraphConfig {
    const newConfig: SubgraphConfig = {
      ...config,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.configs.push(newConfig)
    this.saveToStorage()
    return newConfig
  }

  updateConfig(id: string, updates: Partial<SubgraphConfig>): SubgraphConfig | undefined {
    const index = this.configs.findIndex(config => config.id === id)
    if (index === -1) return undefined

    this.configs[index] = {
      ...this.configs[index],
      ...updates,
      updatedAt: new Date()
    }

    this.saveToStorage()
    return this.configs[index]
  }

  deleteConfig(id: string): boolean {
    const index = this.configs.findIndex(config => config.id === id)
    if (index === -1) return false

    this.configs.splice(index, 1)
    this.saveToStorage()
    return true
  }

  clearAllConfigs(): void {
    this.configs = []
    this.saveToStorage()
  }
}

// Hook for React components
export function useSubgraphConfigs() {
  const store = SubgraphConfigStore.getInstance()

  return {
    configs: store.getAllConfigs(),
    activeConfigs: store.getActiveConfigs(),
    addConfig: (config: Omit<SubgraphConfig, 'id' | 'createdAt' | 'updatedAt'>) => store.addConfig(config),
    updateConfig: (id: string, updates: Partial<SubgraphConfig>) => store.updateConfig(id, updates),
    deleteConfig: (id: string) => store.deleteConfig(id),
    getConfig: (id: string) => store.getConfigById(id),
    clearAll: () => store.clearAllConfigs()
  }
}