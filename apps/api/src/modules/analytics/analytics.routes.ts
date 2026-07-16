import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import * as controller from './analytics.controller'

const router = Router()
router.use(requireAuth)

router.get('/overview', controller.getOverview)
router.get('/timeseries', controller.getTimeSeries)
router.get('/geo', controller.getGeo)
router.get('/devices', controller.getDevices)
router.get('/qrcodes/:id', controller.getQRAnalytics)
router.get('/scans', controller.getScanFeed)

export default router
