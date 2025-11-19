# Deployment Guide

## 📋 Deliverables Checklist

1. ✅ **GitHub Repo** - Source code + README
2. ⏳ **Loom Video** - 2-5 minute walkthrough
3. ⏳ **Hosted Demo** - Vercel deployment

---

## 🚀 Recommended Order: GitHub First, Then Deploy

**Why GitHub first?**
- Vercel can auto-deploy from GitHub (continuous deployment)
- Easy to update and redeploy
- Better for collaboration and review
- Version control before deployment

**Steps:**
1. **Push to GitHub** → Get repo URL
2. **Deploy to Vercel** → Connect GitHub repo → Auto-deploy
3. **Record Loom Video** → Show working demo

---

## Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd smart-todo
git init
```

### 1.2 Create .gitignore (if not exists)
Ensure `.gitignore` includes:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Prisma
prisma/migrations/*.sql
!prisma/migrations/migration_lock.toml

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

### 1.3 Stage and Commit
```bash
git add .
git commit -m "Initial commit: Smart To-Do app with email and calendar integrations"
```

### 1.4 Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository"
3. Name: `smart-todo` (or your preferred name)
4. Description: "Smart To-Do List App - Ennabl Technical Assignment"
5. **Public** (so reviewers can access)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### 1.5 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-todo.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Prerequisites
- ✅ GitHub repo pushed
- ✅ Vercel account (free tier works)
- ✅ Database URL ready (Supabase)
- ✅ SendGrid API key ready
- ✅ Google Calendar credentials ready

### 2.2 Deploy via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import from GitHub
   - Select your `smart-todo` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**:
   Add all these in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://...
   SENDGRID_API_KEY=SG....
   EMAIL_FROM=your-email@example.com
   NOTIFICATION_EMAIL=your-email@example.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   GOOGLE_CALENDAR_ID=primary
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### 2.3 Run Database Migrations

After first deployment, run migrations:

**Option A: Via Vercel CLI** (recommended)
```bash
npm i -g vercel
vercel login
vercel link  # Link to your project
vercel env pull .env.local  # Pull env vars
npx prisma migrate deploy
```

**Option B: Via Supabase Dashboard**
- Go to Supabase SQL Editor
- Copy contents of `prisma/migrations/0001_init/migration.sql`
- Copy contents of `prisma/migrations/20251119003321_add_previous_status/migration.sql`
- Run both SQL scripts

### 2.4 Verify Deployment
- Visit your Vercel URL: `https://your-app.vercel.app`
- Test creating a task
- Check email notification
- Check calendar event creation

---

## Step 3: Record Loom Video

### 3.1 What to Cover (2-5 minutes)

**Introduction (30s)**
- Brief intro: "This is my Smart To-Do app for the Ennabl technical assignment"

**Architecture & Tools (1-2 min)**
- Tech stack: Next.js, React, Prisma, PostgreSQL
- AI tools used: Cursor, Claude Code
- Why these choices: Speed, quality, modern patterns

**Demo (2-3 min)**
- Create a task with due date
- Show email notification received
- Show calendar event created
- Edit a task (show calendar update)
- Delete a task (show calendar cleanup)
- Show filters, search, status changes
- Show responsive design (resize browser)

**Deployment & Trade-offs (30s)**
- Deployed on Vercel
- Free services used (Supabase, SendGrid, Google Calendar)
- Trade-offs: No auth (single user), one-way calendar sync

**Closing (15s)**
- GitHub repo link
- Demo URL
- Questions welcome

### 3.2 Tips
- ✅ Test everything before recording
- ✅ Have demo data ready
- ✅ Show both desktop and mobile views
- ✅ Keep it concise (2-5 minutes)
- ✅ Be enthusiastic but professional

---

## ✅ Final Checklist

Before submitting:

- [ ] **GitHub Repo**
  - [ ] Code pushed to GitHub
  - [ ] README.md includes setup steps
  - [ ] README.md includes assumptions & limitations
  - [ ] Repository is public

- [ ] **Vercel Deployment**
  - [ ] App deployed and accessible
  - [ ] Environment variables configured
  - [ ] Database migrations run
  - [ ] Email integration working
  - [ ] Calendar integration working
  - [ ] App tested end-to-end

- [ ] **Loom Video**
  - [ ] 2-5 minutes long
  - [ ] Architecture & tools explained
  - [ ] Full demo of features
  - [ ] Deployment URL shown
  - [ ] Video is accessible (public or shared link)

---

## 🎯 Quick Start Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy to Vercel (via dashboard)
# - Import from GitHub
# - Add environment variables
# - Deploy

# 3. Run migrations (after deployment)
vercel env pull .env.local
npx prisma migrate deploy

# 4. Test deployment
# Visit your Vercel URL and test all features
```

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set
- Check `package.json` scripts
- Check Prisma client is generated

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Use Session pooler (port 5432) not Transaction pooler

### Email Not Sending
- Verify SendGrid API key
- Check sender email is verified in SendGrid
- Check spam folder

### Calendar Events Not Creating
- Verify Google OAuth credentials
- Check refresh token is valid
- Verify calendar API is enabled

---

Good luck with your submission! 🚀

