import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Account, Contract, RpcProvider, uint256 } from 'starknet'
import {
  STARKNET_ACCOUNT_ADDRESS,
  STARKNET_CONTRACT,
  STARKNET_PRIVATE_KEY,
  STARKNET_RPC_URL,
} from '../config.js'

// Minimal ERC20 ABI for balance checks and transfers
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt' }],
    outputs: [{ name: 'balance', type: 'Uint256' }],
  },
] as const

const ETH_CONTRACT =
  '0x049d36570d4e46f4d22c1b0d71cfa2f8e9f10e39eb9dd0fca6c3f63173d74f9a' // Sepolia ETH

export interface StarkNet {
  account: Account
  contract: Contract
  provider: RpcProvider
  query<T = unknown>(name: string, ...params: any[]): Promise<T>
  transact(name: string, ...params: any[]): Promise<void>
  transactAs(address: string, privateKey: string, name: string, ...params: any[]): Promise<void>
  getBalance(address: string): Promise<bigint>
  transfer(address: string, amount: bigint): Promise<void>
}

declare module 'fastify' {
  interface FastifyRequest {
    sn: StarkNet
  }
}

const starknetPlugin: FastifyPluginAsync = async (fastify) => {
  const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL })

  const account = new Account(
    provider,
    STARKNET_ACCOUNT_ADDRESS!,
    STARKNET_PRIVATE_KEY!,
  )

  const { abi } = await provider.getClassAt(STARKNET_CONTRACT!)
  if (!abi) throw new Error('Missing ABI for StarkNet contract')
  const contract = new Contract(abi, STARKNET_CONTRACT!, account)

  const eth = new Contract(ERC20_ABI as any, ETH_CONTRACT, account)

  async function query<T>(name: string, ...params: any[]): Promise<T> {
    const res = await contract.call(name, params as any)
    // contract.call may return array or object; return as-is
    return res as T
  }

  async function transact(name: string, ...params: any[]): Promise<void> {
    const { transaction_hash } = await contract.invoke(name, params as any)
    await provider.waitForTransaction(transaction_hash)
  }

  async function transactAs(
    address: string,
    privateKey: string,
    name: string,
    ...params: any[]
  ): Promise<void> {
    const acc = new Account(provider, address, privateKey)
    const ctr = new Contract(contract.abi, STARKNET_CONTRACT!, acc)
    const { transaction_hash } = await ctr.invoke(name, params as any)
    await provider.waitForTransaction(transaction_hash)
  }

  async function getBalance(address: string): Promise<bigint> {
    const { balance } = (await eth.balanceOf(address)) as any
    return uint256.uint256ToBN(balance)
  }

  async function transfer(address: string, amount: bigint): Promise<void> {
    const u = uint256.bnToUint256(amount)
    const { transaction_hash } = await eth.invoke('transfer', [address, u.low, u.high])
    await provider.waitForTransaction(transaction_hash)
  }

  const sn: StarkNet = {
    account,
    contract,
    provider,
    query,
    transact,
    transactAs,
    getBalance,
    transfer,
  }

  fastify.addHook('onRequest', async (req) => {
    req.sn = sn
  })
}

export default fp(starknetPlugin)
