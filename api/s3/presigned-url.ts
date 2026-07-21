import type { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { adminAuth, adminDb } from '../_lib/firebaseAdmin.js'

// tipos de imagen permitidos — extensión de archivo correspondiente
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // 1. token presente y con formato correcto
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticación' })
  }

  // 2. token válido según Firebase (no según lo que diga el cliente)
  let uid: string
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length))
    uid = decoded.uid
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  // 3. rol admin, leído directo de Firestore server-side — nunca confiar en un
  // campo "role" que viniera en el body del request
  const userDoc = await adminDb.collection('users').doc(uid).get()
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' })
  }

  // 4. tipo de archivo permitido
  const { fileType } = req.body as { fileType?: string }
  const extension = fileType ? ALLOWED_TYPES[fileType] : undefined
  if (!extension) {
    return res.status(400).json({ error: 'Tipo de archivo no permitido' })
  }

  // 5. key única (no depende del nombre de archivo que mande el cliente) + URL prefirmada de corta duración
  const key = `products/${randomUUID()}.${extension}`
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
  const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return res.status(200).json({ uploadUrl, publicUrl })
}
