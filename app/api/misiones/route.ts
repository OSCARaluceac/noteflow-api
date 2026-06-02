import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

// FIX #2: Se añade image_url al schema de creación (opcional, puede ser null)
const misionSchema = z.object({
  title:     z.string().min(3),
  categoria: z.enum(['Recolección', 'Exploración', 'Captura', 'Escolta', 'Caza']),
  rango:     z.enum(['D', 'C', 'B', 'A', 'S']),
  image_url: z.string().url().nullable().optional(),
});

// GET /api/misiones — devuelve todas las misiones ordenadas por fecha de creación
export async function GET() {
  try {
    const misiones = await query(
      'SELECT * FROM misiones ORDER BY created_at DESC'
    );
    return NextResponse.json(misiones);
  } catch (error) {
    console.error('GET /api/misiones error:', error);
    return NextResponse.json({ error: 'Error al obtener misiones' }, { status: 500 });
  }
}

// POST /api/misiones — crea una nueva misión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = misionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { title, categoria, rango, image_url } = parsed.data;

    // FIX #2: INSERT incluye image_url para que las imágenes no se pierdan
    // al migrar de localStorage a PostgreSQL.
    // IMPORTANTE: ejecutar antes la migración de BD:
    //   ALTER TABLE misiones ADD COLUMN IF NOT EXISTS image_url TEXT;
    const [mision] = await query(
      `INSERT INTO misiones (title, categoria, rango, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, categoria, rango, image_url ?? null]
    );

    return NextResponse.json(mision, { status: 201 });
  } catch (error) {
    console.error('POST /api/misiones error:', error);
    return NextResponse.json({ error: 'Error al crear misión' }, { status: 500 });
  }
}
