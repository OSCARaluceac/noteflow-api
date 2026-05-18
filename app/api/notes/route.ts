import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  title:   z.string().min(3),
  type:    z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color:   z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  items:   z.array(z.object({ text: z.string().min(1) })).optional(),
  tags:    z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const notes = await query(`
      SELECT
        n.*,
        COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') AS items
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { title, type, content, color, items, tags } = parsed.data;

    const [note]: any = await query(
      'INSERT INTO notes (title, type, content, color, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, type, content ?? null, color ?? null, tags ?? []]
    );

    let insertedItems: unknown[] = [];
    if (type === 'checklist' && items && items.length > 0) {
      for (const item of items) {
        const [ci]: any = await query(
          'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING *',
          [note.id, item.text]
        );
        insertedItems.push(ci);
      }
    }

    return NextResponse.json({ ...note, items: insertedItems }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json({ error: 'Error en la creación' }, { status: 500 });
  }
}
