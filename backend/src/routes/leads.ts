import { Router } from 'express';
import { getLeads, generateLeads, updateLead, deleteLead } from '../controllers/leadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeads);
router.post('/generate', generateLeads);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export { router as leadRoutes };
