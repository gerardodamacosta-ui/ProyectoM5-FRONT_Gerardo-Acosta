// script de semilla: puebla products/{productId} en Firestore usando el Admin SDK
// (no el SDK de cliente — este script corre en Node, con permisos totales vía service account)
// se ejecuta a mano con: npm run seed
import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
// import relativo (no @): este script corre con tsx fuera de src, sin el alias de Vite/tsconfig.app
import { COLLECTIONS } from '../src/config/constants'

// credencial del Admin SDK — descargada de la consola de Firebase, nunca al repo (ver .gitignore)
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf-8'))

const app = initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)

// forma del producto tal como se escribe en Firestore (sin id: lo asigna el doc)
interface SeedProduct {
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  stock: number
}

// 18 productos de ejemplo, 3 por categoría, con precios/stock variados para que
// filtro y búsqueda tengan datos reales sobre los que trabajar
const PRODUCTS: SeedProduct[] = [
  // Notebooks
  {
    name: 'Notebook Aria 14" i5',
    description: 'Notebook liviana de 14 pulgadas, procesador i5, 8GB RAM, 256GB SSD.',
    price: 850000,
    category: 'Notebooks',
    imageUrl: 'https://picsum.photos/seed/notebook-aria/600/600',
    stock: 12,
  },
  {
    name: 'Notebook Vector Pro 15" i7',
    description: 'Notebook de alto rendimiento, i7, 16GB RAM, 512GB SSD, placa dedicada.',
    price: 1450000,
    category: 'Notebooks',
    imageUrl: 'https://picsum.photos/seed/notebook-vector/600/600',
    stock: 5,
  },
  {
    name: 'Notebook Basic 11" Celeron',
    description: 'Notebook económica para tareas livianas, 4GB RAM, 128GB eMMC.',
    price: 320000,
    category: 'Notebooks',
    imageUrl: 'https://picsum.photos/seed/notebook-basic/600/600',
    stock: 20,
  },
  // Celulares
  {
    name: 'Celular Nova X 128GB',
    description: 'Pantalla AMOLED 6.5", triple cámara, batería de 5000mAh.',
    price: 480000,
    category: 'Celulares',
    imageUrl: 'https://picsum.photos/seed/celular-nova/600/600',
    stock: 25,
  },
  {
    name: 'Celular Nova X Plus 256GB',
    description: 'Versión con más almacenamiento y carga rápida de 65W.',
    price: 620000,
    category: 'Celulares',
    imageUrl: 'https://picsum.photos/seed/celular-nova-plus/600/600',
    stock: 15,
  },
  {
    name: 'Celular Lite S 64GB',
    description: 'Gama de entrada, pantalla 6.1", cámara dual, ideal para uso diario.',
    price: 210000,
    category: 'Celulares',
    imageUrl: 'https://picsum.photos/seed/celular-lite/600/600',
    stock: 30,
  },
  // Accesorios
  {
    name: 'Mochila Urban 15.6"',
    description: 'Mochila acolchada para notebook, resistente al agua, USB externo.',
    price: 45000,
    category: 'Accesorios',
    imageUrl: 'https://picsum.photos/seed/mochila-urban/600/600',
    stock: 40,
  },
  {
    name: 'Funda Silicona Celular',
    description: 'Funda antigolpes de silicona, varios colores disponibles.',
    price: 8500,
    category: 'Accesorios',
    imageUrl: 'https://picsum.photos/seed/funda-silicona/600/600',
    stock: 100,
  },
  {
    name: 'Cargador Rápido 65W USB-C',
    description: 'Cargador universal con carga rápida, compatible notebook y celular.',
    price: 22000,
    category: 'Accesorios',
    imageUrl: 'https://picsum.photos/seed/cargador-65w/600/600',
    stock: 60,
  },
  // Audio
  {
    name: 'Auriculares Bluetooth Pulse',
    description: 'Auriculares in-ear con cancelación de ruido activa, 24h de batería.',
    price: 95000,
    category: 'Audio',
    imageUrl: 'https://picsum.photos/seed/auriculares-pulse/600/600',
    stock: 35,
  },
  {
    name: 'Parlante Portátil Boom 20W',
    description: 'Parlante Bluetooth resistente al agua (IPX7), 12h de autonomía.',
    price: 78000,
    category: 'Audio',
    imageUrl: 'https://picsum.photos/seed/parlante-boom/600/600',
    stock: 18,
  },
  {
    name: 'Auriculares Gamer Surround',
    description: 'Auriculares con micrófono desmontable y sonido envolvente 7.1.',
    price: 65000,
    category: 'Audio',
    imageUrl: 'https://picsum.photos/seed/auriculares-gamer/600/600',
    stock: 22,
  },
  // Gaming
  {
    name: 'Mouse Gamer Raptor RGB',
    description: 'Mouse óptico 16000 DPI, iluminación RGB personalizable.',
    price: 38000,
    category: 'Gaming',
    imageUrl: 'https://picsum.photos/seed/mouse-raptor/600/600',
    stock: 28,
  },
  {
    name: 'Teclado Mecánico Strike TKL',
    description: 'Teclado mecánico switches rojos, formato TKL, retroiluminado.',
    price: 72000,
    category: 'Gaming',
    imageUrl: 'https://picsum.photos/seed/teclado-strike/600/600',
    stock: 14,
  },
  {
    name: 'Silla Gamer Comfort Pro',
    description: 'Silla ergonómica reclinable, apoyabrazos ajustables, hasta 120kg.',
    price: 280000,
    category: 'Gaming',
    imageUrl: 'https://picsum.photos/seed/silla-comfort/600/600',
    stock: 7,
  },
  // Componentes
  {
    name: 'Memoria RAM 16GB DDR4',
    description: 'Módulo de memoria 16GB DDR4 3200MHz para escritorio.',
    price: 55000,
    category: 'Componentes',
    imageUrl: 'https://picsum.photos/seed/ram-16gb/600/600',
    stock: 33,
  },
  {
    name: 'SSD NVMe 1TB',
    description: 'Unidad de estado sólido NVMe, velocidad de lectura hasta 3500MB/s.',
    price: 89000,
    category: 'Componentes',
    imageUrl: 'https://picsum.photos/seed/ssd-nvme/600/600',
    stock: 24,
  },
  {
    name: 'Fuente de Alimentación 650W 80+',
    description: 'Fuente certificada 80+ Bronze, 650W, modular.',
    price: 68000,
    category: 'Componentes',
    imageUrl: 'https://picsum.photos/seed/fuente-650w/600/600',
    stock: 16,
  },
]

// crea cada doc en products/{autoId} con createdAt en ISO (mismo criterio que users)
async function seed() {
  const now = new Date().toISOString()
  const batch = db.batch()

  for (const product of PRODUCTS) {
    const ref = db.collection(COLLECTIONS.products).doc()
    batch.set(ref, { ...product, createdAt: now })
  }

  await batch.commit()
  console.log(`Semilla completa: ${PRODUCTS.length} productos creados en Firestore.`)
}

seed().catch((error: unknown) => {
  console.error('Error al sembrar productos:', error)
  process.exit(1)
})
