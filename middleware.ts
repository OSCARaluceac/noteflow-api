import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register'];

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET ?? 'taskflow-secret-dev';
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );

    const sigB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const sigBuffer = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      'HMAC', key,
      sigBuffer,
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) return false;

    // Verificar expiración
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Preflight CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  const { pathname } = request.nextUrl;

  // Rutas públicas: pasar sin verificar token
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  // Rutas protegidas: verificar JWT
  if (pathname.startsWith('/api/')) {
    const auth = request.headers.get('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token || !(await verifyJWT(token))) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401, headers: CORS_HEADERS }
      );
    }
  }

  const response = NextResponse.next();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
