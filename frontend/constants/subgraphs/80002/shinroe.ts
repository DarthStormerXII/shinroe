import type { SubgraphConfig } from '../index'

export const shinroeSubgraph: SubgraphConfig = {
  name: 'shinroe',
  description: 'Shinroe Reputation System - Score Registry, Endorsements, Badges, Token Factory, and Airdrops',
  thegraph: {
    // Indexer endpoint from environment variable
    endpoint: process.env.NEXT_PUBLIC_INDEXER_URL || '',
  },
  goldsky: {
    // Goldsky deployment placeholder
    endpoint: '',
    versionEndpoint: '',
  },
  activeProvider: 'thegraph',
  contracts: [
    {
      name: 'ScoreRegistry',
      address: '0xD4372976948551aceD5400080fB9eA80d646b609',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0xD4372976948551aceD5400080fB9eA80d646b609',
      startBlock: 31417575,
    },
    {
      name: 'EndorsementVault',
      address: '0x5a5592A8d4Fc56dC7234Dc7C9421136cC125f66F',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0x5a5592A8d4Fc56dC7234Dc7C9421136cC125f66F',
      startBlock: 31417575,
    },
    {
      name: 'BadgeNFT',
      address: '0xbb658372D839cE4a66E0B686022Ff2744720eb5C',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0xbb658372D839cE4a66E0B686022Ff2744720eb5C',
      startBlock: 31417575,
    },
    {
      name: 'TokenFactory',
      address: '0xFc3b8E87C71628Be20346040134Bd92EA1B518E0',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0xFc3b8E87C71628Be20346040134Bd92EA1B518E0',
      startBlock: 31417575,
    },
    {
      name: 'AirdropVault',
      address: '0xcBE48AAa44E23e0B3Cfc82EE1B6dfe28891Aadf8',
      chainId: 80002,
      chainName: 'Polygon Amoy',
      explorerUrl: 'https://amoy.polygonscan.com/address/0xcBE48AAa44E23e0B3Cfc82EE1B6dfe28891Aadf8',
      startBlock: 31417575,
    },
  ],
}
