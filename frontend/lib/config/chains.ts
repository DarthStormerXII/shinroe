import { verychain } from '@/constants/chains/verychain'

import {
  // Mainnets from viem
  mainnet,
  polygon,
  arbitrum,
  arbitrumNova,
  optimism,
  base,
  avalanche,
  bsc,
  gnosis,
  fantom,
  celo,
  aurora,
  harmonyOne,
  moonbeam,
  moonriver,
  metis,
  boba,
  zkSync,
  linea,
  scroll,
  mantle,
  manta,
  mode,
  blast,
  fraxtal,
  taiko,
  zora,
  degen,
  cyber,
  mint,
  redstone,
  ancient8,
  bob,
  worldchain,
  ink,
  sei,
  berachain,
  sonic,
  abstract as abstractChain,
  apeChain,
  b3,
  chiliz,
  coreDao,
  dogechain,
  electroneum,
  flare,
  flowMainnet,
  fluence,
  form,
  fuse,
  gravity,
  hashkey,
  hemi,
  hyperEvm,
  immutableZkEvm,
  lisk,
  morph,
  opBNB,
  pulsechain,
  ronin,
  shibarium,
  soneium,
  swellchain,
  tac,
  unichain,
  vana,
  viction,
  xai,
  xLayer,
  zetachain,
  zircuit,
  zeroNetwork,
  zeroGMainnet,
  bitlayer,
  botanix,
  bsquared,
  merlin,
  polygonZkEvm,
  astar,
  kaia,
  rootstock,
  confluxESpace,
  lens,
  shape,

  // Testnets from viem
  sepolia,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
  bscTestnet,
  gnosisChiado,
  celoSepolia,
  auroraTestnet,
  scrollSepolia,
  mantleSepoliaTestnet,
  modeTestnet,
  blastSepolia,
  taikoHekla,
  zoraSepolia,
  inkSepolia,
  sonicTestnet,
  abstractTestnet,
  b3Sepolia,
  flareTestnet,
  flowTestnet,
  fluenceTestnet,
  formTestnet,
  fuseSparknet,
  hemiSepolia,
  hyperliquidEvmTestnet,
  immutableZkEvmTestnet,
  citreaTestnet,
  giwaSepolia,
  basecampTestnet,
  unichainSepolia,
  vanaMoksha,
  worldchainSepolia,
  xaiTestnet,
  xLayerTestnet,
  zetachainAthensTestnet,
  rootstockTestnet,
  confluxESpaceTestnet,
  lensTestnet,
  shapeSepolia,
  zircuitTestnet,
  soneiumMinato,
  bobSepolia,
} from 'viem/chains'
import type { Chain } from 'viem'

// =============================================================================
// Custom Chain Definitions (not in viem)
// =============================================================================

// Story Mainnet
const storyMainnet: Chain = {
  id: 1514,
  name: 'Story',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://www.storyscan.xyz' } },
}

// Story Aeneid Testnet
const storyAeneid: Chain = {
  id: 1315,
  name: 'Story Aeneid Testnet',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: { default: { http: ['https://aeneid.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://aeneid.explorer.story.foundation' } },
  testnet: true,
}

// ADI Chain
const adiChain: Chain = {
  id: 36900,
  name: 'ADI Chain',
  nativeCurrency: { name: 'ADI', symbol: 'ADI', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.adichain.io'] } },
  blockExplorers: { default: { name: 'ADI Explorer', url: 'https://explorer.adichain' } },
}

// AppChain
const appChain: Chain = {
  id: 466,
  name: 'AppChain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.appchain.xyz'] } },
  blockExplorers: { default: { name: 'AppChain Explorer', url: 'https://explorer.appchain.xyz' } },
}

// Arcadia
const arcadia: Chain = {
  id: 4278608,
  name: 'Arcadia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.arcadia.khalani.network'] } },
  blockExplorers: { default: { name: 'Arcadia Explorer', url: 'https://explorer.arcadia.khalani.network' } },
}

// Artela
const artela: Chain = {
  id: 11820,
  name: 'Artela',
  nativeCurrency: { name: 'ART', symbol: 'ART', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.artela.network'] } },
  blockExplorers: { default: { name: 'Artela Explorer', url: 'https://artscan.artela.network' } },
}

// CarrChain
const carrChain: Chain = {
  id: 7667,
  name: 'CarrChain',
  nativeCurrency: { name: 'CARR', symbol: 'CARR', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.carrchain.io'] } },
  blockExplorers: { default: { name: 'CarrScan', url: 'https://carrscan.io' } },
}

// Coti
const coti: Chain = {
  id: 2632500,
  name: 'Coti',
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.coti.io'] } },
  blockExplorers: { default: { name: 'Coti Explorer', url: 'https://mainnet.cotiscan.io' } },
}

// Endurance
const endurance: Chain = {
  id: 648,
  name: 'Endurance',
  nativeCurrency: { name: 'ACE', symbol: 'ACE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc-endurance.fusionist.io'] } },
  blockExplorers: { default: { name: 'Endurance Explorer', url: 'https://explorer-endurance.fusionist.io' } },
}

// Everclear
const everclear: Chain = {
  id: 25327,
  name: 'Everclear',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.everclear.org'] } },
  blockExplorers: { default: { name: 'Everclear Explorer', url: 'https://scan.everclear.org' } },
}

// Galactica
const galactica: Chain = {
  id: 613419,
  name: 'Galactica',
  nativeCurrency: { name: 'GNET', symbol: 'GNET', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.galactica.com'] } },
  blockExplorers: { default: { name: 'Galactica Explorer', url: 'https://explorer.galactica.com' } },
}

// Incentiv
const incentiv: Chain = {
  id: 24101,
  name: 'Incentiv',
  nativeCurrency: { name: 'INC', symbol: 'INC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.incentiv.io'] } },
  blockExplorers: { default: { name: 'Incentiv Explorer', url: 'https://explorer.incentiv.io' } },
}

// Katana
const katana: Chain = {
  id: 747474,
  name: 'Katana',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.katanarpc.com'] } },
  blockExplorers: { default: { name: 'Katana Explorer', url: 'https://explorer.katanarpc.com' } },
}

// LazAI
const lazai: Chain = {
  id: 52924,
  name: 'LazAI',
  nativeCurrency: { name: 'LAZ', symbol: 'LAZ', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.lazai.network'] } },
  blockExplorers: { default: { name: 'LazAI Explorer', url: 'https://explorer.mainnet.lazai.network' } },
}

// Lit Chain
const litChain: Chain = {
  id: 175200,
  name: 'Lit Chain',
  nativeCurrency: { name: 'LIT', symbol: 'LIT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.litprotocol.com'] } },
  blockExplorers: { default: { name: 'Lit Explorer', url: 'https://lit-chain-explorer.litprotocol.com' } },
}

// LUKSO
const lukso: Chain = {
  id: 42,
  name: 'LUKSO',
  nativeCurrency: { name: 'LYX', symbol: 'LYX', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.lukso.gateway.fm'] } },
  blockExplorers: { default: { name: 'LUKSO Explorer', url: 'https://explorer.execution.mainnet.lukso.network' } },
}

// Lumia Prism
const lumiaPrism: Chain = {
  id: 994873017,
  name: 'Lumia Prism',
  nativeCurrency: { name: 'LUMIA', symbol: 'LUMIA', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.lumia.org'] } },
  blockExplorers: { default: { name: 'Lumia Explorer', url: 'https://explorer.lumia.org' } },
}

// Mantra
const mantra: Chain = {
  id: 5888,
  name: 'Mantra',
  nativeCurrency: { name: 'OM', symbol: 'OM', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mantrachain.io'] } },
  blockExplorers: { default: { name: 'Mantra Explorer', url: 'https://blockscout.mantrascan.io' } },
}

// Matchain
const matchain: Chain = {
  id: 698,
  name: 'Matchain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.matchain.io'] } },
  blockExplorers: { default: { name: 'Matchain Explorer', url: 'https://matchscan.io' } },
}

// MegaETH
const megaETH: Chain = {
  id: 4326,
  name: 'MegaETH',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.megaeth.com'] } },
  blockExplorers: { default: { name: 'MegaETH Explorer', url: 'https://megaeth.blockscout.com' } },
}

// Metal L2
const metalL2: Chain = {
  id: 1750,
  name: 'Metal L2',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.metall2.com'] } },
  blockExplorers: { default: { name: 'Metal Explorer', url: 'https://explorer.metall2.com' } },
}

// Miraclechain
const miraclechain: Chain = {
  id: 92278,
  name: 'Miraclechain',
  nativeCurrency: { name: 'MCH', symbol: 'MCH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.miracleplay.io'] } },
  blockExplorers: { default: { name: 'Miraclechain Explorer', url: 'https://explorer.miracleplay.io' } },
}

// Mitosis
const mitosis: Chain = {
  id: 124816,
  name: 'Mitosis',
  nativeCurrency: { name: 'MITO', symbol: 'MITO', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mitosis.org'] } },
  blockExplorers: { default: { name: 'Mitosis Explorer', url: 'https://mitoscan.io' } },
}

// Molten
const molten: Chain = {
  id: 360,
  name: 'Molten',
  nativeCurrency: { name: 'MOLTEN', symbol: 'MOLTEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://molten.calderachain.xyz/http'] } },
  blockExplorers: { default: { name: 'Molten Explorer', url: 'https://molten.calderaexplorer.xyz' } },
}

// Monad Mainnet (143 - different from testnet)
const monadMainnet: Chain = {
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Monad Explorer', url: 'https://mainnet-beta.monvision.io' } },
}

// Nibiru
const nibiru: Chain = {
  id: 6900,
  name: 'Nibiru',
  nativeCurrency: { name: 'NIBI', symbol: 'NIBI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm-rpc.nibiru.fi'] } },
  blockExplorers: { default: { name: 'Nibiru Explorer', url: 'https://nibiscan.io' } },
}

// Ontology
const ontology: Chain = {
  id: 58,
  name: 'Ontology',
  nativeCurrency: { name: 'ONG', symbol: 'ONG', decimals: 18 },
  rpcUrls: { default: { http: ['https://dappnode1.ont.io:10339'] } },
  blockExplorers: { default: { name: 'Ontology Explorer', url: 'https://explorer.ont.io' } },
}

// Oort
const oort: Chain = {
  id: 970,
  name: 'Oort',
  nativeCurrency: { name: 'OORT', symbol: 'OORT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.oortech.com'] } },
  blockExplorers: { default: { name: 'Oort Explorer', url: 'https://mainnet-scan.oortech.com' } },
}

// Orderly L2
const orderly: Chain = {
  id: 291,
  name: 'Orderly L2',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.orderly.network'] } },
  blockExplorers: { default: { name: 'Orderly Explorer', url: 'https://explorer.orderly.network' } },
}

// Peaq
const peaq: Chain = {
  id: 3338,
  name: 'Peaq',
  nativeCurrency: { name: 'PEAQ', symbol: 'PEAQ', decimals: 18 },
  rpcUrls: { default: { http: ['https://peaq.api.onfinality.io/public'] } },
  blockExplorers: { default: { name: 'Peaq Explorer', url: 'https://peaq.subscan.io' } },
}

// Plasma
const plasma: Chain = {
  id: 9745,
  name: 'Plasma',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.plasma.to'] } },
  blockExplorers: { default: { name: 'Plasma Explorer', url: 'https://plasmascan.to' } },
}

// Plume
const plume: Chain = {
  id: 98866,
  name: 'Plume',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.plume.org'] } },
  blockExplorers: { default: { name: 'Plume Explorer', url: 'https://explorer.plume.org' } },
}

// Polynomial
const polynomial: Chain = {
  id: 8008,
  name: 'Polynomial',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.polynomial.fi'] } },
  blockExplorers: { default: { name: 'Polynomial Explorer', url: 'https://polynomialscan.io' } },
}

// Prom
const prom: Chain = {
  id: 227,
  name: 'Prom',
  nativeCurrency: { name: 'PROM', symbol: 'PROM', decimals: 18 },
  rpcUrls: { default: { http: ['https://prom-blockscout.eu-north-2.gateway.fm/api/v2/main-page/transactions'] } },
  blockExplorers: { default: { name: 'Prom Explorer', url: 'https://prom-blockscout.eu-north-2.gateway.fm' } },
}

// RARI Chain
const rariChain: Chain = {
  id: 1380012617,
  name: 'RARI Chain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.rpc.rarichain.org/http'] } },
  blockExplorers: { default: { name: 'RARI Explorer', url: 'https://mainnet.explorer.rarichain.org' } },
}

