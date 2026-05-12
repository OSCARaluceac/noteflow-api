-- ============================================================
-- NOTEFLOW — Consultas SQL de referencia
-- ============================================================

-- Todas las notas con sus items en una sola query.
-- Los tags vienen directamente de la columna tags[] de notes (n.*).
--
-- LEFT JOIN: devuelve TODAS las notas, aunque no tengan items.
-- json_agg(): agrega las filas relacionadas en un array JSON.
-- FILTER (WHERE ... IS NOT NULL): evita que aparezca [null] cuando no hay items.
-- GROUP BY n.id: agrupa los JOINs para que cada nota sea una sola fila.
SELECT
  n.*,
  COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') AS items
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;


-- Una nota concreta con sus items.
-- Mismo patrón que arriba pero filtrando por id.
SELECT
  n.*,
  COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') AS items
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
WHERE n.id = $1
GROUP BY n.id;


-- Estadísticas rápidas: cuántos items completos vs total por nota.
SELECT
  n.id,
  n.title,
  COUNT(ci.id) AS total_items,
  COUNT(ci.id) FILTER (WHERE ci.is_completed = TRUE) AS items_completados
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
WHERE n.type = 'checklist'
GROUP BY n.id, n.title;
