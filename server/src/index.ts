import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

// Now import routes (after env vars are loaded)
import contactsRouter from './routes/contacts';
import agentRouter from './routes/agent';

const app = express();
const PORT = process.env.PORT || 3000;

// Verify environment variables
console.log('🔑 Environment check:');
console.log('   PORT:', PORT);
console.log('   CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✅ Set' : '❌ Missing');

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