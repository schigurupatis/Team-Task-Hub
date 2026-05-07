# 🗂️ Team Task Hub

A production-ready, full-stack Task Management application built with React, Node.js, TypeScript, and modern tooling.

**🌐 Live Demo:** https://team-task-hub.netlify.app/ 
**📁 Repository:** https://github.com/schigurupatis/Team-Task-Hub
**⚙️ API Health:** https://team-task-hub-85y6.onrender.com/health

---

## ✅ Assignment Requirements — All Met

| # | Requirement | Implementation |
|---|-------------|----------------|
| 1 | RESTful API for Tasks (ID, Title, Description, Priority, Status) | 5 Express endpoints with consistent `{ success, data, error }` response format |
| 2 | React Dashboard — modular, reusable components | 11 single-responsibility components (TaskCard, TaskForm, FiltersBar, StatsBar, Modal, Toast, etc.) |
| 3 | Data Validation on client AND server | Zod schemas in both `frontend/src/validators/` and `backend/src/validators/` |
| 4 | Performant search while typing | `useDebounce` hook — 350ms delay, 1 API call per search word not 1 per keystroke |
| 5 | Protected delete with custom header | `x-delete-token` header required, frontend sends it automatically via Axios service layer |
| — | Tests for Node.js and React | 20+ backend integration tests (Supertest) + 15+ frontend unit tests (Jest) |
| — | Enterprise-style architecture | Separated layers: routes → controllers → models → validators → middleware |
| — | GitHub repository | ✅ This repository |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm 10+

### 1. Clone & Install

```bash
git clone https://github.com/schigurupatis/Team-Task-Hub.git
cd Team-Task-Hub

cd backend  && npm install
cd ../frontend && npm install
```

### 2. Environment Setup

**`backend/.env`**
```env
PORT=4000
NODE_ENV=development
DELETE_TOKEN=super-secret-delete-token-2026
```

**`frontend/.env`**
```env
VITE_API_URL=/api
VITE_DELETE_TOKEN=super-secret-delete-token-2026
```

### 3. Run Locally

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🧪 Running Tests

```bash
# Backend — integration tests (Jest + Supertest)
cd backend && npm test

# Frontend — unit tests (Jest + ts-jest)
cd frontend && npm test

# With coverage report
cd backend  && npm test -- --coverage
cd frontend && npm test -- --coverage
```

### What the tests cover

**Backend (20+ tests):**
- `GET /api/tasks` — pagination, search filter, priority filter, status filter
- `POST /api/tasks` — creates task, rejects empty title, rejects invalid priority
- `GET /api/tasks/:id` — returns task, 404 for unknown, 400 for invalid UUID
- `PATCH /api/tasks/:id` — updates fields, validates input, handles not found
- `DELETE /api/tasks/:id` — requires `x-delete-token`, rejects wrong/missing token
- Zod schema unit tests — all validation rules for create, update, and filter schemas

**Frontend (15+ tests):**
- Zod `TaskFormSchema` — valid data, empty title, invalid priority/status, defaults
- Redux `taskSlice` reducers — setFilters, setPage, setSelectedTask, clearError, initial state
- `task.utils` — PRIORITY_LABELS, STATUS_LABELS, formatDate

---

## 🏗️ Architecture

