import { Router } from 'express';

import { authenticateMiddleware } from '../middlewares/auth.middleware';
import GroupController from '../controllers/group.controller';
import { validate } from '../middlewares/validate';
import { createGroupSchema } from '../validations/group.validation';
const router = Router();

// All routes require authentication
// router.use(authenticateMiddleware);

router.post(
  '/group',
  validate(createGroupSchema),
  authenticateMiddleware,
  GroupController.createGroup
);

export default router;
