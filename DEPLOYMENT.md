# Deployment Guide

Frontend → **Vercel** · Backend → **Render** · Database → **MongoDB Atlas**

---

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a database user (username/password)
3. Network Access → add IP `0.0.0.0/0` (allow from anywhere, since Render's IP isn't static)
4. Get your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/nayeem-portfolio`

---

## 2. Backend → Render

1. Push the `backend/` folder to a GitHub repo (or the whole project, Render lets you set a root directory)
2. On https://render.com → **New → Web Service** → connect your repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (from your `.env`, using **Environment** tab):
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `CLIENT_URL` → your Vercel URL, e.g. `https://nayeem-portfolio.vercel.app`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECEIVER_EMAIL`
   - `NODE_ENV=production`
5. Deploy. Once live, open a Render **Shell** and run once:
   ```bash
   npm run seed:admin
   npm run seed:projects   # optional
   ```
6. Note your live API URL, e.g. `https://nayeem-portfolio-api.onrender.com`

> Free Render web services sleep after inactivity — the first request after idle can take ~30s to wake up. Fine for a portfolio; upgrade to a paid instance if that matters to you.

---

## 3. Frontend → Vercel

1. Before deploying, open `frontend/assets/js/api.js` and update the production branch:
   ```js
   : 'https://nayeem-portfolio-api.onrender.com/api'; // <-- your real Render URL
   ```
2. Push `frontend/` to GitHub (or use the same repo with Vercel's root directory setting)
3. On https://vercel.com → **New Project** → import the repo
   - **Root Directory:** `frontend`
   - **Framework Preset:** Other (static site, no build command needed)
4. Deploy. Vercel gives you a URL like `https://nayeem-portfolio.vercel.app`
5. Go back to Render and make sure `CLIENT_URL` matches this exact URL (for CORS)

---

## 4. Post-Deploy Checklist

- [ ] Visit the live site — hero animation and projects grid load
- [ ] Submit the contact form — check it appears in the admin dashboard inbox
- [ ] Log in at `/login.html` with your seeded admin credentials
- [ ] Create/edit/delete a project from the dashboard and confirm it appears on the homepage
- [ ] Replace `resume.pdf` in `frontend/` with your real CV (the Download CV button links to it directly)
- [ ] Set custom domain in Vercel (optional) and update `CLIENT_URL` on Render to match
- [ ] Rotate `JWT_SECRET` and admin password away from any placeholder values before going live

---

## 5. Environment Variables Reference

See `backend/.env.example` for the full list with comments. Never commit a real `.env` file — it's already covered by `backend/.gitignore`.
