import express from 'express';
import { getTTSTiming, evaluateSpeech } from '../controllers/speech.controller.js';

const router = express.Router();

router.post('/tts', getTTSTiming);
router.post('/stt', evaluateSpeech);

export default router;
