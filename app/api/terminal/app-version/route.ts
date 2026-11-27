import { NextResponse } from 'next/server';

// ============================================================
// GET /api/terminal/app-version
//
// Point de contrôle de mise à jour pour l'application Android.
// Route **publique** : aucune donnée d'élève, aucun secret.
//
// Configuration (variables d'environnement, côté serveur) :
//   TERMINAL_APP_VERSION   version publiée, ex. « 1.1.0 »
//   TERMINAL_APP_APK_URL   URL directe de l'APK (GitHub Releases, etc.)
//   TERMINAL_APP_NOTES     notes de version affichées sur le terminal
//   TERMINAL_APP_MIN_OS    (optionnel) version minimale supportée
//
// Si `TERMINAL_APP_APK_URL` est vide, le terminal n'affiche **aucune**
// proposition de mise à jour : rien n'est inventé.
// ============================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const version = (process.env.TERMINAL_APP_VERSION || '1.0.0').trim();
  const apkUrl = (process.env.TERMINAL_APP_APK_URL || '').trim();
  const notes = (process.env.TERMINAL_APP_NOTES || '').trim();
  const minOs = (process.env.TERMINAL_APP_MIN_OS || '').trim();

  return NextResponse.json(
    {
      success: true,
      data: {
        version,
        apkUrl,
        notes,
        minOs: minOs || null,
        publishedAt: new Date().toISOString(),
        // Le terminal ne se met à jour que si une URL est fournie.
        updateAvailable: apkUrl.length > 0,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
