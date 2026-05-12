-- ============================================================
-- NOTEFLOW — Schema SQL
-- Ejecutar en la consola SQL de Neon para crear las tablas.
-- ============================================================

-- Tabla principal de notas.
-- Almacena los tres tipos: 'note', 'checklist', 'idea'.
-- Se usa UUID en lugar de INTEGER autoincremental porque el cliente
-- puede generar el ID antes de conectarse a la red (soporte offline futuro).
-- Los tags se almacenan como array TEXT[] en la propia fila de la nota,
-- evitando la tabla separada note_tags (eliminada en esta versión).
CREATE TABLE notes (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  type       VARCHAR(50)  NOT NULL CHECK (type IN ('note', 'checklist', 'idea')),
  color      VARCHAR(7),
  tags       TEXT[]       NOT NULL DEFAULT '{}',
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

-- Script de migración (ejecutar si la BD ya existe sin la columna tags):
-- ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
-- DROP TABLE IF EXISTS note_tags;
