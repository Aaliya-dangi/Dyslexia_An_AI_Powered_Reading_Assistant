import express from 'express';
import { logSessionEvent } from '../controllers/session.controller.js';

const router = express.Router();

router.post('/:documentId/event', logSessionEvent);

export default router;
