# TheGraph Development Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Event log entity | `@entity(immutable: true)` | Regular `@entity` | 10x faster indexing |
| Mutable state | Regular `@entity` | Immutable | Allows updates |
| Unique ID | `tx.hash.concatI32(logIndex)` | Just tx hash | Multiple events per tx |
| Address type | `Bytes!` | `String!` | Native GraphQL type |
| Large numbers | `BigInt!` | `Int` | uint256 support |
| Relationships | `@derivedFrom` | Manual array | Auto-computed |
| Singleton stats | `id: "singleton"` | Multiple entities | Global aggregation |
| Null check | `if (!entity)` before access | Direct access | Prevents crash |
| Formatted values | Format on frontend | Store formatted | Raw values more flexible |

---

## Graph CLI Commands

| Command | Description |
|---------|-------------|
| `graph init` | Create new subgraph |
| `graph codegen` | Generate types from schema |
| `graph build` | Compile subgraph |
| `graph test` | Run Matchstick tests |
| `graph auth --studio <key>` | Authenticate with Studio |
| `graph deploy --studio <name>` | Deploy to Studio |
| `graph deploy --product hosted-service <user/name>` | Deploy to Hosted Service |

## subgraph.yaml Reference

```yaml
specVersion: 1.2.0
indexerHints:
  prune: auto  # auto | never | <block_number>
schema:
  file: ./schema.graphql
features:
  - ipfsOnEthereumContracts  # Optional features
  - nonFatalErrors
dataSources:
  - kind: ethereum
    name: ContractName
    network: sepolia  # mainnet | sepolia | base | arbitrum-one | etc
    source:
      address: "0x..."
      abi: ContractName
      startBlock: 12345678
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - EntityName
      abis:
        - name: ContractName
          file: ./abis/ContractName.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
        - event: Approval(indexed address,indexed address,uint256)
          handler: handleApproval
      callHandlers:  # Optional
        - function: transfer(address,uint256)
          handler: handleTransferCall
      blockHandlers:  # Optional
        - handler: handleBlock
          filter:
            kind: call
      file: ./src/mapping.ts
templates:  # Dynamic data sources
  - kind: ethereum
    name: TokenTemplate
    network: sepolia
    source:
      abi: Token
    mapping:
      # ... same as dataSources mapping
```

## Network Names

| Network | Name | Chain ID |
|---------|------|----------|
| Ethereum Mainnet | `mainnet` | 1 |
| Sepolia | `sepolia` | 11155111 |
| Polygon | `matic` | 137 |
| Arbitrum One | `arbitrum-one` | 42161 |
| Optimism | `optimism` | 10 |
| Base | `base` | 8453 |
| Avalanche | `avalanche` | 43114 |
| BSC | `bsc` | 56 |
| Gnosis | `gnosis` | 100 |

## Schema Types

### Scalar Types

| GraphQL | AssemblyScript | Description |
|---------|----------------|-------------|
| `ID` | `string` | Unique identifier |
| `String` | `string` | UTF-8 string |
| `Boolean` | `boolean` | true/false |
| `Int` | `i32` | 32-bit signed integer |
| `BigInt` | `BigInt` | Large integers (use for uint256) |
| `BigDecimal` | `BigDecimal` | Arbitrary precision decimal |
| `Bytes` | `Bytes` | Byte array (addresses, hashes) |

### Entity Decorators

```graphql
# Regular mutable entity
type Token @entity {
  id: ID!
}

# Immutable entity (much faster indexing)
type Transfer @entity(immutable: true) {
  id: Bytes!
}

# Derived field (computed from other entities)
type Account @entity {
  id: Bytes!
  transfers: [Transfer!]! @derivedFrom(field: "from")
}
```

## AssemblyScript Imports

```typescript
// Core types
import { BigInt, BigDecimal, Bytes, Address } from "@graphprotocol/graph-ts"

// Ethereum specific
import { ethereum } from "@graphprotocol/graph-ts"

// Logging
import { log } from "@graphprotocol/graph-ts"

// JSON handling
import { json, JSONValue, JSONValueKind } from "@graphprotocol/graph-ts"

// Crypto
import { crypto } from "@graphprotocol/graph-ts"

// Generated types
import { Transfer as TransferEvent } from "../generated/Token/Token"
import { Token, Transfer } from "../generated/schema"
```

