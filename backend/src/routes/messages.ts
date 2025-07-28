import { Router } from 'express';
import { getMessages, generateMessage, sendMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/:leadId', getMessages);
router.post('/generate', generateMessage);
router.post('/:id/send', sendMessage);

export { router as messageRoutes };
