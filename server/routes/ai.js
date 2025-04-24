import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logAIChat, logAILead } from '../utils/logToSheet.js';
import { sendLeadEmail } from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const blockedKeywords = ['geek squad', 'fiverr', 'upwork', 'taskrabbit', 'best buy'];

const systemMessages = {
  Website: `You're a friendly AI web consultant for Great Lakes Tech Squad.`,
  Hardware: `You're a calm, helpful technician guiding users with hardware issues.`,
  'Social Media': `You're a digital strategist helping users plan social campaigns.`,
  'IT Support': `You're an experienced IT assistant helping with tech issues.`,
  'Smart Home': `You're a smart home technician for things like Alexa or Nest.`,
  Mobile: `You're a mobile tech expert helping with phone and app issues.`,
  Software: `You're a software assistant for troubleshooting and installs.`,
  Other: `You're a general tech support agent helping solve all problems.`,
};

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const lowered = message.toLowerCase();
    if (blockedKeywords.some(word => lowered.includes(word))) {
      console.log('[⚠️ COMPETITOR MENTION ATTEMPT]', message);
    }

    // 🧠 Classify
    const intentPrompt = `
Classify this into: Website, Hardware, Social Media, IT Support, Software, Smart Home, Mobile, or Other.
Only respond with the category.
Message: "${message}"
    `.trim();

    const intentRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = intentRes.choices[0].message.content.trim();
    const systemIntent = systemMessages[intent] || systemMessages['Other'];

    // 📬 Core AI Response
    const leadPrompt = `
You are a smart lead-capture and triage assistant for Great Lakes Tech Squad.

🎯 GOALS:
- Collect **name**, **email**, and **phone**
- Ask **what day/time works best** for follow-up
- Confirm when someone from the team will reach out
- Ask a follow-up question about the user's issue
- Mention **monthly service plans** for proactive support (no hard sell)
- Never mention competitors

🧠 RESPONSE STYLE:
- Professional, friendly, under 6 sentences
- Thank user for details, confirm next steps
- Ask: “Is there anything specific you’d like us to prepare before our call?”
`.trim();

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemIntent },
        { role: 'system', content: leadPrompt },
        { role: 'user', content: message },
      ],
    });

    const reply = chat.choices[0].message.content;
    console.log('[🤖 REPLY]', reply);

    // ✍️ Log full convo
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 🕵️ Extract
    const sanitize = (v) => v?.trim().replace(/[.,]+$/, '') || '';

    const nameMatch = message.match(/(?:my name is|name[:\-]?)\s*([A-Z][a-z]+\s?[A-Z]?[a-z]*)/i);
    const emailMatch = message.match(/(?:email is|email[:\-]?)\s*([^\s]+)/i);
    const phoneMatch = message.match(/(?:phone is|phone[:\-]?)\s*([^\s]+)/i);
    const timeMatch = message.match(/(?:at|on)?\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(?:at)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*[ap]m)/i);
    const summary = reply.split('\n').find(line => line.toLowerCase().includes('great lakes tech squad'))?.trim() || '';

    const name = sanitize(nameMatch?.[1]);
    const email = sanitize(emailMatch?.[1]);
    const phone = sanitize(phoneMatch?.[1]);
    const preferredTime = sanitize(timeMatch ? `${timeMatch[1] || ''} ${timeMatch[2]}` : '');

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^\d{10}$|^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone);

    if (validEmail && validPhone) {
      await logAILead({ name, email, phone, preferredTime, summary });
      await sendLeadEmail({ name, email, phone, preferredTime, summary });
      console.log(`[✅ LEAD LOGGED & EMAILED] ${name}`);
    } else {
      console.warn('[⚠️ INCOMPLETE OR INVALID LEAD]', { name, email, phone });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI ERROR]', err.response?.data || err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;