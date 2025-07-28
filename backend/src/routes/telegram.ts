import { Router } from 'express';
import { handleWebhook, connectUser } from '../controllers/telegramController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/webhook', handleWebhook);
router.post('/connect', authenticateToken, connectUser);

export { router as telegramRoutes };
