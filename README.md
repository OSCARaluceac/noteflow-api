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

Editar `.env.local` y añadir las variables necesarias:

```
DATABASE_URL=postgres://user:password@ep-xxx.eu-central-1.aws.neon.tech/noteflow?sslmode=require
JWT_SECRET=una-clave-secreta-larga-y-aleatoria
```

### 3. Crear las tablas en Neon

Ir a la consola SQL de Neon (console.neon.tech) y ejecutar en orden:

1. `sql/schema.sql` — tablas de notas y checklist items
2. `sql/users.sql` — tabla de usuarios para autenticación

### 4. Arrancar el servidor de desarrollo

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

---

## Endpoints

### Autenticación (públicos)

| Método | Ruta                 | Body                   | Respuesta               |
|--------|----------------------|------------------------|-------------------------|
| `POST` | `/api/auth/register` | `{username, password}` | `201` `{message, user}` |
| `POST` | `/api/auth/login`    | `{username, password}` | `200` `{token, user}`   |

El login devuelve un token JWT que hay que incluir en todas las peticiones protegidas:

```
Authorization: Bearer <token>
```

**Restricciones:** `username` mínimo 3 caracteres, `password` mínimo 6 caracteres.

---

### Notas (requieren Authorization)

| Método   | Ruta             | Body                                             | Respuesta              |
|----------|------------------|--------------------------------------------------|------------------------|
| `GET`    | `/api/notes`     | —                                                | `200` Array de notas   |
| `POST`   | `/api/notes`     | `{title, type, content?, color?, items?, tags?}` | `201` Nota creada      |
| `GET`    | `/api/notes/:id` | —                                                | `200` Nota con items   |
| `PATCH`  | `/api/notes/:id` | `{title?, content?, color?, tags?}`              | `200` Nota actualizada |
| `DELETE` | `/api/notes/:id` | —                                                | `204` Sin contenido    |

**Body de creación — nota:**
```json
{ "title": "Mi primera nota", "type": "note", "content": "Contenido opcional" }
```

**Body de creación — checklist:**
```json
{
  "title": "Lista de la compra",
  "type": "checklist",
  "items": [{ "text": "Leche" }, { "text": "Pan" }]
}
```

**Body de creación — idea:**
```json
{ "title": "Mi idea", "type": "idea", "color": "#c5a028", "tags": ["urgente"] }
```

---

### Checklist items (requieren Authorization)

| Método   | Ruta                             | Body                   | Respuesta              |
|----------|----------------------------------|------------------------|------------------------|
| `GET`    | `/api/notes/:id/checklist-items` | —                      | `200` Array de items   |
| `POST`   | `/api/notes/:id/checklist-items` | `{text}`               | `201` Item creado      |
| `PATCH`  | `/api/checklist-items/:itemId`   | `{is_completed: bool}` | `200` Item actualizado |
| `DELETE` | `/api/checklist-items/:itemId`   | —                      | `204` Sin contenido    |

---

### Códigos de error

Todos los errores devuelven JSON con la forma `{ "error": "mensaje" }`:

| Código | Cuándo                                   |
|--------|------------------------------------------|
| `400`  | Body inválido o campos que no pasan Zod  |
| `401`  | Token ausente, inválido o expirado       |
| `404`  | El recurso con ese id no existe en la BD |
| `500`  | Error interno — consultar los logs       |

---

## Variables de entorno

| Variable       | Descripción                            | Requerida |
|----------------|----------------------------------------|-----------|
| `DATABASE_URL` | Connection string de PostgreSQL (Neon) | Sí        |
| `JWT_SECRET`   | Clave secreta para firmar tokens JWT   | Sí        |

---

## Despliegue en Vercel

Conectar el repositorio desde vercel.com → New Project y añadir en Settings → Environment Variables:

- `DATABASE_URL`
- `JWT_SECRET`

Vercel despliega automáticamente en cada push a `main`.

---

## Estructura del proyecto

```
noteflow-api/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts            # POST /api/auth/login
│   │   │   └── register/route.ts         # POST /api/auth/register
│   │   ├── notes/
│   │   │   ├── route.ts                  # GET /api/notes, POST /api/notes
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET/PATCH/DELETE /api/notes/:id
│   │   │       └── checklist-items/
│   │   │           └── route.ts          # GET/POST /api/notes/:id/checklist-items
│   │   └── checklist-items/
│   │       └── [itemId]/
│   │           └── route.ts              # PATCH/DELETE /api/checklist-items/:itemId
│   ├── layout.tsx
│   └── page.tsx
├── docs/
│   ├── backend-teoria.md
│   └── seguridad-api.md
├── lib/
│   └── db.ts                             # Módulo de conexión a Neon
├── sql/
│   ├── schema.sql                        # DDL: tablas notes y checklist_items
│   ├── users.sql                         # DDL: tabla users para auth
│   └── queries.sql                       # Consultas de referencia con JOINs
├── middleware.ts                          # CORS + verificación JWT
├── .env.example
├── .gitignore
└── README.md
```
