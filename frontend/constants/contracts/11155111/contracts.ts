import type { ContractRegistry } from '../index'

// Sepolia testnet contracts
const contracts: ContractRegistry = {
  HelloWorld: {
    address: '0x9ED03b9a9Fb743ac36EFb35B72a2db31DE525821',
    name: 'HelloWorld',
    description: 'A simple greeting contract for testing',
  },
  FreeMintToken: {
    address: '0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c',
    name: 'FreeMintToken',
    description: 'ERC20 token with free minting for testing',
  },
  FreeMintNFT: {
    address: '0x1B3b102adc9405EBB9A6a9Ff85562D5c8E5eB0D4',
    name: 'FreeMintNFT',
    description: 'ERC721 NFT with free minting for testing',
  },
}

export default contracts
