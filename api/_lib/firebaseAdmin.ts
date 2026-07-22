import { config } from 'dotenv'

config()

import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// inicializa el Admin SDK una sola vez — en serverless el módulo puede quedar
// "caliente" entre invocaciones, reinicializar tiraría error de app duplicada
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!encoded) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no está configurada')

  const serviceAccount = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
  return initializeApp({ credential: cert(serviceAccount) })
}

export const adminAuth = getAuth(getAdminApp())
export const adminDb = getFirestore(getAdminApp())
