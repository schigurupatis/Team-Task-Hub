# 🗂️ Team Task Hub

A production-ready full-stack Task Management application built for the Team Task Hub

**Live Demo:** https://69f9dd7ba989cf0007497a51--team-task-hub.netlify.app/  
**GitHub:** https://github.com/schigurupatis/Team-Task-Hub

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install

```bash
git clone https://github.com/schigurupatis/Team-Task-Hub.git
cd Team-Task-Hub

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup

**Backend** — create `backend/.env`:
```env
PORT=4000
NODE_ENV=development
DELETE_TOKEN=super-secret-delete-token-2026
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=/api
VITE_DELETE_TOKEN=super-secret-delete-token-2026
```

### 3. Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open browser at: **http://localhost:5173**

---

## 🧪 Running Tests

```bash
# Backend integration tests (Jest + Supertest)
cd backend && npm test

# Frontend unit tests (Jest)
cd frontend && npm test

# With coverage report
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage
```

---

## 🌐 Deployment

### Frontend — Netlify
| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

**Environment variables on Netlify:**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://team-task-hub-85y6.onrender.com/api` |
| `VITE_DELETE_TOKEN` | `super-secret-delete-token-2026` |

### Backend — Render.com
| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

**Environment variables on Render:**
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DELETE_TOKEN` | `super-secret-delete-token-2026` |
| `PORT` | `10000` |

> ⚠️ **Note:** Render free tier sleeps after 15 minutes of inactivity. First request after sleep may take up to 60 seconds. The app automatically sends a wake-up ping on load.

---

## 🏗️ Architecture

```
Team-Task-Hub/
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── app.ts                  # Express app factory (createApp)
│   │   ├── index.ts                # Server entry point — calls app.listen()
│   │   ├── controllers/
│   │   │   └── task.controller.ts  # Request handlers (thin layer)
│   │   ├── middleware/
│   │   │   └── error.middleware.ts # 404 + global error handler
│   │   ├── models/
│   │   │   └── task.model.ts       # In-memory Map<string, Task> store
│   │   ├── routes/
│   │   │   └── task.routes.ts      # URL → controller mapping
│   │   ├── types/
│   │   │   └── task.types.ts       # Shared TypeScript interfaces
│   │   └── validators/
│   │       └── task.validator.ts   # Zod schemas (server-side)
│   └── tests/
│       ├── tasks.test.ts           # API integration tests (Supertest)
│       └── validators.test.ts      # Zod schema unit tests
│
└── frontend/                       # React + Vite SPA
    ├── src/
    │   ├── App.tsx                  # Root component + Redux Provider
    │   ├── components/
    │   │   ├── common/              # Badge, Button, Modal, Toast
    │   │   ├── layout/              # Header
    │   │   └── tasks/               # TaskCard, TaskForm, FiltersBar, StatsBar, DeleteConfirm
    │   ├── hooks/
    │   │   ├── useAppDispatch.ts    # Typed Redux hooks
    │   │   └── useDebounce.ts       # 350ms search debounce
    │   ├── pages/
    │   │   └── Dashboard.tsx        # Main page — orchestrates all components
    │   ├── services/
    │   │   └── task.service.ts      # All Axios API calls (single source of truth)
    │   ├── store/
    │   │   ├── index.ts             # Redux store configuration
    │   │   └── slices/taskSlice.ts  # Actions, reducers, async thunks
    │   ├── types/
    │   │   └── task.types.ts        # Shared TypeScript interfaces
    │   ├── utils/
    │   │   └── task.utils.ts        # Color maps, label maps, formatDate
    │   └── validators/
    │       └── task.validator.ts    # Zod schemas (client-side)
    └── tests/
        └── unit.test.ts             # Redux slice + validator unit tests
```

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api` (dev) | `https://team-task-hub-85y6.onrender.com/api` (prod)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | List tasks (paginated, filterable) | No |
| GET | `/tasks/:id` | Get single task | No |
| POST | `/tasks` | Create task | No |
| PATCH | `/tasks/:id` | Update task (partial) | No |
| DELETE | `/tasks/:id` | Delete task | Yes — `x-delete-token` header |
| GET | `/health` | Health check | No |

### Query Parameters for GET /tasks
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search in title and description |
| `priority` | low \| medium \| high \| critical | Filter by priority |
| `status` | todo \| in-progress \| done \| archived | Filter by status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

### Protected Delete
```bash
curl -X DELETE https://team-task-hub-85y6.onrender.com/api/tasks/<id> \
  -H "x-delete-token: super-secret-delete-token-2026"
```

---

## 🧠 Architectural Decisions

### App Factory Pattern (`createApp()`)
The Express app is created inside a function and exported — `index.ts` calls it and then `.listen()`. This means tests can import `createApp()` and get a fresh app instance without binding to a port. Without this, every test file would conflict trying to use the same port.

### In-Memory Store (`Map<string, Task>`)
`Map` gives O(1) lookups by ID. All data access goes through the `TaskStore` class — swapping to PostgreSQL or MongoDB requires only changing this file. Controllers and routes stay untouched.

### Dual Validation with Zod
The same validation library runs on both client and server. Client-side validation gives instant feedback without a network round-trip. Server-side validation is the real security layer — it runs regardless of what the client sends.

### Redux Toolkit over Context API
Context API re-renders all consumers when any value changes. Redux uses memoized selectors — only components that use the changed state re-render. For a task list with many cards, this prevents unnecessary re-renders on every update.

### Service Layer (`task.service.ts`)
All Axios calls live in one file. Components never import axios directly. This means changing the API base URL, adding authentication headers, or modifying request format requires changes in exactly one place.

### Debounced Search (`useDebounce`)
Search input is debounced at 350ms. Typing a 6-character word fires 1 API request instead of 6. At scale with many concurrent users, this significantly reduces server load.

### Protected Delete with Custom Header
The `DELETE /api/tasks/:id` endpoint requires an `x-delete-token` header. The frontend sends this automatically via the Axios service layer. This demonstrates the pattern used for API key authentication in production systems.

---

## 🛡️ Security Features

- **Raw CORS headers** — set on every response before any other middleware
- **Rate limiting** — 500 requests per 15 minutes per IP
- **Input validation** — Zod schemas reject invalid data on both client and server
- **Body size limit** — 10kb maximum payload (DoS protection)
- **UUID validation** — malformed IDs rejected with 400 before controller runs
- **Protected delete** — custom header required, checked before any data access
- **Environment variables** — all secrets in `.env` files, never committed to Git

---

## ♿ Accessibility (WCAG 2.1 AA)

- Skip-to-content link for keyboard users
- Semantic HTML: `<header>`, `<main>`, `<article>`, `<nav>`, `<time>`
- `aria-live`, `aria-busy`, `aria-required`, `role="alert"` throughout
- All interactive elements keyboard-navigable
- Focus-visible styles on all buttons and inputs
- Color is never the sole conveyor of information (badges have text labels)
- Native `<dialog>` element for modals (built-in focus trapping)
