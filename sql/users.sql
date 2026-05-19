-- Tabla de usuarios para autenticación
-- Ejecutar en la consola SQL de Neon
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(64)  NOT NULL,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);