```
Team-Task-Hub/
├── backend/                        ← Node.js + Express API
│   ├── src/
│   │   ├── app.ts                  ← Express app factory (createApp)
│   │   ├── index.ts                ← Server entry — calls app.listen()
│   │   ├── controllers/
│   │   │   └── task.controller.ts  ← Thin request handlers
│   │   ├── middleware/
│   │   │   └── error.middleware.ts ← 404 + global error handler
│   │   ├── models/
│   │   │   └── task.model.ts       ← In-memory Map<string, Task> store
│   │   ├── routes/
│   │   │   └── task.routes.ts      ← URL → controller mapping + UUID validation
│   │   ├── types/
│   │   │   └── task.types.ts       ← Shared TypeScript interfaces
│   │   └── validators/
│   │       └── task.validator.ts   ← Zod schemas
│   └── tests/
│       ├── tasks.test.ts           ← API integration tests
│       └── validators.test.ts      ← Zod schema unit tests
│
└── frontend/                       ← React + Vite SPA
    ├── src/
    │   ├── App.tsx                 ← Root + Redux Provider
    │   ├── components/
    │   │   ├── common/             ← Button, Badge, Modal, Toast
    │   │   ├── layout/             ← Header
    │   │   └── tasks/              ← TaskCard, TaskForm, TaskFiltersBar, StatsBar, DeleteConfirm
    │   ├── hooks/
    │   │   ├── useAppDispatch.ts   ← Typed Redux hooks
    │   │   └── useDebounce.ts      ← 350ms search debounce
    │   ├── pages/
    │   │   └── Dashboard.tsx       ← Main page — orchestrates all components
    │   ├── services/
    │   │   └── task.service.ts     ← All Axios API calls (single source of truth)
    │   ├── store/
    │   │   ├── index.ts            ← Redux store
    │   │   └── slices/taskSlice.ts ← Actions, reducers, async thunks
    │   ├── types/                  ← Shared TypeScript interfaces
    │   ├── utils/                  ← Color maps, labels, formatDate
    │   └── validators/             ← Zod schemas (client-side mirror of server)
    └── tests/
        └── unit.test.ts            ← Redux + validator unit tests
```

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api` (dev) | `https://team-task-hub-85y6.onrender.com/api` (prod)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | List tasks — supports `?search=`, `?priority=`, `?status=`, `?page=`, `?limit=` | None |
| GET | `/tasks/:id` | Get single task by UUID | None |
| POST | `/tasks` | Create task — body: `{ title, description, priority, status }` | None |
| PATCH | `/tasks/:id` | Update task (partial — only send changed fields) | None |
| DELETE | `/tasks/:id` | Delete task | `x-delete-token` header required |
| GET | `/health` | Health check | None |

### Response Format (always consistent)
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Validation failed", "message": "title: Title is required" }
```

---

## 🧠 Architectural Decisions

### 1. App Factory Pattern — `createApp()`
The Express app is created inside a factory function. `index.ts` calls `createApp()` then `.listen()`. Tests import `createApp()` and get a fresh app without binding a port — this is what makes Supertest integration tests work without port conflicts.

### 2. Repository Pattern — `TaskStore` class
All data access goes through one class. Currently uses `Map<string, Task>` (O(1) lookups). Swapping to PostgreSQL means rewriting only this class — zero changes to controllers, routes, validators, or the frontend.

### 3. Service Layer — `task.service.ts`
Every Axios call lives in one file. Components never import Axios directly. Adding auth tokens, changing the API base URL, or modifying request format requires changes in exactly one place.

### 4. Dual Validation with Zod
The same Zod library runs on both client and server. Client-side validation gives instant field-level feedback without a network round-trip. Server-side validation is the real security layer — it runs regardless of what the client sends.

### 5. Redux Toolkit over Context API
Context API re-renders all consumers when any value changes. Redux uses memoized selectors — only components whose data changed re-render. For a task grid with many cards this prevents unnecessary re-renders on every state update.

### 6. Debounced Search — `useDebounce`
Search is debounced at 350ms. Typing a 6-character word fires 1 API request instead of 6. Extracted as a custom hook so it's reusable, testable, and not duplicated across components.

### 7. Consistent API Response Shape
Every endpoint returns `{ success, data?, error?, message? }`. The frontend always checks `success` first. This contract means adding new endpoints is predictable and the error handling pattern never changes.

### 8. UUID Validation Middleware
A `validateId()` middleware runs before any `/:id` controller. Malformed IDs (path traversal attempts, empty strings) return 400 before the controller or data store is touched.

---

## 🛡️ Security Features
- Manual CORS headers set on every response before all other middleware
- Rate limiting: 500 requests per 15 minutes per IP (express-rate-limit)
- Body size limit: 10kb maximum payload (DoS protection)
- Input validation: Zod schemas reject invalid data on both client and server
- UUID validation: malformed IDs rejected before controllers run
- Protected delete: `x-delete-token` header validated before any data access
- Secrets in environment variables — never committed to source code

---

## ♿ Accessibility (WCAG 2.1 AA)
- Skip-to-content link for keyboard users
- Semantic HTML: `<header>`, `<main>`, `<article>`, `<nav>`, `<time>`
- `aria-live`, `aria-busy`, `aria-required`, `role="alert"` throughout
- `cursor-pointer` on all interactive elements
- Native `<dialog>` for modals — built-in focus trapping and Escape key support
- Color is never the sole conveyor of information (badges include text labels)
