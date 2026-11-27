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
- `mobile/school_attendance/` - **terminal Android de présence par QR**
  (projet Flutter autonome, hors ligne, synchronisé avec la plateforme)

## Terminal de présence (badges QR)

L'administration expose deux modules dédiés :

| Module | Route admin | API |
|---|---|---|
| **Badges QR** | `/admin` → *Badges QR* | `GET/POST/PATCH /api/admin/badges` |
| **Terminaux scanners** | `/admin` → *Terminaux scanners* | `GET/POST/PATCH /api/admin/terminals`, `GET/PATCH /api/admin/scanner-settings`, `GET /api/admin/presence` |

Routes réservées au terminal Android (authentification par token d'appareil) :

- `POST /api/terminal/pair` — appairage par code à usage unique ;
- `GET  /api/terminal/bootstrap` — élèves, classes, configuration ;
- `POST /api/terminal/attendance` — présences (idempotent, par lot) ;
- `POST /api/terminal/heartbeat` — signal de vie.

Mise en service :

```bash
# 1. Appliquer la migration des badges / terminaux
npm run db:sql prisma/sql/30-badges-terminaux.sql
# (ou coller le fichier dans l'éditeur SQL Supabase)
```

Puis dans l'interface : *Badges QR* → générer → imprimer ; *Terminaux
scanners* → créer un terminal → saisir le code dans l'application Android.

Documentation complète : `mobile/school_attendance/docs/INTEGRATION.md`
(architecture, sécurité, QR, PDF, synchronisation, notifications) et
`mobile/school_attendance/docs/ADMIN_GUIDE.md` (guide non technique).

## Next steps

- Add Supabase schema and RLS policies
- Build authentication and role-protected dashboard layouts
- Implement core modules: students, teachers, classes, attendance, grading
- Add export/report features and analytics dashboards
