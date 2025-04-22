import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logAIChat } from '../utils/logToSheet.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🛡️ Optional: Block these keywords from being recommended
const blockedKeywords = ['geek squad', 'fiverr', 'upwork', 'taskrabbit', 'best buy'];

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Log if user mentions a competitor
    const lowered = message.toLowerCase();
    if (blockedKeywords.some(word => lowered.includes(word))) {
      console.log('[⚠️ COMPETITOR MENTION ATTEMPT]', message);
    }

    // 🎯 Generate AI response
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
You are a friendly, helpful AI assistant for Great Lakes Tech Squad.
NEVER recommend or mention competitors like Geek Squad, Upwork, Fiverr, or Best Buy.
If asked about them, politely explain that Great Lakes Tech Squad can handle that need.
Offer clear, confident advice. Keep answers under 300 words.
          `.trim(),
        },
        { role: 'user', content: message },
      ],
    });

    const reply = chat.choices[0].message.content;

    // 🧠 Classify intent
    const intentPrompt = `
Classify this message into one of the following categories: Website, Hardware, Social Media, IT Support, or Other.
Only reply with the category.
Message: "${message}"
    `.trim();

    const intentRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = intentRes.choices[0].message.content.trim();
    console.log('[🧠 INTENT]', intent);

    // 📄 Log to Google Sheets (with debug)
    try {
      console.log('[LOGGING] Logging AI chat to Google Sheets...');
      console.log('[📝 PAYLOAD]', { userMessage: message, botReply: reply, intent });

      await logAIChat({ userMessage: message, botReply: reply, intent });

      console.log('[✅ LOGGED] AI chat successfully saved');
    } catch (logErr) {
      console.error('[🛑 LOGGING ERROR] Failed to log AI chat');
      console.error(logErr);
    }

    // 🚀 Return response
    res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;