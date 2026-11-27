import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 12 * 1024 * 1024;

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local')) return true;
  if (host === '0.0.0.0' || host === '::1') return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;
  if (role !== 'school_admin' && role !== 'super_admin') {
    return NextResponse.json(
      { success: false, message: 'Accès réservé aux administrateurs.' },
      { status: 403 },
    );
  }

  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ success: false, message: 'URL manquante.' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ success: false, message: 'URL invalide.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(target.protocol) || isPrivateHost(target.hostname)) {
    return NextResponse.json({ success: false, message: 'URL non autorisée.' }, { status: 400 });
  }

  try {
    const response = await fetch(target.toString(), {
      headers: { Accept: 'image/*' },
      cache: 'no-store',
      redirect: 'error',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Image distante introuvable.' },
        { status: 404 },
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Le lien ne renvoie pas une image.' },
        { status: 400 },
      );
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Image distante trop lourde (12 Mo maximum).' },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Image distante trop lourde (12 Mo maximum).' },
        { status: 413 },
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Impossible de récupérer l’image distante.' },
      { status: 502 },
    );
  }
}
