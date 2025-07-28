import { Router } from 'express';
import { getICPProfiles, createICPProfile, updateICPProfile, deleteICPProfile, generateICPWithAI } from '../controllers/icpController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getICPProfiles);
router.post('/', createICPProfile);
router.post('/generate-ai', generateICPWithAI);
router.put('/:id', updateICPProfile);
router.delete('/:id', deleteICPProfile);

export { router as icpRoutes };
