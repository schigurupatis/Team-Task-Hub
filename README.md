# 🗂️ Team Task Hub

A production-ready full-stack Task Management application built with React, TypeScript, Node.js, and Express.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd team-task-hub

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** — copy and edit:
```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

### 3. Run in Development

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Or with `concurrently` from root:
```bash
npm install          # install root dev deps
npm run dev          # starts both
```

---

## 🧪 Testing

```bash
# Backend tests (supertest + jest)
cd backend && npm test

# Frontend tests (jest + testing-library)
cd frontend && npm test

# Watch mode
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

---

## 🏗️ Architecture

```
team-task-hub/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── app.ts            # Express app factory
│   │   ├── index.ts          # Server entry point
│   │   ├── controllers/      # Route handlers (thin layer)
│   │   ├── middleware/        # Error handling, ID validation
│   │   ├── models/           # In-memory task store
│   │   ├── routes/           # Express routers
│   │   ├── types/            # Shared TypeScript types
│   │   └── validators/       # Zod schemas
│   └── tests/                # Supertest integration tests
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── common/       # Badge, Button, Modal, Toast
    │   │   ├── layout/       # Header
    │   │   └── tasks/        # TaskCard, TaskForm, FiltersBar, etc.
    │   ├── hooks/            # useDebounce, useAppDispatch
    │   ├── pages/            # Dashboard (main page)
    │   ├── services/         # Axios API layer
    │   ├── store/            # Redux Toolkit store + slices
    │   ├── types/            # Shared TS types
    │   ├── utils/            # Formatting, color maps
    │   └── validators/       # Zod schemas (client-side)
    └── tests/                # Unit tests
```

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks (with search, filter, pagination) |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task *(requires `x-delete-token` header)* |
| GET | `/health` | Health check |

### Query Parameters for GET /tasks
| Param | Type | Example |
|-------|------|---------|
| `search` | string | `?search=deploy` |
| `priority` | low \| medium \| high \| critical | `?priority=high` |
| `status` | todo \| in-progress \| done \| archived | `?status=todo` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=10` |

### Task Object
```json
{
  "id": "uuid",
  "title": "Fix CI pipeline",
  "description": "Details...",
  "priority": "high",
  "status": "in-progress",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T01:00:00.000Z"
}
```

### Protected Delete
```bash
curl -X DELETE http://localhost:4000/api/tasks/<id> \
  -H "x-delete-token: super-secret-delete-token-2026"
```

---

## 🛡️ Security Features

- **Helmet.js** — sets secure HTTP headers
- **CORS** — locked to `FRONTEND_URL`
- **Rate Limiting** — 500 req / 15 min per IP
- **Protected Delete** — custom `x-delete-token` header required
- **Input validation** — Zod on both client and server
- **Body size limit** — 10kb max payload
- **UUID validation** — malformed IDs rejected with 400

---

## 🧠 Architectural Decisions

### Backend
- **App factory pattern** (`createApp()`) — makes the Express app fully testable without starting a server; supertest can import the app directly.
- **In-memory store as a class** — `TaskStore` encapsulates all data logic. Swapping to a database (Postgres, MongoDB) requires only a new class implementing the same interface.
- **Zod for validation** — single source of truth for types and runtime validation. Same library used on both frontend and backend.
- **Thin controllers** — controllers only orchestrate; business/data logic lives in the model layer.

### Frontend
- **Redux Toolkit** — predictable state management with minimal boilerplate. `createAsyncThunk` handles loading/error states consistently.
- **Service layer** (`task.service.ts`) — all API calls live here. Components never call `axios` directly; this makes testing and API changes straightforward.
- **Optimistic-adjacent UI** — state updates happen in Redux after server confirmation; loading spinners keep UX responsive.
- **useDebounce** — search input debounced at 350ms to avoid excessive API calls while typing.
- **Native `<dialog>`** — used for modals; provides built-in focus trapping and `Escape` to close, reducing accessibility boilerplate.
- **Vite proxy** — in development, `/api` is proxied to the backend, so no CORS issues during local development.

### Accessibility (WCAG 2.1 AA)
- Skip-to-content link
- `aria-label`, `aria-live`, `aria-busy`, `aria-required` throughout
- `role="alert"` on validation errors
- Keyboard navigable — all interactive elements reachable via Tab
- Focus-visible styles on all interactive elements
- `<time>` element with `dateTime` attribute for dates
- Color is never the sole conveyor of information (badges include text labels)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| State management | Redux Toolkit |
| Validation | Zod |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Testing (BE) | Jest + Supertest |
| Testing (FE) | Jest + Testing Library |
| Security | Helmet, express-rate-limit |

---

## 🚢 Production Build

```bash
# Backend
cd backend
npm run build        # outputs to dist/
npm start            # runs compiled JS

# Frontend
cd frontend
npm run build        # outputs to dist/
npm run preview      # preview production build
```
