# TheGraph Development Examples

## ERC20 Token Subgraph

### schema.graphql

```graphql
# Immutable transfer records (fast indexing)
type Transfer @entity(immutable: true) {
  id: Bytes!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

# Mutable account balance
type Account @entity {
  id: Bytes!                              # Address
  balance: BigInt!
  transfersOut: [Transfer!]! @derivedFrom(field: "from")
  transfersIn: [Transfer!]! @derivedFrom(field: "to")
}

# Singleton for global stats
type TokenStats @entity {
  id: ID!                                 # "singleton"
  totalSupply: BigInt!
  holderCount: Int!
  transferCount: BigInt!
}
```

### subgraph.yaml

```yaml
specVersion: 1.2.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: Token
    network: sepolia
    source:
      address: "0x..."
      abi: Token
      startBlock: 5000000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - Transfer
        - Account
        - TokenStats
      abis:
        - name: Token
          file: ./abis/Token.json
      eventHandlers:
        - event: Transfer(indexed address,indexed address,uint256)
          handler: handleTransfer
      file: ./src/mapping.ts
```

### mapping.ts

```typescript
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent } from "../generated/Token/Token"
import { Transfer, Account, TokenStats } from "../generated/schema"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const STATS_ID = "singleton"

export function handleTransfer(event: TransferEvent): void {
  // Create unique ID for transfer
  let id = event.transaction.hash.concatI32(event.logIndex.toI32())

  // Create transfer record
  let transfer = new Transfer(id)
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.value = event.params.value
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.transactionHash = event.transaction.hash
  transfer.save()

  // Update sender account (if not mint)
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    let fromAccount = Account.load(event.params.from)
    if (!fromAccount) {
      fromAccount = new Account(event.params.from)
      fromAccount.balance = BigInt.zero()
    }
    fromAccount.balance = fromAccount.balance.minus(event.params.value)
    fromAccount.save()
  }

  // Update receiver account (if not burn)
  if (event.params.to.toHexString() != ZERO_ADDRESS) {
    let toAccount = Account.load(event.params.to)
    let isNewHolder = false
    if (!toAccount) {
      toAccount = new Account(event.params.to)
      toAccount.balance = BigInt.zero()
      isNewHolder = true
    }
    toAccount.balance = toAccount.balance.plus(event.params.value)
    toAccount.save()

    // Update holder count
    if (isNewHolder) {
      updateHolderCount(1)
    }
  }

  // Update stats
  updateTransferCount()
}

function updateTransferCount(): void {
  let stats = TokenStats.load(STATS_ID)
  if (!stats) {
    stats = new TokenStats(STATS_ID)
    stats.totalSupply = BigInt.zero()
    stats.holderCount = 0
    stats.transferCount = BigInt.zero()
  }
  stats.transferCount = stats.transferCount.plus(BigInt.fromI32(1))
  stats.save()
}

function updateHolderCount(delta: i32): void {
  let stats = TokenStats.load(STATS_ID)
  if (!stats) {
    stats = new TokenStats(STATS_ID)
    stats.totalSupply = BigInt.zero()
    stats.holderCount = 0
    stats.transferCount = BigInt.zero()
  }
  stats.holderCount = stats.holderCount + delta
  stats.save()
}
```

## NFT Subgraph (ERC721)

### schema.graphql

```graphql
type Token @entity {
  id: ID!                                  # Contract address + token ID
  tokenId: BigInt!
  contract: Bytes!
  owner: Account!
  uri: String
  mintedAt: BigInt!
  transfers: [Transfer!]! @derivedFrom(field: "token")
}

type Account @entity {
  id: Bytes!                               # Address
  tokens: [Token!]! @derivedFrom(field: "owner")
  tokenCount: Int!
}

type Transfer @entity(immutable: true) {
  id: Bytes!
  token: Token!
  from: Bytes!
  to: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
}

type Collection @entity {
  id: Bytes!                               # Contract address
  name: String
  symbol: String
  totalMinted: BigInt!
}
```

### mapping.ts

```typescript
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { Transfer as TransferEvent, ERC721 } from "../generated/NFT/ERC721"
import { Token, Account, Transfer, Collection } from "../generated/schema"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export function handleTransfer(event: TransferEvent): void {
  let contract = ERC721.bind(event.address)
  let tokenIdStr = event.params.tokenId.toString()
  let tokenEntityId = event.address.toHexString() + "-" + tokenIdStr

  // Get or create token
  let token = Token.load(tokenEntityId)
  let isMint = event.params.from.toHexString() == ZERO_ADDRESS

  if (!token) {
    token = new Token(tokenEntityId)
    token.tokenId = event.params.tokenId
    token.contract = event.address
    token.mintedAt = event.block.timestamp

    // Try to get tokenURI
    let uriResult = contract.try_tokenURI(event.params.tokenId)
    if (!uriResult.reverted) {
      token.uri = uriResult.value
    }
  }

  // Update owner
  token.owner = event.params.to.toHexString()
  token.save()

  // Update accounts
  if (!isMint) {
    updateAccount(event.params.from, -1)
  }
  updateAccount(event.params.to, 1)

  // Create transfer record
  let transfer = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transfer.token = tokenEntityId
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.timestamp = event.block.timestamp
  transfer.blockNumber = event.block.number
  transfer.save()

  // Update collection stats on mint
  if (isMint) {
    let collection = Collection.load(event.address)
    if (!collection) {
      collection = new Collection(event.address)
      collection.totalMinted = BigInt.zero()

      let nameResult = contract.try_name()
      if (!nameResult.reverted) {
        collection.name = nameResult.value
      }

      let symbolResult = contract.try_symbol()
      if (!symbolResult.reverted) {
        collection.symbol = symbolResult.value
      }
    }
    collection.totalMinted = collection.totalMinted.plus(BigInt.fromI32(1))
    collection.save()
  }
}

function updateAccount(address: Address, countDelta: i32): void {
  let account = Account.load(address)
  if (!account) {
    account = new Account(address)
    account.tokenCount = 0
  }
  account.tokenCount = account.tokenCount + countDelta
  account.save()
}
```

