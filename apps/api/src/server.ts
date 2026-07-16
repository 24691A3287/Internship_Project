import app from './app'
import { env } from './config/env'
import prisma from './config/database'

const PORT = Number(env.PORT) || 4000

async function bootstrap() {
  try {
    // Test DB connection
    await prisma.$connect()
    console.log('\u2705 Database connected')

    const server = app.listen(PORT, () => {
      console.log(`\u{1F680} API server running on http://localhost:${PORT}`)
      console.log(`\u{1F4CA} Environment: ${env.NODE_ENV}`)
      console.log(`\u{1F4DD} API docs: http://localhost:${PORT}/api/v1`)
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`)
      server.close(async () => {
        await prisma.$disconnect()
        console.log('\u2705 Server closed and DB disconnected')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err)
      process.exit(1)
    })
  } catch (error) {
    console.error('\u274c Failed to start server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

bootstrap()
