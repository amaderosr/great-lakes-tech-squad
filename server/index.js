import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://great-lakes-tech-squad.vercel.app',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.options('*', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Great Lakes API is online ✅');
});

app.use('/api/contact', contactRoute);
app.use('/api/ai', aiRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));