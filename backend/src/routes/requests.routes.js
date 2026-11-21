import { Router } from 'express';
import {
  createRequest, deleteReceivedRequest, getMyRequest, listMyRequests, listReceivedRequests, respondToRequest,
} from '../controllers/requests.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listMyRequests);
router.post('/', createRequest);
router.get('/received', listReceivedRequests);
router.get('/:id', getMyRequest);
router.patch('/:id', respondToRequest);
router.delete('/:id', deleteReceivedRequest);

export default router;
