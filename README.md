# Patagonix Tech — E-commerce (PI-M5)

Proyecto integrador de SoyHenry (Módulo 5). Patagonix Tech es una software
factory ficticia del sector retail que encarga una plataforma de e-commerce
con dos roles de usuario:

- **Customer**: navega el catálogo, arma su carrito, compra y consulta su
  historial de órdenes.
- **Admin**: gestiona el CRUD de productos (con carga de imágenes) y el
  estado de las órdenes desde un panel propio, protegido por rol.

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite |
| Estilos | TailwindCSS v4 |
| Ruteo | React Router v7 |
| Estado global | Context API + `useReducer` (`AuthContext`, `CartContext`) |
| Backend as a Service | Firebase Authentication + Firestore |
| Storage de imágenes | AWS S3 vía presigned URLs |
| Backend serverless | Vercel Serverless Functions (única capa con credenciales AWS) |
| Testing | Vitest + React Testing Library + MSW |
| Deploy | Vercel + GitHub (CI continuo) |

## Arquitectura y decisiones

### Screaming Architecture

`src/modules/` está organizado por **dominio de negocio**, no por tipo de
archivo. La alternativa más común (layer-based: una carpeta `components/`,
otra `pages/`, otra `hooks/` a nivel raíz, mezclando todos los dominios
adentro) obliga a leer código para entender qué hace la app — con Screaming
Architecture, la estructura de carpetas sola ya "grita" que esto es un
e-commerce (`cart`, `checkout`, `orders`, `products`...) sin necesidad de
abrir un solo archivo. También escala mejor: agregar un dominio nuevo es
agregar una carpeta nueva, no tocar carpetas transversales ya existentes.

Estructura real actual:

```
src/
├── modules/
│   ├── admin/
│   │   ├── components/    # AdminCard, AdminLayout, ProductForm
│   │   ├── pages/           # AdminProductsPage, AdminProductCreatePage,
│   │   │                     # AdminProductEditPage, AdminOrdersPage
│   │   └── services/          # upload.api.ts (pide URL prefirmada al BFF)
│   ├── auth/
│   │   ├── components/    # LoginForm, RegisterForm, GoogleButton, ProtectedRoute
│   │   ├── context/          # AuthContext + authReducer
│   │   ├── hooks/               # useAuth
│   │   ├── pages/                  # LoginPage, RegisterPage
│   │   ├── services/                  # auth.api.ts
│   │   └── types/                        # user.types, auth.types
│   ├── cart/
│   │   ├── components/    # CartIcon, CartItem, CartSummary
│   │   ├── context/          # CartContext + cartReducer
│   │   ├── hooks/               # useCart (join en vivo contra products)
│   │   ├── pages/                  # CartPage
│   │   ├── services/                  # cart.api.ts
│   │   └── types/                        # cart.types
│   ├── checkout/
│   │   └── pages/            # CheckoutPage (reusa createOrder de orders.api.ts
│   │                          # directo — no tiene servicio propio, ver nota abajo)
│   ├── orders/
│   │   ├── components/    # OrderCard, OrderStatusBadge, OrderSummary
│   │   ├── hooks/               # useOrders, useOrder, useAllOrders
│   │   ├── pages/                  # OrdersPage, OrderDetailPage
│   │   ├── services/                  # orders.api.ts
│   │   └── types/                        # order.types
│   └── products/
│       ├── components/    # ProductCard, ProductGrid, CategoryFilter, SearchBar
│       ├── hooks/               # useProducts, useProduct
│       ├── pages/                  # CatalogPage, ProductDetailPage
│       ├── services/                  # products.api.ts
│       └── types/                        # product.types
├── shared/
│   ├── components/ui/     # Button, Input, Modal + states/ (Loading/Error/Empty)
│   ├── hooks/                # useAsyncState, useDebounce
│   ├── layout/                  # RootLayout (header cliente)
│   ├── types/                      # error.types (AppError)
│   └── utils/                         # formatters, normalizeText, validators,
│                                        # handleServiceError
├── config/
│   ├── firebase.ts           # inicialización de Firebase (Auth + Firestore)
│   ├── constants.ts             # PRODUCT_CATEGORIES, ORDER_STATUSES, ROUTES, etc.
│   └── env.ts                      # lectura tipada de variables de entorno
├── router/
│   └── AppRouter.tsx
└── test/
    ├── fixtures.ts            # datos mockeados reutilizables entre tests
    ├── mocks/                    # handlers/server de MSW
    ├── setup.ts                     # jest-dom + ciclo de vida de MSW
    └── renderWithProviders.tsx         # wrapper de AuthProvider + CartProvider

# Vercel Serverless Functions, fuera de src/ — única capa con credenciales AWS
api/
├── _lib/
│   └── firebaseAdmin.ts        # Admin SDK singleton (verifica tokens/rol)
└── s3/
    └── presigned-url.ts        # genera la URL prefirmada de subida

# script de semilla, fuera de src/ — corre una sola vez con el Admin SDK
scripts/
└── seed-products.ts             # popula products/ con datos de ejemplo
```

