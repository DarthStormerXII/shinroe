/**
 * Indexer Types
 * Core type definitions for The Graph and Goldsky indexer integration
 */

// Provider Types
export type IndexerProvider = 'thegraph' | 'goldsky';

export interface ProviderInfo {
  id: IndexerProvider;
  name: string;
  description: string;
  features: string[];
  documentationUrl: string;
  logoUrl?: string;
}

// Network Configuration
export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  isTestnet: boolean;
  explorerUrl?: string;
}

// Subgraph Configuration
export interface SubgraphConfig {
  id: string;
  provider: IndexerProvider;
  name: string;
  slug: string;
  version: string;
  network: string;
  endpoint: string;
  apiKey?: string;
  schemaContent: string;
  description?: string;
  // Provider-specific
  studioUrl?: string;        // The Graph Studio URL
  dashboardUrl?: string;     // Goldsky dashboard URL
  // Status
  status: SubgraphStatus;
  lastSyncedBlock?: number;
  latestBlock?: number;
  syncPercentage?: number;
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubgraphStatus = 'syncing' | 'synced' | 'failed' | 'paused' | 'unknown';

// Entity Types (parsed from schema)
export interface GraphQLEntity {
  name: string;
  pluralName: string;
  fields: GraphQLField[];
  isTimeseries: boolean;
  isImmutable: boolean;
  directives: string[];
}

export interface GraphQLField {
  name: string;
  type: string;
  baseType: string;
  isRequired: boolean;
  isArray: boolean;
  isRelation: boolean;
  relatedEntity?: string;
  description?: string;
}

// Query Types
export interface QueryOptions {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, unknown>;
}

export interface QueryResult<T = unknown> {
  data: T[];
  loading: boolean;
  error?: string;
  metadata?: {
    entityName: string;
    totalCount?: number;
    hasMore?: boolean;
  };
}

// Connection Types
export interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  error?: string;
  meta?: SubgraphMeta;
}

export interface SubgraphMeta {
  deployment?: string;
  block?: {
    number: number;
    hash: string;
    timestamp?: number;
  };
  hasIndexingErrors?: boolean;
}

// Deployment Types
export interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  isOptional?: boolean;
}

export interface DeploymentConfig {
  provider: IndexerProvider;
  subgraphName: string;
  version: string;
  network: string;
  startBlock?: number;
  contractAddress: string;
  contractName: string;
  abiPath?: string;
}

// Endpoint Configuration
export interface EndpointConfig {
  provider: IndexerProvider;
  network: string;
  subgraphSlug: string;
  version?: string;
  tag?: string;  // Goldsky-specific
  apiKey?: string;
  // The Graph specific
  studioId?: string;
  subgraphId?: string;
  // Goldsky specific
  projectId?: string;
}

// Generated Frontend Config (from subgraph build)
export interface GeneratedConfig {
  provider: IndexerProvider;
  subgraph: {
    name: string;
    slug: string;
    version: string;
    endpoint: string;
    network: string;
  };
  schema: {
    entities: GraphQLEntity[];
    queries: Record<string, string>;
  };
  generatedAt: string;
}

// Store Types
export interface IndexerStore {
  subgraphs: SubgraphConfig[];
  activeProvider: IndexerProvider | null;
  activeSubgraphId: string | null;
}

// Hook Return Types
export interface UseSubgraphDataReturn<T = unknown> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchMore: (skip: number) => Promise<void>;
}

export interface UseSubgraphMetaReturn {
  meta: SubgraphMeta | null;
  status: SubgraphStatus;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Provider Base Interface
export interface IIndexerProvider {
  readonly id: IndexerProvider;
  readonly name: string;
  readonly info: ProviderInfo;

  // Networks
  getNetworks(): NetworkConfig[];

  // Endpoint Building
  buildEndpoint(config: EndpointConfig): string;
  parseEndpoint(url: string): Partial<EndpointConfig> | null;

  // Deployment
  getDeploymentSteps(): DeploymentStep[];
  getCliInstallCommand(): string;
  getDeployCommand(config: DeploymentConfig): string;

  // Querying
  query<T>(endpoint: string, query: string, variables?: Record<string, unknown>): Promise<QueryResult<T>>;
  testConnection(endpoint: string): Promise<ConnectionStatus>;
  fetchMeta(endpoint: string): Promise<SubgraphMeta | null>;

  // Schema introspection
  introspectSchema(endpoint: string): Promise<string | null>;
}
