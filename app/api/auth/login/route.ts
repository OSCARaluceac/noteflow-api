import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Función simple de hash sin bcrypt (pure JS, compatible con Edge/Serverless)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // Comprobar si el usuario ya existe
    const existing = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await query<{ id: string; username: string }>(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    return NextResponse.json(
      { message: 'Usuario creado correctamente', user },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