**Nota sobre `checkout/`**: no tiene `services/` propio. Crear una orden es
una sola llamada a `createOrder` (ya definida en `orders/services/orders.api.ts`,
porque una orden es un recurso de ese dominio); duplicarla en un
`checkout.api.ts` aparte solo hubiera repetido lógica sin necesidad.

### Estado global: Context API + `useReducer`

Se eligió Context API + `useReducer` (en vez de una librería externa como
Redux o Zustand) para `AuthContext` y `CartContext` porque el estado global
real del proyecto es acotado (sesión + rol, carrito) y React ya trae las
herramientas necesarias — sumar una dependencia externa para este alcance
sería complejidad sin beneficio real.

`CartContext` resuelve el carrito como `{ productId, quantity }` únicamente
(nunca precio/nombre en snapshot): `useCart` cruza esos items contra el
catálogo ya cargado (`useProducts`) para resolver precio y nombre siempre
en vivo, así un cambio de precio en el catálogo nunca deja un carrito con
datos desactualizados. Los cambios se persisten a `carts/{userId}` en
Firestore con debounce, para no escribir en cada click de "+"/"-".

### Patrón BFF (Backend for Frontend) para S3

El frontend **nunca** tiene credenciales de AWS. El flujo de subida de una
imagen de producto es:

1. El admin elige un archivo en `ProductForm`.
2. El frontend pide una URL prefirmada a `api/s3/presigned-url.ts` (la única
   función serverless con credenciales de AWS, vía variables de entorno de
   Vercel — nunca expuestas al cliente).
3. Esa función verifica, **server-side**: que el request trae un token de
   Firebase Auth válido, y que el usuario dueño de ese token tiene
   `role: 'admin'` en su doc de `users/{uid}` en Firestore. Nunca confía en
   un campo `role` que viniera en el body del request, ni en que el
   frontend oculte el botón de subida a un customer.
4. Si pasa la verificación, devuelve una URL prefirmada de corta duración
   (60s) y la URL pública final del objeto.
5. El frontend hace un único `PUT` directo a esa URL, sin pasar por el
   servidor propio — el archivo va directo al bucket.

### Manejo de errores (3 capas)

Ningún `catch` queda vacío ni silencioso. `handleServiceError` (capa de
servicios) loggea con contexto y relanza como `AppError`; `useAsyncState`
(hooks) resuelve `{ data, loading, error }` de forma consistente en toda la
app; la UI siempre maneja los 3 estados visibles con `LoadingState`,
`ErrorState` y `EmptyState`.

## Testing

Vitest (`globals: true`, `environment: 'jsdom'`) + React Testing Library +
MSW. `src/test/setup.ts` importa `@testing-library/jest-dom` y levanta el
ciclo de vida del servidor de MSW; `src/test/fixtures.ts` centraliza los
datos mockeados (usuario admin, usuario customer, producto, ítem de
carrito, orden) para no repetir el mismo setup en cada archivo.

