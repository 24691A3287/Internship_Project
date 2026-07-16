import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import * as controller from './qrcodes.controller'
import { CreateQRSchema, UpdateQRSchema, BulkDeleteSchema } from './qrcodes.schema'

const router = Router()

// Public redirect (no auth)
router.get('/r/:shortCode', controller.redirectQRCode)

// Protected routes
router.use(requireAuth)

router.get('/', controller.listQRCodes)
router.post('/', validate(CreateQRSchema), controller.createQRCode)
router.get('/:id', controller.getQRCode)
router.patch('/:id', validate(UpdateQRSchema), controller.updateQRCode)
router.delete('/:id', controller.deleteQRCode)
router.post('/:id/duplicate', controller.duplicateQRCode)
router.get('/:id/download', controller.downloadQRCode)
router.delete('/bulk/delete', validate(BulkDeleteSchema), controller.bulkDeleteQRCodes)

export default router
