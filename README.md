# Smart To-Do

A production-ready smart to-do list application built with Next.js, featuring email notifications via Gmail API and Google Calendar integration. Designed to showcase modern full-stack development practices with clean architecture, type safety, and comprehensive error handling.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Assumptions & Limitations](#assumptions--limitations)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

This application demonstrates a production-ready task management system with:
- **Magic link authentication** using NextAuth.js
- **Email notifications** via Gmail API (OAuth2)
- **Google Calendar integration** for automatic event creation/updates
- **Real-time UI** with optimistic updates using React Query
- **Type-safe** codebase with TypeScript and Zod validation
- **Responsive design** that works on all devices

Built as a technical assignment showcasing modern development practices, clean code organization, and practical API integrations.

## ✨ Features

### Core Functionality
- ✅ **CRUD Operations**: Create, read, update, and delete tasks
- ✅ **Task Properties**: Title, description, status, priority, category, due date/time
- ✅ **Filtering & Search**: Filter by status, priority, category, and search by text
- ✅ **Task Status Management**: Pending, In Progress, Completed with status transitions

### Integrations
- 📧 **Email Notifications**: Automatic emails for task creation, updates, and deletions via Gmail API
- 📅 **Calendar Sync**: Automatic Google Calendar event creation/updates when tasks have due dates
- 🔐 **Authentication**: Passwordless magic link authentication

### User Experience
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 📱 **Responsive Design**: Mobile-first approach, works on all screen sizes
- ⚡ **Optimistic Updates**: Instant UI feedback with background synchronization
- 🔄 **Real-time State**: React Query for efficient data fetching and caching
- 🎭 **Loading States**: Skeletons, spinners, and disabled states during operations
- 🚨 **Error Handling**: Comprehensive error messages and graceful degradation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod for validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **Database**: PostgreSQL (Supabase/Neon compatible)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Email provider)

### Integrations
- **Email**: Gmail API (OAuth2 with refresh tokens)
- **Calendar**: Google Calendar API (OAuth2)

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Script Runner**: tsx

## 📁 Project Structure

```
smart-todo/
├── prisma/
│   ├── schema.prisma          # Database schema and models
│   ├── migrations/             # Database migration files
│   └── seed.ts                # Sample data seeding script
├── scripts/
│   └── gmail-auth.ts          # Helper script to generate Gmail refresh token
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/         # Authentication routes (NextAuth)
│   │   │   ├── tasks/         # Task CRUD endpoints
│   │   │   └── user/          # User-related endpoints (calendar)
│   │   ├── login/             # Login page and verification
│   │   ├── tasks/              # Main dashboard
│   │   │   └── _components/   # Task-related components
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── providers/         # React Query, Session, Toast providers
│   │   └── ui/                # Reusable UI components (shadcn)
│   ├── hooks/
│   │   └── use-tasks.ts       # React Query hooks for tasks
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── calendar.ts        # Google Calendar integration
│   │   ├── email.ts            # Task notification emails
│   │   ├── email-auth.ts       # Magic link email sending
│   │   ├── gmail.ts            # Gmail API client
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── tasks.ts            # Core task business logic
│   │   ├── utils.ts            # Utility functions
│   │   └── validations.ts      # Zod schemas
│   └── types/
│       ├── task.ts             # Task type definitions
│       └── next-auth.d.ts      # NextAuth type extensions
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

### Key Directories Explained

**`/src/app/api/`** - API Route Handlers
- HTTP request/response handling
- Input validation with Zod
- Error handling and status codes
- Authentication checks

**`/src/lib/`** - Business Logic Layer
- `tasks.ts`: Core CRUD operations, orchestrates email/calendar integrations
- `gmail.ts`: Gmail API client for sending emails
- `calendar.ts`: Google Calendar API integration
- `email.ts`: Email notification service
- `auth.ts`: NextAuth.js configuration

**`/src/app/tasks/_components/`** - Feature Components
- Co-located task-related UI components
- Dashboard, form, list, filters, summary

**`/src/hooks/`** - Data Fetching
- React Query hooks for server state
- Optimistic updates and cache management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase, Neon, or local)
- Google Cloud project with Gmail API and Google Calendar API enabled
- Gmail account for sending emails

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in all required values (see [Configuration](#configuration) section).

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` and start using the app!

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

