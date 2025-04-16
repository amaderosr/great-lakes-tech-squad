import express from 'express';
import sendMail from '../utils/sendMail.js';
import { logToSheet } from '../utils/logToSheet.js';

const { name, email, message } = req.body;
await logToSheet({ name, email, message });

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

await logToSheet({ name, email, message });

  console.log('[CONTACT] Incoming message:', { name, email, message });

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await sendMail(name, email, message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[CONTACT] Mail error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;