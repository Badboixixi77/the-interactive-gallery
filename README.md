<p align="center">
  <h1 align="center">🖼️ The Interactive Gallery</h1>
  <p align="center">
    A premium full-stack photography discovery platform powered by Unsplash — explore, search, filter, favorite, download, and comment on stunning imagery.
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

### 🖼️ Gallery & Viewing
- **Masonry Grid Gallery** — Responsive, Pinterest-style layout that adapts from 1 to 4 columns across breakpoints
- **Unsplash Integration** — Fetches high-quality images directly from the Unsplash API
- **Image Detail View** — Two-column layout with full image display, metadata, tags, and photographer attribution
- **Lightbox** — Full-screen image viewing with keyboard (Esc) and click-to-close support
- **Loading Skeletons** — Animated shimmer placeholders that match the content layout
- **Hover Effects** — Smooth card elevation, zoom, and photographer name overlay on hover

### 🔍 Search & Discovery
- **Autocomplete Search** — Debounced live suggestions as you type, with keyboard navigation (Arrow keys + Enter)
- **Search Filters** — Filter results by orientation (landscape/portrait/square) and color (12 color swatches)
- **Sorting** — Sort results by Relevance or Latest
- **Result Counts** — Total result count displayed with search results
- **Search History** — Recent searches saved locally, with one-click clear
- **Trending Topics** — Curated topic chips on the homepage for instant exploration
- **Keyboard Shortcut** — Press `/` anywhere to jump to search

### ❤️ Engagement
- **Favorites System** — Heart images to save them, with a dedicated Favorites page and nav badge
- **Comment System** — Post and view comments per image, backed by a persistent PostgreSQL database, with newest/oldest sorting
- **HD Downloads** — Download full-resolution images with proper Unsplash attribution
- **Color Palette Extraction** — Automatically extracts the 5 dominant colors from any image
- **Share Buttons** — Share to Twitter/X, Pinterest, or copy a direct link
- **Toast Notifications** — Real-time success/error feedback for user actions

### 💎 Design
- **Premium Editorial Design** — Serif/sans-serif typography pairing, gallery-inspired aesthetic
- **Mobile Responsive** — Hamburger menu, adaptive layouts, and touch-friendly controls
- **Smooth Animations** — Staggered card entrances, page transitions, and micro-interactions
- **Accessibility** — Reduced-motion support, semantic markup, keyboard navigation
- **SPA Routing** — Seamless client-side navigation with React Router

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
│   │   │   ├── ImageCard.tsx    # Individual image card with hover overlay + favorite
│   │   │   ├── CommentSection.tsx # Comment list + form with toast
│   │   │   ├── Navbar.tsx       # Sticky nav with autocomplete search + keyboard shortcut
│   │   │   ├── FilterBar.tsx    # Search filters (orientation, color, sort)
│   │   │   ├── Lightbox.tsx     # Full-screen image viewer
│   │   │   ├── ShareButtons.tsx # Twitter/X, Pinterest, copy link
│   │   │   ├── Footer.tsx       # Site footer
│   │   │   └── Toast.tsx        # Auto-dismiss toast notification
│   │   ├── pages/
│   │   │   ├── GalleryPage.tsx  # Home page with trending topics + filters
│   │   │   ├── ImageDetailPage.tsx # Detail page with download, palette, share
│   │   │   └── FavoritesPage.tsx # Saved favorites gallery
│   │   ├── hooks/
│   │   │   ├── useFavorites.ts  # localStorage-backed favorites
│   │   │   └── useSearchHistory.ts # localStorage-backed search history
│   │   ├── services/
│   │   │   ├── apiService.ts    # Backend comment API client
│   │   │   └── unsplashService.ts # Unsplash API client (search, filters, topics)
│   │   ├── utils/
│   │   │   └── colorExtractor.ts # Canvas-based dominant color extraction
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

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus the search bar |
| `↑` / `↓` | Navigate search suggestions |
| `Enter` | Select suggestion / submit search |
| `Esc` | Close search dropdown or lightbox |

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
| Responsive masonry grid with trending topics and hover overlays | Two-column layout with palette, download, share, and comments |
| **Search** | **Filters** |
| Autocomplete dropdown with search history | Orientation, color, and sort filter bar |

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