#### Database
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Gmail API (for email notifications)
```env
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-oauth-client-id
GMAIL_CLIENT_SECRET=your-oauth-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
EMAIL_FROM=your-email@gmail.com
```

#### Google Calendar API
```env
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_CALENDAR_ID=primary
```

#### NextAuth.js
```env
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Gmail API Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Gmail API**
   - Navigate to **APIs & Services → Library**
   - Search for "Gmail API" and enable it

3. **Configure OAuth Consent Screen**
   - Go to **APIs & Services → OAuth consent screen**
   - Choose "External" user type
   - Fill in app information
   - Add your Gmail address as a test user

4. **Create OAuth Credentials**
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Choose **Desktop app** as application type
   - Copy the Client ID and Client Secret

5. **Generate Refresh Token**
   ```bash
   GMAIL_CLIENT_ID=your-client-id \
   GMAIL_CLIENT_SECRET=your-client-secret \
   npx tsx scripts/gmail-auth.ts
   ```
   - Open the authorization URL in your browser
   - Sign in with the Gmail account you want to use
   - Approve the permissions
   - Copy the verification code and paste it in the terminal
   - Save the printed refresh token to your `.env` file

6. **Set Gmail User**
   - Set `GMAIL_USER` and `EMAIL_FROM` to the Gmail address you used

> **Note**: Personal Gmail accounts have a limit of ~100 emails/day via the API. For higher limits, use Google Workspace.

### Google Calendar API Setup

1. **Enable Google Calendar API**
   - In the same Google Cloud project, enable "Google Calendar API"

2. **Create OAuth Credentials** (separate from Gmail)
   - Create another OAuth client ID (can be Web application type)
   - Use the OAuth 2.0 Playground or similar tool to get a refresh token with `https://www.googleapis.com/auth/calendar` scope

3. **Set Calendar ID**
   - Use `primary` for the default calendar, or a specific calendar ID

### Database Setup

#### Using Supabase

1. Create a new Supabase project
2. Go to **Settings → Database**
3. Copy the connection string
4. For connection pooling (recommended for serverless):
   - Select **Connection pooling** mode
   - Choose **Session** mode (NOT Transaction mode)
   - The connection string should include `?pgbouncer=true` and use port `6543`

#### Using Neon or Other PostgreSQL

1. Create a PostgreSQL database
2. Copy the connection string
3. Use it as `DATABASE_URL`

## 🏗 Architecture

### Design Principles

#### 1. Separation of Concerns
- **API Layer** (`/app/api/`): HTTP handling, validation, error formatting
- **Business Logic** (`/lib/`): Core operations, integrations, database queries
- **UI Layer** (`/app/tasks/`, `/components/`): React components, user interactions
- **Data Layer** (`/hooks/`): React Query hooks for server state

#### 2. Feature-Based Organization
- Related components co-located in feature directories
- Clear naming conventions
- Easy to navigate and maintain

#### 3. Type Safety First
- TypeScript throughout
- Zod schemas for runtime validation
- Prisma-generated types from schema

#### 4. Integration Isolation
- Email and calendar services are isolated modules
- Failures don't break core functionality (graceful degradation)
- Non-blocking error handling

### Key Components

#### Business Logic (`/lib/tasks.ts`)
- `listTasks()`: Query tasks with filters
- `createTask()`: Create task + trigger email/calendar
- `updateTask()`: Update task + sync calendar + send email
- `deleteTask()`: Delete task + cleanup calendar + send email

#### API Routes (`/app/api/tasks/`)
- `route.ts`: GET (list), POST (create)
- `[taskId]/route.ts`: PATCH (update), DELETE (delete)
- All routes include validation, error handling, proper HTTP status codes

#### React Hooks (`/hooks/use-tasks.ts`)
- `useTasksQuery()`: Fetch tasks with React Query caching
- `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`: Mutations with optimistic updates
- Automatic cache invalidation

#### Integrations
- **Gmail API** (`/lib/gmail.ts`): OAuth2 client, message encoding, sending
- **Calendar API** (`/lib/calendar.ts`): OAuth2 client, event CRUD operations
- Both are non-blocking and production-ready

### Error Handling Strategy

