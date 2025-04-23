import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logAIChat } from '../utils/logToSheet.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🛡 Blocked competitor keywords
const blockedKeywords = ['geek squad', 'fiverr', 'upwork', 'taskrabbit', 'best buy'];

// 🎭 Intent-specific personas
const systemMessages = {
  Website: `
You are a friendly AI web consultant for Great Lakes Tech Squad.
Guide the user through website design, hosting, SEO, or updates.
Keep answers under 300 words. Never mention competitors.
  `.trim(),

  Hardware: `
You're a tech support assistant for Great Lakes Tech Squad.
Assist with laptops, desktops, printers, Wi-Fi, and troubleshooting.
Avoid jargon, stay calm and helpful. Stay under 300 words.
  `.trim(),

  'Social Media': `
You're a social media strategist at Great Lakes Tech Squad.
Give advice on content, platforms, ads, and growth tips.
Encourage clients to hire the Squad for managed services.
  `.trim(),

  'IT Support': `
You're an experienced IT admin at Great Lakes Tech Squad.
Answer questions on networking, backups, cybersecurity, and more.
Promote monthly IT service plans where appropriate.
  `.trim(),

  Other: `
You’re a general tech expert for Great Lakes Tech Squad.
Answer all questions confidently and promote our services when possible.
Stay on-brand and helpful. Max 300 words.
  `.trim(),
};

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const lowered = message.toLowerCase();
    if (blockedKeywords.some(word => lowered.includes(word))) {
      console.log('[⚠️ COMPETITOR MENTION ATTEMPT]', message);
    }

    // 🧠 Classify user intent
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

    // 💬 Generate dynamic response
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemMessages[intent] || systemMessages['Other'],
        },
        { role: 'user', content: message },
      ],
    });

    const reply = chat.choices[0].message.content;

    // 🗂️ Log interaction
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 📤 Send response to frontend
    res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;