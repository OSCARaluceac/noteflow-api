import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const itemSchema = z.object({
  text: z.string().min(1, 'El texto del item no puede estar vacío'),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/notes/:id/checklist-items — lista todos los items de una nota
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const items = await query(
      'SELECT * FROM checklist_items WHERE note_id = $1 ORDER BY id',
      [id]
    );
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/notes/:id/checklist-items — añade un item a una nota existente
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = itemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    // Verificar que la nota existe y es de tipo checklist
    const [note] = await query<{ type: string }>(
      'SELECT type FROM notes WHERE id = $1',
      [id]
    );

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    if (note.type !== 'checklist') {
      return NextResponse.json(
        { error: 'Solo se pueden añadir items a notas de tipo checklist' },
        { status: 400 }
      );
    }

    const [item] = await query(
      'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING *',
      [id, result.data.text]
    );

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
