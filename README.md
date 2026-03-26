# 🚀 ThoughtSpace — Health, Wealth & Wisdom

A **space-themed spatial knowledge board** that organizes your notes, screenshots, and ideas into three life pillars — **Health**, **Wealth**, and **Wisdom** — presented as an interactive, explorable universe.

![ThoughtSpace](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/fc630f28-ecc8-4b55-93f9-b49e8b0b6349" />


---

## ✨ Features

### 🪐 Two-Level Navigation
- **Overview** — Three glowing planet orbs (Health, Wealth, Wisdom) floating in an animated starfield with constellation lines connecting them
- **Pillar View** — Click a planet to "warp in" to a mood board of notes, filterable by category

### 📝 Smart Note Management
- Notes automatically organized into **3 pillars × 6 categories each** (18 total categories)
- Mood board layout with varied card sizes, subtle rotations, and glassmorphism styling
- Category filter chips for quick drilling down
- Click any note card to open a full-content viewer modal

### 📎 Multi-File Upload with AI Auto-Tagging
- Drag & drop or browse to upload `.txt`, `.md`, `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`
- **With OpenAI API key**: AI-powered categorization into the correct pillar, category, and auto-generated tags
- **Without API key**: Keyword-based fallback categorization
- Multi-file queue with per-file status tracking (pending → reading → categorizing → done)

### 📸 Interactive Screenshot Map
- Full-screen gallery showing all screenshots grouped by pillar and category clusters
- Pinch-to-zoom / Ctrl+scroll to zoom out and see clusters at a glance
- Regular scroll for browsing; zoom scales the content
- Click any screenshot for a detailed view with metadata

### 🤖 AI Chatbot Assistant
- Floating chat bubble (bottom-right) powered by OpenAI
- Context-aware — sends your notes as context for intelligent responses
- Quick action chips to navigate to pillars or ask common questions
- Offline fallback mode with text-based search when no API key is configured

### 🗺️ Space-Themed UI
- Animated starfield background with twinkling stars and nebula glows
- Planet orbs with orbital rings, floating animation, and glow effects
- Glassmorphism panels for all UI components
- Smooth "warp" transitions between views

### 🧭 Navigation & Discovery
- **Breadcrumbs** — Always know where you are (🚀 ThoughtSpace → Pillar)
- **Quick Jump sidebar** — Pillar shortcuts + pinned & recent notes (overview only)
- **Minimap** — SVG constellation map with planet dots and distribution bar
- **Search** — Real-time search with results dropdown; click to jump to a pillar

### ⚙️ Settings
- Configure OpenAI API key (stored in `localStorage`, never sent anywhere except OpenAI)
- Select AI model (GPT-4o Mini, GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo)
- Visual indicator (amber dot) on Settings button when no API key is set

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5 |
| **Styling** | Tailwind CSS 3 + Inline styles |
| **State** | Zustand |
| **Build** | Vite 5 |
| **AI** | OpenAI API (GPT-4o / GPT-4o Mini) |
| **Animations** | CSS keyframes (no heavy animation library) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/spatial-notes-board.git
cd spatial-notes-board

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── App.tsx                          # Root component
├── main.tsx                         # Entry point
├── index.css                        # Global styles & animations
├── vite-env.d.ts
│
├── components/
│   ├── canvas/
│   │   ├── SpatialCanvas.tsx        # Main canvas (overview + pillar view)
│   │   └── DragDropZone.tsx         # File drop overlay
│   ├── chat/
│   │   └── Chatbot.tsx              # AI chatbot panel
│   ├── notes/
│   │   ├── FileUploader.tsx         # Multi-file upload with AI tagging
│   │   └── NoteViewer.tsx           # Note detail modal
│   ├── screenshots/
│   │   └── ScreenshotMap.tsx        # Full-screen screenshot gallery
│   └── ui/
│       ├── ActionButtons.tsx        # Upload, Screenshots, Settings buttons
│       ├── Breadcrumbs.tsx          # Navigation breadcrumb trail
│       ├── Minimap.tsx              # Space minimap with planet dots
│       ├── QuickJump.tsx            # Sidebar navigation panel
│       ├── SearchBar.tsx            # Search with results dropdown
│       └── SettingsPanel.tsx        # API key & model settings modal
│
├── constants/
│   └── pillars.ts                   # Pillar colors, positions, keywords
│
├── data/
│   └── mockData.ts                  # Demo data generator (60 notes + screenshots)
│
├── services/
│   └── llm.ts                       # OpenAI API integration
│
├── store/
│   ├── useNotesStore.ts             # Notes & categories state
│   ├── useViewStore.ts              # View state (active view, search, zoom)
│   └── useThemeStore.ts             # Theme state (dark by default)
│
├── types/
│   └── index.ts                     # TypeScript interfaces (Note, Pillar, etc.)
│
└── utils/
    └── layoutUtils.ts               # Masonry layout generation
```

---

## 🌱💎📚 The Three Pillars

Everything you save naturally falls into one of three life pillars:

| Pillar | Emoji | Color | Categories |
|---|---|---|---|
| **Health** | 🌱 | Emerald/Cyan | Fitness & Movement, Nutrition & Cooking, Mental Wellness, Sleep & Recovery, Medical & Healthcare, Habits & Routines |
| **Wealth** | 💎 | Amber/Gold | Career & Work Projects, Skills & Professional Development, Income & Earnings, Investments & Assets, Budgeting & Expenses, Business Ideas & Entrepreneurship |
| **Wisdom** | 📚 | Purple/Indigo | Technical Learning, Books & Reading, Creative Projects, Life Philosophy, Productivity & Systems, Random Ideas & Curiosities |

---

## 🔑 OpenAI Integration (Optional)

ThoughtSpace works fully **without** an API key using keyword-based categorization and offline search. To enable AI features:

1. Click **⚙️ Settings** (bottom-right)
2. Paste your OpenAI API key (`sk-...`)
3. Select your preferred model
4. Click **Save Settings**

AI features include:
- **Smart categorization** — Automatically assigns pillar, category, tags, title, and summary to uploaded files
- **AI Chat** — Context-aware assistant that knows about all your notes
- Your key is stored in `localStorage` and only sent to OpenAI's API

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Vite HMR) |
| `npm run build` | Type-check (`tsc`) + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📄 License

MIT

---

Built with 🚀 by ThoughtSpace
