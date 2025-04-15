import express from 'express';
import sendMail from '../utils/sendMail.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await sendMail(name, email, message);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;