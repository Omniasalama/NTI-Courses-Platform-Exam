import { Router } from 'express';
import { getAdminStats } from './admin.service.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), getAdminStats);

export default router;
