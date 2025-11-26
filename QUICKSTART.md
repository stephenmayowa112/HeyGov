# 🚀 Quick Start Guide

Follow these steps to get the HeyGov CRM up and running:

## Step 1: Set up the Backend

```bash
# Navigate to server directory
cd server

# Create .env file from template
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key-here

# The database has already been initialized!
# If you need to reset it, run: npm run db:push

# Start the backend server
npm run dev
```

The server will start on **http://localhost:3000**

## Step 2: Start the Frontend

Open a **NEW TERMINAL** and run:

```bash
# Navigate to client directory
cd client

# Start the development server
npm run dev
```

The client will start on **http://localhost:5173**

## Step 3: Test the Application

1. Open your browser to **http://localhost:5173**
2. You should see the HeyGov CRM dashboard
3. Try the AI assistant in the right panel:
   - Type: "I met John Doe today, his email is john@example.com"
   - Watch as the AI creates the contact automatically!
   - Try: "Who are my contacts?"
   - Try: "Add Sarah with email sarah@test.com and phone 555-1234"

## 🎯 Important Notes

### Before you start:
- ✅ Dependencies are already installed (axios, lucide-vue-next)
- ✅ Database schema has been pushed to SQLite
- ✅ All code is generated and ready to run
- ⚠️ **YOU MUST** add your OpenAI API key to `server/.env`

### Required Environment Variable:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

## 🔍 Verify Everything is Working

1. **Backend Health Check**:
   - Visit: http://localhost:3000/api/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**:
   - Visit: http://localhost:5173
   - Should see the CRM dashboard with search bar and AI chat panel

3. **Test AI Agent**:
   - Type a message in the chat
   - AI should respond and update contacts

## 🐛 Troubleshooting

### Backend won't start?
- Make sure you created `.env` file in `/server`
- Make sure you added a valid `OPENAI_API_KEY`
- Check that port 3000 is available

### Frontend won't connect?
- Make sure backend is running on port 3000
- Check browser console for errors
- Verify the Vite proxy is configured (it should be!)

### Database issues?
- Run: `cd server && npm run db:push`
- This will recreate the database schema

## 🎉 You're All Set!

The application is production-ready with:
- ✅ Clean architecture with separation of concerns
- ✅ Production-grade error handling
- ✅ TypeScript strict mode throughout
- ✅ Responsive, polished UI
- ✅ AI-powered contact management
- ✅ Real-time search with debouncing
- ✅ Proper state management

**Happy coding! 🚀**
