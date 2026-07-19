import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { DocumentSnapshot } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { COLLECTIONS } from '@/config/constants'
import { handleServiceError } from '@/shared/utils/handleServiceError'
import type { LoginFormData, RegisterFormData } from '@/modules/auth/types/auth.types'
import type { User, UserRole } from '@/modules/auth/types/user.types'

// mapeo de códigos de Firebase Auth a mensajes legibles en español
// (nunca se muestra el código crudo tipo "auth/wrong-password" al usuario final)
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Ese email ya está registrado. Probá iniciar sesión.',
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/weak-password': 'La contraseña es muy débil: usá al menos 6 caracteres.',
  // los 3 códigos de credenciales inválidas comparten mensaje: no conviene revelar
  // si el email existe o no (buena práctica de seguridad)
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Esperá unos minutos y probá de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet y probá de nuevo.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar. Probá de nuevo.',
  'auth/cancelled-popup-request': 'Se canceló la ventana de Google. Probá de nuevo.',
}

// traduce un error de Firebase a español; undefined si no hay mapeo (usa el genérico de handleServiceError)
function mapAuthError(error: unknown): string | undefined {
  return error instanceof FirebaseError ? AUTH_ERROR_MESSAGES[error.code] : undefined
}

// mapeo de datos: doc crudo de Firestore → tipo User del dominio (Firestore no tipa nada)
function mapToUser(snapshot: DocumentSnapshot): User {
  const data = snapshot.data() ?? {}
  return {
    uid: snapshot.id,
    email: (data.email as string) ?? '',
    displayName: (data.displayName as string) ?? '',
    role: (data.role as UserRole) ?? 'customer',
    photoURL: data.photoURL as string | undefined,
    createdAt: (data.createdAt as string) ?? '',
  }
}

// referencia al doc de perfil en users/{uid}
function userDocRef(uid: string) {
  return doc(db, COLLECTIONS.users, uid)
}

// lee el doc de users/{uid}; null si no existe (lo usa el listener de sesión del AuthContext)
export async function getUserDoc(uid: string): Promise<User | null> {
  try {
    const snapshot = await getDoc(userDocRef(uid))
    return snapshot.exists() ? mapToUser(snapshot) : null
  } catch (error) {
    handleServiceError(error, 'auth.getUserDoc', mapAuthError(error))
  }
}

// busca el perfil en users/{uid}; si no existe (primer ingreso) lo crea con role 'customer'
// si ya existe se respeta tal cual (ej. role cambiado a 'admin' a mano en la consola de Firestore)
async function getOrCreateUserDoc(firebaseUser: FirebaseUser): Promise<User> {
  const snapshot = await getDoc(userDocRef(firebaseUser.uid))
  if (snapshot.exists()) return mapToUser(snapshot)

  // primer ingreso: se crea el perfil con los datos que expone Firebase Auth
  const newUser: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    role: 'customer', // default de todo usuario nuevo (admin se asigna a mano, no hay UI de roles)
    createdAt: new Date().toISOString(),
  }
  // photoURL solo si existe (Firestore no acepta campos undefined)
  if (firebaseUser.photoURL) newUser.photoURL = firebaseUser.photoURL

  await setDoc(userDocRef(firebaseUser.uid), newUser)
  return newUser
}

// registro con email/password: crea la cuenta en Auth y el perfil en users/{uid}
export async function registerWithEmail(formData: RegisterFormData): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    // guarda el nombre también en el perfil de Firebase Auth (no solo en Firestore)
    await updateProfile(credential.user, { displayName: formData.displayName })

    // crea el doc de perfil con role 'customer' por default
    const newUser: User = {
      uid: credential.user.uid,
      email: formData.email,
      displayName: formData.displayName,
      role: 'customer',
      createdAt: new Date().toISOString(),
    }
    await setDoc(userDocRef(credential.user.uid), newUser)
    return newUser
  } catch (error) {
    handleServiceError(error, 'auth.registerWithEmail', mapAuthError(error))
  }
}

// login con email/password: autentica y trae el perfil de users/{uid}
export async function loginWithEmail(formData: LoginFormData): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
    // getOrCreate por robustez: si el doc faltara (caso anómalo) se regenera con defaults
    return await getOrCreateUserDoc(credential.user)
  } catch (error) {
    handleServiceError(error, 'auth.loginWithEmail', mapAuthError(error))
  }
}

// login con Google (popup): puede ser primer ingreso o no — getOrCreateUserDoc resuelve ambos casos
export async function loginWithGoogle(): Promise<User> {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    return await getOrCreateUserDoc(credential.user)
  } catch (error) {
    handleServiceError(error, 'auth.loginWithGoogle', mapAuthError(error))
  }
}

// cierra la sesión en Firebase (el listener del AuthContext actualiza el estado global)
export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    handleServiceError(error, 'auth.logout', mapAuthError(error))
  }
}
