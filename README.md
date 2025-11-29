# SupportFlow - AI-Powered Support Ticket System

A modern support ticket management application built with React, TypeScript, Vite, and Supabase.

## Features

- 🔐 **Supabase Authentication** - Secure email/password authentication
- 🎫 **Ticket Management** - Create, view, and manage support tickets
- 🤖 **AI-Powered Responses** - Automated AI responses to support tickets
- 📊 **Dashboard** - Overview of ticket statuses and statistics
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v7
- **Backend**: Supabase (Auth + Database)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Database Schema

The application uses the following Supabase tables:

### `tickets` table
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `status` (Text: 'open', 'pending', 'resolved')
- `user_id` (UUID, Foreign Key to auth.users)
- `ai_response` (Text, nullable)
- `created_at` (Timestamptz)
- `updated_at` (Timestamptz)

### Row Level Security (RLS)
- Users can only view, create, and update their own tickets
- All policies are enforced at the database level

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, etc.)
│   └── Root.tsx     # Root layout component
├── lib/
│   └── supabase.ts  # Supabase client configuration
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── NewTicketPage.tsx
│   ├── TicketDetailPage.tsx
│   └── NotFound.tsx
├── utils/
│   ├── auth.ts      # Authentication utilities
│   ├── tickets.ts   # Ticket management utilities
│   └── routes.tsx   # React Router configuration
├── App.tsx
├── main.tsx
└── index.css        # Global styles and Tailwind imports
```

## Features in Detail

### Authentication
- Sign up with email, password, and name
- Sign in with email and password
- Secure session management via Supabase Auth
- Automatic redirects for unauthenticated users

### Ticket Management
- Create new support tickets with title and description
- View all tickets in a dashboard with status filtering
- View individual ticket details
- AI-generated responses (currently mocked, ready for OpenAI integration)
- Mark tickets as resolved

### Dashboard
- Statistics cards showing open, pending, and resolved tickets
- List of all tickets with status badges
- Quick navigation to create new tickets
- Real-time ticket status updates

## Development

The application is built from a Figma design using the Figma MCP server. All components and pages match the original design specifications.

## License

MIT
