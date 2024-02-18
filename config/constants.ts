export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'xxx'
export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api'
export const BLOCK_EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://etherscan.io'

export const ETH_PRICE_ENDPOINT = process.env.NEXT_PUBLIC_ETH_PRICE_ENDPOINT || 'https://api.coinbase.com/v2/prices/ETH-USD/buy'

export const MARKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS || '0xAAA'

export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'goerli'
export const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY || ''
export const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

export const MARKET_CONTRACT_DOMAIN = {
  name: "VERC20Market",
  version: "1.0",
  verifyingContract: MARKET_CONTRACT_ADDRESS,
}

export const MARKET_CONTRACT_ORDER_TYPES = {
  VERC20Order: [
    {name: "maker", type: "address"},
    {name: "sell", type: "bool"},
    {name: "listId", type: "bytes32"},
    {name: "tick", type: "string"},
    {name: "amount", type: "uint256"},
    {name: "price", type: "uint256"},
    {name: "listingTime", type: "uint64"},
    {name: "expirationTime", type: "uint64"},
  ]
}

export const FREEZE_ORDER_TYPES = {
  VERC20Freeze: [
    {name: "owner", type: "address"},
    {name: "amount", type: "uint256"},
    {name: "tick", type: "string"},
  ]
}

export const PROTOCOL_FEE_RATE = 0.015
export const LIQUIDITY_REWARD_RATE = 0.005