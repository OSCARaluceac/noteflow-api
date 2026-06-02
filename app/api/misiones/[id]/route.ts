import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

// FIX #2: Se añade image_url al schema de actualización parcial
const patchSchema = z.object({
  title:     z.string().min(3).optional(),
  categoria: z.enum(['Recolección', 'Exploración', 'Captura', 'Escolta', 'Caza']).optional(),
  rango:     z.enum(['D', 'C', 'B', 'A', 'S']).optional(),
  completed: z.boolean().optional(),
  image_url: z.string().url().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Se requiere al menos un campo para actualizar',
});

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/misiones/:id — actualiza campos parcialmente
export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const result = patchSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const fields = result.data;
    const keys = Object.keys(fields) as (keyof typeof fields)[];

    // FIX #2: Los nombres de columna en PostgreSQL usan snake_case.
    // image_url ya coincide; el resto de campos también. Sin cambios necesarios.
    const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => fields[k]);

    const [updated] = await query(
      `UPDATE misiones SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (!updated) {
      return NextResponse.json({ error: 'Misión no encontrada' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/misiones/:id error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/misiones/:id — elimina la misión
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const result = await query(
      'DELETE FROM misiones WHERE id = $1 RETURNING id', [id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Misión no encontrada' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/misiones/:id error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
