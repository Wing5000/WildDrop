import { FastifyPluginAsync } from 'fastify'
import { Wallet } from '../models/wallet.js'
import fp from 'fastify-plugin'
import { StarkNet } from './starknet.js'

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

interface IRequestSchema {
  Body: { publicKey: string; privateKey: string; balance: number }
}

interface ITransferSchema {
  Body: { publicKey: string; motes: string }
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
    const address = publicKey.startsWith('0x') ? publicKey : '0x' + publicKey

    const balance: any = await request.sn.query('balanceOf', address)

    return { balance }
  })

  async function updateBalanceAsync(sn: StarkNet, publicKey: string, balance: number) {
    const address = publicKey.startsWith('0x') ? publicKey : '0x' + publicKey

    const eth = await sn.getBalance(address)

    const MIN_THRESHOLD = 5000000000000000n // 0.005 ETH
    const BOOST_AMOUNT = 10000000000000000n // 0.01 ETH

    if (eth < MIN_THRESHOLD) {
      await sn.transfer(address, BOOST_AMOUNT)
    }

    await sn.transact('update', BigInt(balance))
  }

  fastify.put<IUpdateSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params
    const { balance } = request.body

    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)

    updateBalanceAsync(request.sn, publicKey, balance)

    return reply.status(204).send()
  })

  fastify.get<IBalanceSchema>('/a0/:publicKey', hooks, async (request) => {
    const { publicKey } = request.params

    const address = publicKey.startsWith('0x') ? publicKey : '0x' + publicKey

    const balance = await request.sn.getBalance(address)

    return { balance: balance.toString() }
  })

  async function requestBalanceChange(
    sn: StarkNet,
    publicKey: string,
    privateKey: string,
    balance: bigint,
  ) {
    const address = publicKey.startsWith('0x') ? publicKey : '0x' + publicKey

    const eth = await sn.getBalance(address)
    const MIN_THRESHOLD = 5000000000000000n
    const BOOST_AMOUNT = 10000000000000000n
    if (eth < MIN_THRESHOLD) {
      await sn.transfer(address, BOOST_AMOUNT)
    }

    const requestId: any = await sn.query('submit', balance)
    await sn.transactAs(address, privateKey, 'submit', balance)
    await sn.transact('confirm', requestId)
  }

  fastify.post<IRequestSchema>('/request', hooks, async (request, reply) => {
    const { publicKey, privateKey, balance } = request.body

    await requestBalanceChange(request.sn, publicKey, privateKey, BigInt(balance))

    reply.send(204)
  })

  fastify.post<ITransferSchema>('/transfer', hooks, async (request, reply) => {
    const { publicKey, motes } = request.body
    const address = publicKey.startsWith('0x') ? publicKey : '0x' + publicKey
    const amount = BigInt(motes)

    await request.sn.transfer(address, amount)

    reply.send(204)
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(wallet)
