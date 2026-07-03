# HabitFlow

A modern, full-stack habit tracking application with a GitHub-style contribution heatmap, streaks, analytics, and email reminders.

**Stack:** React 18 + Vite + Tailwind CSS + Redux Toolkit · Node.js + Express · MongoDB + Mongoose · JWT auth

---

## Features

- **Auth** — register, login, logout, forgot/reset password (email token, 15-min expiry), profile management, password change
- **Habits** — full CRUD with name, description, category, frequency (daily / weekly / monthly), color, and start date
- **Tracking** — mark/unmark completion per day, duplicate-safe (unique DB index), full completion history
- **GitHub-style heatmap** — last 365 days, 4 shade levels, hover/focus tooltip ("Completed 3 habits on June 22, 2026")
- **Dashboard** — total habits, completed today, current & longest streak, 30-day completion %, weekly + monthly charts
- **Streak system** — current/longest streak computation with badges (3, 7, 30, 100, 365 days)
- **Categories** — six defaults (Health, Fitness, Learning, Reading, Meditation, Productivity) plus custom
- **Reminders** — daily email at a user-chosen time (node-cron + nodemailer), listing only habits still pending that day
- **Analytics** — per-habit success rates, most consistent habit, week-over-week comparison, 12-week trend, category breakdown
- **UI/UX** — responsive, dark mode, card layout, animations, loading states, toast notifications

## Project structure

```
habitflow/
├── server/
│   ├── .env.example
│   └── src/
│       ├── config/          # db connection
│       ├── models/          # User, Habit, HabitCompletion
│       ├── controllers/     # auth, habits, dashboard/analytics
│       ├── routes/
│       ├── middleware/      # auth (JWT), error handler, validation
│       ├── validators/      # express-validator chains
│       ├── utils/           # dates, streaks, tokens, email, errors
│       ├── jobs/            # reminder cron job
│       ├── app.js
│       └── server.js
└── client/
    ├── .env.example
    └── src/
        ├── api/             # axios instance + interceptors
        ├── app/             # Redux store
        ├── features/        # auth / habits / dashboard slices
        ├── components/      # Heatmap, HabitCard, modals, charts, layout, ui
        ├── pages/           # Dashboard, Habits, HabitDetail, Analytics, Profile, auth pages
        ├── hooks/           # useTheme (dark mode)
        └── utils/
```

## Getting started

Prerequisites: Node 18+, MongoDB running locally (or an Atlas URI).

### 1. Backend

```bash
cd server
cp .env.example .env        # edit MONGO_URI and JWT_SECRET at minimum
npm install
npm run dev                 # starts on http://localhost:5000
```

`.env` keys:

| Key | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Frontend origin for CORS + reset links |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth token signing |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Optional — email reminders & password reset. If unset, email features are disabled gracefully. |

### 2. Frontend

```bash
cd client
cp .env.example .env        # optional; Vite proxies /api → localhost:5000 in dev
npm install
npm run dev                 # starts on http://localhost:5173
```

### 3. Production build

```bash
cd client && npm run build   # outputs static files in client/dist
```

Serve `client/dist` behind any static host and point `VITE_API_URL` at your API.

## API reference

Auth (`/api/auth`) — rate limited:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login, returns JWT |
| POST | `/logout` | Logout |
| GET | `/me` | Current user |
| PUT | `/profile` | Update name/email/reminder settings/password |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset with emailed token |

Habits (`/api/habits`) — JWT required:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List habits with streaks + completedToday |
| POST | `/` | Create habit |
| PUT | `/:id` | Update habit |
| DELETE | `/:id` | Delete habit + its completions |
| POST | `/:id/complete` | Mark done for a date (409 on duplicate; future/pre-start dates rejected) |
| DELETE | `/:id/complete` | Unmark for a date |
| GET | `/:id/history` | Completion history |

Dashboard (`/api/dashboard`) — JWT required:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Totals, streaks, badge, 365-day heatmap, weekly + monthly progress |
| GET | `/analytics` | Success rates, most consistent, weekly trend, category breakdown |

## Implementation notes

- Dates are stored as `YYYY-MM-DD` strings throughout to avoid timezone drift; the unique compound index on `(habitId, completedDate)` guarantees no duplicate completions at the database level.
- The current streak counts a run ending today *or yesterday*, so it isn't reset before the day is over.
- The reminder cron runs every minute and matches each user's `reminderTime` against the **server's timezone**.
- Optimistic UI: toggling a habit updates instantly and rolls back with a toast on API failure.
