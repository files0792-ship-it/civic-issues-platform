# Civic Issue Reporting Platform

Full-stack web app for citizens to report local issues (with photos and a city selector), browse a public feed, upvote for priority, and track status. Admins manage reports from a dashboard with filters and bulk actions.

## Tech stack

| Layer    | Choice                          |
|----------|----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS     |
| Location | City string (autocomplete UI)    |
| Backend  | Node.js, Express (ES modules)    |
| Database | MongoDB + Mongoose               |
| Auth     | JWT (Bearer token)               |

## Project structure

```
civic-issues-platform/
├── client/                 # React SPA
│   ├── src/
│   │   ├── api/            # Axios instance + auth header
│   │   ├── components/     # Layout, cards, city combobox, badges
│   │   ├── context/        # AuthContext (JWT in localStorage)
│   │   └── pages/          # Feed, login, register, submit, admin
│   └── vite.config.js      # Dev proxy → API :5000
├── server/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── middleware/     # JWT, multer uploads
│   │   ├── models/         # User, Issue
│   │   ├── constants/      # allowed city names
│   │   ├── routes/         # auth, cities, issues, admin, ml (stub)
│   │   ├── utils/          # Token, text similarity, priority stub
│   │   └── scripts/        # seed sample data
│   └── uploads/            # User images (gitignored except .gitkeep)
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally or a connection URI (Atlas)

## Setup

### 1. MongoDB

Start local MongoDB, or create a free cluster and copy the connection string.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, PUBLIC_API_URL=http://localhost:5000
npm install
npm run seed    # optional: demo users + issues (wipes existing data in that DB)
# If you previously used GeoJSON locations, re-seed or migrate issues so `location` is a string.
npm run dev
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

### 3. Frontend

```bash
cd client
cp .env.example .env
# Leave VITE_API_URL empty for local dev (Vite proxies /api and /uploads)
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Sample accounts (after `npm run seed`)

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | `admin@civic.local` | `admin123` |
| User  | `user@civic.local`  | `user123`  |

To promote any user to admin in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Environment variables

**Server (`server/.env`)**

| Variable         | Description                                        |
|------------------|----------------------------------------------------|
| `MONGODB_URI`    | MongoDB connection string                          |
| `JWT_SECRET`     | Secret for signing JWTs (use a long random value)  |
| `PORT`           | API port (default `5000`)                          |
| `PUBLIC_API_URL` | Base URL for image links in JSON (e.g. production API URL) |
| `CLIENT_ORIGIN`  | CORS origin for production frontend (optional)   |

**Client (`client/.env`)**

| Variable         | Description                                                |
|------------------|------------------------------------------------------------|
| `VITE_API_URL`   | Production API origin, e.g. `https://api.yourapp.com`. Empty in dev uses same-origin + Vite proxy. |

## REST API overview

### Auth

- `POST /api/auth/register` — body: `{ name, email, password }`
- `POST /api/auth/login` — body: `{ email, password }`
- `GET /api/auth/me` — header: `Authorization: Bearer <token>`

### Cities

- `GET /api/cities` — returns `{ cities: string[] }` (Delhi, Mumbai, Bangalore, Chennai, Kolkata)
- `GET /api/cities?q=del` — filtered suggestions for autocomplete

### Issues (public + authenticated)

- `GET /api/issues` — query: `status`, `sort`, `q`, `location` (exact city), `page`, `limit`
- `GET /api/issues/:id`
- `POST /api/issues` — `multipart/form-data`: `title`, `description`, `location` (city name), optional `image` (requires JWT)
- `POST /api/issues/:id/upvote` — toggle upvote (requires JWT)
- `PATCH /api/issues/:id/status` — body: `{ status }` — `Pending` \| `In Progress` \| `Resolved` (requires JWT; returns `{ issue }`)

### Admin (JWT + `role: admin`)

- `GET /api/admin/issues` — filters: status, sort, `q`, `location` (city), `priorityMin`, `priorityMax`
- `DELETE /api/admin/issues/:id`

### ML / bonus stubs

- `POST /api/ml/classify-image` — body: `{ imageUrl }` — returns mock labels (placeholder for a real model)
- Duplicate hint: on create, Jaccard similarity over title+description vs open issues; sets `possibleDuplicateOf` when above threshold
- `predictedPriority` on each issue: heuristic stub in `server/src/utils/priorityStub.js`

## Production build

```bash
cd client && npm run build
# Serve client/dist with any static host (Netlify, Vercel, S3, etc.)
# Set VITE_API_URL to your API before building
```

Deploy the API to Railway, Render, Fly.io, etc. Set `PUBLIC_API_URL` to the public API URL so image URLs in responses are correct. Set `CLIENT_ORIGIN` to your frontend URL for CORS.

## License

MIT — hackathon and learning use encouraged.
