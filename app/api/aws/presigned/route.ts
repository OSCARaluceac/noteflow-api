import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Inicialización del cliente S3 con tus credenciales locales
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Faltan parámetros de archivo" }, { status: 400 });
    }

    // Preparar la orden de subida
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    // Generar la URL temporal (válida por 60 segundos)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    // Calcular la URL pública definitiva donde residirá tu imagen
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({ signedUrl, publicUrl }, { status: 200 });

  } catch (error) {
    console.error("Fallo en la firma S3:", error);
    return NextResponse.json({ error: "No se pudo generar la autorización S3" }, { status: 500 });
  }
}