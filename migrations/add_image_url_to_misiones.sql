-- FIX #2: Añadir columna image_url a la tabla misiones
-- Ejecutar una sola vez contra la BD Neon antes de desplegar la nueva versión del API.
-- Es idempotente: IF NOT EXISTS evita errores si se ejecuta dos veces.

ALTER TABLE misiones
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verificación opcional:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'misiones' ORDER BY ordinal_position;
