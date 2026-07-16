import { Router } from 'express'
import qrcodesRouter from '../modules/qrcodes/qrcodes.routes'
import analyticsRouter from '../modules/analytics/analytics.routes'
import organizationsRouter from '../modules/organizations/organizations.routes'
import foldersRouter from '../modules/folders/folders.routes'
import apiKeysRouter from '../modules/apikeys/apikeys.routes'
import adminRouter from '../modules/admin/admin.routes'
import webhooksRouter from '../modules/webhooks/webhooks.routes'
import uploadsRouter from '../modules/uploads/uploads.routes'
import usersRouter from '../modules/users/users.routes'

const router = Router()

// Public
router.use('/', webhooksRouter)

// Protected API routes
router.use('/qrcodes', qrcodesRouter)
router.use('/analytics', analyticsRouter)
router.use('/organizations', organizationsRouter)
router.use('/folders', foldersRouter)
router.use('/apikeys', apiKeysRouter)
router.use('/admin', adminRouter)
router.use('/uploads', uploadsRouter)
router.use('/users', usersRouter)

export default router
