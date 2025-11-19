# Smart To-Do

Production-ready smart to-do list that showcases architecture, integrations, and UI polish for the Ennabl technical assignment. Built with Next.js App Router, Prisma, PostgreSQL, SendGrid, and Google Calendar so it can be deployed on Vercel with zero paid services.

## 🚀 Development Approach

This project was built using **AI-assisted development tools** (primarily Cursor with Claude Code) to accelerate development while maintaining high code quality. The focus was on:

- **Rapid iteration** with modern tooling
- **Production-ready code** with comprehensive error handling
- **Clean architecture** for maintainability
- **Practical problem-solving** within reasonable constraints (free services, 3-day timeline)


## Tech stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling/UI**: Tailwind CSS v4, shadcn/ui, lucide-react icons
- **State/Data**: React Query for server state, React Hook Form + Zod for forms, Prisma ORM on PostgreSQL (Supabase/Neon compatible)
- **Integrations**: SendGrid email notifications, Google Calendar API events
- **Tooling**: ESLint 9, React Query Devtools, tsx for scripts

## Features

- CRUD tasks with title, description, status, priority, category, due date
- Toggle email + calendar automations per task
- Calendar event lifecycle (create/update/delete) with stored `calendarEventId`
- Responsive dashboard with filters, status/priority badges, summaries, dialogs
- Real-time UX powered by React Query hooks with optimistic UI feedback
- Prisma schema + migrations + seed script for easy onboarding

## Project structure

```
src/
  app/
    api/tasks/            # Route handlers (POST/GET + PATCH/DELETE)
    tasks/                # Dashboard route + UI components
  components/
    providers/            # React Query + toaster providers
    ui/                   # shadcn components
  hooks/                  # React Query hooks
  lib/                    # Prisma client, services, integrations, validation
  types/                  # Shared Task types/enums
prisma/
  schema.prisma           # Task model + enums
  migrations/             # SQL migration (generated via prisma migrate diff)
  seed.ts                 # Sample data seeding script
```

## Code organization & architecture

### Design principles

**1. Separation of concerns**
- **API Layer** (`/app/api/`): HTTP request/response handling, validation, error formatting
- **Business Logic** (`/lib/`): Core task operations, integrations (email, calendar), database queries
- **UI Layer** (`/app/tasks/`, `/components/`): React components, user interactions, state management
- **Data Layer** (`/hooks/`): React Query hooks for server state, caching, mutations

**2. Feature-based organization**
- Task-related components are co-located in `/app/tasks/_components/`
- Related functionality grouped together for easy navigation
- Clear naming conventions (e.g., `tasks-dashboard.tsx`, `tasks-form.tsx`)

**3. Type safety first**
- TypeScript types defined in `/types/` before implementation
- Zod schemas for runtime validation
- Prisma generates types from schema

**4. Integration isolation**
- Email service (`/lib/email.ts`) - isolated, non-blocking
- Calendar service (`/lib/calendar.ts`) - isolated, non-blocking
- Failures don't break core functionality (graceful degradation)

### Key files explained

**Business Logic (`/lib/tasks.ts`)**
- `listTasks()`: Query tasks with filters (status, priority, category, search)
- `createTask()`: Create task + trigger email/calendar integrations
- `updateTask()`: Update task + sync calendar events + send email notifications
- `deleteTask()`: Delete task + cleanup calendar events + send deletion email

**API Routes (`/app/api/tasks/`)**
- `route.ts`: GET (list), POST (create)
- `[taskId]/route.ts`: PATCH (update), DELETE (delete)
- All routes include: validation, error handling, proper HTTP status codes

**React Hooks (`/hooks/use-tasks.ts`)**
- `useTasksQuery()`: Fetch tasks with React Query caching
- `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`: Mutations with optimistic updates
- Automatic cache invalidation on mutations

