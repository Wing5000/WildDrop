export type Environment = 'development' | 'production' | 'testing'

const s2b = (s?: string) => ['1', 'true'].includes(s?.toLowerCase())

export const PORT = Number(process.env.PORT) || 9876

export const DB_HOST = process.env.DB_HOST ?? 'localhost'
export const DB_NAME = process.env.DB_NAME ?? 'WildDrop'
export const DB_USER = process.env.DB_USER ?? 'WildDrop'
export const DB_PASS = process.env.DB_PASS ?? 'WildDrop'
export const DB_DEBUG = s2b(process.env.DB_PASS)

export const SESSION_EXPIRE = Number(process.env.SESSION_EXPIRE) || 60

export const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL ?? ''
export const STARKNET_ACCOUNT_ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS ?? ''
export const STARKNET_PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY ?? ''
export const STARKNET_CONTRACT_ADDRESS = process.env.STARKNET_CONTRACT_ADDRESS ?? ''

export const NODE_ENV: Environment = process.env.NODE_ENV as Environment
