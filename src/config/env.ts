// lectura tipada y centralizada de import.meta.env — único punto de acceso a variables de entorno

// falla rápido y con mensaje claro si falta una variable (mejor que un undefined silencioso)
function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined
  if (!value) {
    throw new Error(`[env] Falta la variable de entorno ${key} (revisar .env)`)
  }
  return value
}

// configuración de Firebase leída desde variables VITE_* (expuestas al frontend por Vite)
export const env = {
  firebase: {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
  },
} as const
