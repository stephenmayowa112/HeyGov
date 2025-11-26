# HeyGov CRM - Mini CRM Application

A full-stack CRM application built with Vue.js 3, Express.js, SQLite, and OpenAI for intelligent contact management.

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (Strict mode)
- **Database**: SQLite (local file `dev.db`)
- **ORM**: Drizzle ORM with better-sqlite3 driver
- **AI**: OpenAI API (Chat Completions with Tool/Function Calling)

### Frontend
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-vue-next
- **HTTP Client**: Axios

## 📁 Project Structure

```
heygov-crm/
├── server/                 # Backend Express.js API
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts  # Drizzle ORM schema
│   │   │   └── index.ts   # Database connection
│   │   ├── routes/
│   │   │   ├── contacts.ts # CRUD endpoints
│   │   │   └── agent.ts   # AI agent endpoint
│   │   └── index.ts       # Server entry point
│   ├── drizzle.config.ts  # Drizzle Kit configuration
│   └── package.json
│
└── client/                # Frontend Vue.js app
    ├── src/
    │   ├── components/    # Vue components
    │   ├── composables/   # Composable functions
    │   ├── services/      # API service layer
    │   ├── types.ts       # TypeScript types
    │   ├── App.vue        # Main dashboard
    │   └── main.ts
    ├── vite.config.ts     # Vite config with API proxy
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API Key

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Add your OpenAI API key** to `.env`:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Generate database schema**:
   ```bash
   npm run db:push
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client directory** (in a new terminal):
   ```bash
   cd client
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 📊 API Endpoints

### Contacts
- `GET /api/contacts` - List all contacts (supports `?q=` search param)
- `POST /api/contacts` - Create a new contact
- `PUT /api/contacts/:id` - Update a contact
- `DELETE /api/contacts/:id` - Delete a contact

### AI Agent
- `POST /api/agent` - Send a prompt to the AI assistant

## 🤖 AI Agent Capabilities

The AI agent uses OpenAI's function calling to intelligently manage contacts:

### Tools Available:
1. **upsertContact**: Creates or updates contacts based on conversation
2. **searchContacts**: Searches through contacts by name, email, or notes

### Example Prompts:
- "I met Alex today at the conference"
- "Add Sarah with email sarah@example.com and phone 555-1234"
- "Who did I contact last week?"
- "Show me all contacts with gmail addresses"

## 🎨 Features

### Frontend
- ✅ Real-time contact search with debouncing
- ✅ AI-powered chat interface for natural language contact management
- ✅ Responsive contact cards with avatars
- ✅ Empty and loading states
- ✅ Clean, modern UI with Tailwind CSS v4
- ✅ Auto-refresh contact list after AI operations

### Backend
- ✅ RESTful API with proper error handling
- ✅ SQLite database with Drizzle ORM
- ✅ OpenAI integration with tool/function calling
- ✅ Intelligent contact upsert logic
- ✅ Comprehensive search functionality
- ✅ Timestamp tracking for interactions

## 🔧 Database Schema

```typescript
contacts {
  id: integer (primary key, auto-increment)
  name: text (nullable)
  email: text (unique, nullable)
  phone: text (nullable)
  notes: text (nullable)
  lastContactedAt: timestamp (nullable)
  createdAt: timestamp (default: now)
}
```

**Constraint**: At least one of `name` or `email` must be provided.

## 🧪 Development Tips

### Backend Commands
```bash
cd server
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Run production build
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
```

### Frontend Commands
```bash
cd client
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🎯 Key Implementation Details

### AI Agent Workflow
1. User sends a natural language prompt
2. System prompt provides context and current date
3. OpenAI determines which tool(s) to use
4. Backend executes tool functions (upsert/search)
5. OpenAI generates human-friendly response
6. Frontend auto-refreshes contact list

### Contact Upsert Logic
- Searches by email first (if provided)
- Falls back to name search
- Updates `lastContactedAt` on every interaction
- Appends new notes with timestamps
- Creates new contact if no match found

## 📝 License

This project was created as a technical assessment.

---

**Built with ❤️by Stephen Mayowa Ojunde for HeyGov**
