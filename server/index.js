import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();
const app = express();

// ✅ Allow all origins for debug — temporary
app.use(cors());
app.options('*', cors()); // handles preflight

app.use(express.json());

// 🔍 Debug logs for verification
app.use((req, res, next) => {
  console.log('[CORS DEBUG]', {
    origin: req.headers.origin,
    method: req.method,
  });
  console.log('[ENV DEBUG] OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
  next();
});

app.get('/', (req, res) => {
  res.send('✅ Great Lakes API is live');
});

app.use('/api/contact', contactRoute);
app.use('/api/ai', aiRoute);

// 🚀 PORT: use Render's injected port or fallback
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);