import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Respuesta de prueba inmediata para ver si el servidor responde
  return NextResponse.json({ debug: "Estoy vivo y soy la versión correcta" }, { status: 200 });
}