import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();

const app = express();

// 🛡️ Strict CORS for Vercel frontend
const allowedOrigins = [
  'https://great-lakes-tech-squad.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ CORS not allowed from this origin: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
}));

app.options('*', cors()); // 🔁 Preflight handler

app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🌊 Great Lakes API is online and secure!');
});

// 📨 Contact form route
app.use('/api/contact', contactRoute);

// 🤖 AI Assistant route
app.use('/api/ai', aiRoute);

// 🚀 Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});