**Integrations (Practical API Integrations)**
- **Email** (`/lib/email.ts`): Real SendGrid API integration with API key authentication, sends actual emails
- **Calendar** (`/lib/calendar.ts`): Real Google Calendar API integration with OAuth 2.0, creates/updates/deletes actual calendar events
- Both integrations are **non-blocking** (failures don't break core functionality) and **production-ready** (comprehensive error handling)

### Error handling strategy

**1. API Level**
- Try-catch blocks in all route handlers
- Zod validation for input sanitization
- User-friendly error messages
- Proper HTTP status codes (400, 404, 500)

**2. Integration Level**
- Non-blocking: Email/calendar failures don't prevent task operations
- Try-catch around all integration calls
- Console logging for debugging
- Graceful fallbacks when services unavailable

**3. UI Level**
- Toast notifications for user feedback
- Loading states during mutations
- Form validation with inline error messages
- Disabled states during operations

### UX quality features

- **Loading states**: Skeletons, spinners, disabled buttons
- **Empty states**: Helpful messages when no tasks exist
- **Error feedback**: Toast notifications with clear messages
- **Optimistic updates**: UI updates immediately, syncs in background
- **Responsive design**: Mobile-first, works on all screen sizes
- **Animations**: Smooth transitions, hover effects, fade-ins
- **Accessibility**: Proper ARIA labels, keyboard navigation

## Environment variables

Create `.env` (and `.env.example` for reference) with the following keys:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Supabase, Neon, local, etc.) |
| `SENDGRID_API_KEY` | SendGrid API key (free tier 100 emails/day) |
| `EMAIL_FROM` | Verified sender email in SendGrid |
| `NOTIFICATION_EMAIL` | Recipient email (can match `EMAIL_FROM`) |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Google Cloud project |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Refresh token with `https://www.googleapis.com/auth/calendar` scope |
| `GOOGLE_CALENDAR_ID` | Calendar ID to create events in (e.g., `primary`) |
| `NEXT_PUBLIC_APP_URL` | Base URL for the deployed app (used in emails if needed) |

_All providers above have generous free tiers suitable for this demo._

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Create migration SQL without a running DB (already generated, optional)
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0001_init/migration.sql

# 4. Apply migrations once DATABASE_URL points to a real database
npm run prisma:migrate -- --name init

# 5. (Optional) seed sample data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Visit `http://localhost:3000/tasks` to use the dashboard. React Query Devtools are enabled in development (bottom-right toggle).

## Running quality checks

```bash
npm run lint
```

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Create a PostgreSQL database (Supabase/Neon) and copy the connection string.
3. Provision SendGrid + Google credentials, populate Vercel project environment variables.
4. Import the repo in Vercel, select the Next.js framework preset, and deploy.
5. After deployment, run `npm run prisma:migrate` (locally or via Vercel CLI) so the remote DB schema matches.

## Loom walkthrough (deliverable reminder)

Record a 2–5 minute Loom covering:

- **Architecture choices** + AI tooling used (Cursor, Claude Code)
- **Demo** of creating/editing tasks + integrations firing (email + calendar)
- **Deployment URL** + trade-offs and next steps
- **Key decisions** made during development

## Assumptions & Limitations

### Assumptions
- Single demo user (no authentication required for assignment)
- Free-tier services sufficient for demo
- Vercel deployment target

### Limitations
- **No user authentication**: Schema supports `userId` but auth not implemented
- **One-way calendar sync**: Task → Calendar (not bi-directional)
- **Basic email templates**: Plain text format (can be enhanced to HTML)
- **No automated tests**: Structure supports testing but tests not included

### Trade-offs
- **Speed vs. Perfection**: Focused on core requirements and quality over perfection
- **Simplicity vs. Features**: Chose simple, working solutions over complex features
- **Free Services**: All services use free tiers (Supabase, SendGrid, Google Calendar, Vercel)

## Future enhancements

- Multi-user auth with Clerk/Supabase Auth (schema already supports `userId`)
- Task reminders/notifications closer to due dates (cron or Resend scheduled emails)
- Rich calendar syncing (bi-directional updates, event attendees)
- Analytics panel (burn-down charts, per-category velocity)
- HTML email templates with better formatting
- Automated tests (unit, integration, e2e)
- Real-time collaboration features

## Documentation

- **`README.md`**: This file - setup, architecture, deployment, assumptions, limitations
- **`DEPLOYMENT_GUIDE.md`**: Step-by-step deployment guide for GitHub and Vercel
- **`GITHUB_SETUP.md`**: GitHub repository setup instructions

---

Questions or tweaks? Ping me and we can iterate on any part of the stack.
