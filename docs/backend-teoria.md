# Backend — Teoría

## Patrón cliente-servidor

Una app móvil nunca debe conectarse directamente a una base de datos. Si el connection string de PostgreSQL estuviese embebido en el binario de la app, cualquiera que descompile el APK tendría acceso completo a la base de datos.

El patrón es **cliente-servidor**:

```
App móvil (cliente)  →  API REST (servidor)  →  PostgreSQL (base de datos)
```

Cada capa tiene una responsabilidad única:
- **Cliente**: muestra datos y envía peticiones HTTP
- **API**: valida los datos, comprueba permisos y ejecuta consultas
- **Base de datos**: almacena y devuelve datos de forma eficiente

La API actúa como guardián: el cliente nunca sabe cómo está organizada la base de datos.

---

## ¿Qué es una API REST?

REST (Representational State Transfer) es un estilo de arquitectura para construir APIs sobre HTTP. Sus reglas principales:

- **Sin estado**: cada petición contiene toda la información necesaria; el servidor no recuerda peticiones anteriores.
- **Recursos**: los datos se organizan como recursos identificados por URLs (`/api/notes`, `/api/notes/123`).
- **Verbos HTTP**: las operaciones se expresan con los métodos del protocolo HTTP.

---

## Métodos HTTP

| Método   | Operación CRUD | Uso en esta API                          |
|----------|----------------|------------------------------------------|
| `GET`    | Read           | Leer notas o items                       |
| `POST`   | Create         | Crear una nota o un item                 |
| `PATCH`  | Update parcial | Actualizar solo algunos campos de una nota |
| `DELETE` | Delete         | Eliminar una nota o un item              |

`PATCH` vs `PUT`: `PUT` reemplaza el recurso completo; `PATCH` actualiza solo los campos enviados. En esta API usamos `PATCH` porque el cliente no siempre conoce todos los campos de una nota.

---

## Códigos de estado HTTP

| Código | Significado        | Cuándo se usa en esta API                            |
|--------|--------------------|------------------------------------------------------|
| 200    | OK                 | GET y PATCH exitosos                                 |
| 201    | Created            | POST exitoso: recurso creado                         |
| 204    | No Content         | DELETE exitoso: sin cuerpo de respuesta              |
| 400    | Bad Request        | Body inválido o validación de Zod fallida            |
| 401    | Unauthorized       | Token ausente, inválido o expirado                   |
| 404    | Not Found          | El recurso solicitado no existe en la BD             |
| 500    | Internal Server Error | Error inesperado — nunca revelamos el error real |

---

## ACID — propiedades de las transacciones

Las bases de datos relacionales garantizan **ACID**:

- **Atomicidad**: la operación completa o no ocurre nada. Si al insertar una nota el segundo INSERT (items) falla, la nota no queda huérfana.
- **Consistencia**: los datos siempre cumplen las reglas definidas (CHECK, NOT NULL, FK).
- **Aislamiento**: las operaciones concurrentes no se interfieren entre sí.
- **Durabilidad**: una vez confirmada, la operación persiste aunque el servidor se reinicie.

---

## Primary Key vs Foreign Key

**Primary Key** (`id UUID PRIMARY KEY`): identifica de forma única cada fila de una tabla. No puede repetirse ni ser nula.

**¿Por qué UUID y no INTEGER?** Con UUID, el cliente puede generar el ID antes de conectarse a la red (soporte offline futuro). Con un entero autoincremental, el servidor asigna el ID y el cliente tiene que esperar la respuesta antes de saber qué ID tiene la nota.

**Foreign Key** (`note_id UUID REFERENCES notes(id)`): columna que apunta a la primary key de otra tabla. Garantiza que no puedes crear un checklist item sin una nota que lo contenga.

**ON DELETE CASCADE**: cuando se borra una nota, PostgreSQL elimina automáticamente todos sus checklist items y tags asociados. Sin esta cláusula quedarían filas huérfanas.

---

## DDL vs DML

**DDL** (Data Definition Language): define la estructura.
```sql
CREATE TABLE notes (...);
ALTER TABLE notes ADD COLUMN ...;
DROP TABLE notes;
```

