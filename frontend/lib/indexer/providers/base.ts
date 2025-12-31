/**
 * Base Indexer Provider
 * Abstract implementation with shared functionality
 */

import {
  IIndexerProvider,
  IndexerProvider,
  ProviderInfo,
  NetworkConfig,
  EndpointConfig,
  DeploymentStep,
  DeploymentConfig,
  QueryResult,
  ConnectionStatus,
  SubgraphMeta,
} from '../types';

export abstract class BaseIndexerProvider implements IIndexerProvider {
  abstract readonly id: IndexerProvider;
  abstract readonly name: string;
  abstract readonly info: ProviderInfo;

  abstract getNetworks(): NetworkConfig[];
  abstract buildEndpoint(config: EndpointConfig): string;
  abstract parseEndpoint(url: string): Partial<EndpointConfig> | null;
  abstract getDeploymentSteps(): DeploymentStep[];
  abstract getCliInstallCommand(): string;
  abstract getDeployCommand(config: DeploymentConfig): string;

  /**
   * Execute a GraphQL query against the subgraph endpoint
   */
  async query<T>(
    endpoint: string,
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<QueryResult<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        return {
          data: [],
          loading: false,
          error: result.errors.map((e: { message: string }) => e.message).join(', '),
        };
      }

      // Extract the first key from data (the query result)
      const dataKey = Object.keys(result.data || {})[0];
      const data = dataKey ? result.data[dataKey] : [];

      return {
        data: Array.isArray(data) ? data : [data].filter(Boolean),
        loading: false,
      };
    } catch (error) {
      return {
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    }
  }

  /**
   * Test connection to the subgraph endpoint
   */
  async testConnection(endpoint: string): Promise<ConnectionStatus> {
    const startTime = Date.now();

    try {
      const meta = await this.fetchMeta(endpoint);

      return {
        connected: true,
        latency: Date.now() - startTime,
        meta: meta || undefined,
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Fetch subgraph metadata
   */
  async fetchMeta(endpoint: string): Promise<SubgraphMeta | null> {
    const query = `
      query {
        _meta {
          deployment
          hasIndexingErrors
          block {
            number
            hash
            timestamp
          }
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors || !result.data?._meta) {
        return null;
      }

      return result.data._meta;
    } catch {
      return null;
    }
  }

  /**
   * Introspect the GraphQL schema from the endpoint
   */
  async introspectSchema(endpoint: string): Promise<string | null> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: introspectionQuery }),
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();

      if (result.errors || !result.data?.__schema) {
        return null;
      }

      return JSON.stringify(result.data.__schema, null, 2);
    } catch {
      return null;
    }
  }
}
