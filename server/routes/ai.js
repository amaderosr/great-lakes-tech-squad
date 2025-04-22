// server/routes/ai.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;
  console.log('[AI REQUEST]', message);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log('[AI RESPONSE]', reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.error('[AI ERROR]', error.response?.data || error.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;