## BigInt Operations

```typescript
// Create
let zero = BigInt.zero()
let one = BigInt.fromI32(1)
let big = BigInt.fromString("1000000000000000000")

// Arithmetic
let sum = a.plus(b)
let diff = a.minus(b)
let product = a.times(b)
let quotient = a.div(b)
let remainder = a.mod(b)

// Comparison
a.equals(b)
a.gt(b)  // greater than
a.ge(b)  // greater or equal
a.lt(b)  // less than
a.le(b)  // less or equal

// Conversion
let str = bigInt.toString()
let i32 = bigInt.toI32()
let hex = bigInt.toHexString()
```

## Bytes Operations

```typescript
// Create
let empty = Bytes.empty()
let fromHex = Bytes.fromHexString("0x1234")
let fromAddress = Address.fromString("0x...")

// Conversion
let hex = bytes.toHexString()
let str = bytes.toString()

// Comparison
bytes.equals(other)

// Create unique ID
let id = event.transaction.hash.concatI32(event.logIndex.toI32())
```

## Event Object Properties

```typescript
export function handleTransfer(event: TransferEvent): void {
  // Event parameters
  event.params.from      // Address
  event.params.to        // Address
  event.params.value     // BigInt

  // Transaction info
  event.transaction.hash       // Bytes
  event.transaction.index      // BigInt
  event.transaction.from       // Address
  event.transaction.to         // Address | null
  event.transaction.value      // BigInt
  event.transaction.gasPrice   // BigInt
  event.transaction.gasLimit   // BigInt
  event.transaction.input      // Bytes

  // Block info
  event.block.hash            // Bytes
  event.block.number          // BigInt
  event.block.timestamp       // BigInt
  event.block.gasLimit        // BigInt
  event.block.gasUsed         // BigInt

  // Log info
  event.logIndex              // BigInt
  event.address               // Address (contract address)
}
```

## Entity Operations

```typescript
// Load entity (returns null if not found)
let entity = Entity.load(id)

// Create new entity
let entity = new Entity(id)

// Required: set all non-nullable fields
entity.field = value

// Save entity
entity.save()

// Pattern: Load or create
let entity = Entity.load(id)
if (!entity) {
  entity = new Entity(id)
  entity.count = BigInt.zero()
}
entity.count = entity.count.plus(BigInt.fromI32(1))
entity.save()
```

## Logging

```typescript
import { log } from "@graphprotocol/graph-ts"

log.info("Message: {}", [value])
log.warning("Warning: {}", [value])
log.error("Error: {}", [value])
log.debug("Debug: {}", [value])
log.critical("Critical: {}", [value])  // Stops indexing
```

## Dynamic Data Sources (Templates)

```typescript
// In subgraph.yaml
templates:
  - kind: ethereum
    name: ERC20
    ...

// In mapping.ts
import { ERC20 } from "../generated/templates"

export function handleNewToken(event: NewToken): void {
  // Create new data source from template
  ERC20.create(event.params.tokenAddress)
}
```

## Matchstick Testing

```typescript
import { test, assert, newMockEvent } from "matchstick-as"
import { handleTransfer } from "../src/mapping"
import { Transfer } from "../generated/Token/Token"

test("handleTransfer creates Transfer entity", () => {
  // Create mock event
  let event = changetype<Transfer>(newMockEvent())
  event.parameters = new Array()
  event.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString("0x...")))
  )

  // Call handler
  handleTransfer(event)

  // Assert
  assert.entityCount("Transfer", 1)
  assert.fieldEquals("Transfer", "id", "from", "0x...")
})
```

## Deployment Endpoints

### TheGraph Studio

```
Query: https://api.studio.thegraph.com/query/[ID]/[NAME]/version/latest
Subgraph Page: https://thegraph.com/studio/subgraph/[NAME]
```

### Decentralized Network

```
Query: https://gateway.thegraph.com/api/[API_KEY]/subgraphs/id/[DEPLOYMENT_ID]
```
