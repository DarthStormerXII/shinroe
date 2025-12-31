import type { ContractRegistry } from '../index'

// Polygon Amoy testnet contracts
const contracts: ContractRegistry = {
  HelloWorld: {
    address: '0x989fd75b865a879BeA8bDcDf22d5121EB31D4469',
    name: 'HelloWorld',
    description: 'A simple greeting contract for testing',
  },
  FreeMintToken: {
    address: '0xc8Fb7fcbA66289592Aa9D7B6A2377f4D15059D82',
    name: 'FreeMintToken',
    description: 'ERC20 token with free minting for testing',
  },
  FreeMintNFT: {
    address: '0x3933cdBB2af177eB3276741A0113e32709f25913',
    name: 'FreeMintNFT',
    description: 'ERC721 NFT with free minting for testing',
  },
  // Shinroe Reputation System
  ScoreRegistry: {
    address: '0xd6b6ac24eefc78fa270824dac65f855175cd080e',
    name: 'ScoreRegistry',
    description: 'Privacy-preserving reputation score storage',
  },
  BadgeNFT: {
    address: '0x9b42b592b2d0e8b845d9975671c48dae90123876',
    name: 'BadgeNFT',
    description: 'Soulbound reputation badges',
  },
  EndorsementVault: {
    address: '0xd0d05fef053a21828321a9273002b13ddd12536f',
    name: 'EndorsementVault',
    description: 'Staked endorsements with decay mechanics',
  },
  TokenFactory: {
    address: '0x86EbE9dB7c20d7EE7F2D81759b7dAe54697a822D',
    name: 'TokenFactory',
    description: 'ERC20 token factory for creating airdrop tokens',
  },
  AirdropVault: {
    address: '0x6598341d88B72dCb8816Ea5c3BD3d25379b5dd94',
    name: 'AirdropVault',
    description: 'Reputation-gated token airdrop distribution',
  },
}

export default contracts