Qué cubre:

- **`cartReducer`** (`modules/cart/context/cartReducer.test.ts`): las 5
  acciones del reducer, con 7 tests (`ADD_ITEM` cubre tanto agregar un
  producto nuevo como sumar cantidad a uno ya existente).
- **`useAuth`/`useCart`** (`renderHook`, aislados): que lancen error si se
  usan fuera de su provider, y su comportamiento real sin sesión activa.
- **Un test de integración** (`modules/checkout/pages/CheckoutPage.test.tsx`):
  agregar un producto al carrito → confirmar la orden en checkout.
- **Wrapper de providers** (`src/test/renderWithProviders.tsx`): envuelve
  `AuthProvider` + `CartProvider` para los tests que dependen de ambos
  contexts a la vez.

**Resultado actual**: 5 archivos de test, 13 tests, todos en verde
(`npm test`).

**Límite encontrado**: en este entorno (Vitest + Node), el SDK de Firebase
no pasa por los interceptores de red de MSW — así que el mockeo real de
Firestore/Auth se hace en el límite de la propia capa de servicios
(`*.api.ts`, `useAuth`) con `vi.mock()`, no interceptando el SDK a nivel de
red como sí se puede con requests HTTP planas. Detalle completo del
hallazgo en la Bitácora de uso de IA.

## Modelo de datos (Firestore)

| Colección | Documento | Campos principales |
| --- | --- | --- |
| `users` | `{userId}` | `uid, email, displayName, role: 'customer' \| 'admin', photoURL?, createdAt` |
| `products` | `{productId}` | `name, description, price, category, stock, imageUrl, active, createdAt, updatedAt` |
| `carts` | `{userId}` | `items: [{productId, quantity}], updatedAt` |
| `orders` | `{orderId}` | `userId, items: [{productId, name, price, quantity}], total, status, createdAt` |

Las Firestore Security Rules (`firestore.rules`, versionado en el repo)
validan rol y dueño del lado del servidor — el frontend nunca es la única
barrera de seguridad.

## Instalación y configuración

### Requisitos

- Node.js y npm.
- Un proyecto de Firebase (Authentication + Firestore) y un bucket de AWS S3
  ya creados (fuera del alcance de este README).

### Pasos

1. **Clonar el repo e instalar dependencias**

   ```bash
   git clone <url-del-repo>
   cd ProyectoM5-FRONT_Gerardo-Acosta
   npm install
   ```

