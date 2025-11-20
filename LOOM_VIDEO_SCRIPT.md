# Smart To-Do App - Loom Video Script
## Duration: 5 minutes

## [00:00-00:15] Introduction

"Hi! I'm [Your Name], and today I'm walking you through my Smart To-Do application - a production-ready task management app. As I show each feature, I'll explain the tools I used and why they're the best choice.

Let's dive in!"
## [00:15-01:15] Authentication & Dashboard
[Show login page]

"Let's start with authentication. While the documentation didn't specifically mention a login page, I implemented one because authentication is essential for any production application. I implemented magic link authentication - users enter their email and receive a secure link. No passwords needed.

**I used NextAuth.js v5** for authentication. 

**The app is built with Next.js 16** using the App Router. I chose Next.js because it's a full-stack framework - frontend and backend API routes in one codebase. 

[Show dashboard]

Here's the main dashboard with task summaries, filters, and the task list. Giving breif about the tech used.

**For data fetching, I used React Query** - it handles caching, background refetching, and loading states automatically. When I update a task, it automatically refetches and updates the UI.

**The backend uses Next.js API Routes** - serverless functions that scale automatically. Keeps everything in one codebase and simplifies deployment.

**For the database, I used PostgreSQL on Supabase with Prisma ORM**. Prisma generates TypeScript types from my schema. It helps catch database errors at compile time, not runtime.

**For the UI, I used Tailwind CSS and its componenets**

---
## [02:30-03:15] Google Calendar Integration

[Show 'Connect Calendar' button]

"One key feature is each user connects their own calendar through OAuth 2.0."

[Explain or show connection]

**I used the Google Calendar API** - it's the official, well-documented way to integrate. Provides all features - creating, updating, and deleting events. The OAuth flow is handled securely on the server side using Next.js API routes, never exposing secrets to the client.

Tasks with due dates automatically sync to your calendar. Update the task, the calendar event updates. Delete the task, the event is removed. Seamless integration."

## [01:15-02:30] Task Management & Integrations

[Click 'New task' and show form]

"Let me create a task. The form includes title, description, priority, category, due date, and integration options.

[Fill out and save]

**For forms, I used React Hook Form with Zod validation** - efficient, type-safe forms that validate on both client and server.

When you save a task with a due date and calendar sync enabled, it automatically creates a Google Calendar event.

**For email notifications, I integrated the Gmail API** - it keeps everything within the Google ecosystem, is free for personal usage, and only requires a one-time OAuth setup for my Gmail account.

**The calendar integration uses Google Calendar API with OAuth 2.0**. Each user connects their own calendar - more secure and scalable than a shared calendar. OAuth 2.0 ensures secure, user-authorized access.

[Show marking as completed]
When you mark a task as completed and later reactivate it, the system opens an edit dialog so you can update values.

[Show editing a task]

You can edit tasks easily. When you update a task, changes sync to Google Calendar automatically.

**All of this is built with TypeScript** - provides type safety throughout the entire application. Catches errors during development and makes the codebase more maintainable."


---



## [03:15-04:00] Technology Stack Summary

"Let me summarize the key technologies and why I chose them:

**Next.js** - Full-stack framework, eliminates separate backend, excellent performance.

**TypeScript** - Type safety catches errors early, improves code quality.

**Prisma + PostgreSQL** - Type-safe database access with excellent developer experience.

**React Query** - Handles complex server state management, eliminates stale data bugs.

**NextAuth.js** - Battle-tested authentication, handles security best practices automatically.

**Tailwind + shadcn/ui** - Rapid UI development with professional components.

**Vercel + Supabase** - Production-ready infrastructure that scales automatically.

**Gmail API** - Reliable sending with OAuth-based security, great for personal use.

**Google Calendar API** - Official integration with OAuth 2.0 security.

Together, these create a modern, scalable, maintainable application following industry best practices."

---

## [04:00-04:30] Development Process

"Throughout development, I used **Cursor AI** as a coding assistant. It was helpful for implementing code quickly, catching syntax errors, and speeding up development. However, all the architectural decisions, technology choices, database design, and problem-solving were done by me. Cursor was a tool that accelerated my development, not a replacement for my engineering decisions.

For example, when I encountered the connection pooling challenge with Supabase in serverless environments, I researched the problem, identified the solution approach, and Cursor helped me implement the Prisma configuration correctly. But the problem-solving and architecture were mine."

---

## [04:30-05:00] Closing

"The application is fully responsive, works on mobile and desktop, and is deployed on Vercel with automatic CI/CD from GitHub.

This Smart To-Do application demonstrates production-ready full-stack development with modern tools and best practices. It's secure, scalable, and provides an excellent user experience.

Thank you for watching!"

---

## Recording Tips:

1. **Practice once** before recording
2. **Speak naturally** - use this as a guide, not word-for-word
3. **Show real interactions** - click buttons, fill forms, navigate
4. **Keep it conversational** - explain like you're talking to a colleague
5. **Pace yourself** - don't rush, but stay on track

## Pre-Recording Checklist:

- [ ] Test account ready with tasks created
- [ ] Google Calendar connected
- [ ] Magic link flow tested
- [ ] Browser tabs organized
- [ ] Good audio quality
- [ ] Screen resolution set (1920x1080 recommended)

---

## Key Points to Hit:

✅ Magic link authentication (NextAuth.js)  
✅ Task management with filtering (React Query, Prisma)  
✅ Google Calendar sync (OAuth 2.0, Google Calendar API)  
✅ Email notifications (Gmail API)  
✅ Full-stack with Next.js  
✅ TypeScript for type safety  
✅ Production deployment on Vercel  
✅ Cursor AI as development assistant (not decision maker)
