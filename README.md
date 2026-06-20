# 🏋️ GymBuddy Finder

**A Tinder-style gym partner matching platform** — find workout partners nearby, swipe to match, and chat in real-time.

Built with **one shared backend** powering three platforms:

| Platform | Technology |
|----------|------------|
| 📱 **iOS** | React Native (Expo SDK 52) |
| 📱 **Android** | React Native (Expo SDK 52) |
| 💻 **Web** | React + Vite |
| ⚙️ **Backend** | Node.js + Express + MongoDB |

---

## ✨ Features

- 🔐 **Authentication** — Email/password signup & login with JWT dual-token strategy
- 🧍 **Profile Management** — Photo upload, gym name, workout type, preferred timing, bio
- 💪 **Swipe to Connect** — Custom swipe cards (Framer Motion on web, Reanimated on mobile)
- ❤️ **Match System** — Real-time match notifications with celebration modal & confetti
- 💬 **Real-time Chat** — Socket.io messaging with typing indicators, read receipts, online status
- 🖼️ **Cloud Storage** — Profile photos stored on Cloudinary
- 🔄 **Token Refresh** — Automatic silent refresh via httpOnly cookies (web) / SecureStore (mobile)
- 📱 **Onboarding** — 3-slide intro carousel for new mobile users

---

## 🧩 Tech Stack

### Backend (`/server`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Real-time | Socket.io |
| Storage | Cloudinary (via Multer + SDK) |
| Security | Helmet, CORS, express-rate-limit |

### Web Frontend (`/web`)

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Routing | React Router v6 |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP | Axios |
| Real-time | Socket.io Client |

### Mobile (`/mobile`)

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.76 + Expo SDK 52 |
| Routing | Expo Router v4 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand |
| Forms | React Hook Form |
| Animations | React Native Reanimated 3 + Gesture Handler |
| Icons | Lucide React Native |
| Tokens | Expo SecureStore |
| Images | Expo Image + Expo Image Picker |
| Real-time | Socket.io Client |

---

## 📁 Project Structure

```
GymBuddy-Finder/
├── server/                          # Shared Node.js backend
│   ├── server.js                    # Entry point
│   ├── src/
│   │   ├── config/db.js             # MongoDB connection
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── Match.model.js
│   │   │   └── Message.model.js
│   │   ├── controllers/             # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── swipe.controller.js
│   │   │   ├── match.controller.js
│   │   │   └── message.controller.js
│   │   ├── routes/                  # Express routes
│   │   ├── middleware/              # Auth + upload middleware
│   │   ├── socket/socket.js         # Socket.io event handlers
│   │   └── utils/                   # JWT + Cloudinary helpers
│   └── package.json
│
├── web/                             # React + Vite web app
│   ├── src/
│   │   ├── App.jsx                  # Root with routing
│   │   ├── api/axios.js             # Axios with JWT interceptor
│   │   ├── store/                   # Zustand stores
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # 9 pages
│   │   └── components/              # 10 reusable components
│   └── package.json
│
├── mobile/                          # Expo React Native app
│   ├── app/                         # Expo Router screens
│   │   ├── _layout.jsx              # Root layout + auth gate
│   │   ├── onboarding.jsx           # 3-slide intro
│   │   ├── (auth)/                  # Login + Signup
│   │   └── (app)/                   # Protected screens
│   │       ├── (tabs)/              # Bottom tab navigator
│   │       │   ├── index.jsx        # Discover/Swipe
│   │       │   ├── matches.jsx      # Match grid
│   │       │   ├── chats.jsx        # Chat list
│   │       │   └── profile.jsx      # Profile view
│   │       ├── chat/[matchId].jsx   # Individual chat
│   │       └── profile/             # Edit + Setup
│   ├── api/axios.js                 # Axios with SecureStore
│   ├── store/                       # Zustand stores
│   ├── hooks/                       # Socket + data hooks
│   ├── components/                  # 8 reusable components
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account for image uploads
- **Expo CLI** (`npm install -g expo-cli`) for mobile development

### 1. Clone the Repository

```bash
git clone https://github.com/thesatyamraj/GymBuddy-Finder.git
cd GymBuddy-Finder
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/gymbuddy
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Web Frontend Setup

```bash
cd web
npm install
```

Create `web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Mobile Setup

```bash
cd mobile
npm install
```

Create `mobile/.env`:

```env
# Use your machine's local IP (not localhost!) for physical devices
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:5000
```

Find your IP:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone or press `i` for iOS Simulator / `a` for Android Emulator.

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout and clear refresh token |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current authenticated user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update user profile fields |
| POST | `/api/users/profile/photo` | Upload profile photo (multipart) |
| DELETE | `/api/users/profile/photo` | Delete profile photo |

### Swipe

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/swipe/candidates` | Get swipe candidates (paginated) |
| POST | `/api/swipe/like/:userId` | Like a user |
| POST | `/api/swipe/pass/:userId` | Pass on a user |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get all matches for current user |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:matchId` | Get messages for a match (cursor-paginated) |
| POST | `/api/messages/:matchId` | Send a message |
| PUT | `/api/messages/:matchId/read` | Mark messages as read |

---

## 🔗 Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_match` | `matchId` | Join a chat room |
| `leave_match` | `matchId` | Leave a chat room |
| `typing` | `{ matchId }` | User started typing |
| `stop_typing` | `{ matchId }` | User stopped typing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `online_users` | `[userId]` | List of currently online users |
| `new_message` | `message` | New message received |
| `new_match` | `match` | New mutual match |
| `user_typing` | `{ userId }` | Someone is typing |
| `user_stop_typing` | `{ userId }` | Someone stopped typing |
| `messages_read` | `{ matchId, readBy }` | Messages were read |

---

## 🚢 Deployment

### Backend → Railway / Render

Deploy `/server` as a Node.js service. Set all `.env` variables in the platform dashboard.

### Web → Vercel

```bash
cd web
npm run build
# Deploy to Vercel — SPA rewrite is configured in vercel.json
```

### Mobile → EAS Build

```bash
cd mobile

# Preview APK (Android)
eas build --platform android --profile preview

# Production builds
eas build --platform all --profile production
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with 💪 by [@thesatyamraj](https://github.com/thesatyamraj)