**DML** (Data Manipulation Language): manipula los datos.
```sql
SELECT * FROM notes;
INSERT INTO notes (...) VALUES (...);
UPDATE notes SET title = $1 WHERE id = $2;
DELETE FROM notes WHERE id = $1;
```

---

## Diagrama entidad-relación

```
notes
├── id          UUID  PK
├── title       VARCHAR(255)
├── content     TEXT
├── type        VARCHAR(50)   CHECK('note','checklist','idea')
├── color       VARCHAR(7)
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ
        │
        │ 1 ──── N
        ▼
checklist_items
├── id           UUID  PK
├── note_id      UUID  FK → notes.id  (ON DELETE CASCADE)
├── text         VARCHAR(255)
└── is_completed BOOLEAN

users
├── id            UUID  PK
├── username      VARCHAR(50)  UNIQUE
├── password_hash VARCHAR(64)
└── created_at    TIMESTAMPTZ
```

---

## JOINs

### INNER JOIN
Devuelve solo las filas que tienen coincidencia en **ambas** tablas.

```sql
-- Solo devuelve notas que tengan AL MENOS un item.
-- Las notas de tipo 'text' o 'idea' desaparecerían.
SELECT n.*, ci.text
FROM notes n
INNER JOIN checklist_items ci ON n.id = ci.note_id;
```

### LEFT JOIN
Devuelve **todas** las filas de la tabla izquierda, y las coincidentes de la derecha. Si no hay coincidencia, las columnas de la derecha son NULL.

```sql
-- Devuelve TODAS las notas. Si no tienen items, items = NULL.
SELECT n.*, ci.text
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id;
```

**Cuándo usar cada uno:**
- `LEFT JOIN`: cuando el recurso principal puede existir sin el recurso secundario (nota sin items).
- `INNER JOIN`: cuando solo te interesan los registros que tienen la relación (usuarios con al menos un pedido).

---

## Autenticación con JWT

### Por qué necesitamos autenticación

Sin autenticación, cualquiera que conozca la URL de la API puede leer, crear o borrar notas de cualquier usuario. La autenticación garantiza que cada petición proviene de un usuario legítimo y permite devolver solo sus propios datos.

### Flujo completo

```
1. POST /api/auth/register  →  se crea el usuario con password hasheado
2. POST /api/auth/login     →  se verifica el password y se devuelve un JWT
3. GET  /api/notes          →  el cliente envía el JWT en el header
4. middleware.ts            →  verifica el JWT antes de llegar al route handler
5. Route handler            →  ejecuta la query y devuelve los datos
```

### Hashing de contraseñas

Las contraseñas nunca se guardan en texto plano. Se aplica SHA-256 (via Web Crypto API, sin dependencias externas) y se guarda el hash resultante. En el login se hashea la contraseña recibida y se compara con el hash almacenado.

```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### JWT — JSON Web Token

Un JWT tiene tres partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9          ← header (algoritmo, tipo)
.eyJzdWIiOiJ1c2VyLWlkIn0      ← payload (datos: id, username, expiración)
.SflKxwRJSMeKKF2QT4fwpMeJf    ← firma HMAC-SHA256
```

Las dos primeras partes son solo base64 (legibles, no cifradas). La firma garantiza que nadie puede modificar el payload sin que el servidor lo detecte. Si alguien cambia el payload, la firma deja de ser válida.

El token expira a los 7 días (`exp` en el payload). Si el cliente envía un token expirado, el middleware devuelve 401.

### Middleware

El middleware de Next.js se ejecuta **antes** de que llegue la petición al Route Handler. En este proyecto:

```typescript
// Rutas públicas: no requieren token
if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

// Rutas protegidas: verificar JWT
const token = request.headers.get('Authorization')?.slice(7);
if (!token || !(await verifyJWT(token))) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
```

El cliente incluye el token en cada petición:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Almacenamiento del token en el cliente

El token se guarda en `localStorage` (web). Sobrevive a recargas de página pero se borra si el usuario hace logout o limpia el almacenamiento del navegador. En producción móvil real se usaría `expo-secure-store`, que cifra el token en el keychain del dispositivo.
