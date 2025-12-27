import type { SubgraphConfig } from '../index'

export const freemintSubgraph: SubgraphConfig = {
  name: 'freemint-token',
  description: 'Indexes FreeMintToken ERC20 transfers and approvals on Polygon Amoy',
  thegraph: {
    // Not used in production - shinroe is the primary subgraph
    endpoint: '',
  },
  goldsky: {
    endpoint: '',
    versionEndpoint: '',
  },
  activeProvider: 'thegraph',
  contracts: [
    {
      name: 'FreeMintToken',
      address: '0x6d0a8fc7cb9f8130aed27e695483f840c8d259be',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0x6d0a8fc7cb9f8130aed27e695483f840c8d259be',
      startBlock: 31180915,
    },
  ],
  schemaContent: `
type Transfer @entity(immutable: true) {
  id: Bytes!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Approval @entity(immutable: true) {
  id: Bytes!
  owner: Bytes!
  spender: Bytes!
  value: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type TokenHolder @entity {
  id: Bytes!
  balance: BigInt!
  transferCount: BigInt!
  firstTransferBlock: BigInt!
  lastTransferBlock: BigInt!
}

type DailyStats @entity {
  id: ID!
  date: BigInt!
  transferCount: BigInt!
  totalVolume: BigInt!
  uniqueUsers: BigInt!
}
`,
}
