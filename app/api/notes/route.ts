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
    // Eliminamos el JOIN a note_tags; ahora usamos la columna 'tags' integrada
    const notes = await query(`
      SELECT 
        n.*,
        COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') as items
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Falla en GET:", error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, content, color, items, tags } = noteSchema.parse(body);

    // 1. Insertar la nota principal (inyectando directamente el arreglo de tags)
    const [note]: any = await query(
      'INSERT INTO notes (title, type, content, color, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, type, content, color, tags || []]
    );

    // 2. Si es una misión (checklist), insertamos los items y los guardamos para la respuesta
    let insertedItems = [];
    if (type === 'checklist' && items) {
      for (const item of items) {
        const [ci]: any = await query(
          'INSERT INTO checklist_items (note_id, text) VALUES ($1, $2) RETURNING *', 
          [note.id, item.text]
        );
        insertedItems.push(ci);
      }
    }

    // 3. Devolvemos la estructura completa para que la aplicación móvil no pierda el rastro
    const completeNote = {
      ...note,
      items: insertedItems
    };

    return NextResponse.json(completeNote, { status: 201 });
  } catch (error) {
    console.error("Falla en POST:", error);
    return NextResponse.json({ error: 'Error en la creación' }, { status: 400 });
  }
}