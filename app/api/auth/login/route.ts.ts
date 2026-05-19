import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signJWT(payload: Record<string, unknown>): Promise<string> {
  const secret = process.env.JWT_SECRET ?? 'taskflow-secret-dev';
  const encoder = new TextEncoder();

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${body}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${header}.${body}.${sigB64}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { username, password } = result.data;
    const passwordHash = await hashPassword(password);

    const [user] = await query<{ id: string; username: string }>(
      'SELECT id, username FROM users WHERE username = $1 AND password_hash = $2',
      [username, passwordHash]
    );

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await signJWT({ sub: user.id, username: user.username });

    return NextResponse.json({ token, user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
