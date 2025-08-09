import { FastifyPluginAsync } from 'fastify'
import { RpcProvider, Account, Contract } from 'starknet'
import fp from 'fastify-plugin'
import {
  STARKNET_RPC_URL,
  STARKNET_ACCOUNT_ADDRESS,
  STARKNET_PRIVATE_KEY,
  STARKNET_CONTRACT_ADDRESS,
} from '../config.js'

export interface Starknet {
  account: Account
  contract: Contract
  query<T = unknown>(name: string, ...params: any[]): Promise<T>
  transact(name: string, ...params: any[]): Promise<void>
  getBalance(address: string): Promise<bigint>
  transfer(address: string, amount: bigint): Promise<void>
}

declare module 'fastify' {
  interface FastifyRequest {
    starknet: Starknet
  }
}

const starknetPlugin: FastifyPluginAsync = async (fastify) => {
  const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL })
  const account = new Account(provider, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY)
  const contract = new Contract([], STARKNET_CONTRACT_ADDRESS, account)

  const query = async (name: string, ...params: any[]) => {
    return (await contract.call(name, params)) as any
  }

  const transact = async (name: string, ...params: any[]) => {
    await contract.invoke(name, params)
  }

  const getBalance = async (address: string): Promise<bigint> => {
    const result = await contract.call('balanceOf', [address])
    return BigInt(result[0] ?? 0)
  }

  const transfer = async (address: string, amount: bigint) => {
    await contract.invoke('transfer', [address, amount])
  }

  const starknet: Starknet = {
    account,
    contract,
    query,
    transact,
    getBalance,
    transfer,
  }

  fastify.addHook('onRequest', async (request) => {
    request.starknet = starknet
  })
}

export default fp(starknetPlugin)
