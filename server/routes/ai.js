import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logAIChat, logAILead } from '../utils/logToSheet.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const blockedKeywords = ['geek squad', 'fiverr', 'upwork', 'taskrabbit', 'best buy'];

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

    // 💬 Generate AI response
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
You are a smart lead-capture assistant for Great Lakes Tech Squad.

🎯 GOALS:
- Politely collect the user's name, email, and phone number.
- Suggest a good date & time for a team member to reach out.
- Provide a **brief**, non-technical summary of what Great Lakes Tech Squad can do to help — do NOT give detailed step-by-step instructions.
- Avoid recommending competitors.

RESPONSE STYLE:
- Friendly and professional
- Limit replies to 3-4 sentences
- Always encourage the user to schedule help
          `.trim(),
        },
        { role: 'user', content: message },
      ],
    });

    const reply = chat.choices[0].message.content;

    // 📄 Log full message + response
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 🔎 Extract user info for leads
    const nameMatch = reply.match(/name is ([A-Za-z\s]+)/i);
    const emailMatch = reply.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = reply.match(/(\+?\d[\d\s().-]{8,})/i);
    const timeMatch = reply.match(/(?:at|on)\s+([0-9apm:\s]+)/i);

    const name = nameMatch?.[1]?.trim() || '';
    const email = emailMatch?.[0] || '';
    const phone = phoneMatch?.[0] || '';
    const preferredTime = timeMatch?.[1]?.trim() || '';

    if (email && phone) {
      await logAILead({ name, email, phone, preferredTime });
      console.log(`[✅ LEAD LOGGED] ${name} - ${email} - ${phone}`);
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;