import { fastify } from 'fastify'
import { PORT } from './config.js'
import database from './plugins/database.js'
import auth from './plugins/auth.js'
import wallet from './plugins/wallet.js'
import starknet from './plugins/starknet.js'

/**
 * Bootstraps the application by initializing necessary configurations and dependencies.
 *
 * @returns A promise that resolves to the URL where the server is started.
 */
export async function bootstrap(): Promise<string> {
  // Initialize Fastify application.
  const app = fastify({ logger: true })

  // Register database plugin to establish connection with the database.
  await app.register(database)

  // Register request auth plugin for handling incoming requests.
  await app.register(auth)

  await app.register(wallet)

  // Register StarkNet plugin for blockchain interactions.
  await app.register(starknet)

  // Start the server and return the URL where it is listening.
  return await app.listen({ host: '0.0.0.0', port: PORT })
}
