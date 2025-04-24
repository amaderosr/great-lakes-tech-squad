import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logAIChat, logAILead } from '../utils/logToSheet.js';

dotenv.config();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const blockedKeywords = ['geek squad', 'fiverr', 'upwork', 'taskrabbit', 'best buy'];

const systemMessages = {
  Website: `You're a web consultant for Great Lakes Tech Squad. Guide users on websites, SEO, and domains.`,
  Hardware: `You're a tech support pro. Help with printers, routers, Wi-Fi, laptops.`,
  Software: `You're a software assistant. Help with installs, crashes, or system updates.`,
  'Smart Home': `You're a smart home specialist. Assist with cameras, Alexa, Google Home, smart lights.`,
  Mobile: `You're a mobile tech expert. Help with phone setup, syncing, crashes, and iCloud.`,
  'Social Media': `You're a social media strategist. Help with Instagram, Facebook ads, growth tips.`,
  'IT Support': `You're an IT expert. Handle networking, servers, backups, and cybersecurity.`,
  Other: `You're a friendly tech assistant. Help with anything. Never recommend competitors.`,
};

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const lowered = message.toLowerCase();
    if (blockedKeywords.some(word => lowered.includes(word))) {
      console.log('[⚠️ BLOCKED TERM]', message);
    }

    // 🧠 Intent Classification
    const intentPrompt = `
Classify the message into one: Website, Hardware, Software, Smart Home, Mobile, Social Media, IT Support, Other.
Only reply with one category.
Message: "${message}"`.trim();

    const intentRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = intentRes.choices[0].message.content.trim();
    console.log('[🧠 INTENT]', intent);

    const systemIntent = systemMessages[intent] || systemMessages['Other'];

    // 🎯 Lead Prompt (no suggested time)
    const leadPrompt = `
You are a smart lead-capture assistant for Great Lakes Tech Squad.

🎯 GOALS:
- Collect the user's name, email, and phone.
- Ask what day/time works best for a follow-up. Do NOT suggest one.
- Briefly summarize how we can help solve their issue (based on their question).
- Mention our monthly support plans, but don't push.
- Be friendly, under 6 sentences, and never mention competitors.
    `.trim();

    // 💬 Generate AI Response
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

    // ✅ Log conversation
    await logAIChat({ userMessage: message, botReply: reply, intent });

    // 🔍 Lead Extraction from AI reply
    const nameMatch = reply.match(/(?:name[:\s]*)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
    const emailMatch = reply.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    const phoneMatch = reply.match(/(?:\+?1\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i);
    const timeMatch = reply.match(/(?:at|on)?\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(?:at)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*[ap]m)/i);

    let name = nameMatch?.[1]?.trim() || '';
    let email = emailMatch?.[0]?.trim() || '';
    let phone = phoneMatch?.[1]?.trim() || '';
    let preferredTime = timeMatch ? `${timeMatch[1] || ''} ${timeMatch[2]}`.trim() : '';

    // ⛑️ Fallback: Try from original message if needed
    if (!email) email = message.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || '';
    if (!phone) phone = message.match(/(?:\+?1\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i)?.[1] || '';
    if (!name) {
      const msgName = message.match(/(?:my name is|I'm|I am)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
      name = msgName?.[1]?.trim() || '';
    }

    const summary = ''; // Reserved

    console.log('[🧬 LEAD EXTRACTED]', { name, email, phone, preferredTime });

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