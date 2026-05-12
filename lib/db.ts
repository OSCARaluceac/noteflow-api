import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function query<T = unknown>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  // Forzamos a TypeScript a entender que estamos usando la función de consulta estándar
  const result = await (sql as any)(text, params);
  return result as T[];
}