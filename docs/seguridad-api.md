# Seguridad de la API

## SQL Injection

### ¿Qué es?

SQL injection ocurre cuando la entrada del usuario se concatena directamente en una consulta SQL. El atacante puede inyectar código SQL arbitrario que la base de datos ejecutará como si fuera código legítimo.

### Ejemplo vulnerable

```typescript
// ❌ NUNCA hagas esto
const title = req.body.title;
// Si el usuario envía: "'; DROP TABLE notes;--"
// La query resultante destruye la tabla entera:
// SELECT * FROM notes WHERE title = ''; DROP TABLE notes;--'
const result = await db.query("SELECT * FROM notes WHERE title = '" + title + "'");
```

Otros ejemplos de payloads maliciosos:
- `' OR '1'='1` — devuelve todas las filas ignorando el filtro
- `' UNION SELECT password FROM users;--` — extrae datos de otras tablas
- `'; UPDATE notes SET content = 'pwned';--` — modifica todos los registros

### Solución: consultas parametrizadas

Las consultas parametrizadas envían la **estructura SQL** y los **valores por separado**. La base de datos precompila el SQL y trata los parámetros estrictamente como datos, nunca como código.

```typescript
// ✅ Siempre usa parámetros con $1, $2, etc.
const result = await query(
  'SELECT * FROM notes WHERE title = $1',
  [req.body.title]  // el valor va separado, nunca concatenado
);
```

Con consultas parametrizadas, si el usuario envía `"'; DROP TABLE notes;--"`, PostgreSQL lo trata literalmente como una cadena de texto. La tabla no corre ningún peligro.

**En esta API**, toda interacción con la base de datos usa `lib/db.ts` que obliga a pasar los parámetros por separado. No existe ninguna concatenación de strings SQL en el codebase.

---

## Variables de entorno

### ¿Qué son?

Las variables de entorno son pares clave-valor que el sistema operativo (o la plataforma de despliegue) inyecta en el proceso de la aplicación en tiempo de ejecución. No forman parte del código fuente.

### Por qué el connection string nunca va en el código

Si el connection string apareciera hardcodeado en el código:

```typescript
// ❌ NUNCA hardcodees credenciales
const sql = neon('postgres://admin:miPassword123@my-db.neon.tech/noteflow');
```

...entonces cualquiera con acceso al repositorio (incluido acceso futuro si el repo se hace público) tendría acceso completo a la base de datos en producción.

### El patrón correcto

```
.env.local        → solo en tu máquina local (en .gitignore)
.env.example      → plantilla sin valores reales (se sube al repo)
Vercel dashboard  → variables de entorno en producción (no en el repo)
```

```typescript
// ✅ La variable viene del entorno, no del código
const sql = neon(process.env.DATABASE_URL!);
```

### .gitignore — primera línea de defensa

El archivo `.gitignore` le indica a Git qué archivos ignorar. Nunca debe faltar:

```
.env.local
.env.*.local
```

**Regla práctica**: crea el `.gitignore` **antes** del primer `git add`. Un secreto que llega al historial de Git queda expuesto para siempre, incluso si después se borra el archivo.

---

## Errores de base de datos — nunca al cliente

```typescript
// ❌ Expone información interna
} catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
  // → "relation 'notes' does not exist" revela la estructura de la BD
  // → "duplicate key value violates unique constraint" revela el esquema
}

// ✅ Mensaje genérico siempre
} catch {
  return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
}
```

Los errores reales se registran en los logs del servidor (Vercel logs, consola local), donde solo tienen acceso los desarrolladores.