## DEX Swap Subgraph

### schema.graphql

```graphql
type Pool @entity {
  id: Bytes!                               # Pool address
  token0: Bytes!
  token1: Bytes!
  reserve0: BigInt!
  reserve1: BigInt!
  totalSwapCount: BigInt!
  totalVolumeToken0: BigInt!
  totalVolumeToken1: BigInt!
  swaps: [Swap!]! @derivedFrom(field: "pool")
}

type Swap @entity(immutable: true) {
  id: Bytes!
  pool: Pool!
  sender: Bytes!
  amount0In: BigInt!
  amount1In: BigInt!
  amount0Out: BigInt!
  amount1Out: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
}

type DailyVolume @entity {
  id: ID!                                  # Pool address + day timestamp
  pool: Pool!
  date: Int!
  volumeToken0: BigInt!
  volumeToken1: BigInt!
  swapCount: Int!
}
```

### mapping.ts

```typescript
import { BigInt } from "@graphprotocol/graph-ts"
import { Swap as SwapEvent, Sync as SyncEvent } from "../generated/Pool/Pool"
import { Pool, Swap, DailyVolume } from "../generated/schema"

const DAY_SECONDS = 86400

export function handleSwap(event: SwapEvent): void {
  let pool = Pool.load(event.address)
  if (!pool) return

  // Create swap record
  let swap = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  swap.pool = pool.id
  swap.sender = event.params.sender
  swap.amount0In = event.params.amount0In
  swap.amount1In = event.params.amount1In
  swap.amount0Out = event.params.amount0Out
  swap.amount1Out = event.params.amount1Out
  swap.timestamp = event.block.timestamp
  swap.blockNumber = event.block.number
  swap.save()

  // Update pool stats
  pool.totalSwapCount = pool.totalSwapCount.plus(BigInt.fromI32(1))
  pool.totalVolumeToken0 = pool.totalVolumeToken0
    .plus(event.params.amount0In)
    .plus(event.params.amount0Out)
  pool.totalVolumeToken1 = pool.totalVolumeToken1
    .plus(event.params.amount1In)
    .plus(event.params.amount1Out)
  pool.save()

  // Update daily volume
  let dayTimestamp = event.block.timestamp.toI32() / DAY_SECONDS * DAY_SECONDS
  let dailyId = pool.id.toHexString() + "-" + dayTimestamp.toString()

  let daily = DailyVolume.load(dailyId)
  if (!daily) {
    daily = new DailyVolume(dailyId)
    daily.pool = pool.id
    daily.date = dayTimestamp
    daily.volumeToken0 = BigInt.zero()
    daily.volumeToken1 = BigInt.zero()
    daily.swapCount = 0
  }

  daily.volumeToken0 = daily.volumeToken0
    .plus(event.params.amount0In)
    .plus(event.params.amount0Out)
  daily.volumeToken1 = daily.volumeToken1
    .plus(event.params.amount1In)
    .plus(event.params.amount1Out)
  daily.swapCount = daily.swapCount + 1
  daily.save()
}

export function handleSync(event: SyncEvent): void {
  let pool = Pool.load(event.address)
  if (!pool) return

  pool.reserve0 = event.params.reserve0
  pool.reserve1 = event.params.reserve1
  pool.save()
}
```

## Matchstick Test Example

```typescript
// tests/mapping.test.ts
import { test, assert, newMockEvent, clearStore, afterEach } from "matchstick-as"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { handleTransfer } from "../src/mapping"
import { Transfer } from "../generated/Token/Token"

afterEach(() => {
  clearStore()
})

test("Creates Transfer entity on transfer event", () => {
  // Create mock event
  let event = changetype<Transfer>(newMockEvent())

  event.parameters = new Array()
  event.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000001"))
    )
  )
  event.parameters.push(
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString("0x0000000000000000000000000000000000000002"))
    )
  )
  event.parameters.push(
    new ethereum.EventParam(
      "value",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000))
    )
  )

  // Call handler
  handleTransfer(event)

  // Assert
  assert.entityCount("Transfer", 1)
})

test("Updates account balances correctly", () => {
  // ... test implementation
})
```