**API Level**
- Try-catch blocks in all route handlers
- Zod validation for input sanitization
- User-friendly error messages
- Proper HTTP status codes (400, 404, 500)

**Integration Level**
- Non-blocking: Email/calendar failures don't prevent task operations
- Try-catch around all integration calls
- Console logging for debugging
- Graceful fallbacks when services unavailable

**UI Level**
- Toast notifications for user feedback
- Loading states during mutations
- Form validation with inline error messages
- Disabled states during operations

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select Next.js as the framework

3. **Configure Environment Variables**
   - Add all environment variables from your `.env` file
   - Ensure `DATABASE_URL` uses connection pooling if using Supabase
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL

4. **Deploy**
   - Vercel will automatically build and deploy
   - After deployment, run migrations:
     ```bash
     npx prisma migrate deploy
     ```
     Or use Vercel CLI:
     ```bash
     vercel env pull .env.production
     npx prisma migrate deploy
     ```

5. **Verify**
   - Test authentication flow
   - Test task creation with email/calendar
   - Check Vercel function logs for any errors

### Database Migrations

After deployment, ensure your production database schema is up to date:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

Or run migrations directly on the production database using the connection string.

## 📝 Assumptions & Limitations

### Assumptions

1. **Single User Demo**: The application is designed as a single-user demo. While the schema supports multi-user functionality, authentication is simplified for demonstration purposes.

2. **Free-Tier Services**: All services used have generous free tiers suitable for demonstration:
   - Supabase/Neon: Free PostgreSQL database
   - Gmail API: ~100 emails/day (personal accounts)
   - Google Calendar API: Free with Google account
   - Vercel: Free hosting tier

3. **Vercel Deployment**: The application is optimized for Vercel's serverless environment with connection pooling considerations.

4. **Personal Gmail Account**: Email sending uses a personal Gmail account with OAuth2. For production, consider Google Workspace for higher limits.

### Limitations

1. **No Multi-User Authentication**: While the schema supports `userId`, the current implementation uses NextAuth.js for single-user magic link authentication. Multi-user support would require additional work.

2. **One-Way Calendar Sync**: Calendar integration is one-way (Task → Calendar). Bi-directional sync (Calendar → Task) is not implemented.

3. **Basic Email Templates**: Email notifications use plain text format. HTML templates could be enhanced for better formatting.

4. **No Automated Tests**: The codebase structure supports testing, but automated tests (unit, integration, e2e) are not included.

5. **Gmail Daily Limits**: Personal Gmail accounts are limited to ~100 emails/day via the API. This may be insufficient for high-volume use cases.

6. **No Task Reminders**: While tasks can have due dates, there's no automated reminder system (e.g., cron jobs or scheduled emails).

7. **No Real-Time Collaboration**: The application is single-user. Real-time collaboration features are not implemented.

### Trade-offs

- **Speed vs. Perfection**: Focused on core requirements and quality over perfection
- **Simplicity vs. Features**: Chose simple, working solutions over complex features
- **Free Services**: All services use free tiers suitable for demonstration
- **Development Speed**: Used AI-assisted development tools to accelerate development while maintaining code quality

## 🔮 Future Enhancements

- **Multi-User Support**: Implement proper multi-user authentication and authorization
- **Task Reminders**: Automated reminders via cron jobs or scheduled emails
- **Bi-Directional Calendar Sync**: Sync changes from Google Calendar back to tasks
- **Rich Email Templates**: HTML email templates with better formatting
- **Analytics Dashboard**: Task completion metrics, burn-down charts, velocity tracking
- **Automated Testing**: Unit tests, integration tests, and e2e tests
- **Real-Time Collaboration**: Multi-user collaboration features
- **Task Dependencies**: Support for task dependencies and subtasks
- **File Attachments**: Attach files to tasks
- **Task Comments**: Add comments and notes to tasks
- **Export/Import**: Export tasks to CSV/JSON, import from other tools

## 📚 Additional Documentation

- **`scripts/gmail-auth.ts`**: Helper script for Gmail OAuth token generation

## 🤝 Contributing

This is a demonstration project. For questions or improvements, please open an issue or submit a pull request.

## 📄 License

This project is part of a technical assignment and is provided as-is for demonstration purposes.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
