import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { env } from './config/env'

// Route modules
import qrCodesRouter from './modules/qrcodes/qrcodes.routes'
import analyticsRouter from './modules/analytics/analytics.routes'
import organizationsRouter from './modules/organizations/organizations.routes'
import foldersRouter from './modules/folders/folders.routes'
import apiKeysRouter from './modules/apikeys/apikeys.routes'
import webhooksRouter from './modules/webhooks/webhooks.routes'
import usersRouter from './modules/users/users.routes'
import templatesRouter from './modules/templates/templates.routes'
import adminRouter from './modules/admin/admin.routes'
import uploadsRouter from './modules/uploads/uploads.routes'

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// CORS
app.use(
  cors({
    origin: [
      env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
)

// Request logging
app.use(requestLogger)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// API Routes
const apiV1 = '/api/v1'

// Apply general rate limiting to all API routes
app.use(apiV1, rateLimiter(false))

app.use(`${apiV1}/qrcodes`, qrCodesRouter)
app.use(`${apiV1}/analytics`, analyticsRouter)
app.use(`${apiV1}/organizations`, organizationsRouter)
app.use(`${apiV1}/folders`, foldersRouter)
app.use(`${apiV1}/api-keys`, apiKeysRouter)
app.use(`${apiV1}/webhooks`, webhooksRouter)
app.use(`${apiV1}/users`, usersRouter)
app.use(`${apiV1}/templates`, templatesRouter)
app.use(`${apiV1}/admin`, adminRouter)
app.use(`${apiV1}/uploads`, uploadsRouter)

// 404 handler
app.use(notFoundHandler)

// Global error handler
app.use(errorHandler)

export default app
