import type { SubgraphConfig } from '../index'

export const freemintSubgraph: SubgraphConfig = {
  name: 'freemint-token',
  description: 'Indexes FreeMintToken ERC20 transfers and approvals',
  thegraph: {
    endpoint: 'https://api.studio.thegraph.com/query/1718541/testing/version/latest',
  },
  goldsky: {
    endpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/freemint-token/prod/gn',
    versionEndpoint: 'https://api.goldsky.com/api/public/project_cmemwacolly2301xs17yy3d6z/subgraphs/freemint-token/1.0.0/gn',
  },
  activeProvider: 'goldsky',
  contracts: [
    {
      name: 'FreeMintToken',
      address: '0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c',
      chainId: 11155111,
      chainName: 'Sepolia',
      explorerUrl: 'https://eth-sepolia.blockscout.com/address/0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c',
      startBlock: 9791758,
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
