import { NextResponse } from 'next/server';

// ============================================================
// API — Connexion par e-mail (côté serveur)
// Le navigateur n'appelle plus directement Supabase Auth.
// Cela évite les erreurs "Failed to fetch" liées au réseau,
// aux extensions ou à un cache navigateur trop agressif.
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, message: 'Configuration Supabase manquante.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Adresse e-mail et mot de passe requis.' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timeout);
    }

    const payload = await response.json().catch(() => ({} as any));

    if (!response.ok) {
      const rawMessage =
        payload?.msg || payload?.message || payload?.error_description || payload?.error || '';
      const invalidCredentials =
        payload?.error_code === 'invalid_credentials' ||
        payload?.error === 'invalid_grant' ||
        /invalid login credentials/i.test(rawMessage);

      return NextResponse.json(
        {
          success: false,
          message: invalidCredentials
            ? 'Email ou mot de passe incorrect.'
            : rawMessage || 'Connexion impossible pour le moment.',
        },
        { status: invalidCredentials ? 401 : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie.',
      user: payload.user,
      session: {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_in: payload.expires_in,
        token_type: payload.token_type,
      },
    });
  } catch (error: any) {
    const aborted = error?.name === 'AbortError';
    return NextResponse.json(
      {
        success: false,
        message: aborted
          ? 'Le serveur d’authentification ne répond pas. Réessayez dans un instant.'
          : 'Impossible de joindre le serveur d’authentification. Vérifiez votre connexion internet.',
      },
      { status: 502 }
    );
  }
}
