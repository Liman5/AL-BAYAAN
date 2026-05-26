# School Management SaaS

Modern school ERP platform scaffold built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and reusable dashboard architecture.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXTAUTH_SECRET`

3. Run development server
   ```bash
   npm run dev
   ```

## Project structure

- `app/` - application routes, layouts, pages
- `components/` - reusable UI primitives
- `features/` - feature-specific modules
- `lib/` - supabase client, helpers, validation
- `services/` - business services and data access
- `types/` - shared TypeScript models

## Next steps

- Add Supabase schema and RLS policies
- Build authentication and role-protected dashboard layouts
- Implement core modules: students, teachers, classes, attendance, grading
- Add export/report features and analytics dashboards
