import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const itemSchema = z.object({
  text: z.string().min(1, 'El texto del item no puede estar vacío'),
});

type Ctx = { params: Promise<{ id: string }> };

// GET /api/notes/:id/checklist-items
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const items = await query(
      'SELECT * FROM checklist_items WHERE note_id = $1 ORDER BY id',
      [id]
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET checklist-items error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/notes/:id/checklist-items
export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const result = itemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('POST checklist-items error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
