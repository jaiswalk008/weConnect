import { Router } from 'express';
import { generateToken } from '../controllers/agora.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/token', authenticateMiddleware, generateToken);

export default router;
