<div align="center">

# 🏋️ GymBuddy Finder

**A Tinder-style gym-partner matching platform — find workout partners nearby, swipe to match, chat in real time, and train smarter with a built-in AI fitness coach.**

One shared **Node.js backend** powering a **React web app** and a **React Native (Expo) mobile app**.

</div>

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Environment Variables](#-environment-variables)
7. [Local Setup](#-local-setup)
8. [AI Coach Setup (Groq)](#-ai-coach-setup-groq)
9. [Delete Account (Full Data Erasure)](#-delete-account-full-data-erasure)
10. [API Reference](#-api-reference)
11. [Socket.io Events](#-socketio-events)
12. [Data Models](#-data-models)
13. [Deployment](#-deployment)
14. [Security Notes](#-security-notes)
15. [Troubleshooting](#-troubleshooting)
16. [License & Credits](#-license--credits)

---

## ✨ Features

| Area | What you get |
|------|--------------|
| 🔐 **Auth** | Email/password signup & login with **email OTP verification**, JWT dual-token strategy (short-lived access + httpOnly refresh), and OTP-protected password change |
| 🧍 **Profiles** | Photo upload (Cloudinary), gym name, workout type, preferred timing, bio, profile completeness gate |
| 📍 **Location** | Real-time GeoJSON location updates for nearby-partner discovery |
| 💪 **Swipe to Connect** | Custom swipe cards — Framer Motion on web, Reanimated gestures on mobile |
| ❤️ **Matching** | Mutual-like matches with a celebration modal + confetti |
| 💬 **Real-time Chat** | Socket.io messaging with typing indicators, read receipts, online presence, cursor-paginated history |
| 🤖 **AI Coach (FITNEX)** | In-app fitness & nutrition chatbot powered by Groq — workout/diet plans in Markdown, conversation history, quick-prompt chips, safety guardrails |
| 🗑️ **Delete Account** | One action erases the user everywhere — profile, chats, matches, messages, swipe footprint, and Cloudinary photo |
| 🌓 **Theming** | Light/dark mode across web and mobile |
| 🖼️ **Cloud Storage** | Profile photos on Cloudinary (auto-cleanup on delete) |
| 🔄 **Session** | Silent token refresh via httpOnly cookie (web) / SecureStore (mobile) |

---

## 🧩 Tech Stack

### Backend (`/server`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 18 (native `fetch`) |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh), bcryptjs |
| Real-time | Socket.io |
| AI | Groq API (OpenAI-compatible chat completions) |
| Storage | Cloudinary (via Multer + SDK) |
| Email | Nodemailer (SMTP, for OTP) |
| Security | Helmet, CORS, express-rate-limit, express-validator |
| Logging | Morgan |

### Web (`/web`)

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Routing | React Router v6 |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Markdown | react-markdown (AI Coach replies) |
| Icons | Lucide React |
| HTTP | Axios (JWT refresh interceptor) |
| Real-time | Socket.io Client |
| Notifications | react-hot-toast |

### Mobile (`/mobile`)

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.76 + Expo SDK 52 |
| Routing | Expo Router v4 (file-based) |
| Styling | NativeWind v4 (Tailwind) |
| State | Zustand |
| Animations | Reanimated 3 + Gesture Handler |
| Icons | Lucide React Native |
| Secure storage | Expo SecureStore |
| Images | Expo Image + Image Picker |
| Location | Expo Location |
| Real-time | Socket.io Client |
| Notifications | react-native-toast-message |

---

## 🏛 Architecture

```
                       ┌──────────────────────────┐
                       │      MongoDB Atlas        │
                       │   Cloudinary · Gmail SMTP │
                       │          Groq AI          │
                       └─────────────┬────────────┘
                                     │
                       ┌─────────────▼────────────┐
                       │   Node.js + Express API   │
                       │   REST  +  Socket.io      │
                       │   (the single backend)    │
                       └──────┬──────────────┬─────┘
                              │              │
                  ┌───────────▼───┐    ┌─────▼──────────┐
                  │  React (Vite) │    │ React Native   │
                  │   Web app     │    │ (Expo) mobile  │
                  └───────────────┘    └────────────────┘
```

- The **Groq API key lives only on the server** — the web/mobile clients only ever call `/api/ai/*`.
- The web and mobile clients share the exact same REST + Socket.io contract.

---

## 📁 Project Structure

```
GymBuddy-Finder/
├── server/                              # Shared Node.js backend
│   ├── server.js                        # Entry point (Express + Socket.io)
│   ├── .env.example                     # All backend env vars (documented)
│   └── src/
│       ├── config/
│       │   ├── db.js                    # MongoDB connection
│       │   ├── cloudinary.js            # Cloudinary SDK config
│       │   ├── mailer.js                # Nodemailer SMTP transport
│       │   └── ai.js                    # 🤖 Groq wrapper + FITNEX system prompt
│       ├── models/
│       │   ├── User.model.js            # profile, auth, swipe history, location
│       │   ├── Match.model.js
│       │   ├── Message.model.js
│       │   ├── Otp.model.js             # signup OTP
│       │   ├── PasswordChangeOtp.model.js
│       │   ├── AiConversation.model.js  # 🤖 AI Coach chat history
│       │   └── AiUsage.model.js         # 🤖 daily Groq usage guard
│       ├── controllers/
│       │   ├── auth.controller.js       # OTP signup, login, refresh, password change
│       │   ├── user.controller.js       # profile, photo, location, DELETE account
│       │   ├── swipe.controller.js
│       │   ├── match.controller.js
│       │   ├── message.controller.js
│       │   └── ai.controller.js         # 🤖 chat + conversation CRUD
│       ├── routes/                      # auth · user · swipe · match · message · ai
│       ├── middleware/                  # auth · upload (Multer/Cloudinary) · error
│       ├── socket/socket.js             # Socket.io event handlers
│       └── utils/                       # ApiResponse · generateTokens
│
├── web/                                 # React + Vite web app
│   ├── .env.example
│   └── src/
│       ├── App.jsx                      # Routing
│       ├── api/axios.js                 # Axios + JWT refresh interceptor
│       ├── store/                       # authStore · chatStore · matchStore · themeStore · aiStore 🤖
│       ├── constants/aiPrompts.js       # 🤖 quick-prompt chips
│       ├── hooks/                       # useSocket · useOnlineUsers · useSwipeUsers
│       ├── pages/                       # Landing · Login · Signup · ProfileSetup · Discover
│       │                                # Matches · Chats · Profile · EditProfile
│       │                                # ChangePassword · AiCoachPage 🤖
│       └── components/                  # Navbar · SwipeCard/Stack · MatchModal · MessageBubble
│                                        # TypingIndicator · ThemeToggle · AiMessageBubble 🤖 · …
│
├── mobile/                              # Expo React Native app
│   ├── .env.example
│   ├── app/                             # Expo Router (file-based)
│   │   ├── _layout.jsx                  # Root layout + auth gate
│   │   ├── onboarding.jsx
│   │   ├── (auth)/                      # login · signup
│   │   └── (app)/
│   │       ├── (tabs)/                  # index(Discover) · matches · chats · coach 🤖 · profile
│   │       ├── chat/[matchId].jsx
│   │       └── profile/                 # edit · setup · change-password
│   ├── api/axios.js                     # Axios + SecureStore tokens
│   ├── store/                           # authStore · chatStore · matchStore · aiStore 🤖
│   ├── constants/aiPrompts.js           # 🤖
│   ├── components/                      # …shared UI… · AiMarkdown 🤖 · AiMessageBubble 🤖
│   ├── hooks/ · lib/theme.js
│   └── package.json
│
└── README.md                            # 📖 you are here
```

> 🤖 = files added for the **AI Coach** feature.

---

## 🔧 Prerequisites

- **Node.js ≥ 18** and npm
- **MongoDB** — local or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Cloudinary** account (image uploads)
- **Gmail** (or any SMTP) for OTP emails — Gmail needs an [App Password](https://myaccount.google.com/apppasswords)
- **Groq** API key — free at [console.groq.com](https://console.groq.com) (no card)
- **Expo CLI** for mobile: `npm install -g expo-cli` (or use `npx expo`)

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`; Render injects its own — don't hardcode in prod) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string (keep the `/gymbuddy` db name) |
| `JWT_ACCESS_SECRET` | Secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLIENT_WEB_URL` | Web origin for CORS + refresh cookie (e.g. `http://localhost:5173`) |
| `CLIENT_MOBILE_URL` | Mobile web origin for CORS (e.g. `http://localhost:8081`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | SMTP for OTP emails |
| `GROQ_API_KEY` | 🤖 Groq API key (**server-only**, never shipped to clients) |
| `GROQ_MODEL` | 🤖 Primary model (default `openai/gpt-oss-120b`) |
| `GROQ_FALLBACK_MODEL` | 🤖 Fallback model (default `openai/gpt-oss-20b`) |

### `web/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io base, e.g. `http://localhost:5000` |

### `mobile/.env`

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Use your machine's **LAN IP** (not `localhost`) for physical devices, e.g. `http://192.168.1.100:5000/api` |
| `EXPO_PUBLIC_SOCKET_URL` | e.g. `http://192.168.1.100:5000` |

> Each folder ships a `.env.example` — copy it to `.env` and fill in the values.

---

## 🛠 Local Setup

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in the values
npm install
npm run dev               # http://localhost:5000 (nodemon)
```

Verify it's up: open `http://localhost:5000/api/health` → `{ "success": true, ... }`.

### 2. Web

```bash
cd web
cp .env.example .env      # VITE_API_URL / VITE_SOCKET_URL
npm install               # installs react-markdown for AI Coach
npm run dev               # http://localhost:5173
```

### 3. Mobile

```bash
cd mobile
cp .env.example .env      # set EXPO_PUBLIC_API_URL to your LAN IP
npm install
npx expo start            # scan QR with Expo Go, or press i / a
```

Find your LAN IP: `ifconfig | grep "inet " | grep -v 127.0.0.1` (macOS/Linux) or `ipconfig` (Windows).

---

## 🤖 AI Coach Setup (Groq)

The **FITNEX Coach** is a fitness/nutrition chatbot on the web `/coach` page and the mobile **AI Coach** tab. It uses Groq's free, OpenAI-compatible API.

### Get a key (2 minutes, no card)

1. Sign up at **[console.groq.com](https://console.groq.com)**.
2. **API Keys → Create API Key** → copy it (shown once).
3. Paste into `server/.env`:
   ```env
   GROQ_API_KEY=gsk_your_real_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   GROQ_FALLBACK_MODEL=openai/gpt-oss-20b
   ```

> Model IDs change occasionally — verify yours isn't listed at
> [console.groq.com/docs/deprecations](https://console.groq.com/docs/deprecations).
> (`openai/gpt-oss-120b` / `gpt-oss-20b` verified active.)

### How it works

- The browser/app calls **our** `/api/ai/*` routes; the server adds the Groq key. **The key never reaches the client.**
- A fixed server-side **system prompt** enforces the coaching role and safety rules (no medical diagnosis, redirects disordered-eating prompts, resists jailbreaks). The model's hidden "reasoning" field is stripped and never surfaced.
- Replies render as **Markdown** (web: `react-markdown`; mobile: a tiny built-in renderer).
- Only the **last 12 messages** are sent per call (keeps within token-per-minute limits), and multi-day plans are tuned to finish in one response (`max_completion_tokens: 3072`).

### Free-tier capacity & guards

Groq's free limits are **per API key**, shared across all users (~200k tokens/day, ~1k requests/day for `gpt-oss-120b`). Two layers protect it:

1. **Per-user limiter** — 15 chat messages / 15 min (keyed by user ID).
2. **Daily capacity guard** — trips at 90% of the token *or* request cap → "AI Coach is at capacity for today."

### Quick test
Open AI Coach → tap a quick-prompt chip (e.g. "💪 Build Muscle") → you get a formatted plan in seconds. Refresh → the conversation appears in **History**.

---

## 🗑 Delete Account (Full Data Erasure)

A single action removes the user **everywhere**.

- **Endpoint:** `DELETE /api/users/account` (auth + password confirmation).
- **Web:** Profile → **Danger Zone → Delete Account** → modal asks for password + type `DELETE`.
- **Mobile:** Profile tab → **Delete Account** → same confirmation modal.

**Cascade (in order):**
1. The user's AI Coach conversations.
2. Every **match** the user is in → so they also vanish from the *other* person's matches & chat list (the Match document is the link).
3. All **messages** in those matches (both sides).
4. The user's footprint inside everyone else's `likedUsers` / `passedUsers`.
5. The user's **Cloudinary** profile photo (best-effort).
6. The **user document**, then the refresh-token cookie is cleared.

> Deletion always uses the authenticated user's own ID from the token (never the request body) and **bcrypt-verifies the password first** — a wrong password deletes nothing.

---

## 🔌 API Reference

Base URL: `/api`. All routes require a Bearer access token **except** signup, login, refresh, and health.

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup/send-otp` | Send signup OTP to email |
| POST | `/signup/verify-otp` | Verify OTP & create account |
| POST | `/signup/resend-otp` | Resend signup OTP |
| POST | `/login` | Login with email/password |
| POST | `/logout` | Logout (clear refresh token) |
| POST | `/refresh` | Refresh the access token |
| GET | `/me` | Current authenticated user |
| POST | `/change-password/send-otp` | Verify current password, send OTP |
| POST | `/change-password/verify` | Verify OTP & update password |

### Users — `/api/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/profile` | Update profile fields |
| POST | `/profile/photo` | Upload profile photo (multipart) |
| DELETE | `/profile/photo` | Remove profile photo |
| PUT | `/location` | Update real-time location |
| DELETE | `/account` | **Permanently delete account + all related data** |

### Swipe — `/api/swipe`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidates` | Next batch of swipe candidates |
| POST | `/like/:targetId` | Like (swipe right) |
| POST | `/pass/:targetId` | Pass (swipe left) |

### Matches — `/api/matches`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | All matches for the current user |

### Messages — `/api/messages`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/unread/counts` | Unread counts for all matches |
| GET | `/:matchId` | Messages for a match (cursor pagination) |
| POST | `/:matchId` | Send a message |
| PUT | `/:matchId/read` | Mark all messages read |

### AI Coach — `/api/ai`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send a message, get a reply *(rate-limited)* |
| GET | `/conversations` | List the user's conversations |
| GET | `/conversations/:id` | Get one conversation's messages |
| DELETE | `/conversations/:id` | Delete a conversation |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |

---

## 🔗 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_match` | `matchId` | Join a chat room |
| `leave_match` | `matchId` | Leave a chat room |
| `typing` | `{ matchId }` | Started typing |
| `stop_typing` | `{ matchId }` | Stopped typing |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `online_users` | `[userId]` | Currently online users |
| `new_message` | `message` | New message received |
| `new_match` | `match` | New mutual match |
| `user_typing` | `{ userId }` | Someone is typing |
| `user_stop_typing` | `{ userId }` | Someone stopped typing |
| `messages_read` | `{ matchId, readBy }` | Messages were read |

---

## 🗃 Data Models

| Model | Purpose |
|-------|---------|
| **User** | Profile, hashed password, `likedUsers`/`passedUsers` swipe history, Cloudinary photo id, GeoJSON location, refresh token |
| **Match** | Links two users (`users: [id, id]`) + last-message pointer |
| **Message** | `matchId`, `senderId`, `content`, `read` |
| **Otp** | Pending signup verification codes |
| **PasswordChangeOtp** | Password-change verification codes |
| **AiConversation** 🤖 | A user's AI Coach chat (`user`, `title`, `messages[]`) |
| **AiUsage** 🤖 | One doc per UTC day — total Groq `requestCount` / `tokenCount` |

---

## 🚀 Deployment

> Topology: **Vercel (web) ⇄ Render (Node API + Socket.io) ⇄ MongoDB Atlas + Cloudinary + Gmail SMTP + Groq**

### Pre-flight (do first)

1. **Rotate every secret** before going live (Mongo password, Cloudinary secret, Gmail app password, JWT secrets, Groq key).
2. **Confirm `.env` is not committed:**
   ```bash
   git ls-files | grep .env     # should print nothing
   ```
3. **Generate fresh JWT secrets** (run twice):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

### 1) MongoDB Atlas
Create a free cluster → add a DB user (strong password) → **Network Access** add `0.0.0.0/0` (Render egress IPs are dynamic) → copy the `mongodb+srv://…/gymbuddy` connection string.

### 2) Cloudinary
Copy **Cloud name**, **API Key**, **API Secret** from the dashboard.

### 3) Gmail SMTP
Enable 2FA → create an **App Password** (Mail) → that 16-char value is `SMTP_PASS`.

### 4) Groq
Create an API key at [console.groq.com](https://console.groq.com) → it becomes `GROQ_API_KEY`.

### 5) Backend → Render
- **New → Web Service**, connect the repo.
- **Root Directory** `server` · **Build** `npm install` · **Start** `npm start`.
- Add env vars (from `server/.env.production.example`): `NODE_ENV=production`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_WEB_URL` (placeholder for now), all `CLOUDINARY_*`, all `SMTP_*`, and all `GROQ_*`. **Do not set `PORT`** — Render injects it.
- Deploy → verify `https://<your-api>.onrender.com/api/health`.

### 6) Web → Vercel
- **Add New → Project**, import the repo.
- **Root Directory** `web` · **Framework** Vite · **Build** `npm run build` · **Output** `dist`.
- Env vars: `VITE_API_URL=https://<your-api>.onrender.com/api`, `VITE_SOCKET_URL=https://<your-api>.onrender.com`.
- Deploy → copy the Vercel URL.

### 7) Connect them (important!)
In **Render** set `CLIENT_WEB_URL=https://<your-app>.vercel.app` (no trailing slash) and redeploy. Required for **CORS** and the **cross-site refresh-token cookie** — without it, login works but users get logged out after ~15 min.

### 8) Mobile → EAS Build
```bash
cd mobile
npm install -g eas-cli && eas login
# Point the app at the Render backend (mobile/.env or eas.json):
#   EXPO_PUBLIC_API_URL=https://<your-api>.onrender.com/api
#   EXPO_PUBLIC_SOCKET_URL=https://<your-api>.onrender.com
eas build --platform android --profile preview     # APK to test
eas build --platform all --profile production       # store builds
```
Native builds send no `Origin` header and are already allowed by CORS. If you run the mobile web build from a browser origin, add it to `CLIENT_MOBILE_URL` on Render.

### Live smoke test
- [ ] Sign up → OTP email arrives → verify → account created
- [ ] Log out / log back in; stay logged in after ~15 min idle (refresh cookie)
- [ ] Upload a profile photo (Cloudinary)
- [ ] Swipe → match → send a chat message (Socket.io)
- [ ] AI Coach returns a complete, formatted plan
- [ ] Delete a throwaway account → it disappears from a matched user's list too

### Deployment gotchas
- **Render free tier cold starts** (~50s after 15 min idle) — ping `/api/health` on a schedule or upgrade.
- **Gmail limits** (~500/day) — swap `SMTP_*` for SendGrid/Resend/Postmark for volume (no code change).
- **`dist/` is gitignored** — Vercel builds it fresh (correct).
- **Groq capacity** — see [AI Coach Setup](#-ai-coach-setup-groq); the daily guard prevents quota overrun.

---

## 🔒 Security Notes

- **Groq key is server-only** — clients never see it.
- **Passwords** hashed with bcrypt (cost 12); the field is `select: false`.
- **JWT** access tokens are short-lived; refresh tokens live in an **httpOnly cookie** (web) / **SecureStore** (mobile).
- **Account deletion** re-authenticates with the password and uses the token's user ID, never request input.
- **Rate limiting** globally + a stricter per-user limiter on AI chat; **express-validator** on inputs; **Helmet** + **CORS** allow-list.
- AI **system prompt** enforces safety (no medical diagnosis, disordered-eating redirects, jailbreak resistance); the model's reasoning field is never returned.

---

## 🧯 Troubleshooting

| Symptom | Fix |
|---------|-----|
| Mobile can't reach API | Use your **LAN IP** in `EXPO_PUBLIC_API_URL`, not `localhost`; phone and computer on the same Wi-Fi |
| Logged out after ~15 min in prod | Set `CLIENT_WEB_URL` on the backend to the exact web origin (no trailing slash) |
| AI Coach: "temporarily unavailable" | Check `GROQ_API_KEY`; confirm the model isn't deprecated |
| AI Coach: "at capacity for today" | Daily free-tier guard tripped — resets next UTC day, or upgrade Groq tier |
| Photos don't upload | Verify all three `CLOUDINARY_*` values |
| OTP email never arrives | Use a Gmail **App Password** (not your login password); check spam |
| CORS errors | Add the calling origin to `CLIENT_WEB_URL` / `CLIENT_MOBILE_URL` |

---

## 📄 License & Credits

Open source under the **MIT License**.

Built with 💪 — core platform by [@thesatyamraj](https://github.com/thesatyamraj); AI Coach & account-deletion modules added on top of the shared backend.
