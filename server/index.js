import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();
const app = express();

// 🛡️ Allow Vercel frontend explicitly
const corsOptions = {
  origin: 'https://great-lakes-tech-squad.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
};

// 🔍 DEBUGGING: log origin + method on every request
app.use((req, res, next) => {
  console.log('[CORS DEBUG]', {
    origin: req.headers.origin,
    method: req.method,
  });
  next();
});

// ✅ Apply CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // allow preflight requests

app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🌊 Great Lakes API is online and secure!');
});

// 📩 Contact form
app.use('/api/contact', contactRoute);

// 🧠 AI assistant
app.use('/api/ai', aiRoute);

// 🚀 Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('[ENV DEBUG] PORT:', process.env.PORT);
});