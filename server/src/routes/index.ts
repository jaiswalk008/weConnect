import { Router } from 'express';
import userRoutes from './user.routes';
import friendRoutes from './friend.routes';
const router = Router();

router.use(userRoutes);
router.use('/api', friendRoutes);
export default router;
