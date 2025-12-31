export interface SubgraphConfig {
  id: string
  name: string
  url: string
  schemaContent: string // GraphQL schema content
  schemaSource: 'file' | 'url' | 'manual' // How the schema was provided
  description?: string
  network?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GraphQLEntity {
  name: string
  fields: GraphQLField[]
  directives: string[]
  isTimeseries: boolean
}

export interface GraphQLField {
  name: string
  type: string
  isRequired: boolean
  isArray: boolean
  description?: string
}

export interface SubgraphQueryResult {
  subgraphId: string
  entityName: string
  data: any[]
  error?: string
  loading: boolean
}