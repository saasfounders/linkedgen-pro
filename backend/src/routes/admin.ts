import { Router } from 'express';
import { getApiKeys, updateApiKey } from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAdmin);

router.get('/api-keys', getApiKeys);
router.put('/api-keys', updateApiKey);

export { router as adminRoutes };
