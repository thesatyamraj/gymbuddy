# 🚀 GymBuddy Finder — Deployment Guide (Render + Vercel)

This guide deploys the **backend** (`/server`) to **Render** and the **web app** (`/web`) to **Vercel**.
The mobile app (`/mobile`) is built separately with EAS and is covered briefly at the end.

> Architecture: `Vercel (web)  ⇄  Render (Node API + Socket.io)  ⇄  MongoDB Atlas + Cloudinary + Gmail SMTP`

---

## ✅ Pre-flight checklist (do this first)

1. **Rotate your secrets.** The committed `.env` contained real, weak credentials
   (Mongo password `udemy123`, Cloudinary secret, Gmail app password, JWT secrets).
   Treat them all as compromised and regenerate before going live (steps below).

2. **Confirm `.env` is NOT in git.** It's already in `.gitignore`, but verify:
   ```bash
   git status --ignored | grep .env     # should list .env as ignored, not staged
   git ls-files | grep .env             # should print NOTHING (no tracked .env)
   ```
   If a real `.env` is tracked, remove it: `git rm --cached server/.env && git commit -m "remove env"`.

3. **Generate fresh JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # run twice
   ```
   Use one for `JWT_ACCESS_SECRET`, one for `JWT_REFRESH_SECRET`.

---

## 1️⃣ MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/atlas.
2. **Database Access** → add a DB user with a **strong** password.
3. **Network Access** → Add IP `0.0.0.0/0` (Allow from anywhere). Render's free
   tier has dynamic egress IPs, so an allow-list won't work reliably.
4. **Connect** → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/gymbuddy?retryWrites=true&w=majority
   ```
   Keep the `/gymbuddy` database name in the path.

## 2️⃣ Cloudinary

1. Dashboard at https://cloudinary.com → copy **Cloud name**, **API Key**, **API Secret**.
2. If rotating: regenerate the API secret in Settings → Security.

## 3️⃣ Gmail SMTP (for OTP emails)

1. Enable 2-Factor Auth on the Google account.
2. Create an **App Password**: https://myaccount.google.com/apppasswords → pick "Mail".
3. Copy the 16-character password (spaces removed). This is `SMTP_PASS`.

---

## 4️⃣ Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 5️⃣ Deploy the BACKEND to Render

1. https://dashboard.render.com → **New** → **Web Service** → connect your repo.
2. Configure:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or paid to avoid cold starts) |

3. **Environment** → add these variables (from `server/.env.production.example`):

   ```
   NODE_ENV=production
   MONGODB_URI=<your atlas string>
   JWT_ACCESS_SECRET=<generated>
   JWT_REFRESH_SECRET=<generated>
   CLIENT_WEB_URL=https://PLACEHOLDER.vercel.app   ← fix in step 7
   CLOUDINARY_CLOUD_NAME=<...>
   CLOUDINARY_API_KEY=<...>
   CLOUDINARY_API_SECRET=<...>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your email>
   SMTP_PASS=<gmail app password>
   SMTP_FROM=<your email>
   ```
   > Do **not** set `PORT` — Render injects it automatically and the app reads it.

4. **Create Web Service**. Wait for the build, then copy your URL, e.g.
   `https://gymbuddy-api.onrender.com`.

5. **Verify:** open `https://gymbuddy-api.onrender.com/api/health` → you should see
   `{"success":true,"message":"GymBuddy Finder API is running",...}`.

---

## 6️⃣ Deploy the WEB app to Vercel

1. https://vercel.com → **Add New** → **Project** → import your repo.
2. Configure:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `web` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` (default) |
   | **Output Directory** | `dist` (default) |

3. **Environment Variables** (from `web/.env.production.example`), using your Render URL:
   ```
   VITE_API_URL=https://gymbuddy-api.onrender.com/api
   VITE_SOCKET_URL=https://gymbuddy-api.onrender.com
   ```
4. **Deploy**. Copy your URL, e.g. `https://gymbuddy.vercel.app`.

---

## 7️⃣ Connect the two (important!)

1. Back in **Render** → your service → **Environment** → set
   `CLIENT_WEB_URL=https://gymbuddy.vercel.app` (your real Vercel URL, **no trailing slash**).
2. Save → Render redeploys automatically.

This is required for **CORS** (the API rejects unknown origins) and for the
**cross-site refresh-token cookie** to work. Without it, login looks fine but users
get logged out after ~15 minutes.

---

## 8️⃣ Smoke test the live app

Open your Vercel URL and verify:
- [ ] Sign up → OTP email arrives → code verifies → account created
- [ ] Log out, log back in
- [ ] Wait ~15 min idle, then act → you stay logged in (refresh-cookie works)
- [ ] Upload a profile photo (Cloudinary)
- [ ] Swipe, match, and send a chat message (Socket.io real-time)

---

## ⚠️ Things to know

- **Render free tier cold starts:** the service sleeps after ~15 min of inactivity;
  the next request can take ~50s. The first signup/login after idle will feel slow.
  Upgrade to a paid instance or ping `/api/health` on a schedule to keep it warm.
- **Gmail sending limits:** app-password SMTP is fine for testing (~500 emails/day).
  For real volume use a transactional provider (SendGrid, Resend, Postmark) — just
  swap `SMTP_*` values; no code change needed.
- **`dist/` is gitignored** for web — Vercel builds it fresh, so that's correct.
- **`multer@1.x`** is deprecated with known CVEs. Not a blocker, but consider
  upgrading to `multer@2.x` later (the API is nearly identical).

---

## 📱 Mobile (separate track — not Vercel/Render)

The Expo app is shipped via **EAS Build**, not a web host:

```bash
cd mobile
npm install -g eas-cli
eas login
# Set the API URL to your Render backend in mobile/.env or eas.json:
#   EXPO_PUBLIC_API_URL=https://gymbuddy-api.onrender.com/api
#   EXPO_PUBLIC_SOCKET_URL=https://gymbuddy-api.onrender.com
eas build --platform android --profile preview   # APK to test
```

If you set a mobile web origin that calls the API from a browser, add it to
`CLIENT_MOBILE_URL` on Render. Native builds send no `Origin` header and are
already allowed by the CORS config.
