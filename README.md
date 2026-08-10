<p align="center">
  <h1 align="center">🖼️ The Interactive Gallery</h1>
  <p align="center">
    A full-stack interactive image gallery powered by Unsplash, where users can explore stunning photography and leave comments.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-19.1-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-5.1-green?logo=node.js" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Deployed%20on-Render-46e3b7?logo=render" alt="Render" />
  </p>
</p>

---

## ✨ Features

- **Masonry Grid Gallery** — Responsive, Pinterest-style layout that adapts from 1 to 4 columns across breakpoints
- **Unsplash Integration** — Fetches high-quality images directly from the Unsplash API
- **Image Detail View** — Two-column layout with full image display, metadata, tags, and photographer attribution
- **Comment System** — Post and view comments per image, backed by a persistent PostgreSQL database
- **Toast Notifications** — Real-time success/error feedback for user actions
- **Loading Skeletons** — Animated shimmer placeholders that match the content layout
- **Hover Effects** — Smooth card elevation, zoom, and photographer name overlay on hover
- **SPA Routing** — Seamless client-side navigation with React Router
- **Dark Footer** — Professional footer with Unsplash attribution

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, React Router 7, Axios, react-masonry-css |
| **Backend** | Express 5, TypeScript, pg (node-postgres), CORS, dotenv |
| **Database** | PostgreSQL |
| **External API** | Unsplash API |
| **Deployment** | Render (Backend + DB), Render Static Site or Vercel (Frontend) |
| **Build Tool** | Create React App (react-scripts) |

---

## 📁 Project Structure

```
the-interactive-gallery/
├── backend/
│   ├── index.ts                 # Express server, routes, PostgreSQL setup
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example             # Environment variable template
│   └── .env                     # Local secrets (not committed)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Gallery.tsx      # Masonry grid layout
│   │   │   ├── ImageCard.tsx    # Individual image card with hover overlay
│   │   │   ├── CommentSection.tsx # Comment list + form with toast
│   │   │   ├── Navbar.tsx       # Sticky navigation header
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   └── Toast.tsx        # Auto-dismiss toast notification
│   │   ├── pages/
│   │   │   ├── GalleryPage.tsx  # Home page with skeleton loading
│   │   │   └── ImageDetailPage.tsx # Detail page with back nav
│   │   ├── services/
│   │   │   ├── apiService.ts    # Backend comment API client
│   │   │   └── unsplashService.ts # Unsplash API client
│   │   ├── App.tsx              # Router + layout wrapper
│   │   ├── App.css              # All component styles
│   │   └── index.css            # Global styles + reset
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json              # Vercel SPA rewrite config
│   ├── .env.example
│   └── .env
├── render.yaml                  # Render Blueprint (full-stack deploy)
├── package.json                 # Root orchestration scripts
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally on port 5432
- An **Unsplash API key** ([get one here](https://unsplash.com/developers))

### 1. Clone & Install

```bash
git clone https://github.com/Badboixixi77/the-interactive-gallery.git
cd the-interactive-gallery
npm run install:all
```

### 2. Configure Environment Variables

**Frontend** — copy the example and fill in your values:

```bash
cd frontend
cp .env.example .env
```

```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Backend** — copy the example and adjust if needed:

```bash
cd backend
cp .env.example .env
```

```env
PORT=3001
DATABASE_URL=postgresql://user@localhost:5432/interactive_gallery
```

### 3. Create the Database

```bash
psql -U $(whoami) -d postgres -c "CREATE DATABASE interactive_gallery;"
```

> The `comments` table is auto-created on first backend startup.

### 4. Run the App

Start both servers (run in separate terminals):

```bash
# Terminal 1 — Backend (with hot reload)
npm run backend

# Terminal 2 — Frontend
npm run frontend
```

The app will be available at **http://localhost:3000**.

---

## 🏗️ Available Scripts

| Command | Description |
|---|---|
| `npm run install:all` | Install dependencies for root, frontend, and backend |
| `npm run frontend` | Start the React dev server (port 3000) |
| `npm run backend` | Start the Express server with hot reload (port 3001) |
| `npm run build:frontend` | Build the React app for production |
| `npm run build:backend` | Compile backend TypeScript to `backend/dist/` |

### Backend-specific scripts

| Command | Description |
|---|---|
| `npm start` | Run with ts-node (development) |
| `npm run dev` | Run with ts-node-dev + auto-restart |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled JS from `dist/` (production) |

---

## 🌐 Deployment

### One-Click Deploy to Render

This project includes a [render.yaml](render.yaml) Blueprint that deploys the entire stack:

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Blueprint** and connect this repository
3. Render auto-detects 3 services:
   - **interactive-gallery-api** — Express backend (Node.js Web Service)
   - **interactive-gallery-frontend** — React static site
   - **interactive-gallery-db** — Managed PostgreSQL database
4. When prompted, enter your **Unsplash API key** for `REACT_APP_UNSPLASH_ACCESS_KEY`
5. Click **Apply** — everything deploys automatically

### Environment Variables on Render

| Service | Variable | Source |
|---|---|---|
| Backend | `PORT` | Set to `3001` |
| Backend | `DATABASE_URL` | Auto-linked from PostgreSQL service |
| Backend | `FRONTEND_URL` | Auto-linked from frontend service host |
| Frontend | `REACT_APP_BACKEND_URL` | Auto-linked from backend service host |
| Frontend | `REACT_APP_UNSPLASH_ACCESS_KEY` | Manual (your API key) |

### Deploy Frontend Separately to Vercel

If you prefer Vercel for the frontend:

1. Import the repo on [vercel.com](https://vercel.com)
2. Set the root directory to `frontend`
3. Add `REACT_APP_BACKEND_URL` pointing to your Render backend URL
4. Add `REACT_APP_UNSPLASH_ACCESS_KEY` with your Unsplash key

---

## 🔌 API Endpoints

The backend exposes a simple REST API for comments:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/comments/:imageId` | Fetch all comments for an image (newest first) |
| `POST` | `/api/comments/:imageId` | Post a new comment (`author` and `text` required, min 2 chars) |

### Example: Post a Comment

```bash
curl -X POST http://localhost:3001/api/comments/abc123 \
  -H "Content-Type: application/json" \
  -d '{"author": "Alice", "text": "Beautiful shot!"}'
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE comments (
  id          SERIAL PRIMARY KEY,
  image_id    VARCHAR(100) NOT NULL,
  author      VARCHAR(100) NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📸 Screenshots

| Gallery | Image Detail |
|---|---|
| Responsive masonry grid with hover overlays | Two-column layout with tags and comments |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Express, and PostgreSQL
  <br/>
  Images provided by <a href="https://unsplash.com">Unsplash</a>
</p>
