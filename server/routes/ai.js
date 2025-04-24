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

  'Smart Home': `
You're a home automation expert at Great Lakes Tech Squad.
Help users with smart bulbs, Alexa, Google Home, and device integration.
Stay under 300 words. No competitor mentions.
`.trim(),

  Mobile: `
You're a mobile tech expert at Great Lakes Tech Squad.
Help users with mobile phones, syncing, backups, and app issues.
Offer brief, professional advice. Promote our tech support services.
`.trim(),

  Software: `
You're a software advisor at Great Lakes Tech Squad.
Help with apps, installs, updates, and software troubleshooting.
Stay helpful and concise. No step-by-step, promote the Squad.
`.trim(),

  Other: `
You're a general tech assistant at Great Lakes Tech Squad.
Answer confidently, promote services, and avoid recommending competitors.
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
Classify this message into one of the following categories: Website, Hardware, Social Media, IT Support, Software, Smart Home, Mobile, or Other.
Only reply with the category.
Message: "${message}"
    `.trim();

    const intentRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = intentRes.choices[0].message.content.trim();
    console.log('[🧠 INTENT]', intent);

    const systemIntent = systemMessages[intent] || systemMessages['Other'];

    const leadPrompt = `
You are a smart lead-capture and triage assistant for Great Lakes Tech Squad.

🎯 GOALS:
- Politely collect the user's **name**, **email**, and **phone number**
- Ask **what day/time works best** for a follow-up — don't suggest one yourself.
- Provide a **brief, confident summary** of what Great Lakes Tech Squad can do to fix their issue
- Mention that **monthly service plans** are available for proactive support — but don't hard sell
- Do not mention or recommend competitors.

🧠 RESPONSE STYLE:
- Friendly, professional, and solutions-focused
- Always encourage scheduling a call
- No more than 6 sentences per reply
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

    // 📄 Log AI interaction
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 🕵️ Lead extraction with improved logic
    let name = '';
    let email = '';
    let phone = '';
    let preferredTime = '';
    let summary = '';

    const nameMatch = message.match(/(?:my name is|name[:\-]?)\s*([A-Z][a-z]+\s?[A-Z]?[a-z]*)/i);
    const emailMatch = message.match(/(?:email is|email[:\-]?)\s*([^\s]+)/i);
    const phoneMatch = message.match(/(?:phone is|phone[:\-]?)\s*([^\s]+)/i);
    const timeMatch = message.match(/(?:at|on)?\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(?:at)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*[ap]m)/i);

    name = nameMatch?.[1]?.trim() || '';
    email = emailMatch?.[1]?.trim() || '';
    phone = phoneMatch?.[1]?.trim() || '';
    preferredTime = timeMatch ? `${timeMatch[1] || ''} ${timeMatch[2]}`.trim() : '';
    summary = reply.split('\n').find(line => line.toLowerCase().includes('great lakes tech squad'))?.trim() || '';

    console.log('[🔍 LEAD EXTRACTED]', { name, email, phone, preferredTime });

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^\d{10}$|^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone);

    if (validEmail && validPhone) {
      await logAILead({ name, email, phone, preferredTime, summary });
      console.log(`[✅ LEAD LOGGED] ${name} - ${email}`);
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