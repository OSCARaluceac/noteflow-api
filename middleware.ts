import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request: NextRequest) {
  // Responder al preflight OPTIONS directamente desde el middleware.
  // El navegador manda este request antes de cualquier fetch cross-origin.
  // Si no recibe 200/204 con los headers correctos, bloquea la petición real.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // Para el resto de peticiones, dejar pasar y añadir los headers CORS
  // a la respuesta para que el navegador la acepte.
  const response = NextResponse.next();
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Solo aplicar el middleware a rutas /api/*
export const config = {
  matcher: '/api/:path*',
};
