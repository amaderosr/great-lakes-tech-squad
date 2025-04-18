import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();
const app = express();

// ✅ Full CORS allow for debug/final check
app.use(cors());
app.options('*', cors());

app.use(express.json());

// 💬 Log CORS & env on every request
app.use((req, res, next) => {
  console.log('[CORS DEBUG]', {
    origin: req.headers.origin,
    method: req.method,
  });
  console.log('[ENV DEBUG] OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
  next();
});

app.get('/', (req, res) => {
  res.send('✅ Great Lakes API is online');
});

app.use('/api/contact', contactRoute);
app.use('/api/ai', aiRoute);

// 🧠 Critical: Use correct Render PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);