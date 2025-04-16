import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactRoute from './routes/contact.js';

dotenv.config();

const app = express();

const corsOptions = {
    origin: 'https://great-lakes-tech-squad.vercel.app',
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: false
  };
  
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // <-- handles preflight properly

  app.use((req, res, next) => {
    console.log('[CORS DEBUG]', {
      origin: req.headers.origin,
      method: req.method
    });
    next(); // continue to next middleware or route
  });

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Great Lakes API is online ✅');
  });

app.use('/api/contact', contactRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
