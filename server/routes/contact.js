import express from 'express';
import sendMail from '../utils/sendMail.js';
import { logToSheet } from '../utils/logToSheet.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 🛡 Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 📬 Send email
    await sendMail(name, email, message);

    // 📄 Log to Google Sheets
    await logToSheet({ name, email, message });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[CONTACT] Error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;