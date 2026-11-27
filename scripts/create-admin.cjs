/**
 * Crée le compte administrateur Supabase Auth + les profils users/admins.
 * Prérequis : DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * et SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 * Usage : npm run db:create-admin
 * Un mot de passe temporaire est écrit dans ADMIN_ACCESS.txt (ignoré par git).
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const EMAIL = 'admin@albayan.edu';
const SCHOOL_ID = 'school-1';

function readEnv() {
  const env = {};
  const content = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
    }
  }
  return env;
}

function connectionString(raw) {
  return raw.replace(/([?&])sslmode=[^&]*/i, '$1').replace(/[?&]$/, '');
}

async function createAuthUser(env, password) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: EMAIL,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Direction',
        last_name: 'AL-BAYAAN',
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Création Auth impossible (${response.status}) : ${data.msg || data.message || 'erreur inconnue'}`,
    );
  }

  const userId = data.id || data.user?.id;
  if (!userId) throw new Error('Réponse Supabase Auth sans identifiant utilisateur.');
  return { userId, url, anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

async function main() {
  const env = readEnv();
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL manquant.');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant.');

  const client = new Client({
    connectionString: connectionString(env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const existing = await client.query('select id::text from auth.users where email = $1', [EMAIL]);
  let userId;
  let password = null;

  if (existing.rows.length > 0) {
    userId = existing.rows[0].id;
    console.log(`AUTH_USER_EXISTANT id=${userId}`);
  } else {
    password = 'Lg-' + crypto.randomBytes(8).toString('base64url') + '-2026!';
    const created = await createAuthUser(env, password);
    userId = created.userId;
    console.log(`AUTH_USER_CREE id=${userId}`);
  }

  await client.query(
    `
      INSERT INTO public.users (id, email, password_hash, first_name, last_name, status, school_id)
      VALUES ($1, $2, 'supabase-auth', 'Direction', 'AL-BAYAAN', 'active', $3)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        status = 'active',
        school_id = EXCLUDED.school_id
    `,
    [userId, EMAIL, SCHOOL_ID],
  );

  await client.query(
    `
      INSERT INTO public.admins (id, matricule, admin_level, permissions, user_id, school_id)
      VALUES ('admin-1', 'CSG-A-001', 'school_admin', $1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        admin_level = EXCLUDED.admin_level,
        permissions = EXCLUDED.permissions,
        school_id = EXCLUDED.school_id
    `,
    [
      ['dashboard', 'students', 'teachers', 'classes', 'reports', 'payments', 'passages', 'images'],
      userId,
      SCHOOL_ID,
    ],
  );

  console.log('PROFIL_ADMIN_OK');

  if (password) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
    const loginResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL, password }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json().catch(() => ({}));
      throw new Error(
        `Test de connexion échoué (${loginResponse.status}) : ${error.error_description || error.msg || 'erreur'}`,
      );
    }
    console.log('TEST_LOGIN_OK');

    const accessFile = path.join(process.cwd(), 'ADMIN_ACCESS.txt');
    fs.writeFileSync(
      accessFile,
      [
        'AL-BAYAAN — ACCÈS ADMINISTRATEUR',
        '=====================================',
        '',
        'URL de connexion : /auth/login',
        `E-mail          : ${EMAIL}`,
        `Mot de passe    : ${password}`,
        '',
        'IMPORTANT :',
        '1. Connectez-vous puis changez ce mot de passe dans Supabase → Authentication → Users.',
        '2. Supprimez ce fichier après avoir noté le mot de passe.',
        '3. Ne partagez pas ce fichier.',
        '',
      ].join('\n'),
      'utf8',
    );
    console.log('FICHIER_ADMIN_ACCESS_CREE=ADMIN_ACCESS.txt');
  } else {
    console.log('MOT_DE_PASSE_NON_MODIFIE (compte existant)');
  }

  await client.end();
}

main().catch((error) => {
  console.error('ERREUR:', error.message);
  process.exit(1);
});
