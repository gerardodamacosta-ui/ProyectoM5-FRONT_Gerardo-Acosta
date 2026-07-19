import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { env } from './env'

// inicializa la app de Firebase con la config tipada de env.ts
const app = initializeApp(env.firebase)

// instancias únicas de Auth y Firestore — el resto de los módulos importa desde acá
export const auth = getAuth(app)
export const db = getFirestore(app)
