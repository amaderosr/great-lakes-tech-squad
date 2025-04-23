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

    // 🧠 AI response
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessages[intent] || systemMessages['Other'] },
        {
          role: 'system',
          content: `
You are a smart lead-capture and triage assistant for Great Lakes Tech Squad.

🎯 GOALS:
- Promptly and politely collect user's name, email, and phone number.
- Suggest a good date & time for a tech to follow up.
- Briefly summarize what the user might be dealing with.
- THEN briefly explain how Great Lakes Tech Squad can help solve it.
- Never give full step-by-step tech solutions.
- Do not mention or recommend competitors.

RESPONSE STYLE:
- Friendly and professional
- 3 short paragraphs max
- Encourage scheduling help
`.trim(),
        },
        { role: 'user', content: message },
      ],
    });

    const reply = chat.choices[0].message.content;
    console.log('[🤖 REPLY]', reply);

    // 📄 Log full chat
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 🕵️ Extract lead info
    const nameMatch = reply.match(/name:\s*(.*)/i);
const emailMatch = reply.match(/email:\s*([^\s]+)/i);
const phoneMatch = reply.match(/phone:\s*([^\n]+)/i);
const timeMatch = reply.match(/preferred time:\s*(.*)/i);
const summaryMatch = reply.match(/summary:\s*(.*)/i);

const name = nameMatch?.[1]?.trim() || '';
const email = emailMatch?.[1]?.trim() || '';
const phone = phoneMatch?.[1]?.trim() || '';
const preferredTime = timeMatch?.[1]?.trim() || '';
const summary = summaryMatch?.[1]?.trim() || '';

    console.log('[🔍 LEAD EXTRACTED]', { name, email, phone, preferredTime });

    if (email && phone) {
      await logAILead({ name, email, phone, preferredTime, summary });
      console.log(`[✅ LEAD LOGGED] ${name} - ${email} - ${phone}`);
    } else {
      console.warn('[⚠️ INCOMPLETE LEAD]', { name, email, phone });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;