2. **Variables de entorno**

   Copiar `.env.example` a `.env` y completar con los valores reales:

   ```bash
   cp .env.example .env
   ```

   Ver la sección [`.env.example`](#envexample) más abajo para el detalle de
   cada variable.

3. **(Opcional) Poblar el catálogo con datos de ejemplo**

   ```bash
   npm run seed
   ```

   Requiere `serviceAccountKey.json` en la raíz del repo (credencial del
   Admin SDK de Firebase, descargada desde la consola de Firebase —
   **nunca se versiona**, ya está en `.gitignore`). Corre una sola vez con
   el Admin SDK, no forma parte del bundle de producción.

4. **Levantar el entorno de desarrollo**

   ```bash
   npm run dev
   ```

### Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo de Vite |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Corre `oxlint` |
| `npm test` | Corre la suite de tests con Vitest |
| `npm run seed` | Puebla `products/` en Firestore con datos de ejemplo (ver arriba) |

## `.env.example`

Ya versionado en la raíz del repo, sin valores reales — solo los nombres de
variable que el proyecto realmente usa:

```bash
# credenciales de Firebase (frontend) — copiar a .env y completar con valores reales
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# credenciales de AWS (backend, Vercel Serverless Functions) — copiar a .env y completar con valores reales
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# credenciales de Firebase Admin SDK (backend) — copiar a .env y completar con valores reales
FIREBASE_SERVICE_ACCOUNT_KEY=
```

Las variables `VITE_*` se exponen al frontend (Vite las inyecta en build).
Las demás (`AWS_*`, `FIREBASE_SERVICE_ACCOUNT_KEY`) solo existen del lado
servidor, en las Vercel Serverless Functions de `api/` — nunca llegan al
bundle del cliente.

## URL de producción

https://proyecto-m5-front-gerardo-acosta.vercel.app

## Bitácora de uso de IA

| # | Momento | Categoría | Decisión / hallazgo | Alternativa descartada |
| --- | --- | --- | --- | --- |
| 1 | Planificación de rutas protegidas de admin | Planificación | Antes de escribir código, se propuso crear un `AdminRoute` nuevo que envolviera `ProtectedRoute` sumando un chequeo de rol. Al pedir el contenido real de `ProtectedRoute.tsx` para diseñar la composición, se confirmó que el componente ya soportaba `allowedRoles: UserRole[]` desde antes. Se usó `<ProtectedRoute allowedRoles={['admin']}>` tal cual, sin crear nada nuevo. | Un componente `AdminRoute` separado, propuesto antes de confirmar contra el código real — hubiera duplicado lógica ya cerrada y verificada. |
| 2 | Code review de la regla de Firestore para `users` | Code review | Una revisión posterior detectó que la regla original (`allow read, write` bajo una sola condición de dueño) validaba *quién* podía escribir el documento, pero no *qué* campos — un customer autenticado podía auto-promoverse a `role: 'admin'` desde la consola del navegador. Se separó `create` (fuerza `role: 'customer'`) de `update` (el campo `role` queda inmutable desde el cliente). | La regla original, dejada como "definitiva" en su momento sin revisarla desde el ángulo de autorización por campo, no solo por documento. |
| 3 | Validación de una afirmación de la IA sobre el estado real de las Firestore Rules | Validación de decisiones técnicas | Claude Code afirmó que las rules de `orders` "todavía no estaban deployadas". La afirmación se cuestionó en vez de aceptarse — se confirmó contra el historial real de commits que las rules de `products` y `orders` se habían desplegado juntas, y se le pidió a la IA reintentar en vivo contra Firestore real en lugar de seguir asumiendo. El error real resultó ser un `permission-denied` propio del contexto de prueba (sin sesión admin real), no un problema de las rules. | Aceptar la afirmación de la IA sin verificarla contra el código/estado real — mismo principio de verificación que se aplica en todo el proyecto, también hacia la propia IA. |
| 4 | Generación de la configuración de testing (Vitest + MSW) | Generación de tests | Al armar el test de integración de checkout, se descubrió empíricamente que el SDK de Firebase (Firestore/Auth) no pasa por los interceptores de red de MSW en Node — un test sin mockear golpeó Firestore de producción real. Se decidió mockear en el límite de la propia capa de servicios (`*.api.ts`, `useAuth`) con `vi.mock()`, en vez de mockear el SDK de Firebase función por función. | Mockear el SDK de Firebase pieza por pieza a nivel de red (el enfoque "MSW intercepta todo" que sugería la consigna al pie de la letra) — no es viable con el transporte real de Firebase, y hubiera arriesgado escribir en producción en cada corrida de tests. |
| 5 | Resolución del bug de CORS en la subida de imágenes a S3 | Resolución de problemas | La verificación previa del endpoint de subida solo se había hecho por `curl` (URL prefirmada generada correctamente), nunca con un `PUT` real desde el navegador. Al probar la subida real desde `ProductForm`, falló por falta de configuración CORS del bucket para `PUT` desde `localhost`. Se corrigió agregando la configuración CORS faltante en la consola de AWS. | Dar por cerrado el flujo completo de upload solo con la verificación por `curl`, sin probar el `PUT` real desde el navegador — la causa quedó fuera de esa verificación inicial. |
