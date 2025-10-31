import { Router } from 'express';
import FriendController from '../controllers/friend.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { updateFriendSchema } from '../validations/friend.validation';

const router = Router();

router.post(
  '/friend',
  validate(updateFriendSchema),
  authenticateMiddleware,
  FriendController.updateFriendshipStatus
);
router.get('/friend', authenticateMiddleware, FriendController.findFriends);
export default router;
