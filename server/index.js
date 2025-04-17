import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();

const app = express();

// ✅ CORS CONFIG (for Vercel)
const corsOptions = {
  origin: 'https://great-lakes-tech-squad.vercel.app', // 👈 your live frontend
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

// ✅ CORS middleware + preflight handler
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Debug logs to Render console
app.use((req, res, next) => {
  console.log('[CORS DEBUG]', {
    origin: req.headers.origin,
    method: req.method
  });
  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Great Lakes API is online ✅');
});

// ✅ Contact form route
app.use('/api/contact', contactRoute);
app.use('/api/ai', aiRoute);

// ✅ Boot server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));