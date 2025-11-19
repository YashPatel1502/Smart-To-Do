# Guide for Reviewers/Testers

## 🎯 Quick Start for Testing

### Option 1: Test Without Integrations (Easiest)

The app works perfectly with **only** the database configured:

1. **Set up database** (required):
   - Create a free Supabase PostgreSQL database
   - Copy the connection string
   - Add to Vercel environment variables as `DATABASE_URL`

2. **Deploy to Vercel**:
   - Import the GitHub repo
   - Add `DATABASE_URL` environment variable
   - Deploy
   - Run migrations: `npx prisma migrate deploy`

3. **Test the app**:
   - ✅ Create, edit, delete tasks
   - ✅ Filter and search tasks
   - ✅ Mark tasks as completed
   - ✅ All core features work
   - ⚠️ Email/calendar features will be skipped (graceful degradation)

### Option 2: Test With Full Integrations

If you want to test email and calendar features:

1. **Set up SendGrid** (5 minutes):
   - Create free account at https://sendgrid.com
   - Create API key
   - Verify sender email
   - Add to Vercel: `SENDGRID_API_KEY`, `EMAIL_FROM`, `NOTIFICATION_EMAIL`

2. **Set up Google Calendar** (10 minutes):
   - Create Google Cloud project
   - Enable Calendar API
   - Create OAuth 2.0 credentials
   - Get refresh token (see `DEPLOYMENT_GUIDE.md` for detailed steps)
   - Add to Vercel: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`

3. **Test integrations**:
   - Create a task with due date → Check your email inbox
   - Create a task with due date → Check your Google Calendar
   - Update a task → Calendar event updates
   - Delete a task → Calendar event is deleted

---

## ✅ What Works Without Integrations

The app is designed to work gracefully without email/calendar credentials:

- ✅ **All CRUD operations** (create, read, update, delete tasks)
- ✅ **Filtering and search** (status, priority, category, search)
- ✅ **Task management** (mark complete, restore status)
- ✅ **Responsive UI** (desktop and mobile)
- ✅ **Form validation** and error handling
- ✅ **Loading states** and animations

**What's skipped:**
- ⚠️ Email notifications (tasks still created/updated, just no email sent)
- ⚠️ Calendar events (tasks still created/updated, just no calendar sync)

**Console messages:**
- You'll see warnings like `[email] Missing SENDGRID configuration. Skipping email delivery.`
- This is **expected behavior** - the app continues working normally

---

## 🔒 Security Note

**Each reviewer should use their own credentials:**
- Don't share API keys or OAuth tokens
- Use your own SendGrid account (free tier: 100 emails/day)
- Use your own Google Calendar (free, unlimited events)
- The app is designed to work with any user's credentials

---

## 📋 Minimum Setup for Testing

**Absolute minimum** (app works, no integrations):
```env
DATABASE_URL=postgresql://...
```

**With email** (add these):
```env
SENDGRID_API_KEY=SG....
EMAIL_FROM=your-email@example.com
NOTIFICATION_EMAIL=your-email@example.com
```

**With calendar** (add these):
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary
```

---

## 🎬 Testing Checklist

### Core Features (Works Without Integrations)
- [ ] Create a new task
- [ ] Edit an existing task
- [ ] Delete a task
- [ ] Mark task as completed
- [ ] Mark completed task as active (restores previous status)
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Search tasks
- [ ] Toggle show/hide completed tasks
- [ ] Test on mobile device (responsive design)

### Email Integration (Requires SendGrid Setup)
- [ ] Create task with due date → Email received
- [ ] Update task → Email received with latest info
- [ ] Delete task → Email received

### Calendar Integration (Requires Google Calendar Setup)
- [ ] Create task with due date → Event appears in calendar
- [ ] Update task → Calendar event updates
- [ ] Delete task → Calendar event deleted
- [ ] Remove due date → Calendar event deleted

---

## 🐛 Troubleshooting

### App Works But No Emails
- ✅ This is **normal** if SendGrid credentials are not configured
- Check Vercel environment variables
- Verify SendGrid API key is correct
- Check spam folder

### App Works But No Calendar Events
- ✅ This is **normal** if Google Calendar credentials are not configured
- Check Vercel environment variables
- Verify OAuth credentials are correct
- Check Google Calendar API is enabled

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Use Session pooler (port 5432) not Transaction pooler

---

## 💡 Key Points for Reviewers

1. **The app works without integrations** - Don't worry if you don't set up email/calendar
2. **Use your own credentials** - Each reviewer should use their own accounts
3. **Graceful degradation** - Missing credentials don't break the app
4. **Focus on code quality** - The integration code is there, even if not tested with real APIs
5. **Check the code** - All integration logic is in `src/lib/email.ts` and `src/lib/calendar.ts`

---

## 📞 Questions?

If you have questions about setup or testing, check:
- `README.md` - Full setup instructions
- `DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `GITHUB_SETUP.md` - GitHub repository setup

The codebase is well-documented with JSDoc comments explaining all functions.

