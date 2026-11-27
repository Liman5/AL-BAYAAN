import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { SITE_IMAGE_SLOTS } from '@/lib/siteImages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_SLOTS = new Set(SITE_IMAGE_SLOTS.map((slot) => slot.key));
const MAX_BYTES = 8 * 1024 * 1024;

function detectExtension(buffer: Buffer): string | null {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg';
  if (
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') {
    return 'webp';
  }
  return null;
}

export async function POST(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;
  if (role !== 'school_admin' && role !== 'super_admin') {
    return NextResponse.json(
      { success: false, message: 'Accès réservé aux administrateurs.' },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, message: 'Requête invalide.' }, { status: 400 });
  }

  const file = form.get('file');
  const slot = String(form.get('slot') || '');

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'Aucun fichier reçu.' }, { status: 400 });
  }
  if (!ALLOWED_SLOTS.has(slot)) {
    return NextResponse.json({ success: false, message: 'Emplacement inconnu.' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { success: false, message: 'Le fichier doit être une image.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, message: 'Image trop lourde (8 Mo maximum).' },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = detectExtension(buffer);
  if (!extension) {
    return NextResponse.json(
      { success: false, message: 'Format d’image non reconnu (JPEG, PNG ou WebP).' },
      { status: 400 },
    );
  }

  const uploadDir = path.join(process.cwd(), 'data', 'site-uploads');
  const safeSlot = slot.replace(/[^a-z0-9-]/gi, '-');
  const filename = `${safeSlot}-${Date.now()}.${extension}`;

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({
      success: true,
      path: `/api/site-images/file/${filename}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Impossible d’enregistrer le fichier sur le serveur.' },
      { status: 500 },
    );
  }
}
