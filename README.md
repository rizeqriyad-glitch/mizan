# ⚖️ Mizan — ميزان
### Premium Islamic Productivity Platform

A production-ready web application built around the 5 daily prayers, deep productivity, and Islamic lifestyle management. Built with React, Firebase, and Framer Motion.

---

## ✨ Features

- **5 Daily Prayers** — Fixed, permanent prayer sections (Fajr, Dhuhr, Asr, Maghrib, Isha) that cannot be deleted
- **Worship Sections** — Quran, Morning Adhkar, Evening Adhkar
- **Real Prayer Times** — Auto-detected via GPS using the Aladhan API, accurate for any location worldwide
- **Task Management** — Add, edit, delete, reorder tasks within each section
- **Focus Timer** — Pomodoro-style timer with 25/5/15 minute modes and audio notification
- **Analytics** — Weekly bar charts, prayer heatmap, section breakdown
- **Streak & Points** — Gamified productivity system
- **Google Authentication** — Real OAuth sign-in, no fake auth
- **Cloud Database** — Firestore with per-user data isolation
- **Multi-language** — Full English/Arabic with proper RTL layout
- **Theme** — Dark/Light mode with smooth transition
- **Time Format** — 12h/24h user preference, saved to account
- **Fully Responsive** — Mobile, tablet, desktop

---

## 🚀 Setup Guide

### 1. Prerequisites

- Node.js 18+ installed
- A Google account
- A Firebase account (free tier works)

### 2. Clone & Install

```bash
git clone <your-repo>
cd mizan
npm install
```

### 3. Firebase Setup

#### A. Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `mizan-app`
3. Disable Google Analytics (optional)
4. Click **Create Project**

#### B. Enable Authentication
1. In your Firebase project → **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** provider
4. Add your project's domain to **Authorized domains** (add `localhost` for development)
5. Save

#### C. Enable Firestore
1. In Firebase project → **Firestore Database** → **Create database**
2. Choose **Start in test mode** (you'll apply security rules next)
3. Choose your region → **Enable**

#### D. Apply Security Rules
1. Go to Firestore → **Rules** tab
2. Copy the contents of `firestore.rules` into the editor
3. Click **Publish**

#### E. Get Config Values
1. In Firebase project → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **Add app** → **Web** (</>)
3. Register the app with name `mizan-web`
4. Copy the `firebaseConfig` object values

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase values:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=mizan-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mizan-app
VITE_FIREBASE_STORAGE_BUCKET=mizan-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add all your `VITE_FIREBASE_*` values.

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Add environment variables in the Netlify dashboard → Site settings → Environment variables.

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to: dist
# Configure as SPA: Yes
npm run build
firebase deploy
```

---

## 🏗️ Project Structure

```
mizan/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # App shell with sidebar nav
│   │   ├── TaskSection.jsx     # Section with full task CRUD + reorder
│   │   ├── PrayerTimesWidget.jsx # Live prayer times with done tracking
│   │   ├── FocusTimer.jsx      # Pomodoro timer
│   │   └── StatsBar.jsx        # Streak, points, prayers, score
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Firebase Auth + Google OAuth
│   │   └── AppContext.jsx      # Global state + Firestore sync + translations
│   ├── pages/
│   │   ├── LoginPage.jsx       # Sign-in with Google
│   │   ├── DashboardPage.jsx   # Main daily view
│   │   ├── AnalyticsPage.jsx   # Weekly analytics + prayer tracker
│   │   └── SettingsPage.jsx    # Language, theme, time format
│   ├── utils/
│   │   ├── prayerTimes.js      # Aladhan API integration
│   │   └── dateUtils.js        # Date helpers, timer format
│   ├── styles/
│   │   └── globals.css         # Design tokens, themes, animations
│   ├── firebase.js             # Firebase initialization
│   ├── App.jsx                 # Routes + auth guards
│   └── main.jsx                # Entry point
├── firestore.rules             # Firestore security rules
├── .env.example                # Environment variables template
└── README.md
```

---

## 🔒 Security

- **Auth guards** — All routes except `/login` require authentication
- **Firestore rules** — Users can only read/write their own data (`/users/{userId}/...`)
- **No shared data** — Complete data isolation between users
- **Google OAuth** — Industry-standard authentication, no passwords stored
- **Environment variables** — Firebase config never hard-coded

---

## 🕌 Prayer Times API

Uses the free [Aladhan API](https://aladhan.com/prayer-times-api):
- Automatic GPS location detection
- Calculation method: ISNA (method 2) — change in `prayerTimes.js` if needed
- Falls back to Mecca coordinates if GPS denied
- Other methods: 1=University of Islamic Sciences Karachi, 3=Muslim World League, 4=Umm Al-Qura, 5=Egyptian, etc.

---

## 🌍 Languages

| Feature | English | Arabic |
|---------|---------|--------|
| UI Direction | LTR | RTL |
| Font | DM Sans | Noto Naskh Arabic |
| Prayer names | ✅ | ✅ |
| All UI text | ✅ | ✅ |
| Date formatting | ✅ | ✅ |

---

## 📱 Browser Support

Chrome, Firefox, Safari, Edge (last 2 versions). Mobile Safari and Chrome on iOS/Android fully supported.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS variables (no framework) |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore |
| Prayer API | Aladhan (free, no key needed) |
| Drag & Drop | dnd-kit |
| Deployment | Vercel / Netlify / Firebase Hosting |

---

## 🤲 بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ

*"Indeed, prayer has been decreed upon the believers a decree of specified times."*
— Quran 4:103
