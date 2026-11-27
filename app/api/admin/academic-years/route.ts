import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// API — Années scolaires
// GET   : liste des années + année active (public)
// POST  : créer une année (admin)
// PATCH : activer une année (admin)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const YEAR_NAME = /^\d{4}-\d{4}$/;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isAdmin(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;
  return role === 'school_admin' || role === 'super_admin';
}

async function listYears(client: ReturnType<typeof getAdminClient>) {
  if (!client) return { years: [], activeYear: null };
  const { data } = await client
    .from('academic_years')
    .select('id, name, start_date, end_date, status, is_active')
    .order('start_date', { ascending: true });
  const years = data || [];
  return { years, activeYear: years.find((year) => year.is_active) || null };
}

export async function GET() {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json(
      { success: false, message: 'Configuration Supabase manquante.' },
      { status: 500 },
    );
  }

  const { years, activeYear } = await listYears(client);
  return NextResponse.json({ success: true, years, activeYear });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { success: false, message: 'Accès réservé aux administrateurs.' },
      { status: 403 },
    );
  }

  const client = getAdminClient();
  if (!client) {
    return NextResponse.json(
      { success: false, message: 'Configuration Supabase manquante.' },
      { status: 500 },
    );
  }

  let body: { name?: string; startDate?: string; endDate?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Requête invalide.' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const startDate = String(body.startDate || '').trim();
  const endDate = String(body.endDate || '').trim();

  if (!YEAR_NAME.test(name)) {
    return NextResponse.json(
      { success: false, message: 'Format attendu : 2026-2027.' },
      { status: 400 },
    );
  }

  const [startYear, endYear] = name.split('-').map(Number);
  if (endYear !== startYear + 1) {
    return NextResponse.json(
      { success: false, message: 'Les deux années doivent se suivre (ex. 2026-2027).' },
      { status: 400 },
    );
  }

  if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
    return NextResponse.json(
      { success: false, message: 'Les dates de début et de fin sont invalides.' },
      { status: 400 },
    );
  }

  const { data: existing } = await client
    .from('academic_years')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { success: false, message: 'Cette année scolaire existe déjà.' },
      { status: 409 },
    );
  }

  const { data, error } = await client
    .from('academic_years')
    .insert({
      id: `ay-${name}`,
      name,
      start_date: startDate,
      end_date: endDate,
      status: 'upcoming',
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, year: data });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { success: false, message: 'Accès réservé aux administrateurs.' },
      { status: 403 },
    );
  }

  const client = getAdminClient();
  if (!client) {
    return NextResponse.json(
      { success: false, message: 'Configuration Supabase manquante.' },
      { status: 500 },
    );
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Requête invalide.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  if (!id) {
    return NextResponse.json({ success: false, message: 'Identifiant manquant.' }, { status: 400 });
  }

  const { data: years, error } = await client
    .from('academic_years')
    .select('id, name, start_date, end_date, status, is_active')
    .order('start_date', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }

  const target = (years || []).find((year) => year.id === id);
  if (!target) {
    return NextResponse.json({ success: false, message: 'Année introuvable.' }, { status: 404 });
  }

  for (const year of years || []) {
    const status =
      year.id === id
        ? 'current'
        : new Date(year.start_date) < new Date(target.start_date)
          ? 'previous'
          : 'upcoming';

    const { error: updateError } = await client
      .from('academic_years')
      .update({ status, is_active: year.id === id })
      .eq('id', year.id);

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 400 });
    }
  }

  const updated = await listYears(client);
  return NextResponse.json({ success: true, ...updated });
}
