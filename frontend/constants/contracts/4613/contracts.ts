import type { ContractRegistry } from '../index'

// VeryChain mainnet contracts - Deployed 2026-01-03
const contracts: ContractRegistry = {
  // Shinroe Reputation System
  ScoreRegistry: {
    address: '0x7cc5385b2fa1ca408a2f7f938001cf0cceca390c',
    name: 'ScoreRegistry',
    description: 'Privacy-preserving reputation score storage',
  },
  BadgeNFT: {
    address: '0xcfcd96d4b017bc83fd67b030d32d103a7f6f485d',
    name: 'BadgeNFT',
    description: 'Soulbound reputation badges',
  },
  EndorsementVault: {
    address: '0xdf7bc712757ef8bec78ca24b3f01066c825421f7',
    name: 'EndorsementVault',
    description: 'Staked endorsements with decay mechanics',
  },
  AirdropVault: {
    address: '0xfb66a25b0b81285e8bef1e6ca35976ec49b70056',
    name: 'AirdropVault',
    description: 'Token airdrop distribution vault',
  },
  TokenFactory: {
    address: '0xbefdc386aa5aeca6d9c45f6c316c43c5e01dbb44',
    name: 'TokenFactory',
    description: 'ERC20 token creation factory',
  },
  HelloWorld: {
    address: '0x1d00e9fec4748e07e178faf1778c4b95e74cda30',
    name: 'HelloWorld',
    description: 'Simple hello world contract',
  },
  FreeMintToken: {
    address: '0x8e25b6a75907f8ddf28e15558759802d7922a898',
    name: 'FreeMintToken',
    description: 'Free mintable ERC20 token',
  },
  FreeMintNFT: {
    address: '0xee4c62bb881cf0364333d5754ef0551a39ba4426',
    name: 'FreeMintNFT',
    description: 'Free mintable NFT collection',
  },
}

export default contracts
