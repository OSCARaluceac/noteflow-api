# noteflow-api

API REST para la app móvil NoteFlow. Construida con Next.js App Router y PostgreSQL en Neon. Actúa como capa intermedia entre la app móvil y la base de datos: valida los datos entrantes, ejecuta las consultas de forma segura y devuelve respuestas JSON tipadas.

## Stack

- **Next.js 15** — App Router con Route Handlers
- **PostgreSQL** (Neon) — base de datos relacional serverless
- **Zod** — validación de esquemas en los endpoints
- **TypeScript** — tipado estático en todo el codebase

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/noteflow-api.git
cd noteflow-api
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` y añadir el connection string de Neon:

```
DATABASE_URL=postgres://user:password@ep-xxx.eu-central-1.aws.neon.tech/noteflow?sslmode=require
```

### 3. Crear las tablas en Neon

Ir a la consola SQL de Neon (console.neon.tech) y ejecutar el contenido de `sql/schema.sql`.

### 4. Arrancar el servidor de desarrollo

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

---

## Endpoints

### Notas

| Método   | Ruta             | Body                                  | Respuesta               |
|----------|------------------|---------------------------------------|-------------------------|
| `GET`    | `/api/notes`     | —                                     | `200` Array de notas    |
| `POST`   | `/api/notes`     | `{title, type, content?, color?, items?, tags?}` | `201` Nota creada |
| `GET`    | `/api/notes/:id` | —                                     | `200` Nota con items y tags |
| `PATCH`  | `/api/notes/:id` | `{title?, content?, color?}`          | `200` Nota actualizada  |
| `DELETE` | `/api/notes/:id` | —                                     | `204` Sin contenido     |

**Body de creación (POST /api/notes):**
```json
{
  "title": "Mi primera nota",
  "type": "note",
  "content": "Contenido opcional"
}
```

**Body de creación de checklist:**
```json
{
  "title": "Lista de la compra",
  "type": "checklist",
  "items": [
    { "text": "Leche" },
    { "text": "Pan" }
  ]
}
```

### Checklist items

| Método   | Ruta                               | Body                    | Respuesta              |
|----------|------------------------------------|-------------------------|------------------------|
| `GET`    | `/api/notes/:id/checklist-items`   | —                       | `200` Array de items   |
| `POST`   | `/api/notes/:id/checklist-items`   | `{text}`                | `201` Item creado      |
| `PATCH`  | `/api/checklist-items/:itemId`     | `{is_completed: bool}`  | `200` Item actualizado |
| `DELETE` | `/api/checklist-items/:itemId`     | —                       | `204` Sin contenido    |

### Códigos de error

Todos los errores devuelven JSON con la forma `{ "error": "mensaje" }`:

| Código | Cuándo                                      |
|--------|---------------------------------------------|
| `400`  | Body inválido o campos que no pasan Zod     |
| `404`  | El recurso con ese id no existe en la BD    |
| `500`  | Error interno — consultar los logs          |

---

## Variables de entorno

| Variable       | Descripción                                          | Requerida |
|----------------|------------------------------------------------------|-----------|
| `DATABASE_URL` | Connection string de PostgreSQL (Neon)               | Sí        |

---

## Despliegue en Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Desplegar
vercel
```

O conectar el repositorio directamente desde vercel.com → New Project.

En el panel de Vercel, añadir `DATABASE_URL` en Settings → Environment Variables antes de desplegar.

---

## Estructura del proyecto

```
noteflow-api/
├── app/
│   ├── api/
│   │   ├── notes/
│   │   │   ├── route.ts              # GET /api/notes, POST /api/notes
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET/PATCH/DELETE /api/notes/:id
│   │   │       └── checklist-items/
│   │   │           └── route.ts      # GET/POST /api/notes/:id/checklist-items
│   │   └── checklist-items/
│   │       └── [itemId]/
│   │           └── route.ts          # PATCH/DELETE /api/checklist-items/:itemId
│   ├── layout.tsx
│   └── page.tsx
├── docs/
│   ├── backend-teoria.md
│   └── seguridad-api.md
├── lib/
│   └── db.ts                         # Módulo de conexión a Neon
├── sql/
│   ├── schema.sql                    # DDL: CREATE TABLE
│   └── queries.sql                   # Consultas de referencia con JOINs
├── .env.example
├── .gitignore
└── README.md
```
