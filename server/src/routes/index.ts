import { Router } from 'express';
import userRoutes from './user.routes';
import friendRoutes from './friend.routes';
import authRoutes from './auth.routes';
const router = Router();

router.use('/api', userRoutes);
router.use('/api', friendRoutes);
router.use('/auth', authRoutes);
export default router;
