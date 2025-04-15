import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import contactRoute from './routes/contact.js';

app.get('/', (req, res) => {
    res.send('Great Lakes API is online ✅');
  });
  
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/contact', contactRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
