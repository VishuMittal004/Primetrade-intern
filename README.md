<p **⚠ NOTE:** There was a task-link mismatch during the hiring process: the assignment shared in the role email differed from the backend-developer project included in the submission form. To stay safe, both projects were completed. The other project repository is here: <a href="REPLACE_WITH_OTHER_PROJECT_REPO_LINK">Other project repo</a>.</p>

# TaskFlow API — Backend Intern Assignment

A production-ready REST API demonstrating JWT authentication, Role-Based Access Control (RBAC), and full CRUD operations — built with Node.js, Express, and MongoDB.

---

## 🗂 Project Structure

```
Intern project/
├── backend/
│   ├── src/
│   │   ├── config/         # DB & Swagger config
│   │   ├── controllers/    # HTTP handlers (thin layer)
│   │   ├── middleware/     # auth, error, validate
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/v1/      # Versioned API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # logger, response, seed
│   │   ├── validators/     # express-validator chains
│   │   ├── app.js          # Express setup
│   │   └── server.js       # Entry point
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + service fns
│   │   ├── components/     # Sidebar, Layout, Modal, Guards
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Register, Dashboard, Tasks, Profile, Admin
│   │   ├── App.jsx         # Router
│   │   └── main.jsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017 (or Atlas URI)

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (MongoDB URI, JWT secrets)
npm run seed     # Seed demo users & tasks
npm run dev      # Starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev      # Starts on http://localhost:3000
```

### 3. Docker (All-in-one)

```bash
docker-compose up --build
# API:     http://localhost:5000
# Frontend: http://localhost:3000
# Docs:    http://localhost:5000/api-docs
```

---

## 🔐 Demo Accounts (after seed)

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@taskflow.dev     | Admin123   |
| User  | alice@taskflow.dev     | Alice123   |
| User  | bob@taskflow.dev       | Bobby123   |

---

## 📡 API Routes

### Auth — `/api/v1/auth`
| Method | Route               | Access  | Description            |
|--------|---------------------|---------|------------------------|
| POST   | /register           | Public  | Register new account   |
| POST   | /login              | Public  | Login, returns JWT     |
| POST   | /logout             | Auth    | Clear refresh cookie   |
| GET    | /me                 | Auth    | Get own profile        |
| PATCH  | /change-password    | Auth    | Change password        |

### Users — `/api/v1/users`
| Method | Route               | Access  | Description            |
|--------|---------------------|---------|------------------------|
| PATCH  | /profile            | Auth    | Update own display name|
| GET    | /                   | Admin   | List all users         |
| GET    | /:id                | Admin   | Get user by ID         |
| PATCH  | /:id/toggle-status  | Admin   | Activate/deactivate    |
| PATCH  | /:id/role           | Admin   | Change user role       |
| DELETE | /:id                | Admin   | Delete user            |

### Tasks — `/api/v1/tasks`
| Method | Route      | Access       | Description                    |
|--------|------------|--------------|--------------------------------|
| GET    | /stats     | Auth         | Aggregated task statistics     |
| GET    | /          | Auth         | List tasks (paginated/filtered)|
| POST   | /          | Auth         | Create task                    |
| GET    | /:id       | Auth (owner) | Get task by ID                 |
| PUT    | /:id       | Auth (owner) | Update task                    |
| DELETE | /:id       | Auth (owner) | Delete task                    |

### Query Parameters (GET /tasks)
- `page`, `limit` — Pagination
- `status` — `todo | in-progress | done`
- `priority` — `low | medium | high`
- `search` — Full-text search
- `tags` — Comma-separated tag filter
- `sortBy` — `createdAt | updatedAt | dueDate | priority | title`
- `order` — `asc | desc`

---

## 📚 API Documentation

Swagger UI: **http://localhost:5000/api-docs**

Covers all endpoints with request/response schemas, auth flow, and examples.

---

## 🔒 Security Features

- **JWT** with access tokens (7d) + httpOnly refresh cookie (30d)
- **bcrypt** password hashing (12 salt rounds)
- **Helmet** security headers
- **express-rate-limit** — 100 req / 15min per IP
- **express-mongo-sanitize** — NoSQL injection prevention
- **CORS** restricted to frontend origin
- **Input validation** on every endpoint via express-validator
- **Password policy** — uppercase + lowercase + number required

---

## 🗄 MongoDB Schema

### User
```
name, email (unique), password (hashed), role (user|admin),
isActive, lastLogin, passwordChangedAt, createdAt, updatedAt
```

### Task
```
title, description, status (todo|in-progress|done),
priority (low|medium|high), dueDate, tags[], owner (ref:User),
isArchived, createdAt, updatedAt
```
Indexes: `{ owner, status }`, `{ owner, priority }`, `{ owner, createdAt }`, full-text on title+description

---

## 📈 Scalability Notes

### Horizontal Scaling
- Stateless JWT — add any number of API replicas behind a load balancer (Nginx/AWS ALB)
- MongoDB connection pooling (maxPoolSize: 10) — ready for Atlas sharding

### Caching (Future)
- Add Redis for: session tokens, rate-limit counters, task-stats cache
- `node-cache` or `ioredis` as drop-in — service layer is already abstracted

### Microservices Path
- Services (`auth.service.js`, `task.service.js`) map 1:1 to future microservices
- Add an API Gateway (Kong / Express Gateway) without changing route contracts

### Monitoring
- Winston structured logging — ship to ELK, Datadog, or CloudWatch
- Add `/metrics` endpoint with `prom-client` for Prometheus/Grafana

### CI/CD
- Dockerfile + docker-compose included
- Add GitHub Actions: lint → test → build → push to ECR → deploy to ECS/K8s

---

## 🛠 Environment Variables

| Variable              | Description                    | Default                    |
|-----------------------|--------------------------------|----------------------------|
| `NODE_ENV`            | Environment                    | development                |
| `PORT`                | Server port                    | 5000                       |
| `MONGODB_URI`         | MongoDB connection string      | mongodb://localhost:27017/taskflow_db |
| `JWT_SECRET`          | Access token secret (≥32 chars)| —                          |
| `JWT_EXPIRES_IN`      | Access token TTL               | 7d                         |
| `JWT_REFRESH_SECRET`  | Refresh token secret           | —                          |
| `CLIENT_URL`          | Allowed CORS origin            | http://localhost:3000      |

---

## 📦 Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Runtime     | Node.js 20 + Express 4           |
| Database    | MongoDB 7 + Mongoose 8           |
| Auth        | JWT + bcryptjs                   |
| Validation  | express-validator                |
| Docs        | Swagger UI (OpenAPI 3.0)         |
| Logging     | Winston                          |
| Security    | Helmet, CORS, rate-limit, sanitize|
| Frontend    | React 18 + Vite + React Router 6 |
| HTTP Client | Axios                            |
| Docker      | Docker + Docker Compose          |
