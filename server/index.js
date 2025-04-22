import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();

const app = express();

// ✅ Allow Vercel frontend
const corsOptions = {
  origin: 'https://great-lakes-tech-squad.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests

app.use(express.json());

app.use('/api/ai', aiRoute);

app.get('/', (req, res) => {
  res.send('Great Lakes API is online ✅');
});

app.use('/api/contact', contactRoute);

// ✅ Port bind for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);