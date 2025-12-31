/**
 * Export Frontend Config Script
 *
 * This script generates a configuration file that can be used
 * by the frontend to connect to and query the subgraph.
 *
 * Usage: npm run export
 */

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

// Configuration - modify these values after deployment
const CONFIG = {
  provider: process.env.INDEXER_PROVIDER || 'thegraph', // 'thegraph' or 'goldsky'
  endpoint: process.env.SUBGRAPH_ENDPOINT || '',
  version: process.env.SUBGRAPH_VERSION || '1.0.0',
}

function parseSchema(schemaPath) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  const entities = []
  const queries = {}

  // Simple regex-based parser
  const typeRegex = /type\s+(\w+)\s*(@entity[^{]*)?\s*\{([^}]+)\}/g
  let match

  while ((match = typeRegex.exec(schemaContent)) !== null) {
    const [, typeName, directives = '', fieldsString] = match

    // Skip internal types
    if (['Query', 'Mutation', 'Subscription'].includes(typeName) || typeName.startsWith('_')) {
      continue
    }

    const fields = fieldsString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const fieldMatch = line.match(/(\w+):\s*(\[?[\w!]+\]?!?)/)
        if (fieldMatch) {
          const [, name, typeStr] = fieldMatch
          return {
            name,
            type: typeStr.replace(/[\[\]!]/g, ''),
            baseType: typeStr.replace(/[\[\]!]/g, ''),
            isRequired: typeStr.endsWith('!'),
            isArray: typeStr.startsWith('['),
            isRelation: false
          }
        }
        return null
      })
      .filter(f => f !== null)

    // Determine plural name
    let pluralName = typeName
    if (typeName.endsWith('s')) {
      pluralName = typeName
    } else if (typeName.endsWith('y')) {
      pluralName = typeName.slice(0, -1) + 'ies'
    } else {
      pluralName = typeName + 's'
    }
    pluralName = pluralName.charAt(0).toLowerCase() + pluralName.slice(1)

    const entity = {
      name: typeName,
      pluralName,
      fields,
      isTimeseries: directives.includes('timeseries'),
      isImmutable: directives.includes('immutable'),
      directives: directives.match(/@\w+[^@]*/g)?.map(d => d.trim()) || []
    }

    entities.push(entity)

    // Generate query for this entity
    const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'BigInt', 'BigDecimal', 'Bytes']
    const fieldSelections = fields
      .filter(f => scalarTypes.includes(f.type))
      .map(f => f.name)
      .join('\n    ')

    queries[`get${typeName}s`] = `query Get${typeName}s($first: Int = 10, $skip: Int = 0) {
  ${pluralName}(first: $first, skip: $skip, orderDirection: desc) {
    ${fieldSelections}
  }
}`

    if (fields.some(f => f.name === 'id')) {
      queries[`get${typeName}`] = `query Get${typeName}($id: ID!) {
  ${typeName.toLowerCase()}(id: $id) {
    ${fieldSelections}
  }
}`
    }
  }

  return { entities, queries }
}

function parseSubgraphYaml(yamlPath) {
  if (!fs.existsSync(yamlPath)) {
    return { name: 'unknown', network: 'unknown' }
  }

  const content = fs.readFileSync(yamlPath, 'utf-8')
  const parsed = yaml.parse(content)

  return {
    name: parsed.dataSources?.[0]?.name || 'unknown',
    network: parsed.dataSources?.[0]?.network || 'unknown'
  }
}

function main() {
  const schemaPath = path.join(__dirname, '..', 'schema.graphql')
  const yamlPath = path.join(__dirname, '..', 'subgraph.yaml')
  const outputDir = path.join(__dirname, '..', 'generated')
  const outputPath = path.join(outputDir, 'frontend-config.json')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Parse schema
  if (!fs.existsSync(schemaPath)) {
    console.error('Error: schema.graphql not found')
    process.exit(1)
  }

  const { entities, queries } = parseSchema(schemaPath)
  const subgraphInfo = parseSubgraphYaml(yamlPath)

  // Build config
  const frontendConfig = {
    provider: CONFIG.provider,
    subgraph: {
      name: subgraphInfo.name,
      slug: subgraphInfo.name.toLowerCase().replace(/\s+/g, '-'),
      version: CONFIG.version,
      endpoint: CONFIG.endpoint,
      network: subgraphInfo.network
    },
    schema: {
      entities,
      queries
    },
    generatedAt: new Date().toISOString()
  }

  // Write config
  fs.writeFileSync(outputPath, JSON.stringify(frontendConfig, null, 2))
  console.log(`Frontend config exported to: ${outputPath}`)
  console.log(`Found ${entities.length} entities and generated ${Object.keys(queries).length} queries`)

  // Also create a TypeScript types file
  const typesPath = path.join(outputDir, 'types.ts')
  const typesContent = `// Auto-generated types from schema.graphql
// Generated at: ${new Date().toISOString()}

${entities.map(entity => `export interface ${entity.name} {
${entity.fields.map(f => `  ${f.name}${f.isRequired ? '' : '?'}: ${mapGraphQLTypeToTS(f.type)}${f.isArray ? '[]' : ''}`).join('\n')}
}`).join('\n\n')}
`
  fs.writeFileSync(typesPath, typesContent)
  console.log(`TypeScript types exported to: ${typesPath}`)
}

function mapGraphQLTypeToTS(graphqlType) {
  const mapping = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'ID': 'string',
    'BigInt': 'string',
    'BigDecimal': 'string',
    'Bytes': 'string'
  }
  return mapping[graphqlType] || 'unknown'
}

main()
