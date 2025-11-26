import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routes/contacts';
import agentRouter from './routes/agent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/agent', agentRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET    /api/contacts`);
  console.log(`   - POST   /api/contacts`);
  console.log(`   - PUT    /api/contacts/:id`);
  console.log(`   - DELETE /api/contacts/:id`);
  console.log(`   - POST   /api/agent`);
});