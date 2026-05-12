import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
  items: z.array(z.object({ text: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    // Consulta "Maestra" con JOIN para traer notas, sus tareas y etiquetas de un solo viaje
    const notes = await query(`
      SELECT 
        n.*,
        COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') as items,
        COALESCE(json_agg(DISTINCT nt.tag) FILTER (WHERE nt.tag IS NOT NULL), '[]') as tags
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, content, color, items, tags } = noteSchema.parse(body);

    // 1. Insertar la nota principal
    const [note]: any = await query(
      'INSERT INTO notes (title, type, content, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, type, content, color]
    );

    // 2. Si es una misión (checklist), insertar los items
    if (type === 'checklist' && items) {
      for (const item of items) {
        await query('INSERT INTO checklist_items (note_id, text) VALUES ($1, $2)', [note.id, item.text]);
      }
    }

    // 3. Si tiene etiquetas, insertarlas
    if (tags) {
      for (const tag of tags) {
        await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [note.id, tag]);
      }
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error en la creación' }, { status: 400 });
  }
}