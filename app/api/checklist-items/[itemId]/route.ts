import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  is_completed: z.boolean(),
});

type Params = { params: Promise<{ itemId: string }> };

// PATCH /api/checklist-items/:itemId — marca o desmarca un item
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const [item] = await query(
      'UPDATE checklist_items SET is_completed = $2 WHERE id = $1 RETURNING *',
      [itemId, result.data.is_completed]
    );

    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE /api/checklist-items/:itemId — elimina un item concreto
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { itemId } = await params;
    const result = await query(
      'DELETE FROM checklist_items WHERE id = $1 RETURNING id',
      [itemId]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
