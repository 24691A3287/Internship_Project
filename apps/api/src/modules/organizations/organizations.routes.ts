import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import * as controller from './organizations.controller'
import {
  CreateOrgSchema,
  UpdateOrgSchema,
  InviteMemberSchema,
  UpdateMemberRoleSchema,
} from './organizations.schema'

const router = Router()
router.use(requireAuth)

router.get('/', controller.listOrganizations)
router.post('/', validate(CreateOrgSchema), controller.createOrganization)
router.get('/:id', controller.getOrganization)
router.patch('/:id', validate(UpdateOrgSchema), controller.updateOrganization)
router.delete('/:id', controller.deleteOrganization)
router.get('/:id/members', controller.listMembers)
router.post('/:id/members', validate(InviteMemberSchema), controller.inviteMember)
router.patch('/:id/members/:userId', validate(UpdateMemberRoleSchema), controller.updateMemberRole)
router.delete('/:id/members/:userId', controller.removeMember)

export default router
