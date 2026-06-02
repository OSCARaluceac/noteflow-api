import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Inicialización de la conexión de alta seguridad con AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, fileType } = body;

    // Validación de integridad de los datos de entrada
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Faltan datos del archivo' }, { status: 400 });
    }

    // Generación de un identificador único para evitar colisiones en tu bucket
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // Emisión de la URL firmada (caducidad estricta: 60 segundos)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // Construcción de la URL de acceso público persistente
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    return NextResponse.json({ signedUrl, publicUrl }, { status: 200 });

  } catch (error) {
    console.error('Error en la comunicación con AWS S3:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}