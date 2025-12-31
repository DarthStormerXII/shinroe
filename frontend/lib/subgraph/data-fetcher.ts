'use client'

import { SubgraphConfig, SubgraphQueryResult, GraphQLEntity } from './types'

export interface QueryOptions {
  first?: number
  skip?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  where?: Record<string, any>
}

export class SubgraphDataFetcher {
  private config: SubgraphConfig

  constructor(config: SubgraphConfig) {
    this.config = config
  }

  /**
   * Execute a GraphQL query against the subgraph
   */
  async executeQuery(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<{ data?: any; errors?: any[] }> {
    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('GraphQL query failed:', error)
      return {
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
      }
    }
  }

  /**
   * Fetch data for a specific entity
   */
  async fetchEntityData(
    entity: GraphQLEntity,
    options: QueryOptions = {}
  ): Promise<SubgraphQueryResult> {
    const result: SubgraphQueryResult = {
      subgraphId: this.config.id,
      entityName: entity.name,
      data: [],
      loading: true
    }

    try {
      const queryName = this.getQueryName(entity.name)
      const fieldSelections = this.generateFieldSelections(entity.fields)

      // Build query variables
      const queryVariables: Record<string, any> = {
        first: options.first || 10,
        skip: options.skip || 0
      }

      if (options.orderBy) {
        queryVariables.orderBy = options.orderBy
      }

      if (options.orderDirection) {
        queryVariables.orderDirection = options.orderDirection
      }

      // Build the GraphQL query
      const query = `
        query Get${entity.name}Data(
          $first: Int!
          $skip: Int!
          ${options.orderBy ? '$orderBy: String' : ''}
          ${options.orderDirection ? '$orderDirection: String' : ''}
        ) {
          ${queryName}(
            first: $first
            skip: $skip
            ${options.orderBy ? 'orderBy: $orderBy' : ''}
            ${options.orderDirection ? 'orderDirection: $orderDirection' : ''}
          ) {
            ${fieldSelections}
          }
        }
      `

      const response = await this.executeQuery(query, queryVariables)

      if (response.errors) {
        result.error = response.errors.map((e: any) => e.message).join(', ')
      } else if (response.data) {
        result.data = response.data[queryName] || []
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      result.loading = false
    }

    return result
  }

  /**
   * Fetch a single entity by ID
   */
  async fetchEntityById(
    entity: GraphQLEntity,
    id: string
  ): Promise<SubgraphQueryResult> {
    const result: SubgraphQueryResult = {
      subgraphId: this.config.id,
      entityName: entity.name,
      data: [],
      loading: true
    }

    try {
      const entityName = entity.name.toLowerCase()
      const fieldSelections = this.generateFieldSelections(entity.fields)

      const query = `
        query Get${entity.name}ById($id: ID!) {
          ${entityName}(id: $id) {
            ${fieldSelections}
          }
        }
      `

      const response = await this.executeQuery(query, { id })

      if (response.errors) {
        result.error = response.errors.map((e: any) => e.message).join(', ')
      } else if (response.data && response.data[entityName]) {
        result.data = [response.data[entityName]]
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      result.loading = false
    }

    return result
  }

  /**
   * Test the subgraph connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try a simple introspection query
      const query = `
        query {
          _meta {
            block {
              number
              hash
            }
          }
        }
      `

      const response = await this.executeQuery(query)

      if (response.errors) {
        return {
          success: false,
          error: response.errors.map((e: any) => e.message).join(', ')
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  private getQueryName(entityName: string): string {
    // Convert PascalCase to camelCase and pluralize
    const camelCase = entityName.charAt(0).toLowerCase() + entityName.slice(1)

    // Simple pluralization
    if (camelCase.endsWith('s')) {
      return camelCase
    } else if (camelCase.endsWith('y')) {
      return camelCase.slice(0, -1) + 'ies'
    } else {
      return camelCase + 's'
    }
  }

  private generateFieldSelections(fields: any[]): string {
    return fields
      .filter(field => this.isScalarType(field.type))
      .map(field => field.name)
      .join('\n            ')
  }

  private isScalarType(type: string): boolean {
    const scalarTypes = [
      'String',
      'Int',
      'Float',
      'Boolean',
      'ID',
      'BigInt',
      'BigDecimal',
      'Bytes'
    ]

    return scalarTypes.includes(type)
  }
}

/**
 * Hook for fetching subgraph data in React components
 */
export function useSubgraphData(configs: SubgraphConfig[]) {
  return {
    async fetchEntityData(
      configId: string,
      entity: GraphQLEntity,
      options?: QueryOptions
    ): Promise<SubgraphQueryResult> {
      const config = configs.find(c => c.id === configId)
      if (!config) {
        return {
          subgraphId: configId,
          entityName: entity.name,
          data: [],
          error: 'Subgraph configuration not found',
          loading: false
        }
      }

      const fetcher = new SubgraphDataFetcher(config)
      return fetcher.fetchEntityData(entity, options)
    },

    async testConnection(configId: string): Promise<{ success: boolean; error?: string }> {
      const config = configs.find(c => c.id === configId)
      if (!config) {
        return { success: false, error: 'Subgraph configuration not found' }
      }

      const fetcher = new SubgraphDataFetcher(config)
      return fetcher.testConnection()
    }
  }
}