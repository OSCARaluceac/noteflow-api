import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'NoteFlow API',
    version: '1.0.0',
    description: 'API REST para la app NoteFlow. Gestiona notas, listas e ideas con autenticación JWT.',
  },
  servers: [
    { url: 'https://noteflow-api-y6uh.vercel.app/api', description: 'Producción' },
    { url: 'http://localhost:3000/api', description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en POST /auth/login',
      },
    },
    schemas: {
      Note: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          type: { type: 'string', enum: ['note', 'checklist', 'idea'] },
          content: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true },
          items: { type: 'array', items: { $ref: '#/components/schemas/ChecklistItem' } },
          tags: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ChecklistItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          note_id: { type: 'string', format: 'uuid' },
          text: { type: 'string' },
          is_completed: { type: 'boolean' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', minLength: 3, example: 'aventurero' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } },
          },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Usuario ya existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'aventurero' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login correcto — devuelve token JWT',
            content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } },
          },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notes': {
      get: {
        tags: ['Notas'],
        summary: 'Obtener todas las notas',
        description: 'Devuelve todas las notas con sus checklist items (LEFT JOIN).',
        responses: {
          200: { description: 'Array de notas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Note' } } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Notas'],
        summary: 'Crear nota',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'type'],
                properties: {
                  title: { type: 'string', minLength: 3, example: 'Mi nota' },
                  type: { type: 'string', enum: ['note', 'checklist', 'idea'], example: 'note' },
                  content: { type: 'string', example: 'Contenido de la nota' },
                  color: { type: 'string', example: '#c5a028' },
                  items: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' } } }, example: [{ text: 'Tarea 1' }] },
                  tags: { type: 'array', items: { type: 'string' }, example: ['urgente'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Nota creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notes/{id}': {
      get: {
        tags: ['Notas'],
        summary: 'Obtener nota por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Nota con items', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'No encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      patch: {
        tags: ['Notas'],
        summary: 'Actualizar nota',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  color: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Nota actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'No encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Notas'],
        summary: 'Eliminar nota',
        description: 'Elimina la nota y sus items (ON DELETE CASCADE).',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          204: { description: 'Eliminada — sin body' },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'No encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notes/{id}/checklist-items': {
      get: {
        tags: ['Checklist Items'],
        summary: 'Items de una lista',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Array de items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ChecklistItem' } } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Checklist Items'],
        summary: 'Añadir item',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['text'], properties: { text: { type: 'string', example: 'Nueva tarea' } } },
            },
          },
        },
        responses: {
          201: { description: 'Item creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistItem' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/checklist-items/{itemId}': {
      patch: {
        tags: ['Checklist Items'],
        summary: 'Marcar/desmarcar item',
        parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['is_completed'], properties: { is_completed: { type: 'boolean', example: true } } },
            },
          },
        },
        responses: {
          200: { description: 'Item actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistItem' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Checklist Items'],
        summary: 'Eliminar item',
        parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          204: { description: 'Eliminado — sin body' },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
