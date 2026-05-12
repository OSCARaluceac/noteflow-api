import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

// BUG 4 RESUELTO: Ahora permitimos actualizar el array de tags
const patchSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(), 
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // BUG 2 RESUELTO: Lectura directa sin JOIN a note_tags
    const [note]: any = await query('SELECT * FROM notes WHERE id = $1', [params.id]);
    
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    // TS7034 / TS7005 RESUELTO: Declaración explícita del tipo de arreglo
    let items: any[] = [];
    if (note.type === 'checklist') {
      items = await query(
        'SELECT * FROM checklist_items WHERE note_id = $1 ORDER BY created_at ASC',
        [note.id]
      );
    }

    return NextResponse.json({ ...note, items });
  } catch (error) {
    console.error("Falla en GET individual:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    values.push(params.id);
    const queryString = `
      UPDATE notes 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const [updatedNote]: any = await query(queryString, values);

    if (!updatedNote) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Falla en PATCH:", error);
    return NextResponse.json({ error: 'Datos inválidos o error en actualización' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const [deletedNote]: any = await query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (!deletedNote) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deletedNote.id });
  } catch (error) {
    console.error("Falla en DELETE:", error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}