// Reactive
const reactive: Chain = {
  id: 1597,
  name: 'Reactive',
  nativeCurrency: { name: 'REACT', symbol: 'REACT', decimals: 18 },
  rpcUrls: { default: { http: ['https://reactive.network'] } },
  blockExplorers: { default: { name: 'Reactive Explorer', url: 'https://reactscan.net' } },
}

// Somnia
const somnia: Chain = {
  id: 5031,
  name: 'Somnia',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.somnia.network'] } },
  blockExplorers: { default: { name: 'Somnia Explorer', url: 'https://explorer.somnia.network' } },
}

// Sophon
const sophon: Chain = {
  id: 50104,
  name: 'Sophon',
  nativeCurrency: { name: 'SOPH', symbol: 'SOPH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sophon.xyz'] } },
  blockExplorers: { default: { name: 'Sophon Explorer', url: 'https://explorer.sophon.xyz' } },
}

// Stable
const stable: Chain = {
  id: 988,
  name: 'Stable',
  nativeCurrency: { name: 'FREE', symbol: 'FREE', decimals: 18 },
  rpcUrls: { default: { http: ['https://free.stablewallet.xyz'] } },
  blockExplorers: { default: { name: 'Stable Explorer', url: 'https://stablescan.xyz' } },
}

// Subtensor
const subtensor: Chain = {
  id: 964,
  name: 'Subtensor',
  nativeCurrency: { name: 'TAO', symbol: 'TAO', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm.bittensor.com'] } },
  blockExplorers: { default: { name: 'Subtensor Explorer', url: 'https://evm.taostats.io' } },
}

// Superposition
const superposition: Chain = {
  id: 55244,
  name: 'Superposition',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.superposition.so'] } },
  blockExplorers: { default: { name: 'Superposition Explorer', url: 'https://explorer.superposition.so' } },
}

// Superseed
const superseed: Chain = {
  id: 5330,
  name: 'Superseed',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.superseed.xyz'] } },
  blockExplorers: { default: { name: 'Superseed Explorer', url: 'https://explorer.superseed.xyz' } },
}

// Tangle
const tangle: Chain = {
  id: 5845,
  name: 'Tangle',
  nativeCurrency: { name: 'TNT', symbol: 'TNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.tangle.tools'] } },
  blockExplorers: { default: { name: 'Tangle Explorer', url: 'https://explorer.tangle.tools' } },
}

// Torus
const torus: Chain = {
  id: 21000,
  name: 'Torus',
  nativeCurrency: { name: 'TORUS', symbol: 'TORUS', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.torus.network'] } },
  blockExplorers: { default: { name: 'Torus Explorer', url: 'https://blockscout.torus.network' } },
}

// XRPL EVM
const xrplEvm: Chain = {
  id: 1440000,
  name: 'XRPL EVM',
  nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.xrplevm.org'] } },
  blockExplorers: { default: { name: 'XRPL EVM Explorer', url: 'https://explorer.xrplevm.org' } },
}

// Corn
const corn: Chain = {
  id: 21000000,
  name: 'Corn',
  nativeCurrency: { name: 'BTCN', symbol: 'BTCN', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.corn.io'] } },
  blockExplorers: { default: { name: 'Corn Explorer', url: 'https://cornscan.io' } },
}

// Curtis (ApeChain Testnet on Tenderly)
const curtis: Chain = {
  id: 33111,
  name: 'Curtis',
  nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.curtis.apechain.com'] } },
  blockExplorers: { default: { name: 'Curtis Explorer', url: 'https://explorer.curtis.apechain.com' } },
}

// Ethereal
const ethereal: Chain = {
  id: 5064014,
  name: 'Ethereal',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.ethereal.io'] } },
  blockExplorers: { default: { name: 'Ethereal Explorer', url: 'https://explorer.ethereal.io' } },
}

// Katana Bokuto
const katanaBokuto: Chain = {
  id: 737373,
  name: 'Katana Bokuto',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.bokuto.katanarpc.com'] } },
  blockExplorers: { default: { name: 'Katana Bokuto Explorer', url: 'https://explorer.bokuto.katanarpc.com' } },
}

// Katana Tatara
const katanaTatara: Chain = {
  id: 129399,
  name: 'Katana Tatara',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.tatara.katanarpc.com'] } },
  blockExplorers: { default: { name: 'Katana Tatara Explorer', url: 'https://explorer.tatara.katanarpc.com' } },
}

// ApexFusion Nexus
const apexFusionNexus: Chain = {
  id: 9069,
  name: 'ApexFusion Nexus',
  nativeCurrency: { name: 'APEX', symbol: 'APEX', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.nexus.apexfusion.org'] } },
  blockExplorers: { default: { name: 'ApexFusion Explorer', url: 'https://explorer.nexus.apexfusion.org' } },
}

// Injective EVM
const injectiveEvm: Chain = {
  id: 1776,
  name: 'Injective EVM',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm.injective.network'] } },
  blockExplorers: { default: { name: 'Injective Explorer', url: 'https://explorer.injective.network' } },
}

// Boba BNB
const bobaBnb: Chain = {
  id: 56288,
  name: 'Boba BNB',
  nativeCurrency: { name: 'BOBA', symbol: 'BOBA', decimals: 18 },
  rpcUrls: { default: { http: ['https://bnb.boba.network'] } },
  blockExplorers: { default: { name: 'Boba BNB Explorer', url: 'https://bnb.bobascan.com' } },
}

// =============================================================================
// Testnet Custom Chains
// =============================================================================

// Arcadia Testnet v2
const arcadiaTestnet: Chain = {
  id: 1098411886,
  name: 'Arcadia Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.khalani.network'] } },
  blockExplorers: { default: { name: 'Arcadia Explorer', url: 'https://explorer.khalani.network' } },
  testnet: true,
}

// CarrChain Testnet
const carrChainTestnet: Chain = {
  id: 76672,
  name: 'CarrChain Testnet',
  nativeCurrency: { name: 'CARR', symbol: 'CARR', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.carrchain.io'] } },
  blockExplorers: { default: { name: 'CarrChain Testnet Explorer', url: 'https://testnet.carrscan.io' } },
  testnet: true,
}

// Coti Testnet
const cotiTestnet: Chain = {
  id: 7082400,
  name: 'Coti Testnet',
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.coti.io'] } },
  blockExplorers: { default: { name: 'Coti Testnet Explorer', url: 'https://testnet.cotiscan.io' } },
  testnet: true,
}

// Incentiv Testnet v2
const incentivTestnet: Chain = {
  id: 28802,
  name: 'Incentiv Testnet',
  nativeCurrency: { name: 'INC', symbol: 'INC', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.incentiv.io'] } },
  blockExplorers: { default: { name: 'Incentiv Testnet Explorer', url: 'https://explorer-testnet.incentiv.io' } },
  testnet: true,
}

// MegaETH Testnet
const megaETHTestnet: Chain = {
  id: 6342,
  name: 'MegaETH Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.megaeth.com'] } },
  blockExplorers: { default: { name: 'MegaETH Testnet Explorer', url: 'https://www.megaexplorer.xyz' } },
  testnet: true,
}

// Monad Testnet
const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Monad Testnet Explorer', url: 'https://explorer.monad-testnet.category.xyz' } },
  testnet: true,
}

// Neura Testnet
const neuraTestnet: Chain = {
  id: 267,
  name: 'Neura Testnet',
  nativeCurrency: { name: 'NEURA', symbol: 'NEURA', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.neuraprotocol.io'] } },
  blockExplorers: { default: { name: 'Neura Testnet Explorer', url: 'https://testnet-blockscout.infra.neuraprotocol.io' } },
  testnet: true,
}

// Somnia Testnet
const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
  blockExplorers: { default: { name: 'Somnia Testnet Explorer', url: 'https://shannon-explorer.somnia.network' } },
  testnet: true,
}

// Subtensor Testnet
const subtensorTestnet: Chain = {
  id: 945,
  name: 'Subtensor Testnet',
  nativeCurrency: { name: 'TAO', symbol: 'TAO', decimals: 18 },
  rpcUrls: { default: { http: ['https://test.evm.bittensor.com'] } },
  blockExplorers: { default: { name: 'Subtensor Testnet Explorer', url: 'https://test.taostats.io' } },
  testnet: true,
}

// Tangle Testnet
const tangleTestnet: Chain = {
  id: 3799,
  name: 'Tangle Testnet',
  nativeCurrency: { name: 'TNT', symbol: 'TNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.tangle.tools'] } },
  blockExplorers: { default: { name: 'Tangle Testnet Explorer', url: 'https://testnet-explorer.tangle.tools' } },
  testnet: true,
}

// Corn Testnet
const cornTestnet: Chain = {
  id: 21000001,
  name: 'Corn Testnet',
  nativeCurrency: { name: 'BTCN', symbol: 'BTCN', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.corn.io'] } },
  blockExplorers: { default: { name: 'Corn Testnet Explorer', url: 'https://testnet.cornscan.io' } },
  testnet: true,
}

// Ethereal Testnet
const etherealTestnet: Chain = {
  id: 13374202,
  name: 'Ethereal Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.ethereal.io'] } },
  blockExplorers: { default: { name: 'Ethereal Testnet Explorer', url: 'https://testnet.explorer.ethereal.io' } },
  testnet: true,
}

// ApexFusion Nexus Testnet
const apexFusionNexusTestnet: Chain = {
  id: 9070,
  name: 'ApexFusion Nexus Testnet',
  nativeCurrency: { name: 'APEX', symbol: 'APEX', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.nexus.apexfusion.org'] } },
  blockExplorers: { default: { name: 'ApexFusion Testnet Explorer', url: 'https://testnet-explorer.nexus.apexfusion.org' } },
  testnet: true,
}

// Injective EVM Testnet
const injectiveEvmTestnet: Chain = {
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.evm.injective.network'] } },
  blockExplorers: { default: { name: 'Injective Testnet Explorer', url: 'https://testnet.explorer.injective.network' } },
  testnet: true,
}

// Bepolia (Berachain Testnet)
const bepolia: Chain = {
  id: 80069,
  name: 'Bepolia',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: { default: { http: ['https://bepolia.rpc.berachain.com'] } },
  blockExplorers: { default: { name: 'Bepolia Explorer', url: 'https://bepolia.beratrail.io' } },
  testnet: true,
}

// Polynomial Sepolia
const polynomialSepolia: Chain = {
  id: 80008,
  name: 'Polynomial Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia-rpc.polynomial.fi'] } },
  blockExplorers: { default: { name: 'Polynomial Sepolia Explorer', url: 'https://sepolia.polynomialscan.io' } },
  testnet: true,
}

// TAC SPB Testnet
const tacSpbTestnet: Chain = {
  id: 2391,
  name: 'TAC SPB Testnet',
  nativeCurrency: { name: 'TAC', symbol: 'TAC', decimals: 18 },
  rpcUrls: { default: { http: ['https://spb-testnet.tac.build'] } },
  blockExplorers: { default: { name: 'TAC Testnet Explorer', url: 'https://spb-testnet-explorer.tac.build' } },
  testnet: true,
}

// Ethereum Hoodi Testnet
const ethereumHoodi: Chain = {
  id: 560048,
  name: 'Ethereum Hoodi',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.hoodi.network'] } },
  blockExplorers: { default: { name: 'Hoodi Explorer', url: 'https://explorer.hoodi.network' } },
  testnet: true,
}

// Boba BNB Testnet
const bobaBnbTestnet: Chain = {
  id: 9728,
  name: 'Boba BNB Testnet',
  nativeCurrency: { name: 'BOBA', symbol: 'BOBA', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.bnb.boba.network'] } },
  blockExplorers: { default: { name: 'Boba BNB Testnet Explorer', url: 'https://testnet.bnb.bobascan.com' } },
  testnet: true,
}

// Boba Sepolia
const bobaSepoliaChain: Chain = {
  id: 28882,
  name: 'Boba Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia.boba.network'] } },
  blockExplorers: { default: { name: 'Boba Sepolia Explorer', url: 'https://sepolia.bobascan.com' } },
  testnet: true,
}

// Swellchain Sepolia
const swellchainSepolia: Chain = {
  id: 1924,
  name: 'Swellchain Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://swell-sepolia.alt.technology'] } },
  blockExplorers: { default: { name: 'Swellchain Sepolia Explorer', url: 'https://sepolia-explorer.swellnetwork.io' } },
  testnet: true,
}

// Plasma Testnet
const plasmaTestnet: Chain = {
  id: 9746,
  name: 'Plasma Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.plasma.to'] } },
  blockExplorers: { default: { name: 'Plasma Testnet Explorer', url: 'https://testnet.plasmascan.to' } },
  testnet: true,
}

