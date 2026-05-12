import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  title:   z.string().min(3).optional(),
  content: z.string().optional(),
  color:   z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Se requiere al menos un campo para actualizar',
});

type Params = { params: Promise<{ id: string }> };

// GET /api/notes/:id — devuelve una nota concreta con items y tags
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [note] = await query(`
      SELECT
        n.*,
        json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
        json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      WHERE n.id = $1
      GROUP BY n.id
    `, [id]);

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/notes/:id — actualiza campos parcialmente
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const fields = result.data;
    const keys = Object.keys(fields) as (keyof typeof fields)[];

    // Construimos el SET dinámicamente solo con los campos enviados
    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map(k => fields[k]);

    const [updated] = await query(
      `UPDATE notes SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (!updated) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/notes/:id — elimina la nota.
// ON DELETE CASCADE en la BD borra automáticamente sus checklist_items y note_tags.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    // 204 No Content: operación exitosa sin cuerpo de respuesta
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
