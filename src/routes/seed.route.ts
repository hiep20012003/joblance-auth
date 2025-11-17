import { Router } from 'express';

import { seedUsers, deleteSeededUsers } from '../controllers/seed.controller';

const router = Router();

router.post('/users', seedUsers);
router.delete('/users', deleteSeededUsers);

export default router;
