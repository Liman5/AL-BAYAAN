import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'site-uploads');
const SAFE_NAME = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeName = path.basename(filename);

  if (safeName !== filename || !SAFE_NAME.test(safeName)) {
    return new NextResponse('Image introuvable.', { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, safeName));
    const extension = path.extname(safeName).slice(1).toLowerCase();
    const contentType =
      extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Image introuvable.', { status: 404 });
  }
}
