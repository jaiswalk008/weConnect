import { Router } from 'express';
import userRoutes from './user.routes';
import friendRoutes from './friend.routes';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import groupRoutes from './group.routes';
const router = Router();

router.use('/api', userRoutes);
router.use('/api', friendRoutes);
router.use('/auth', authRoutes);
router.use('/api', chatRoutes);
router.use('/api', groupRoutes);
export default router;
