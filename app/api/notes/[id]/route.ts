import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  title:   z.string().min(3).optional(),
  content: z.string().optional(),
  color:   z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  tags:    z.array(z.string()).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Se requiere al menos un campo para actualizar',
});

type Ctx = { params: Promise<{ id: string }> };

// GET /api/notes/:id
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const [note] = await query(`
      SELECT
        n.*,
        COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') AS items
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      WHERE n.id = $1
      GROUP BY n.id
    `, [id]);

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('GET /api/notes/:id error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/notes/:id
export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
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
  } catch (error) {
    console.error('PATCH /api/notes/:id error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/notes/:id
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/notes/:id error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