// Stable Testnet
const stableTestnet: Chain = {
  id: 2201,
  name: 'Stable Testnet',
  nativeCurrency: { name: 'FREE', symbol: 'FREE', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.stablewallet.xyz'] } },
  blockExplorers: { default: { name: 'Stable Testnet Explorer', url: 'https://testnet.stablescan.xyz' } },
  testnet: true,
}

// peaq agung Testnet
const peaqAgung: Chain = {
  id: 9990,
  name: 'peaq agung',
  nativeCurrency: { name: 'AGUNG', symbol: 'AGUNG', decimals: 18 },
  rpcUrls: { default: { http: ['https://wss-async.agung.peaq.network'] } },
  blockExplorers: { default: { name: 'peaq agung Explorer', url: 'https://agung.subscan.io' } },
  testnet: true,
}

// Metis Sepolia
const metisSepolia: Chain = {
  id: 59902,
  name: 'Metis Sepolia',
  nativeCurrency: { name: 'tMETIS', symbol: 'tMETIS', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia.metisdevops.link'] } },
  blockExplorers: { default: { name: 'Metis Sepolia Explorer', url: 'https://sepolia.explorer.metis.io' } },
  testnet: true,
}

// Sophon Testnet
const sophonTestnet: Chain = {
  id: 531050104,
  name: 'Sophon Testnet',
  nativeCurrency: { name: 'SOPH', symbol: 'SOPH', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.sophon.xyz'] } },
  blockExplorers: { default: { name: 'Sophon Testnet Explorer', url: 'https://testnet.explorer.sophon.xyz' } },
  testnet: true,
}

// Sei Atlantic-2 Testnet
const seiAtlantic2: Chain = {
  id: 1328,
  name: 'Sei Atlantic-2',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm-rpc-testnet.sei-apis.com'] } },
  blockExplorers: { default: { name: 'Sei Testnet Explorer', url: 'https://seitrace.com/?chain=atlantic-2' } },
  testnet: true,
}

// Ronin Saigon Testnet
const roninSaigon: Chain = {
  id: 2021,
  name: 'Ronin Saigon',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: { default: { http: ['https://saigon-testnet.roninchain.com/rpc'] } },
  blockExplorers: { default: { name: 'Ronin Testnet Explorer', url: 'https://saigon-app.roninchain.com' } },
  testnet: true,
}

// Metis Sepolia Testnet (custom since not in viem)
const metisSepoliaCustom: Chain = {
  id: 59902,
  name: 'Metis Sepolia',
  nativeCurrency: { name: 'tMETIS', symbol: 'tMETIS', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia.metisdevops.link'] } },
  blockExplorers: { default: { name: 'Metis Sepolia Explorer', url: 'https://sepolia.explorer.metis.io' } },
  testnet: true,
}

// =============================================================================
// App Mode Configuration
// =============================================================================

export type AppMode = 'testnet' | 'mainnet' | 'both'

const VALID_APP_MODES: AppMode[] = ['testnet', 'mainnet', 'both']

export interface ChainConfigError {
  type: 'app_mode' | 'supported_chains'
  message: string
  details?: string[]
}

let configErrors: ChainConfigError[] = []

export function getChainConfigErrors(): ChainConfigError[] {
  return configErrors
}

export function hasChainConfigErrors(): boolean {
  return configErrors.length > 0
}

function validateAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE

  if (!mode) {
    configErrors.push({
      type: 'app_mode',
      message: 'NEXT_PUBLIC_APP_MODE is required',
      details: [
        `Valid values: ${VALID_APP_MODES.join(', ')}`,
        'Add to your .env.local: NEXT_PUBLIC_APP_MODE=testnet'
      ]
    })
    return 'testnet'
  }

  if (!VALID_APP_MODES.includes(mode as AppMode)) {
    configErrors.push({
      type: 'app_mode',
      message: `Invalid NEXT_PUBLIC_APP_MODE: "${mode}"`,
      details: [`Valid values: ${VALID_APP_MODES.join(', ')}`]
    })
    return 'testnet'
  }

  return mode as AppMode
}

export const APP_MODE = validateAppMode()

// =============================================================================
// Chain Definitions
// =============================================================================

export interface ChainConfig {
  chain: Chain
  name: string
  shortName: string
  rpcUrl: string
  explorerUrl: string
  iconUrl: string
  isTestnet: boolean
}

// Helper to get icon URL
const getIconUrl = (name: string) => `https://icons.llamao.fi/icons/chains/rsz_${name.toLowerCase().replace(/\s+/g, '')}.jpg`

// =============================================================================
// ALL MAINNET CHAINS
// =============================================================================

const ALL_MAINNET_CHAINS: Record<string, ChainConfig> = {
  // === VeryChain (Priority for this branch) ===
  verychain: {
    chain: verychain,
    name: 'VeryChain',
    shortName: 'VERY',
    rpcUrl: '/api/rpc/verychain',
    explorerUrl: 'https://www.veryscan.io',
    iconUrl: '/chain-logos/verychain.png',
    isTestnet: false,
  },
  // === TIER 1: Major L1s & L2s ===
  ethereum: {
    chain: mainnet,
    name: 'Ethereum',
    shortName: 'ETH',
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://etherscan.io',
    iconUrl: getIconUrl('ethereum'),
    isTestnet: false,
  },
  polygon: {
    chain: polygon,
    name: 'Polygon',
    shortName: 'POL',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://polygonscan.com',
    iconUrl: getIconUrl('polygon'),
    isTestnet: false,
  },
  arbitrum: {
    chain: arbitrum,
    name: 'Arbitrum One',
    shortName: 'ARB',
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://arbiscan.io',
    iconUrl: getIconUrl('arbitrum'),
    isTestnet: false,
  },
  'arbitrum-nova': {
    chain: arbitrumNova,
    name: 'Arbitrum Nova',
    shortName: 'NOVA',
    rpcUrl: 'https://nova.arbitrum.io/rpc',
    explorerUrl: 'https://nova.arbiscan.io',
    iconUrl: getIconUrl('arbitrum'),
    isTestnet: false,
  },
  optimism: {
    chain: optimism,
    name: 'Optimism',
    shortName: 'OP',
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://optimistic.etherscan.io',
    iconUrl: getIconUrl('optimism'),
    isTestnet: false,
  },
  base: {
    chain: base,
    name: 'Base',
    shortName: 'BASE',
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://basescan.org',
    iconUrl: getIconUrl('base'),
    isTestnet: false,
  },
  avalanche: {
    chain: avalanche,
    name: 'Avalanche',
    shortName: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    iconUrl: getIconUrl('avalanche'),
    isTestnet: false,
  },
  bsc: {
    chain: bsc,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    iconUrl: getIconUrl('binance'),
    isTestnet: false,
  },
  gnosis: {
    chain: gnosis,
    name: 'Gnosis',
    shortName: 'GNO',
    rpcUrl: 'https://rpc.gnosischain.com',
    explorerUrl: 'https://gnosisscan.io',
    iconUrl: getIconUrl('gnosis'),
    isTestnet: false,
  },
  fantom: {
    chain: fantom,
    name: 'Fantom Opera',
    shortName: 'FTM',
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    iconUrl: getIconUrl('fantom'),
    isTestnet: false,
  },
  celo: {
    chain: celo,
    name: 'Celo',
    shortName: 'CELO',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    iconUrl: getIconUrl('celo'),
    isTestnet: false,
  },

  // === TIER 2: L2s & Sidechains ===
  aurora: {
    chain: aurora,
    name: 'Aurora',
    shortName: 'AURORA',
    rpcUrl: 'https://mainnet.aurora.dev',
    explorerUrl: 'https://explorer.mainnet.aurora.dev',
    iconUrl: getIconUrl('aurora'),
    isTestnet: false,
  },
  'harmony-one': {
    chain: harmonyOne,
    name: 'Harmony One',
    shortName: 'ONE',
    rpcUrl: 'https://api.harmony.one',
    explorerUrl: 'https://explorer.harmony.one',
    iconUrl: getIconUrl('harmony'),
    isTestnet: false,
  },
  moonbeam: {
    chain: moonbeam,
    name: 'Moonbeam',
    shortName: 'GLMR',
    rpcUrl: 'https://rpc.api.moonbeam.network',
    explorerUrl: 'https://moonscan.io',
    iconUrl: getIconUrl('moonbeam'),
    isTestnet: false,
  },
  metis: {
    chain: metis,
    name: 'Metis Andromeda',
    shortName: 'METIS',
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    explorerUrl: 'https://andromeda-explorer.metis.io',
    iconUrl: getIconUrl('metis'),
    isTestnet: false,
  },
  boba: {
    chain: boba,
    name: 'Boba Network',
    shortName: 'BOBA',
    rpcUrl: 'https://mainnet.boba.network',
    explorerUrl: 'https://bobascan.com',
    iconUrl: getIconUrl('boba'),
    isTestnet: false,
  },

  // === TIER 3: zkEVMs & Modern L2s ===
  zksync: {
    chain: zkSync,
    name: 'zkSync Era',
    shortName: 'ZKSYNC',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    iconUrl: getIconUrl('zksync'),
    isTestnet: false,
  },
  linea: {
    chain: linea,
    name: 'Linea',
    shortName: 'LINEA',
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    iconUrl: getIconUrl('linea'),
    isTestnet: false,
  },
  scroll: {
    chain: scroll,
    name: 'Scroll',
    shortName: 'SCROLL',
    rpcUrl: 'https://rpc.scroll.io',
    explorerUrl: 'https://scrollscan.com',
    iconUrl: getIconUrl('scroll'),
    isTestnet: false,
  },
  mantle: {
    chain: mantle,
    name: 'Mantle',
    shortName: 'MNT',
    rpcUrl: 'https://rpc.mantle.xyz',
    explorerUrl: 'https://explorer.mantle.xyz',
    iconUrl: getIconUrl('mantle'),
    isTestnet: false,
  },
  manta: {
    chain: manta,
    name: 'Manta Pacific',
    shortName: 'MANTA',
    rpcUrl: 'https://pacific-rpc.manta.network/http',
    explorerUrl: 'https://pacific-explorer.manta.network',
    iconUrl: getIconUrl('manta'),
    isTestnet: false,
  },
  mode: {
    chain: mode,
    name: 'Mode',
    shortName: 'MODE',
    rpcUrl: 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    iconUrl: getIconUrl('mode'),
    isTestnet: false,
  },
  blast: {
    chain: blast,
    name: 'Blast',
    shortName: 'BLAST',
    rpcUrl: 'https://rpc.blast.io',
    explorerUrl: 'https://blastscan.io',
    iconUrl: getIconUrl('blast'),
    isTestnet: false,
  },
  fraxtal: {
    chain: fraxtal,
    name: 'Fraxtal',
    shortName: 'FRAX',
    rpcUrl: 'https://rpc.frax.com',
    explorerUrl: 'https://fraxscan.com',
    iconUrl: getIconUrl('fraxtal'),
    isTestnet: false,
  },
  taiko: {
    chain: taiko,
    name: 'Taiko',
    shortName: 'TAIKO',
    rpcUrl: 'https://rpc.mainnet.taiko.xyz',
    explorerUrl: 'https://taikoscan.io',
    iconUrl: getIconUrl('taiko'),
    isTestnet: false,
  },
  zora: {
    chain: zora,
    name: 'Zora',
    shortName: 'ZORA',
    rpcUrl: 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    iconUrl: getIconUrl('zora'),
    isTestnet: false,
  },
  'polygon-zkevm': {
    chain: polygonZkEvm,
    name: 'Polygon zkEVM',
    shortName: 'ZKEVM',
    rpcUrl: 'https://zkevm-rpc.com',
    explorerUrl: 'https://zkevm.polygonscan.com',
    iconUrl: getIconUrl('polygon'),
    isTestnet: false,
  },

  // === TIER 4: App-Specific L2s ===
  degen: {
    chain: degen,
    name: 'Degen',
    shortName: 'DEGEN',
    rpcUrl: 'https://rpc.degen.tips',
    explorerUrl: 'https://explorer.degen.tips',
    iconUrl: getIconUrl('degen'),
    isTestnet: false,
  },
  cyber: {
    chain: cyber,
    name: 'Cyber',
    shortName: 'CYBER',
    rpcUrl: 'https://cyber.alt.technology',
    explorerUrl: 'https://cyberscan.co',
    iconUrl: getIconUrl('cyber'),
    isTestnet: false,
  },
  mint: {
    chain: mint,
    name: 'Mint',
    shortName: 'MINT',
    rpcUrl: 'https://rpc.mintchain.io',
    explorerUrl: 'https://explorer.mintchain.io',
    iconUrl: getIconUrl('mint'),
    isTestnet: false,
  },
  redstone: {
    chain: redstone,
    name: 'Redstone',
    shortName: 'RED',
    rpcUrl: 'https://rpc.redstonechain.com',
    explorerUrl: 'https://explorer.redstone.xyz',
    iconUrl: getIconUrl('redstone'),
    isTestnet: false,
  },
  ancient8: {
    chain: ancient8,
    name: 'Ancient8',
    shortName: 'A8',
    rpcUrl: 'https://rpc.ancient8.gg',
    explorerUrl: 'https://scan.ancient8.gg',
    iconUrl: getIconUrl('ancient8'),
    isTestnet: false,
  },
  bob: {
    chain: bob,
    name: 'BOB',
    shortName: 'BOB',
    rpcUrl: 'https://rpc.gobob.xyz',
    explorerUrl: 'https://explorer.gobob.xyz',
    iconUrl: getIconUrl('bob'),
    isTestnet: false,
  },
  worldchain: {
    chain: worldchain,
    name: 'World Chain',
    shortName: 'WLD',
    rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
    explorerUrl: 'https://worldscan.org',
    iconUrl: getIconUrl('worldcoin'),
    isTestnet: false,
  },
  ink: {
    chain: ink,
    name: 'Ink',
    shortName: 'INK',
    rpcUrl: 'https://rpc-gel.inkonchain.com',
    explorerUrl: 'https://explorer.inkonchain.com',
    iconUrl: getIconUrl('ink'),
    isTestnet: false,
  },

  // === TIER 5: Newer L1s & L2s ===
  sei: {
    chain: sei,
    name: 'Sei',
    shortName: 'SEI',
    rpcUrl: 'https://evm-rpc.sei-apis.com',
    explorerUrl: 'https://seitrace.com',
    iconUrl: getIconUrl('sei'),
    isTestnet: false,
  },
  berachain: {
    chain: berachain,
    name: 'Berachain',
    shortName: 'BERA',
    rpcUrl: 'https://rpc.berachain.com',
    explorerUrl: 'https://beratrail.io',
    iconUrl: getIconUrl('berachain'),
    isTestnet: false,
  },
  sonic: {
    chain: sonic,
    name: 'Sonic',
    shortName: 'S',
    rpcUrl: 'https://rpc.soniclabs.com',
    explorerUrl: 'https://sonicscan.org',
    iconUrl: getIconUrl('sonic'),
    isTestnet: false,
  },
  abstract: {
    chain: abstractChain,
    name: 'Abstract',
    shortName: 'ABS',
    rpcUrl: 'https://api.mainnet.abs.xyz',
    explorerUrl: 'https://abscan.org',
    iconUrl: getIconUrl('abstract'),
    isTestnet: false,
  },
  apechain: {
    chain: apeChain,
    name: 'ApeChain',
    shortName: 'APE',
    rpcUrl: 'https://rpc.apechain.com/http',
    explorerUrl: 'https://apescan.io',
    iconUrl: getIconUrl('apechain'),
    isTestnet: false,
  },
  b3: {
    chain: b3,
    name: 'B3',
    shortName: 'B3',
    rpcUrl: 'https://mainnet-rpc.b3.fun',
    explorerUrl: 'https://explorer.b3.fun',
    iconUrl: getIconUrl('b3'),
    isTestnet: false,
  },
  chiliz: {
    chain: chiliz,
    name: 'Chiliz',
    shortName: 'CHZ',
    rpcUrl: 'https://rpc.chiliz.com',
    explorerUrl: 'https://chiliscan.com',
    iconUrl: getIconUrl('chiliz'),
    isTestnet: false,
  },
  core: {
    chain: coreDao,
    name: 'Core',
    shortName: 'CORE',
    rpcUrl: 'https://rpc.coredao.org',
    explorerUrl: 'https://scan.coredao.org',
    iconUrl: getIconUrl('core'),
    isTestnet: false,
  },
  dogechain: {
    chain: dogechain,
    name: 'Dogechain',
    shortName: 'DOGE',
    rpcUrl: 'https://rpc.dogechain.dog',
    explorerUrl: 'https://explorer.dogechain.dog',
    iconUrl: getIconUrl('dogechain'),
    isTestnet: false,
  },
  electroneum: {
    chain: electroneum,
    name: 'Electroneum',
    shortName: 'ETN',
    rpcUrl: 'https://rpc.electroneum.com',
    explorerUrl: 'https://blockexplorer.electroneum.com',
    iconUrl: getIconUrl('electroneum'),
    isTestnet: false,
  },
  flare: {
    chain: flare,
    name: 'Flare',
    shortName: 'FLR',
    rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://flare-explorer.flare.network',
    iconUrl: getIconUrl('flare'),
    isTestnet: false,
  },
  flow: {
    chain: flowMainnet,
    name: 'Flow EVM',
    shortName: 'FLOW',
    rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
    explorerUrl: 'https://evm.flowscan.io',
    iconUrl: getIconUrl('flow'),
    isTestnet: false,
  },
  fluence: {
    chain: fluence,
    name: 'Fluence',
    shortName: 'FLU',
    rpcUrl: 'https://rpc.mainnet.fluence.dev',
    explorerUrl: 'https://blockscout.mainnet.fluence.dev',
    iconUrl: getIconUrl('fluence'),
    isTestnet: false,
  },
  form: {
    chain: form,
    name: 'Form',
    shortName: 'FORM',
    rpcUrl: 'https://rpc.form.network/http',
    explorerUrl: 'https://explorer.form.network',
    iconUrl: getIconUrl('form'),
    isTestnet: false,
  },
  fuse: {
    chain: fuse,
    name: 'Fuse',
    shortName: 'FUSE',
    rpcUrl: 'https://rpc.fuse.io',
    explorerUrl: 'https://explorer.fuse.io',
    iconUrl: getIconUrl('fuse'),
    isTestnet: false,
  },
  gravity: {
    chain: gravity,
    name: 'Gravity',
    shortName: 'G',
    rpcUrl: 'https://rpc.gravity.xyz',
    explorerUrl: 'https://explorer.gravity.xyz',
    iconUrl: getIconUrl('gravity'),
    isTestnet: false,
  },
  hashkey: {
    chain: hashkey,
    name: 'HashKey',
    shortName: 'HSK',
    rpcUrl: 'https://hashkeychain-mainnet.alt.technology',
    explorerUrl: 'https://explorer.hsk.xyz',
    iconUrl: getIconUrl('hashkey'),
    isTestnet: false,
  },
  hemi: {
    chain: hemi,
    name: 'Hemi',
    shortName: 'HEMI',
    rpcUrl: 'https://rpc.hemi.network/rpc',
    explorerUrl: 'https://explorer.hemi.xyz',
    iconUrl: getIconUrl('hemi'),
    isTestnet: false,
  },
  hyperevm: {
    chain: hyperEvm,
    name: 'HyperEVM',
    shortName: 'HYPER',
    rpcUrl: 'https://api.hyperliquid.xyz/evm',
    explorerUrl: 'https://hyperliquid.cloud.blockscout.com',
    iconUrl: getIconUrl('hyperliquid'),
    isTestnet: false,
  },
  'immutable-zkevm': {
    chain: immutableZkEvm,
    name: 'Immutable zkEVM',
    shortName: 'IMX',
    rpcUrl: 'https://rpc.immutable.com',
    explorerUrl: 'https://explorer.immutable.com',
    iconUrl: getIconUrl('immutable'),
    isTestnet: false,
  },
  lisk: {
    chain: lisk,
    name: 'Lisk',
    shortName: 'LSK',
    rpcUrl: 'https://rpc.api.lisk.com',
    explorerUrl: 'https://blockscout.lisk.com',
    iconUrl: getIconUrl('lisk'),
    isTestnet: false,
  },
  morph: {
    chain: morph,
    name: 'Morph',
    shortName: 'MORPH',
    rpcUrl: 'https://rpc.morphl2.io',
    explorerUrl: 'https://explorer.morphl2.io',
    iconUrl: getIconUrl('morph'),
    isTestnet: false,
  },
  opbnb: {
    chain: opBNB,
    name: 'opBNB',
    shortName: 'OPBNB',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnb.bscscan.com',
    iconUrl: getIconUrl('binance'),
    isTestnet: false,
  },
  pulsechain: {
    chain: pulsechain,
    name: 'PulseChain',
    shortName: 'PLS',
    rpcUrl: 'https://rpc.pulsechain.com',
    explorerUrl: 'https://scan.pulsechain.com',
    iconUrl: getIconUrl('pulsechain'),
    isTestnet: false,
  },
  ronin: {
    chain: ronin,
    name: 'Ronin',
    shortName: 'RON',
    rpcUrl: 'https://rpc.roninchain.com',
    explorerUrl: 'https://app.roninchain.com',
    iconUrl: getIconUrl('ronin'),
    isTestnet: false,
  },
  shibarium: {
    chain: shibarium,
    name: 'Shibarium',
    shortName: 'SHIB',
    rpcUrl: 'https://www.shibrpc.com',
    explorerUrl: 'https://shibariumscan.io',
    iconUrl: getIconUrl('shibarium'),
    isTestnet: false,
  },
  soneium: {
    chain: soneium,
    name: 'Soneium',
    shortName: 'SON',
    rpcUrl: 'https://rpc.soneium.org',
    explorerUrl: 'https://soneium.blockscout.com',
    iconUrl: getIconUrl('soneium'),
    isTestnet: false,
  },
  swell: {
    chain: swellchain,
    name: 'Swell',
    shortName: 'SWELL',
    rpcUrl: 'https://swell-mainnet.alt.technology',
    explorerUrl: 'https://explorer.swellnetwork.io',
    iconUrl: getIconUrl('swell'),
    isTestnet: false,
  },
  tac: {
    chain: tac,
    name: 'TAC',
    shortName: 'TAC',
    rpcUrl: 'https://tac-mainnet.alt.technology',
    explorerUrl: 'https://explorer.tac.build',
    iconUrl: getIconUrl('tac'),
    isTestnet: false,
  },
  unichain: {
    chain: unichain,
    name: 'Unichain',
    shortName: 'UNI',
    rpcUrl: 'https://mainnet.unichain.org',
    explorerUrl: 'https://uniscan.xyz',
    iconUrl: getIconUrl('unichain'),
    isTestnet: false,
  },
  vana: {
    chain: vana,
    name: 'Vana',
    shortName: 'VANA',
    rpcUrl: 'https://rpc.vana.org',
    explorerUrl: 'https://vanascan.io',
    iconUrl: getIconUrl('vana'),
    isTestnet: false,
  },
  viction: {
    chain: viction,
    name: 'Viction',
    shortName: 'VIC',
    rpcUrl: 'https://rpc.viction.xyz',
    explorerUrl: 'https://www.vicscan.xyz',
    iconUrl: getIconUrl('viction'),
    isTestnet: false,
  },
  xai: {
    chain: xai,
    name: 'Xai',
    shortName: 'XAI',
    rpcUrl: 'https://xai-chain.net/rpc',
    explorerUrl: 'https://explorer.xai-chain.net',
    iconUrl: getIconUrl('xai'),
    isTestnet: false,
  },
  xlayer: {
    chain: xLayer,
    name: 'X Layer',
    shortName: 'XLAYER',
    rpcUrl: 'https://rpc.xlayer.tech',
    explorerUrl: 'https://www.oklink.com/xlayer',
    iconUrl: getIconUrl('xlayer'),
    isTestnet: false,
  },
  zetachain: {
    chain: zetachain,
    name: 'ZetaChain',
    shortName: 'ZETA',
    rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
    explorerUrl: 'https://explorer.zetachain.com',
    iconUrl: getIconUrl('zetachain'),
    isTestnet: false,
  },
  zircuit: {
    chain: zircuit,
    name: 'Zircuit',
    shortName: 'ZRC',
    rpcUrl: 'https://zircuit1-mainnet.p2pify.com',
    explorerUrl: 'https://explorer.zircuit.com',
    iconUrl: getIconUrl('zircuit'),
    isTestnet: false,
  },
  'zero-network': {
    chain: zeroNetwork,
    name: 'Zero Network',
    shortName: 'ZERO',
    rpcUrl: 'https://rpc.zerion.io/v1/zero',
    explorerUrl: 'https://explorer.zero.network',
    iconUrl: getIconUrl('zero'),
    isTestnet: false,
  },
  '0g': {
    chain: zeroGMainnet,
    name: '0G',
    shortName: '0G',
    rpcUrl: 'https://evmrpc-mainnet.0g.ai',
    explorerUrl: 'https://chainscan.0g.ai',
    iconUrl: getIconUrl('0g'),
    isTestnet: false,
  },
  bitlayer: {
    chain: bitlayer,
    name: 'Bitlayer',
    shortName: 'BTR',
    rpcUrl: 'https://rpc.bitlayer.org',
    explorerUrl: 'https://www.btrscan.com',
    iconUrl: getIconUrl('bitlayer'),
    isTestnet: false,
  },
  botanix: {
    chain: botanix,
    name: 'Botanix',
    shortName: 'BOT',
    rpcUrl: 'https://rpc.botanixlabs.dev',
    explorerUrl: 'https://botanixscan.io',
    iconUrl: getIconUrl('botanix'),
    isTestnet: false,
  },
  bsquared: {
    chain: bsquared,
    name: 'B² Network',
    shortName: 'B2',
    rpcUrl: 'https://rpc.bsquared.network',
    explorerUrl: 'https://explorer.bsquared.network',
    iconUrl: getIconUrl('b2'),
    isTestnet: false,
  },
  merlin: {
    chain: merlin,
    name: 'Merlin',
    shortName: 'MERL',
    rpcUrl: 'https://rpc.merlinchain.io',
    explorerUrl: 'https://scan.merlinchain.io',
    iconUrl: getIconUrl('merlin'),
    isTestnet: false,
  },
  astar: {
    chain: astar,
    name: 'Astar',
    shortName: 'ASTR',
    rpcUrl: 'https://evm.astar.network',
    explorerUrl: 'https://astar.blockscout.com',
    iconUrl: getIconUrl('astar'),
    isTestnet: false,
  },
  kaia: {
    chain: kaia,
    name: 'Kaia',
    shortName: 'KAIA',
    rpcUrl: 'https://public-en.node.kaia.io',
    explorerUrl: 'https://kaiascope.com',
    iconUrl: getIconUrl('kaia'),
    isTestnet: false,
  },

  // === CUSTOM CHAINS (not in viem) ===
  story: {
    chain: storyMainnet,
    name: 'Story',
    shortName: 'IP',
    rpcUrl: 'https://mainnet.storyrpc.io',
    explorerUrl: 'https://www.storyscan.xyz',
    iconUrl: getIconUrl('story'),
    isTestnet: false,
  },
  adi: {
    chain: adiChain,
    name: 'ADI Chain',
    shortName: 'ADI',
    rpcUrl: 'https://rpc.adichain.io',
    explorerUrl: 'https://explorer.adichain',
    iconUrl: getIconUrl('adi'),
    isTestnet: false,
  },
  appchain: {
    chain: appChain,
    name: 'AppChain',
    shortName: 'APP',
    rpcUrl: 'https://rpc.appchain.xyz',
    explorerUrl: 'https://explorer.appchain.xyz',
    iconUrl: getIconUrl('appchain'),
    isTestnet: false,
  },
  arcadia: {
    chain: arcadia,
    name: 'Arcadia',
    shortName: 'ARC',
    rpcUrl: 'https://rpc.arcadia.khalani.network',
    explorerUrl: 'https://explorer.arcadia.khalani.network',
    iconUrl: getIconUrl('arcadia'),
    isTestnet: false,
  },
  artela: {
    chain: artela,
    name: 'Artela',
    shortName: 'ART',
    rpcUrl: 'https://rpc.artela.network',
    explorerUrl: 'https://artscan.artela.network',
    iconUrl: getIconUrl('artela'),
    isTestnet: false,
  },
  carrchain: {
    chain: carrChain,
    name: 'CarrChain',
    shortName: 'CARR',
    rpcUrl: 'https://rpc.carrchain.io',
    explorerUrl: 'https://carrscan.io',
    iconUrl: getIconUrl('carrchain'),
    isTestnet: false,
  },
  coti: {
    chain: coti,
    name: 'Coti',
    shortName: 'COTI',
    rpcUrl: 'https://rpc.coti.io',
    explorerUrl: 'https://mainnet.cotiscan.io',
    iconUrl: getIconUrl('coti'),
    isTestnet: false,
  },
  endurance: {
    chain: endurance,
    name: 'Endurance',
    shortName: 'ACE',
    rpcUrl: 'https://rpc-endurance.fusionist.io',
    explorerUrl: 'https://explorer-endurance.fusionist.io',
    iconUrl: getIconUrl('endurance'),
    isTestnet: false,
  },
  everclear: {
    chain: everclear,
    name: 'Everclear',
    shortName: 'EVER',
    rpcUrl: 'https://rpc.everclear.org',
    explorerUrl: 'https://scan.everclear.org',
    iconUrl: getIconUrl('everclear'),
    isTestnet: false,
  },
  galactica: {
    chain: galactica,
    name: 'Galactica',
    shortName: 'GNET',
    rpcUrl: 'https://rpc.galactica.com',
    explorerUrl: 'https://explorer.galactica.com',
    iconUrl: getIconUrl('galactica'),
    isTestnet: false,
  },
  incentiv: {
    chain: incentiv,
    name: 'Incentiv',
    shortName: 'INC',
    rpcUrl: 'https://rpc.incentiv.io',
    explorerUrl: 'https://explorer.incentiv.io',
    iconUrl: getIconUrl('incentiv'),
    isTestnet: false,
  },
  katana: {
    chain: katana,
    name: 'Katana',
    shortName: 'KATA',
    rpcUrl: 'https://rpc.katanarpc.com',
    explorerUrl: 'https://explorer.katanarpc.com',
    iconUrl: getIconUrl('katana'),
    isTestnet: false,
  },
  lazai: {
    chain: lazai,
    name: 'LazAI',
    shortName: 'LAZ',
    rpcUrl: 'https://rpc.mainnet.lazai.network',
    explorerUrl: 'https://explorer.mainnet.lazai.network',
    iconUrl: getIconUrl('lazai'),
    isTestnet: false,
  },
  litchain: {
    chain: litChain,
    name: 'Lit Chain',
    shortName: 'LIT',
    rpcUrl: 'https://rpc.litprotocol.com',
    explorerUrl: 'https://lit-chain-explorer.litprotocol.com',
    iconUrl: getIconUrl('lit'),
    isTestnet: false,
  },
  lukso: {
    chain: lukso,
    name: 'LUKSO',
    shortName: 'LYX',
    rpcUrl: 'https://rpc.lukso.gateway.fm',
    explorerUrl: 'https://explorer.execution.mainnet.lukso.network',
    iconUrl: getIconUrl('lukso'),
    isTestnet: false,
  },
  'lumia-prism': {
    chain: lumiaPrism,
    name: 'Lumia Prism',
    shortName: 'LUMIA',
    rpcUrl: 'https://rpc.lumia.org',
    explorerUrl: 'https://explorer.lumia.org',
    iconUrl: getIconUrl('lumia'),
    isTestnet: false,
  },
  mantra: {
    chain: mantra,
    name: 'Mantra',
    shortName: 'OM',
    rpcUrl: 'https://rpc.mantrachain.io',
    explorerUrl: 'https://blockscout.mantrascan.io',
    iconUrl: getIconUrl('mantra'),
    isTestnet: false,
  },
  matchain: {
    chain: matchain,
    name: 'Matchain',
    shortName: 'MAT',
    rpcUrl: 'https://rpc.matchain.io',
    explorerUrl: 'https://matchscan.io',
    iconUrl: getIconUrl('matchain'),
    isTestnet: false,
  },
  megaeth: {
    chain: megaETH,
    name: 'MegaETH',
    shortName: 'MEGA',
    rpcUrl: 'https://rpc.megaeth.com',
    explorerUrl: 'https://megaeth.blockscout.com',
    iconUrl: getIconUrl('megaeth'),
    isTestnet: false,
  },
  'metal-l2': {
    chain: metalL2,
    name: 'Metal L2',
    shortName: 'MTL',
    rpcUrl: 'https://rpc.metall2.com',
    explorerUrl: 'https://explorer.metall2.com',
    iconUrl: getIconUrl('metal'),
    isTestnet: false,
  },
  miraclechain: {
    chain: miraclechain,
    name: 'Miraclechain',
    shortName: 'MCH',
    rpcUrl: 'https://rpc.miracleplay.io',
    explorerUrl: 'https://explorer.miracleplay.io',
    iconUrl: getIconUrl('miraclechain'),
    isTestnet: false,
  },
  mitosis: {
    chain: mitosis,
    name: 'Mitosis',
    shortName: 'MITO',
    rpcUrl: 'https://rpc.mitosis.org',
    explorerUrl: 'https://mitoscan.io',
    iconUrl: getIconUrl('mitosis'),
    isTestnet: false,
  },
  molten: {
    chain: molten,
    name: 'Molten',
    shortName: 'MOLT',
    rpcUrl: 'https://molten.calderachain.xyz/http',
    explorerUrl: 'https://molten.calderaexplorer.xyz',
    iconUrl: getIconUrl('molten'),
    isTestnet: false,
  },
  monad: {
    chain: monadMainnet,
    name: 'Monad',
    shortName: 'MON',
    rpcUrl: 'https://rpc.monad.xyz',
    explorerUrl: 'https://mainnet-beta.monvision.io',
    iconUrl: getIconUrl('monad'),
    isTestnet: false,
  },
  nibiru: {
    chain: nibiru,
    name: 'Nibiru',
    shortName: 'NIBI',
    rpcUrl: 'https://evm-rpc.nibiru.fi',
    explorerUrl: 'https://nibiscan.io',
    iconUrl: getIconUrl('nibiru'),
    isTestnet: false,
  },
  ontology: {
    chain: ontology,
    name: 'Ontology',
    shortName: 'ONG',
    rpcUrl: 'https://dappnode1.ont.io:10339',
    explorerUrl: 'https://explorer.ont.io',
    iconUrl: getIconUrl('ontology'),
    isTestnet: false,
  },
  oort: {
    chain: oort,
    name: 'Oort',
    shortName: 'OORT',
    rpcUrl: 'https://rpc.oortech.com',
    explorerUrl: 'https://mainnet-scan.oortech.com',
    iconUrl: getIconUrl('oort'),
    isTestnet: false,
  },
  orderly: {
    chain: orderly,
    name: 'Orderly L2',
    shortName: 'ORDER',
    rpcUrl: 'https://rpc.orderly.network',
    explorerUrl: 'https://explorer.orderly.network',
    iconUrl: getIconUrl('orderly'),
    isTestnet: false,
  },
  peaq: {
    chain: peaq,
    name: 'Peaq',
    shortName: 'PEAQ',
    rpcUrl: 'https://peaq.api.onfinality.io/public',
    explorerUrl: 'https://peaq.subscan.io',
    iconUrl: getIconUrl('peaq'),
    isTestnet: false,
  },
  plasma: {
    chain: plasma,
    name: 'Plasma',
    shortName: 'PLASMA',
    rpcUrl: 'https://rpc.plasma.to',
    explorerUrl: 'https://plasmascan.to',
    iconUrl: getIconUrl('plasma'),
    isTestnet: false,
  },
  plume: {
    chain: plume,
    name: 'Plume',
    shortName: 'PLUME',
    rpcUrl: 'https://rpc.plume.org',
    explorerUrl: 'https://explorer.plume.org',
    iconUrl: getIconUrl('plume'),
    isTestnet: false,
  },
  polynomial: {
    chain: polynomial,
    name: 'Polynomial',
    shortName: 'POLY',
    rpcUrl: 'https://rpc.polynomial.fi',
    explorerUrl: 'https://polynomialscan.io',
    iconUrl: getIconUrl('polynomial'),
    isTestnet: false,
  },
  prom: {
    chain: prom,
    name: 'Prom',
    shortName: 'PROM',
    rpcUrl: 'https://prom-mainnet.alt.technology',
    explorerUrl: 'https://prom-blockscout.eu-north-2.gateway.fm',
    iconUrl: getIconUrl('prom'),
    isTestnet: false,
  },
  rarichain: {
    chain: rariChain,
    name: 'RARI Chain',
    shortName: 'RARI',
    rpcUrl: 'https://mainnet.rpc.rarichain.org/http',
    explorerUrl: 'https://mainnet.explorer.rarichain.org',
    iconUrl: getIconUrl('rari'),
    isTestnet: false,
  },
  reactive: {
    chain: reactive,
    name: 'Reactive',
    shortName: 'REACT',
    rpcUrl: 'https://reactive.network',
    explorerUrl: 'https://reactscan.net',
    iconUrl: getIconUrl('reactive'),
    isTestnet: false,
  },
  somnia: {
    chain: somnia,
    name: 'Somnia',
    shortName: 'SOMNIA',
    rpcUrl: 'https://rpc.somnia.network',
    explorerUrl: 'https://explorer.somnia.network',
    iconUrl: getIconUrl('somnia'),
    isTestnet: false,
  },
  sophon: {
    chain: sophon,
    name: 'Sophon',
    shortName: 'SOPH',
    rpcUrl: 'https://rpc.sophon.xyz',
    explorerUrl: 'https://explorer.sophon.xyz',
    iconUrl: getIconUrl('sophon'),
    isTestnet: false,
  },
  stable: {
    chain: stable,
    name: 'Stable',
    shortName: 'FREE',
    rpcUrl: 'https://free.stablewallet.xyz',
    explorerUrl: 'https://stablescan.xyz',
    iconUrl: getIconUrl('stable'),
    isTestnet: false,
  },
  subtensor: {
    chain: subtensor,
    name: 'Subtensor',
    shortName: 'TAO',
    rpcUrl: 'https://evm.bittensor.com',
    explorerUrl: 'https://evm.taostats.io',
    iconUrl: getIconUrl('bittensor'),
    isTestnet: false,
  },
  superposition: {
    chain: superposition,
    name: 'Superposition',
    shortName: 'SUPER',
    rpcUrl: 'https://rpc.superposition.so',
    explorerUrl: 'https://explorer.superposition.so',
    iconUrl: getIconUrl('superposition'),
    isTestnet: false,
  },
  superseed: {
    chain: superseed,
    name: 'Superseed',
    shortName: 'SEED',
    rpcUrl: 'https://rpc.superseed.xyz',
    explorerUrl: 'https://explorer.superseed.xyz',
    iconUrl: getIconUrl('superseed'),
    isTestnet: false,
  },
  tangle: {
    chain: tangle,
    name: 'Tangle',
    shortName: 'TNT',
    rpcUrl: 'https://rpc.tangle.tools',
    explorerUrl: 'https://explorer.tangle.tools',
    iconUrl: getIconUrl('tangle'),
    isTestnet: false,
  },
  torus: {
    chain: torus,
    name: 'Torus',
    shortName: 'TORUS',
    rpcUrl: 'https://rpc.torus.network',
    explorerUrl: 'https://blockscout.torus.network',
    iconUrl: getIconUrl('torus'),
    isTestnet: false,
  },
  'xrpl-evm': {
    chain: xrplEvm,
    name: 'XRPL EVM',
    shortName: 'XRP',
    rpcUrl: 'https://rpc.xrplevm.org',
    explorerUrl: 'https://explorer.xrplevm.org',
    iconUrl: getIconUrl('xrp'),
    isTestnet: false,
  },

  // === Tenderly-Supported Custom Chains ===
  moonriver: {
    chain: moonriver,
    name: 'Moonriver',
    shortName: 'MOVR',
    rpcUrl: 'https://rpc.api.moonriver.moonbeam.network',
    explorerUrl: 'https://moonriver.moonscan.io',
    iconUrl: getIconUrl('moonriver'),
    isTestnet: false,
  },
  rootstock: {
    chain: rootstock,
    name: 'Rootstock',
    shortName: 'RBTC',
    rpcUrl: 'https://public-node.rsk.co',
    explorerUrl: 'https://explorer.rsk.co',
    iconUrl: getIconUrl('rootstock'),
    isTestnet: false,
  },
  'conflux-espace': {
    chain: confluxESpace,
    name: 'Conflux eSpace',
    shortName: 'CFX',
    rpcUrl: 'https://evm.confluxrpc.com',
    explorerUrl: 'https://evm.confluxscan.io',
    iconUrl: getIconUrl('conflux'),
    isTestnet: false,
  },
  lens: {
    chain: lens,
    name: 'Lens',
    shortName: 'LENS',
    rpcUrl: 'https://rpc.lens.xyz',
    explorerUrl: 'https://explorer.lens.xyz',
    iconUrl: getIconUrl('lens'),
    isTestnet: false,
  },
  shape: {
    chain: shape,
    name: 'Shape',
    shortName: 'SHAPE',
    rpcUrl: 'https://mainnet.shape.network',
    explorerUrl: 'https://shapescan.xyz',
    iconUrl: getIconUrl('shape'),
    isTestnet: false,
  },
  corn: {
    chain: corn,
    name: 'Corn',
    shortName: 'CORN',
    rpcUrl: 'https://rpc.corn.io',
    explorerUrl: 'https://cornscan.io',
    iconUrl: getIconUrl('corn'),
    isTestnet: false,
  },
  curtis: {
    chain: curtis,
    name: 'Curtis',
    shortName: 'CURTIS',
    rpcUrl: 'https://rpc.curtis.apechain.com',
    explorerUrl: 'https://explorer.curtis.apechain.com',
    iconUrl: getIconUrl('apechain'),
    isTestnet: false,
  },
  ethereal: {
    chain: ethereal,
    name: 'Ethereal',
    shortName: 'EREAL',
    rpcUrl: 'https://rpc.ethereal.io',
    explorerUrl: 'https://explorer.ethereal.io',
    iconUrl: getIconUrl('ethereal'),
    isTestnet: false,
  },
  'katana-bokuto': {
    chain: katanaBokuto,
    name: 'Katana Bokuto',
    shortName: 'BOKUTO',
    rpcUrl: 'https://rpc.bokuto.katanarpc.com',
    explorerUrl: 'https://explorer.bokuto.katanarpc.com',
    iconUrl: getIconUrl('katana'),
    isTestnet: false,
  },
  'katana-tatara': {
    chain: katanaTatara,
    name: 'Katana Tatara',
    shortName: 'TATARA',
    rpcUrl: 'https://rpc.tatara.katanarpc.com',
    explorerUrl: 'https://explorer.tatara.katanarpc.com',
    iconUrl: getIconUrl('katana'),
    isTestnet: false,
  },
  'apexfusion-nexus': {
    chain: apexFusionNexus,
    name: 'ApexFusion Nexus',
    shortName: 'APEX',
    rpcUrl: 'https://rpc.nexus.apexfusion.org',
    explorerUrl: 'https://explorer.nexus.apexfusion.org',
    iconUrl: getIconUrl('apexfusion'),
    isTestnet: false,
  },
  injective: {
    chain: injectiveEvm,
    name: 'Injective EVM',
    shortName: 'INJ',
    rpcUrl: 'https://evm.injective.network',
    explorerUrl: 'https://explorer.injective.network',
    iconUrl: getIconUrl('injective'),
    isTestnet: false,
  },
  'boba-bnb': {
    chain: bobaBnb,
    name: 'Boba BNB',
    shortName: 'BOBA-BNB',
    rpcUrl: 'https://bnb.boba.network',
    explorerUrl: 'https://bnb.bobascan.com',
    iconUrl: getIconUrl('boba'),
    isTestnet: false,
  },
}

// =============================================================================
// ALL TESTNET CHAINS
// =============================================================================

const ALL_TESTNET_CHAINS: Record<string, ChainConfig> = {
  // === Major Testnet Networks ===
  sepolia: {
    chain: sepolia,
    name: 'Sepolia',
    shortName: 'SEP',
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://sepolia.etherscan.io',
    iconUrl: getIconUrl('ethereum'),
    isTestnet: true,
  },
  amoy: {
    chain: polygonAmoy,
    name: 'Polygon Amoy',
    shortName: 'AMOY',
    rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorerUrl: 'https://amoy.polygonscan.com',
    iconUrl: getIconUrl('polygon'),
    isTestnet: true,
  },
  'arbitrum-sepolia': {
    chain: arbitrumSepolia,
    name: 'Arbitrum Sepolia',
    shortName: 'ARB-SEP',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    iconUrl: getIconUrl('arbitrum'),
    isTestnet: true,
  },
  'optimism-sepolia': {
    chain: optimismSepolia,
    name: 'Optimism Sepolia',
    shortName: 'OP-SEP',
    rpcUrl: 'https://sepolia.optimism.io',
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    iconUrl: getIconUrl('optimism'),
    isTestnet: true,
  },
  'base-sepolia': {
    chain: baseSepolia,
    name: 'Base Sepolia',
    shortName: 'BASE-SEP',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    iconUrl: getIconUrl('base'),
    isTestnet: true,
  },
  fuji: {
    chain: avalancheFuji,
    name: 'Avalanche Fuji',
    shortName: 'FUJI',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    iconUrl: getIconUrl('avalanche'),
    isTestnet: true,
  },
  'bsc-testnet': {
    chain: bscTestnet,
    name: 'BSC Testnet',
    shortName: 'BSC-TEST',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    iconUrl: getIconUrl('binance'),
    isTestnet: true,
  },
  chiado: {
    chain: gnosisChiado,
    name: 'Gnosis Chiado',
    shortName: 'CHIADO',
    rpcUrl: 'https://rpc.chiadochain.net',
    explorerUrl: 'https://gnosis-chiado.blockscout.com',
    iconUrl: getIconUrl('gnosis'),
    isTestnet: true,
  },
  'celo-sepolia': {
    chain: celoSepolia,
    name: 'Celo Sepolia',
    shortName: 'CELO-SEP',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://celo-sepolia.blockscout.com',
    iconUrl: getIconUrl('celo'),
    isTestnet: true,
  },
  'aurora-testnet': {
    chain: auroraTestnet,
    name: 'Aurora Testnet',
    shortName: 'AURORA-TEST',
    rpcUrl: 'https://testnet.aurora.dev',
    explorerUrl: 'https://explorer.testnet.aurora.dev',
    iconUrl: getIconUrl('aurora'),
    isTestnet: true,
  },
  'scroll-sepolia': {
    chain: scrollSepolia,
    name: 'Scroll Sepolia',
    shortName: 'SCROLL-SEP',
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    explorerUrl: 'https://sepolia.scrollscan.dev',
    iconUrl: getIconUrl('scroll'),
    isTestnet: true,
  },
  'mantle-sepolia': {
    chain: mantleSepoliaTestnet,
    name: 'Mantle Sepolia',
    shortName: 'MNT-SEP',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    explorerUrl: 'https://explorer.sepolia.mantle.xyz',
    iconUrl: getIconUrl('mantle'),
    isTestnet: true,
  },
  'mode-testnet': {
    chain: modeTestnet,
    name: 'Mode Testnet',
    shortName: 'MODE-TEST',
    rpcUrl: 'https://sepolia.mode.network',
    explorerUrl: 'https://testnet.modescan.io',
    iconUrl: getIconUrl('mode'),
    isTestnet: true,
  },
  'blast-sepolia': {
    chain: blastSepolia,
    name: 'Blast Sepolia',
    shortName: 'BLAST-SEP',
    rpcUrl: 'https://sepolia.blast.io',
    explorerUrl: 'https://testnet.blastscan.io',
    iconUrl: getIconUrl('blast'),
    isTestnet: true,
  },
  'taiko-hekla': {
    chain: taikoHekla,
    name: 'Taiko Hekla',
    shortName: 'TAIKO-TEST',
    rpcUrl: 'https://rpc.hekla.taiko.xyz',
    explorerUrl: 'https://hekla.taikoscan.network',
    iconUrl: getIconUrl('taiko'),
    isTestnet: true,
  },
  'zora-sepolia': {
    chain: zoraSepolia,
    name: 'Zora Sepolia',
    shortName: 'ZORA-SEP',
    rpcUrl: 'https://sepolia.rpc.zora.energy',
    explorerUrl: 'https://sepolia.explorer.zora.energy',
    iconUrl: getIconUrl('zora'),
    isTestnet: true,
  },
  'ink-sepolia': {
    chain: inkSepolia,
    name: 'Ink Sepolia',
    shortName: 'INK-SEP',
    rpcUrl: 'https://rpc-gel-sepolia.inkonchain.com',
    explorerUrl: 'https://explorer-sepolia.inkonchain.com',
    iconUrl: getIconUrl('ink'),
    isTestnet: true,
  },
  'sonic-testnet': {
    chain: sonicTestnet,
    name: 'Sonic Testnet',
    shortName: 'S-TEST',
    rpcUrl: 'https://rpc.testnet.soniclabs.com',
    explorerUrl: 'https://testnet.soniclabs.com',
    iconUrl: getIconUrl('sonic'),
    isTestnet: true,
  },
  'abstract-testnet': {
    chain: abstractTestnet,
    name: 'Abstract Testnet',
    shortName: 'ABS-TEST',
    rpcUrl: 'https://api.testnet.abs.xyz',
    explorerUrl: 'https://explorer.testnet.abs.xyz',
    iconUrl: getIconUrl('abstract'),
    isTestnet: true,
  },
  'b3-sepolia': {
    chain: b3Sepolia,
    name: 'B3 Sepolia',
    shortName: 'B3-SEP',
    rpcUrl: 'https://sepolia.b3.fun',
    explorerUrl: 'https://sepolia.explorer.b3.fun',
    iconUrl: getIconUrl('b3'),
    isTestnet: true,
  },
  'flare-testnet': {
    chain: flareTestnet,
    name: 'Flare Testnet',
    shortName: 'FLR-TEST',
    rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://coston2-explorer.flare.network',
    iconUrl: getIconUrl('flare'),
    isTestnet: true,
  },
  'flow-testnet': {
    chain: flowTestnet,
    name: 'Flow Testnet',
    shortName: 'FLOW-TEST',
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    explorerUrl: 'https://evm-testnet.flowscan.io',
    iconUrl: getIconUrl('flow'),
    isTestnet: true,
  },
  'fluence-testnet': {
    chain: fluenceTestnet,
    name: 'Fluence Testnet',
    shortName: 'FLU-TEST',
    rpcUrl: 'https://rpc.testnet.fluence.dev',
    explorerUrl: 'https://blockscout.testnet.fluence.dev',
    iconUrl: getIconUrl('fluence'),
    isTestnet: true,
  },
  'form-testnet': {
    chain: formTestnet,
    name: 'Form Testnet',
    shortName: 'FORM-TEST',
    rpcUrl: 'https://rpc.form-testnet.network/http',
    explorerUrl: 'https://explorer.form-testnet.network',
    iconUrl: getIconUrl('form'),
    isTestnet: true,
  },
  'fuse-sparknet': {
    chain: fuseSparknet,
    name: 'Fuse Sparknet',
    shortName: 'FUSE-TEST',
    rpcUrl: 'https://rpc.fusespark.io',
    explorerUrl: 'https://explorer.fusespark.io',
    iconUrl: getIconUrl('fuse'),
    isTestnet: true,
  },
  'hemi-sepolia': {
    chain: hemiSepolia,
    name: 'Hemi Sepolia',
    shortName: 'HEMI-SEP',
    rpcUrl: 'https://testnet.rpc.hemi.network/rpc',
    explorerUrl: 'https://testnet.explorer.hemi.xyz',
    iconUrl: getIconUrl('hemi'),
    isTestnet: true,
  },
  'hyperliquid-testnet': {
    chain: hyperliquidEvmTestnet,
    name: 'Hyperliquid Testnet',
    shortName: 'HL-TEST',
    rpcUrl: 'https://rpc.hyperlend.finance',
    explorerUrl: 'https://explorer.hyperlend.finance',
    iconUrl: getIconUrl('hyperliquid'),
    isTestnet: true,
  },
  'immutable-testnet': {
    chain: immutableZkEvmTestnet,
    name: 'Immutable Testnet',
    shortName: 'IMX-TEST',
    rpcUrl: 'https://rpc.testnet.immutable.com',
    explorerUrl: 'https://explorer.testnet.immutable.com',
    iconUrl: getIconUrl('immutable'),
    isTestnet: true,
  },
  'citrea-testnet': {
    chain: citreaTestnet,
    name: 'Citrea Testnet',
    shortName: 'CITREA-TEST',
    rpcUrl: 'https://rpc.testnet.citrea.xyz',
    explorerUrl: 'https://explorer.testnet.citrea.xyz',
    iconUrl: getIconUrl('citrea'),
    isTestnet: true,
  },
  'giwa-sepolia': {
    chain: giwaSepolia,
    name: 'GIWA Sepolia',
    shortName: 'GIWA-SEP',
    rpcUrl: 'https://sepolia-rpc.giwa.io',
    explorerUrl: 'https://sepolia-explorer.giwa.io',
    iconUrl: getIconUrl('giwa'),
    isTestnet: true,
  },
  'basecamp-testnet': {
    chain: basecampTestnet,
    name: 'Basecamp Testnet',
    shortName: 'BASECAMP',
    rpcUrl: 'https://basecamp.cloud.blockscout.com',
    explorerUrl: 'https://basecamp.cloud.blockscout.com',
    iconUrl: getIconUrl('basecamp'),
    isTestnet: true,
  },
  'unichain-sepolia': {
    chain: unichainSepolia,
    name: 'Unichain Sepolia',
    shortName: 'UNI-SEP',
    rpcUrl: 'https://sepolia.unichain.org',
    explorerUrl: 'https://sepolia.uniscan.xyz',
    iconUrl: getIconUrl('unichain'),
    isTestnet: true,
  },
  'vana-moksha': {
    chain: vanaMoksha,
    name: 'Vana Moksha',
    shortName: 'VANA-TEST',
    rpcUrl: 'https://rpc.moksha.vana.org',
    explorerUrl: 'https://moksha.vanascan.io',
    iconUrl: getIconUrl('vana'),
    isTestnet: true,
  },
  'worldchain-sepolia': {
    chain: worldchainSepolia,
    name: 'World Chain Sepolia',
    shortName: 'WLD-SEP',
    rpcUrl: 'https://worldchain-sepolia.g.alchemy.com/public',
    explorerUrl: 'https://sepolia.worldscan.org',
    iconUrl: getIconUrl('worldcoin'),
    isTestnet: true,
  },
  'xai-testnet': {
    chain: xaiTestnet,
    name: 'Xai Testnet',
    shortName: 'XAI-TEST',
    rpcUrl: 'https://testnet-v2.xai-chain.net/rpc',
    explorerUrl: 'https://testnet-explorer-v2.xai-chain.net',
    iconUrl: getIconUrl('xai'),
    isTestnet: true,
  },
  'xlayer-testnet': {
    chain: xLayerTestnet,
    name: 'X Layer Testnet',
    shortName: 'XLAYER-TEST',
    rpcUrl: 'https://testrpc.xlayer.tech',
    explorerUrl: 'https://www.oklink.com/xlayer-test',
    iconUrl: getIconUrl('xlayer'),
    isTestnet: true,
  },
  'zetachain-testnet': {
    chain: zetachainAthensTestnet,
    name: 'ZetaChain Athens',
    shortName: 'ZETA-TEST',
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    explorerUrl: 'https://athens.explorer.zetachain.com',
    iconUrl: getIconUrl('zetachain'),
    isTestnet: true,
  },

  // === Custom Testnet Chains ===
  'story-aeneid': {
    chain: storyAeneid,
    name: 'Story Aeneid',
    shortName: 'STORY-TEST',
    rpcUrl: 'https://aeneid.storyrpc.io',
    explorerUrl: 'https://aeneid.explorer.story.foundation',
    iconUrl: getIconUrl('story'),
    isTestnet: true,
  },
  'arcadia-testnet': {
    chain: arcadiaTestnet,
    name: 'Arcadia Testnet',
    shortName: 'ARC-TEST',
    rpcUrl: 'https://rpc.khalani.network',
    explorerUrl: 'https://explorer.khalani.network',
    iconUrl: getIconUrl('arcadia'),
    isTestnet: true,
  },
  'carrchain-testnet': {
    chain: carrChainTestnet,
    name: 'CarrChain Testnet',
    shortName: 'CARR-TEST',
    rpcUrl: 'https://testnet-rpc.carrchain.io',
    explorerUrl: 'https://testnet.carrscan.io',
    iconUrl: getIconUrl('carrchain'),
    isTestnet: true,
  },
  'coti-testnet': {
    chain: cotiTestnet,
    name: 'Coti Testnet',
    shortName: 'COTI-TEST',
    rpcUrl: 'https://testnet-rpc.coti.io',
    explorerUrl: 'https://testnet.cotiscan.io',
    iconUrl: getIconUrl('coti'),
    isTestnet: true,
  },
  'incentiv-testnet': {
    chain: incentivTestnet,
    name: 'Incentiv Testnet',
    shortName: 'INC-TEST',
    rpcUrl: 'https://testnet-rpc.incentiv.io',
    explorerUrl: 'https://explorer-testnet.incentiv.io',
    iconUrl: getIconUrl('incentiv'),
    isTestnet: true,
  },
  'megaeth-testnet': {
    chain: megaETHTestnet,
    name: 'MegaETH Testnet',
    shortName: 'MEGA-TEST',
    rpcUrl: 'https://testnet-rpc.megaeth.com',
    explorerUrl: 'https://www.megaexplorer.xyz',
    iconUrl: getIconUrl('megaeth'),
    isTestnet: true,
  },
  'monad-testnet': {
    chain: monadTestnet,
    name: 'Monad Testnet',
    shortName: 'MON-TEST',
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    explorerUrl: 'https://explorer.monad-testnet.category.xyz',
    iconUrl: getIconUrl('monad'),
    isTestnet: true,
  },
  'neura-testnet': {
    chain: neuraTestnet,
    name: 'Neura Testnet',
    shortName: 'NEURA-TEST',
    rpcUrl: 'https://testnet-rpc.neuraprotocol.io',
    explorerUrl: 'https://testnet-blockscout.infra.neuraprotocol.io',
    iconUrl: getIconUrl('neura'),
    isTestnet: true,
  },
  'somnia-testnet': {
    chain: somniaTestnet,
    name: 'Somnia Testnet',
    shortName: 'SOMNIA-TEST',
    rpcUrl: 'https://dream-rpc.somnia.network',
    explorerUrl: 'https://shannon-explorer.somnia.network',
    iconUrl: getIconUrl('somnia'),
    isTestnet: true,
  },
  'subtensor-testnet': {
    chain: subtensorTestnet,
    name: 'Subtensor Testnet',
    shortName: 'TAO-TEST',
    rpcUrl: 'https://test.evm.bittensor.com',
    explorerUrl: 'https://test.taostats.io',
    iconUrl: getIconUrl('bittensor'),
    isTestnet: true,
  },
  'tangle-testnet': {
    chain: tangleTestnet,
    name: 'Tangle Testnet',
    shortName: 'TNT-TEST',
    rpcUrl: 'https://testnet-rpc.tangle.tools',
    explorerUrl: 'https://testnet-explorer.tangle.tools',
    iconUrl: getIconUrl('tangle'),
    isTestnet: true,
  },

  // === Tenderly-Supported Testnet Chains ===
  'rootstock-testnet': {
    chain: rootstockTestnet,
    name: 'Rootstock Testnet',
    shortName: 'tRBTC',
    rpcUrl: 'https://public-node.testnet.rsk.co',
    explorerUrl: 'https://explorer.testnet.rsk.co',
    iconUrl: getIconUrl('rootstock'),
    isTestnet: true,
  },
  'conflux-espace-testnet': {
    chain: confluxESpaceTestnet,
    name: 'Conflux eSpace Testnet',
    shortName: 'CFX-TEST',
    rpcUrl: 'https://evmtestnet.confluxrpc.com',
    explorerUrl: 'https://evmtestnet.confluxscan.io',
    iconUrl: getIconUrl('conflux'),
    isTestnet: true,
  },
  'lens-testnet': {
    chain: lensTestnet,
    name: 'Lens Testnet',
    shortName: 'LENS-TEST',
    rpcUrl: 'https://rpc.testnet.lens.dev',
    explorerUrl: 'https://testnet.explorer.lens.xyz',
    iconUrl: getIconUrl('lens'),
    isTestnet: true,
  },
  'shape-sepolia': {
    chain: shapeSepolia,
    name: 'Shape Sepolia',
    shortName: 'SHAPE-SEP',
    rpcUrl: 'https://sepolia.shape.network',
    explorerUrl: 'https://sepolia.shapescan.xyz',
    iconUrl: getIconUrl('shape'),
    isTestnet: true,
  },
  'zircuit-testnet': {
    chain: zircuitTestnet,
    name: 'Zircuit Garfield',
    shortName: 'ZRC-TEST',
    rpcUrl: 'https://zircuit1-testnet.p2pify.com',
    explorerUrl: 'https://explorer.testnet.zircuit.com',
    iconUrl: getIconUrl('zircuit'),
    isTestnet: true,
  },
  'ronin-testnet': {
    chain: roninSaigon,
    name: 'Ronin Saigon',
    shortName: 'RON-TEST',
    rpcUrl: 'https://saigon-testnet.roninchain.com/rpc',
    explorerUrl: 'https://saigon-app.roninchain.com',
    iconUrl: getIconUrl('ronin'),
    isTestnet: true,
  },
  'soneium-minato': {
    chain: soneiumMinato,
    name: 'Soneium Minato',
    shortName: 'SON-TEST',
    rpcUrl: 'https://rpc.minato.soneium.org',
    explorerUrl: 'https://minato.soneium.blockscout.com',
    iconUrl: getIconUrl('soneium'),
    isTestnet: true,
  },
  'bob-sepolia': {
    chain: bobSepolia,
    name: 'BOB Sepolia',
    shortName: 'BOB-SEP',
    rpcUrl: 'https://testnet.rpc.gobob.xyz',
    explorerUrl: 'https://testnet.explorer.gobob.xyz',
    iconUrl: getIconUrl('bob'),
    isTestnet: true,
  },
  'corn-testnet': {
    chain: cornTestnet,
    name: 'Corn Testnet',
    shortName: 'CORN-TEST',
    rpcUrl: 'https://testnet-rpc.corn.io',
    explorerUrl: 'https://testnet.cornscan.io',
    iconUrl: getIconUrl('corn'),
    isTestnet: true,
  },
  'ethereal-testnet': {
    chain: etherealTestnet,
    name: 'Ethereal Testnet',
    shortName: 'EREAL-TEST',
    rpcUrl: 'https://testnet-rpc.ethereal.io',
    explorerUrl: 'https://testnet.explorer.ethereal.io',
    iconUrl: getIconUrl('ethereal'),
    isTestnet: true,
  },
  'apexfusion-testnet': {
    chain: apexFusionNexusTestnet,
    name: 'ApexFusion Nexus Testnet',
    shortName: 'APEX-TEST',
    rpcUrl: 'https://testnet-rpc.nexus.apexfusion.org',
    explorerUrl: 'https://testnet-explorer.nexus.apexfusion.org',
    iconUrl: getIconUrl('apexfusion'),
    isTestnet: true,
  },
  'injective-testnet': {
    chain: injectiveEvmTestnet,
    name: 'Injective EVM Testnet',
    shortName: 'INJ-TEST',
    rpcUrl: 'https://testnet.evm.injective.network',
    explorerUrl: 'https://testnet.explorer.injective.network',
    iconUrl: getIconUrl('injective'),
    isTestnet: true,
  },
  bepolia: {
    chain: bepolia,
    name: 'Bepolia',
    shortName: 'BERA-TEST',
    rpcUrl: 'https://bepolia.rpc.berachain.com',
    explorerUrl: 'https://bepolia.beratrail.io',
    iconUrl: getIconUrl('berachain'),
    isTestnet: true,
  },
  'polynomial-sepolia': {
    chain: polynomialSepolia,
    name: 'Polynomial Sepolia',
    shortName: 'POLY-SEP',
    rpcUrl: 'https://sepolia-rpc.polynomial.fi',
    explorerUrl: 'https://sepolia.polynomialscan.io',
    iconUrl: getIconUrl('polynomial'),
    isTestnet: true,
  },
  'tac-testnet': {
    chain: tacSpbTestnet,
    name: 'TAC SPB Testnet',
    shortName: 'TAC-TEST',
    rpcUrl: 'https://spb-testnet.tac.build',
    explorerUrl: 'https://spb-testnet-explorer.tac.build',
    iconUrl: getIconUrl('tac'),
    isTestnet: true,
  },
  'ethereum-hoodi': {
    chain: ethereumHoodi,
    name: 'Ethereum Hoodi',
    shortName: 'HOODI',
    rpcUrl: 'https://rpc.hoodi.network',
    explorerUrl: 'https://explorer.hoodi.network',
    iconUrl: getIconUrl('ethereum'),
    isTestnet: true,
  },
  'boba-bnb-testnet': {
    chain: bobaBnbTestnet,
    name: 'Boba BNB Testnet',
    shortName: 'BOBA-BNB-TEST',
    rpcUrl: 'https://testnet.bnb.boba.network',
    explorerUrl: 'https://testnet.bnb.bobascan.com',
    iconUrl: getIconUrl('boba'),
    isTestnet: true,
  },
  'boba-sepolia': {
    chain: bobaSepoliaChain,
    name: 'Boba Sepolia',
    shortName: 'BOBA-SEP',
    rpcUrl: 'https://sepolia.boba.network',
    explorerUrl: 'https://sepolia.bobascan.com',
    iconUrl: getIconUrl('boba'),
    isTestnet: true,
  },
  'swellchain-sepolia': {
    chain: swellchainSepolia,
    name: 'Swellchain Sepolia',
    shortName: 'SWELL-SEP',
    rpcUrl: 'https://swell-sepolia.alt.technology',
    explorerUrl: 'https://sepolia-explorer.swellnetwork.io',
    iconUrl: getIconUrl('swell'),
    isTestnet: true,
  },
  'plasma-testnet': {
    chain: plasmaTestnet,
    name: 'Plasma Testnet',
    shortName: 'PLASMA-TEST',
    rpcUrl: 'https://testnet-rpc.plasma.to',
    explorerUrl: 'https://testnet.plasmascan.to',
    iconUrl: getIconUrl('plasma'),
    isTestnet: true,
  },
  'stable-testnet': {
    chain: stableTestnet,
    name: 'Stable Testnet',
    shortName: 'FREE-TEST',
    rpcUrl: 'https://testnet.stablewallet.xyz',
    explorerUrl: 'https://testnet.stablescan.xyz',
    iconUrl: getIconUrl('stable'),
    isTestnet: true,
  },
  'peaq-agung': {
    chain: peaqAgung,
    name: 'peaq agung',
    shortName: 'PEAQ-TEST',
    rpcUrl: 'https://wss-async.agung.peaq.network',
    explorerUrl: 'https://agung.subscan.io',
    iconUrl: getIconUrl('peaq'),
    isTestnet: true,
  },
  'metis-sepolia': {
    chain: metisSepoliaCustom,
    name: 'Metis Sepolia',
    shortName: 'METIS-SEP',
    rpcUrl: 'https://sepolia.metisdevops.link',
    explorerUrl: 'https://sepolia.explorer.metis.io',
    iconUrl: getIconUrl('metis'),
    isTestnet: true,
  },
  'sophon-testnet': {
    chain: sophonTestnet,
    name: 'Sophon Testnet',
    shortName: 'SOPH-TEST',
    rpcUrl: 'https://testnet-rpc.sophon.xyz',
    explorerUrl: 'https://testnet.explorer.sophon.xyz',
    iconUrl: getIconUrl('sophon'),
    isTestnet: true,
  },
  'sei-testnet': {
    chain: seiAtlantic2,
    name: 'Sei Atlantic-2',
    shortName: 'SEI-TEST',
    rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
    explorerUrl: 'https://seitrace.com/?chain=atlantic-2',
    iconUrl: getIconUrl('sei'),
    isTestnet: true,
  },
}

// Combined for reference
const ALL_CHAINS: Record<string, ChainConfig> = {
  ...ALL_MAINNET_CHAINS,
  ...ALL_TESTNET_CHAINS,
}

// =============================================================================
// Supported Chains Filter
// =============================================================================

function getAvailableChainsForMode(): Record<string, ChainConfig> {
  switch (APP_MODE) {
    case 'testnet':
      return ALL_TESTNET_CHAINS
    case 'mainnet':
      return ALL_MAINNET_CHAINS
    case 'both':
      return ALL_CHAINS
  }
}

function validateSupportedChains(): Record<string, ChainConfig> {
  const availableChains = getAvailableChainsForMode()
  const availableChainNames = Object.keys(availableChains)

  const supportedChainsEnv = process.env.NEXT_PUBLIC_SUPPORTED_CHAINS

  if (!supportedChainsEnv) {
    return availableChains
  }

  const requestedChains = supportedChainsEnv
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter((c) => c.length > 0)

  if (requestedChains.length === 0) {
    configErrors.push({
      type: 'supported_chains',
      message: 'NEXT_PUBLIC_SUPPORTED_CHAINS is set but empty',
      details: [
        'Either remove this variable to use all chains, or specify chains.',
        `Available chains for ${APP_MODE} mode: ${availableChainNames.join(', ')}`
      ]
    })
    return availableChains
  }

  const invalidChains: string[] = []
  const modeInvalidChains: string[] = []
  const validChains: Record<string, ChainConfig> = {}

  for (const chainName of requestedChains) {
    if (availableChains[chainName]) {
      validChains[chainName] = availableChains[chainName]
    } else if (ALL_CHAINS[chainName]) {
      modeInvalidChains.push(chainName)
    } else {
      invalidChains.push(chainName)
    }
  }

  if (invalidChains.length > 0) {
    configErrors.push({
      type: 'supported_chains',
      message: `Unknown chains: ${invalidChains.join(', ')}`,
      details: [`Available: ${Object.keys(ALL_CHAINS).join(', ')}`]
    })
  }

  if (modeInvalidChains.length > 0) {
    configErrors.push({
      type: 'supported_chains',
      message: `Chains not available in ${APP_MODE} mode: ${modeInvalidChains.join(', ')}`,
      details: [`Available: ${availableChainNames.join(', ')}`]
    })
  }

  if (Object.keys(validChains).length === 0) {
    configErrors.push({
      type: 'supported_chains',
      message: 'No valid chains in NEXT_PUBLIC_SUPPORTED_CHAINS',
      details: [`Falling back to all available chains for ${APP_MODE} mode`]
    })
    return availableChains
  }

  return validChains
}

// =============================================================================
// Lazy Computed Exports (computed on first access for better performance)
// =============================================================================

let _cachedSupportedChains: Record<string, ChainConfig> | null = null

export function getSupportedChains(): Record<string, ChainConfig> {
  if (!_cachedSupportedChains) {
    _cachedSupportedChains = validateSupportedChains()
  }
  return _cachedSupportedChains
}

// For backwards compatibility - use getter for lazy evaluation
export const SUPPORTED_CHAINS = new Proxy({} as Record<string, ChainConfig>, {
  get(_, prop) {
    return getSupportedChains()[prop as string]
  },
  ownKeys() {
    return Object.keys(getSupportedChains())
  },
  getOwnPropertyDescriptor(_, prop) {
    const chains = getSupportedChains()
    if (prop in chains) {
      return { enumerable: true, configurable: true, value: chains[prop as string] }
    }
    return undefined
  },
  has(_, prop) {
    return prop in getSupportedChains()
  }
})

// =============================================================================
// Chain Getters
// =============================================================================

export function getSupportedChainList(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS)
}

export function getSupportedViemChains(): Chain[] {
  return getSupportedChainList().map((c) => c.chain)
}

export function getSupportedChainIds(): number[] {
  return getSupportedChainList().map((c) => c.chain.id)
}

export function getChainById(chainId: number): ChainConfig | undefined {
  return getSupportedChainList().find((c) => c.chain.id === chainId)
}

export function getChainByName(name: string): ChainConfig | undefined {
  return SUPPORTED_CHAINS[name.toLowerCase()]
}

export function isChainSupported(chainId: number): boolean {
  return getSupportedChainIds().includes(chainId)
}

export function getChainTransports(): Record<number, string> {
  const chains = getSupportedChainList()
  const transports: Record<number, string> = {}

  for (const chain of chains) {
    transports[chain.chain.id] = chain.rpcUrl
  }

  return transports
}

export function getDefaultChain(): ChainConfig {
  const chains = getSupportedChainList()
  if (chains.length === 0) {
    throw new Error('[Chain Config] No chains available for current configuration')
  }
  return chains[0]
}

// =============================================================================
// Convenience Exports
// =============================================================================

// These share the cached getSupportedChains() result via the Proxy above
export const SUPPORTED_CHAIN_LIST = getSupportedChainList()
export const SUPPORTED_VIEM_CHAINS = getSupportedViemChains()
export const SUPPORTED_CHAIN_IDS = getSupportedChainIds()

export const ALL_AVAILABLE_CHAINS = ALL_CHAINS
export const MAINNET_CHAIN_NAMES = Object.keys(ALL_MAINNET_CHAINS)
export const TESTNET_CHAIN_NAMES = Object.keys(ALL_TESTNET_CHAINS)

// Export chain counts for documentation
export const TOTAL_MAINNET_CHAINS = Object.keys(ALL_MAINNET_CHAINS).length
export const TOTAL_TESTNET_CHAINS = Object.keys(ALL_TESTNET_CHAINS).length
export const TOTAL_CHAINS = Object.keys(ALL_CHAINS).length

// =============================================================================
// Helper Functions (backwards compatible with legacy lib/web3/chains.ts)
// =============================================================================

export function getChainName(chainId: number): string {
  const chain = getChainById(chainId)
  return chain?.name || 'Unknown Chain'
}

export function getExplorerUrl(chainId: number): string | undefined {
  const chain = getChainById(chainId)
  return chain?.explorerUrl
}

export function getExplorerLink(
  chainId: number,
  hash: string,
  type: 'tx' | 'address' | 'token' | 'block' = 'tx'
): string | null {
  const explorerUrl = getExplorerUrl(chainId)
  if (!explorerUrl) return null

  switch (type) {
    case 'tx':
      return `${explorerUrl}/tx/${hash}`
    case 'address':
      return `${explorerUrl}/address/${hash}`
    case 'token':
      return `${explorerUrl}/token/${hash}`
    case 'block':
      return `${explorerUrl}/block/${hash}`
    default:
      return `${explorerUrl}/tx/${hash}`
  }
}

export function isTestnet(chainId: number): boolean {
  const chain = getChainById(chainId)
  return chain?.isTestnet || false
}

export function getChainIcon(chainId: number): string | undefined {
  const chain = getChainById(chainId)
  return chain?.iconUrl
}
