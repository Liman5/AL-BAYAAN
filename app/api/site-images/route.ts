import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { SITE_IMAGE_SLOTS, type SiteImageMap } from '@/lib/siteImages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-images.json');
const ALLOWED_KEYS = new Set(SITE_IMAGE_SLOTS.map((slot) => slot.key));

function sanitize(raw: unknown): SiteImageMap {
  if (!raw || typeof raw !== 'object') return {};
  const clean: SiteImageMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key) || typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 2048) continue;
    clean[key] = trimmed;
  }
  return clean;
}

async function readOverrides(): Promise<SiteImageMap> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function GET() {
  return NextResponse.json(
    { success: true, images: await readOverrides() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;
  if (role !== 'school_admin' && role !== 'super_admin') {
    return NextResponse.json(
      { success: false, message: 'Accès réservé aux administrateurs.' },
      { status: 403 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Requête invalide.' }, { status: 400 });
  }

  const source = (payload as { images?: unknown })?.images ?? payload;
  const images = sanitize(source);

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(images, null, 2), 'utf8');
    return NextResponse.json({ success: true, images });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Impossible d’enregistrer les images sur le serveur.' },
      { status: 500 },
    );
  }
}
