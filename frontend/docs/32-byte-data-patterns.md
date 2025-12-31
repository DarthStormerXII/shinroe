# 32-Byte Data Field Patterns

## The Limitation

The state channel's `data` field is only 32 bytes (256 bits). This is because:
- On-chain storage is expensive
- State channels need to be disputeable on-chain
- 32 bytes = one storage slot in EVM

## Common Patterns

### 1. Hash-Based Storage
Store a hash that points to off-chain data:

```typescript
// Store full game state on IPFS
const gameState = { board: [...], moves: [...], scores: {...} };
const ipfsHash = await ipfs.add(JSON.stringify(gameState));

// Store only the hash on-chain (32 bytes)
const stateData = ipfsHashToBytes32(ipfsHash); // "QmXxx..." -> 0x...
```

### 2. Packed Data
For simple games, pack data efficiently:

```typescript
// Chess move example (fits in 32 bytes):
// - Move counter: 2 bytes (65,535 moves)
// - From position: 1 byte (0-63)
// - To position: 1 byte (0-63)
// - Piece type: 1 byte
// - Flags: 1 byte (castling, en passant, etc.)
// - Game ID: 26 bytes

function encodeChessMove(move: ChessMove): Hex {
  const buffer = new Uint8Array(32);
  // Pack move data...
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
```

### 3. State References
Use the data field as a pointer/ID:

```typescript
// Store state in database with UUID
const stateId = crypto.randomUUID();
await database.save(stateId, complexState);

// Store only the UUID reference (32 bytes)
const stateData = uuidToBytes32(stateId);
```

### 4. Merkle Trees
Store only the root hash:

```typescript
// Build merkle tree of game state
const leaves = players.map(p => hashPlayer(p));
const tree = new MerkleTree(leaves);

// Store only root (32 bytes)
const stateData = tree.getRoot();

// Players can prove their state with merkle proofs
```

### 5. Bloom Filters
Track membership/flags efficiently:

```typescript
// 256-bit bloom filter for tracking completed actions
const bloom = new BloomFilter(256);
bloom.add("quest1_completed");
bloom.add("achievement_unlocked");

const stateData = bloom.toBytes32();
```

## Real-World Examples

### 1. Tic-Tac-Toe
```typescript
// 9 cells * 2 bits each = 18 bits (fits easily)
// 0 = empty, 1 = X, 2 = O
function encodeTicTacToe(board: number[][]): Hex {
  let encoded = 0n;
  for (let i = 0; i < 9; i++) {
    encoded |= BigInt(board[Math.floor(i/3)][i%3]) << BigInt(i * 2);
  }
  return `0x${encoded.toString(16).padStart(64, '0')}`;
}
```

### 2. Payment Channel with Metadata
```typescript
// Pack payment metadata
function encodePayment(invoiceId: string, timestamp: number): Hex {
  const buffer = new Uint8Array(32);
  // First 16 bytes: invoice ID hash
  buffer.set(sha256(invoiceId).slice(0, 16), 0);
  // Next 8 bytes: timestamp
  buffer.set(new BigNumber(timestamp).toBuffer('be', 8), 16);
  // Last 8 bytes: reserved for flags
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
```

### 3. Access Control
```typescript
// Encode permissions as bit flags
enum Permission {
  READ = 1 << 0,
  WRITE = 1 << 1,
  DELETE = 1 << 2,
  ADMIN = 1 << 3,
}

function encodePermissions(userId: string, perms: number): Hex {
  const buffer = new Uint8Array(32);
  // First 28 bytes: user ID hash
  buffer.set(sha256(userId).slice(0, 28), 0);
  // Last 4 bytes: permission flags
  buffer.set(new Uint8Array([perms]), 28);
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
```

### 4. Gaming Session
```typescript
interface GameSession {
  sessionId: number;    // 4 bytes
  level: number;        // 2 bytes
  score: number;        // 4 bytes
  lives: number;        // 1 byte
  powerups: number;     // 1 byte
  checkpoint: string;   // 20 bytes (hash)
}

function encodeGameSession(session: GameSession): Hex {
  // Total: 32 bytes exactly
  const buffer = new Uint8Array(32);
  // ... pack each field
  return `0x${Buffer.from(buffer).toString('hex')}`;
}
```

## Best Practices

1. **Plan Your Data Structure**: Design for 32 bytes from the start
2. **Use External Storage**: IPFS, Arweave, or databases for large data
3. **Compress When Possible**: Use bit packing for flags and small numbers
4. **Version Your Schema**: Reserve bits for version numbers
5. **Document Encoding**: Clear documentation for data interpretation

## Tools & Libraries

- **Ethers.js**: `ethers.utils.hexZeroPad()` for padding
- **Buffer**: Node.js Buffer for byte manipulation
- **Bitwise Operations**: Use shifts and masks for packing
- **IPFS**: For decentralized storage of large data
- **Arweave**: For permanent storage

## Remember

The 32-byte limitation is a feature, not a bug. It forces you to:
- Think about data efficiency
- Separate on-chain consensus from off-chain data
- Design proper data architectures
- Keep gas costs manageable

For complex applications, the pattern is always:
1. Store minimal consensus data on-chain (32 bytes)
2. Store full application state off-chain
3. Use the 32 bytes to reference or validate the off-chain data