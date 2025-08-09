import { FastifyPluginAsync } from 'fastify'
import { Wallet } from '../models/wallet.js'
import fp from 'fastify-plugin'
import { Starknet } from './starknet.js'
import BN from 'bn.js'

interface IBalanceSchema {
  Params: { publicKey: string }
}

interface IUpdateSchema {
  Params: { publicKey: string }
  Body: { balance: number }
}

interface IRegisterSchema {
  Params: { publicKey: string }
}

const wallet: FastifyPluginAsync = async (fastify) => {
  const hooks = { onRequest: [fastify.authenticate], onSend: [fastify.encryptPayload] }

  fastify.get('/wallet', hooks, async (request) => {
    const wallets = await request.orm.em.getRepository(Wallet).findAll({ fields: ['publicKey'] })
    const keys = wallets.map((wallet) => wallet.publicKey)
    return { keys }
  })

  fastify.post<IRegisterSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params
    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)
    return reply.status(201).send()
  })

  fastify.get<IBalanceSchema>('/wallet/:publicKey', hooks, async (request) => {
    const { publicKey } = request.params
    const balance = await request.starknet.query<bigint>('balanceOf', publicKey)
    return { balance: balance.toString() }
  })

  async function updateBalanceAsync(sn: Starknet, address: string, balance: number) {
    const current = await sn.getBalance(address)
    const MIN_THRESHOLD = new BN('5000000000000000')
    const BOOST_AMOUNT = new BN('10000000000000000')
    if (new BN(current.toString()).lt(MIN_THRESHOLD)) {
      await sn.transfer(address, BigInt(BOOST_AMOUNT.toString()))
    }
    await sn.transact('update', balance)
  }

  fastify.put<IUpdateSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params
    const { balance } = request.body
    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)
    updateBalanceAsync(request.starknet, publicKey, balance)
    return reply.status(204).send()
  })
}

export default fp(wallet)
