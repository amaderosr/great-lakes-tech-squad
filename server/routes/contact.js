import axios from 'axios';
import express from 'express';
import sendMail from '../utils/sendMail.js';
import { logToSheet } from '../utils/logToSheet.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message, captchaToken } = req.body;
    console.log('[CONTACT] captchaToken received:', captchaToken);

    if (!captchaToken) {
      return res.status(400).json({ error: 'Captcha token missing' });
    }

    // 🔐 Verify reCAPTCHA with Google
    const verifyRes = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: captchaToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[reCAPTCHA DEBUG] Google verification response:', verifyRes.data);

    if (!verifyRes.data.success) {
      return res.status(403).json({ error: 'Captcha verification failed' });
    }

    // 🛡️ Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 📬 Send email
    await sendMail(name, email, message);

    // 📄 Log to Google Sheets
    await logToSheet({ name, email, message });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[CONTACT] Error:', error.response?.data || error.message || error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;