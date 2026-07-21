import { auth } from '@/config/firebase'
import { AppError } from '@/shared/types/error.types'

interface UploadUrlResponse {
  uploadUrl: string
  publicUrl: string
}

// pide al BFF (api/s3/presigned-url) una URL prefirmada para subir una imagen de producto
export async function getUploadUrl(fileType: string): Promise<UploadUrlResponse> {
  const idToken = await auth.currentUser?.getIdToken()
  if (!idToken) throw new AppError('Debés estar logueado para subir imágenes.', 'admin.uploadApi.getUploadUrl')

  const response = await fetch('/api/s3/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fileType }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new AppError(
      body?.error ?? 'No se pudo generar la URL de subida.',
      'admin.uploadApi.getUploadUrl'
    )
  }

  // cast explícito: Response.json() tipa Promise<any> en lib.dom — nunca se deja pasar
  // el any implícito, se declara la forma esperada acá mismo (misma regla que any prohibido)
  return (await response.json()) as UploadUrlResponse
}

// sube el archivo directo a S3 con la URL prefirmada — no pasa por nuestro servidor
export async function uploadImageToS3(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) {
    throw new AppError('No se pudo subir la imagen a S3.', 'admin.uploadApi.uploadImageToS3')
  }
}
