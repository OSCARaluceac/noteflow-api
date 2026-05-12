-- ============================================================
-- NOTEFLOW — Schema SQL
-- Ejecutar en la consola SQL de Neon para crear las tablas.
-- ============================================================

-- Tabla principal de notas.
-- Almacena los tres tipos: 'note', 'checklist', 'idea'.
-- Se usa UUID en lugar de INTEGER autoincremental porque el cliente
-- puede generar el ID antes de conectarse a la red (soporte offline futuro).
CREATE TABLE notes (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  type       VARCHAR(50)  NOT NULL CHECK (type IN ('note', 'checklist', 'idea')),
  color      VARCHAR(7),
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Items individuales de una nota tipo checklist.
-- ON DELETE CASCADE: al borrar una nota, sus items se eliminan automáticamente.
-- La clave foránea note_id garantiza integridad referencial.
CREATE TABLE checklist_items (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id      UUID         NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  text         VARCHAR(255) NOT NULL,
  is_completed BOOLEAN      DEFAULT FALSE
);

-- Tags (etiquetas) asociadas a una nota, principalmente para notas tipo 'idea'.
-- También usa ON DELETE CASCADE para consistencia.
CREATE TABLE note_tags (
  id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID         NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag     VARCHAR(100) NOT NULL
);
