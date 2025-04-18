import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import contactRoute from './routes/contact.js';
import aiRoute from './routes/ai.js';

dotenv.config();
const app = express();

// ✅ Allow all origins
app.use(cors());
app.options('*', cors()); // important for OPTIONS requests

app.use(express.json());

app.use((req, res, next) => {
  console.log('[CORS DEBUG]', {
    origin: req.headers.origin,
    method: req.method,
  });
  next();
});

app.get('/', (req, res) => {
  res.send('✅ Great Lakes API is online');
});

app.use('/api/contact', contactRoute);
app.use('/api/ai', aiRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);