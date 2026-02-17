import { Router } from 'express';
import storageController from '../controllers/storage.controller';
import { authenticateMiddleware } from '../middlewares/auth.middleware'; // Assuming authentication middleware exists

const router: Router = Router();

// Apply authentication middleware to all storage routes
// router.use(authenticate);

router.post('/upload-url', authenticateMiddleware, storageController.getUploadUrl);
router.get('/session', authenticateMiddleware, storageController.refreshSession);

export default router;
