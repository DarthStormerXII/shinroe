import { GraphQLEntity, GraphQLField } from './types'

export class GraphQLSchemaParser {
  private schema: string

  constructor(schema: string) {
    this.schema = schema
  }

  /**
   * Parse the GraphQL schema and extract all entity types
   */
  parseEntities(): GraphQLEntity[] {
    const entities: GraphQLEntity[] = []

    // Remove comments and normalize whitespace
    const cleanSchema = this.cleanSchema(this.schema)

    // Find all type definitions (excluding built-in types and scalars)
    const typeRegex = /type\s+(\w+)\s*(@entity[^{]*)?\s*\{([^}]+)\}/g
    let match

    while ((match = typeRegex.exec(cleanSchema)) !== null) {
      const [, typeName, directives = '', fieldsString] = match

      // Skip internal GraphQL types
      if (this.isInternalType(typeName)) {
        continue
      }

      const fields = this.parseFields(fieldsString)
      const isTimeseries = directives.includes('timeseries: true')
      const directivesList = this.parseDirectives(directives)

      entities.push({
        name: typeName,
        fields,
        directives: directivesList,
        isTimeseries
      })
    }

    return entities
  }

  /**
   * Generate GraphQL queries for all entities
   */
  generateQueries(entities: GraphQLEntity[]): Record<string, string> {
    const queries: Record<string, string> = {}

    entities.forEach(entity => {
      const queryName = this.getQueryName(entity.name)
      const fieldSelections = this.generateFieldSelections(entity.fields)

      // Generate basic query
      queries[`get${entity.name}s`] = `
        query Get${entity.name}s($first: Int = 10, $skip: Int = 0, $orderBy: String, $orderDirection: String) {
          ${queryName}(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
            ${fieldSelections}
          }
        }
      `.trim()

      // Generate single item query if it has an id field
      if (entity.fields.some(field => field.name === 'id')) {
        queries[`get${entity.name}`] = `
          query Get${entity.name}($id: ID!) {
            ${entity.name.toLowerCase()}(id: $id) {
              ${fieldSelections}
            }
          }
        `.trim()
      }
    })

    return queries
  }

  /**
   * Generate a query for a specific entity with custom parameters
   */
  generateCustomQuery(
    entity: GraphQLEntity,
    options: {
      first?: number
      skip?: number
      where?: Record<string, any>
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
    } = {}
  ): string {
    const queryName = this.getQueryName(entity.name)
    const fieldSelections = this.generateFieldSelections(entity.fields)

    let queryParams = []
    let variables = []

    if (options.first !== undefined) {
      queryParams.push('$first: Int')
      variables.push('first: $first')
    }

    if (options.skip !== undefined) {
      queryParams.push('$skip: Int')
      variables.push('skip: $skip')
    }

    if (options.where) {
      queryParams.push('$where: String')
      variables.push('where: $where')
    }

    if (options.orderBy) {
      queryParams.push('$orderBy: String')
      variables.push('orderBy: $orderBy')
    }

    if (options.orderDirection) {
      queryParams.push('$orderDirection: String')
      variables.push('orderDirection: $orderDirection')
    }

    const queryParamsString = queryParams.length > 0 ? `(${queryParams.join(', ')})` : ''
    const variablesString = variables.length > 0 ? `(${variables.join(', ')})` : ''

    return `
      query Get${entity.name}s${queryParamsString} {
        ${queryName}${variablesString} {
          ${fieldSelections}
        }
      }
    `.trim()
  }

  private cleanSchema(schema: string): string {
    // Remove comments
    return schema
      .replace(/#[^\n]*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private isInternalType(typeName: string): boolean {
    const internalTypes = [
      'Query',
      'Mutation',
      'Subscription',
      'String',
      'Int',
      'Float',
      'Boolean',
      'ID',
      'BigInt',
      'BigDecimal',
      'Bytes'
    ]

    return internalTypes.includes(typeName) || typeName.startsWith('_')
  }

  private parseFields(fieldsString: string): GraphQLField[] {
    const fields: GraphQLField[] = []

    // Split by lines and clean up
    const fieldLines = fieldsString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))

    fieldLines.forEach(line => {
      const fieldMatch = line.match(/(\w+):\s*(\[?[\w!]+\]?!?)/)
      if (fieldMatch) {
        const [, name, typeStr] = fieldMatch

        const isArray = typeStr.startsWith('[')
        const isRequired = typeStr.endsWith('!')
        const baseType = typeStr.replace(/[\[\]!]/g, '')

        fields.push({
          name,
          type: baseType,
          isRequired,
          isArray
        })
      }
    })

    return fields
  }

  private parseDirectives(directivesString: string): string[] {
    const directives: string[] = []

    // Simple directive parsing - can be enhanced
    const directiveMatches = directivesString.match(/@\w+[^@]*/g)
    if (directiveMatches) {
      directives.push(...directiveMatches.map(d => d.trim()))
    }

    return directives
  }

  private getQueryName(entityName: string): string {
    // Convert PascalCase to camelCase and pluralize
    const camelCase = entityName.charAt(0).toLowerCase() + entityName.slice(1)

    // Simple pluralization (can be enhanced)
    if (camelCase.endsWith('s')) {
      return camelCase
    } else if (camelCase.endsWith('y')) {
      return camelCase.slice(0, -1) + 'ies'
    } else {
      return camelCase + 's'
    }
  }

  private generateFieldSelections(fields: GraphQLField[], maxDepth = 2, currentDepth = 0): string {
    if (currentDepth >= maxDepth) {
      return 'id'
    }

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
 * Utility function to parse schema and generate queries
 */
export function parseSchemaAndGenerateQueries(schemaContent: string) {
  const parser = new GraphQLSchemaParser(schemaContent)
  const entities = parser.parseEntities()
  const queries = parser.generateQueries(entities)

  return { entities, queries }
}