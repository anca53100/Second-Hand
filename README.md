# Second Hand — Proyecto Full Stack con React y Express

Plataforma web para **publicar, explorar y solicitar artículos de segunda mano**. Los usuarios publican artículos, los demás los solicitan y el dueño acepta o rechaza cada solicitud. Un administrador gestiona usuarios y categorías.

```
INTERFAZ → REACT + VITE → API REST → EXPRESS → ROUTES → CONTROLLERS → SERVICES → MODELOS (MONGOOSE) → MONGODB ATLAS
```

---

## Tabla de contenido

1. [Tecnologías](#1-tecnologías)
2. [Requisitos](#2-requisitos)
3. [Instalación](#3-instalación)
4. [Configuración y variables de entorno](#4-configuración-y-variables-de-entorno)
5. [Ejecución](#5-ejecución)
6. [Endpoints de la API](#6-endpoints-de-la-api)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Pruebas](#8-pruebas)
9. [Despliegue en Vercel](#9-despliegue-en-vercel)

---

## 1. Tecnologías

| Capa | Tecnología | Para qué |
|------|-----------|----------|
| Frontend | React 18 | Interfaz basada en componentes |
| | React Router 6 | Navegación entre páginas |
| | Bootstrap 5 | Estilos y componentes visuales |
| | Vite 5 | Servidor de desarrollo y compilación |
| Backend | Node.js ≥ 20.19 | Entorno de ejecución |
| | Express 5 | Servidor HTTP y rutas |
| | jsonwebtoken · bcrypt | Autenticación con JWT y contraseñas cifradas |
| | cors · swagger-ui-express | CORS y documentación de la API |
| Persistencia | MongoDB Atlas | Base de datos en la nube |
| | Mongoose 9 | Esquemas, validaciones y consultas a MongoDB |

## 2. Requisitos

- **Node.js 20.19 o superior** → `node -v`
- **npm 10 o superior** → `npm -v`
- Un editor (recomendado **Visual Studio Code**) y un navegador moderno.
- *(Opcional)* La extensión REST Client o Thunder Client para probar la API.

## 3. Instalación

```bash
# 1. Entra en la carpeta del proyecto
cd "Second Hand"

# 2. Dependencias del backend
cd backend
npm install

# 3. Dependencias del frontend
cd ../frontend
npm install
```

## 4. Configuración y variables de entorno

Cada proyecto lee **su propio** archivo `.env`. Crea las copias a partir de las plantillas:

```bash
# macOS / Linux / Git Bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Windows PowerShell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

### `backend/.env`

| Variable | Obligatoria | Valor por defecto | Descripción |
|----------|:-----------:|-------------------|-------------|
| `PORT` | No | `3000` | Puerto de la API |
| `MONGODB_URI` | **Sí** | — | Cadena de conexión de MongoDB Atlas (Database → Connect → Drivers) |
| `MONGODB_DB` | No | `secondhand` | Nombre de la base de datos dentro del clúster |
| `JWT_SECRET` | **Sí** | — | Clave para firmar los tokens JWT |
| `JWT_EXPIRES_IN` | No | `1d` | Duración de los tokens |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Origen(es) del frontend autorizados, separados por coma. Solo hace falta en local |
| `SEED_ADMIN_PASSWORD` | No | `Admin12345` | Contraseña de la cuenta principal del administrador (`admin@secondhand.com`). En producción usa una propia y segura |
| `SEED_USER_PASSWORD` | No | `Usuario12345` | Contraseña de las cuentas de prueba que crea `npm run seed` |
| `DNS_SERVERS` | No | — | Solo si al arrancar sale `querySrv ECONNREFUSED` (pasa en algunos Windows): `8.8.8.8,1.1.1.1` |
| `SMTP_HOST` · `SMTP_PORT` | No | `smtp.gmail.com` · `465` | Servidor de correo para recuperar contraseñas |
| `SMTP_USER` · `SMTP_PASS` | No | — | Cuenta y contraseña de aplicación del correo (ver abajo). Sin ellas, en local el correo se muestra en la consola |
| `MAIL_FROM` | No | `Second Hand <SMTP_USER>` | Remitente que ve la persona |
| `APP_URL` | No | `CORS_ORIGIN` en local · dominio del proyecto en Vercel | Dirección del frontend para el enlace del correo |

### Configurar MongoDB Atlas

1. Crea un clúster gratuito (M0) en [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → crea un usuario de base de datos con contraseña.
3. **Network Access** → agrega tu IP (o `0.0.0.0/0` solo para pruebas).
4. **Database → Connect → Drivers** → copia la cadena `mongodb+srv://…`, reemplaza `<db_password>` y pégala en `MONGODB_URI`.

La primera vez que arranca la API con la base vacía, crea la cuenta del administrador (`admin@secondhand.com`) y las categorías base: Libros, Útiles escolares, Ropa y Muebles. Las cuentas, los artículos y las solicitudes se crean desde la app.

- `npm run seed` **borra** la base y carga datos de prueba (usuarios, artículos y solicitudes).
- `npm run reset` **borra** la base y la deja solo con el administrador y las categorías base.

No uses ninguno de los dos contra la base de producción.

### Correo para recuperar contraseñas (Gmail)

Usa una cuenta de Gmail del proyecto, no la personal:

1. Activa la verificación en dos pasos de esa cuenta.
2. Crea una contraseña de aplicación en [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Pon el correo en `SMTP_USER` y esa contraseña de 16 letras en `SMTP_PASS`, y reinicia el backend.

El enlace del correo vence en 1 hora y sirve una sola vez. La contraseña de `admin@secondhand.com` no se recupera por correo: es el valor de `SEED_ADMIN_PASSWORD`.

### `frontend/.env`

| Variable | Obligatoria | Valor por defecto | Descripción |
|----------|:-----------:|-------------------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000/api` en local · `/api` desplegado | URL base de la API. En Vercel no se configura |

> **Seguridad:** los archivos `.env` están en `.gitignore` y **nunca** deben subirse al repositorio. Las variables `VITE_*` terminan en el navegador, así que son públicas: no pongas secretos en ellas.

## 5. Ejecución

Necesitas **dos terminales**.

```bash
# Terminal 1 — API
cd backend
npm run dev          # http://localhost:3000/api  ·  Swagger en http://localhost:3000/api/docs

# Terminal 2 — Interfaz
cd frontend
npm run dev          # http://localhost:5173
```

Abre **http://localhost:5173**.

### Cuentas de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@secondhand.com` | valor de `SEED_ADMIN_PASSWORD` |
| Usuario (solo después de `npm run seed`) | `ana@correo.com` | valor de `SEED_USER_PASSWORD` |

El administrador también usa la tienda (publica y pide artículos) y, desde **Usuarios**, puede inactivar cuentas y dar o quitar permisos de administrador a otras cuentas escribiendo su correo.

### Scripts disponibles

| Proyecto | Script | Qué hace |
|----------|--------|----------|
| backend | `npm run dev` | Inicia la API con recarga automática (`node --watch`) |
| backend | `npm start` | Inicia la API |
| backend | `npm run seed` | Borra la base y carga los datos de prueba |
| backend | `npm run reset` | Borra la base y deja solo el administrador y las categorías base |
| frontend | `npm run dev` | Servidor de desarrollo de Vite |
| frontend | `npm run build` | Genera la versión de producción en `dist/` |
| frontend | `npm run preview` | Sirve la versión de producción |

## 6. Endpoints de la API

URL base: `http://localhost:3000/api` · Documentación interactiva: `http://localhost:3000/api/docs`

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/health` | Estado de la API | Público |
| POST | `/auth/register` | Crea una cuenta | Público |
| POST | `/auth/login` | Inicia sesión y devuelve el token | Público |
| POST | `/auth/forgot-password` | Envía al correo el enlace para restablecer la contraseña | Público |
| POST | `/auth/reset-password` | Guarda la contraseña nueva con el código del enlace | Público |
| GET | `/users/me` | Perfil del usuario actual | Autenticado |
| PUT | `/users/me` | Actualiza el perfil | Autenticado |
| PATCH | `/users/me/status` | Da de baja la cuenta propia (pide la contraseña) | Autenticado |
| GET | `/users` | Lista las cuentas (`?email=` busca una) | Admin |
| PATCH | `/users/:id/status` | Activa o inactiva una cuenta | Admin |
| PATCH | `/users/:id/role` | Da o quita permisos de administrador | Admin |
| GET | `/items` | Lista y filtra artículos | Público |
| GET | `/items/mine` | Mis publicaciones | Autenticado |
| GET | `/items/:id` | Detalle de un artículo | Público |
| POST | `/items` | Publica un artículo | Autenticado |
| PUT | `/items/:id` | Edita un artículo propio | Autenticado |
| PATCH | `/items/:id/status` | Cambia el estado de un artículo propio | Autenticado |
| GET | `/requests` | Mis solicitudes | Autenticado |
| POST | `/requests` | Solicita un artículo | Autenticado |
| GET | `/requests/received` | Solicitudes recibidas | Autenticado |
| GET | `/requests/:id` | Detalle de una solicitud | Autenticado |
| PATCH | `/requests/:id` | Cambia el estado de una solicitud (ver abajo) | Autenticado |
| DELETE | `/requests/:id` | Quita de la lista una solicitud recibida rechazada o cancelada | Autenticado |
| GET | `/categories` | Lista las categorías | Público |
| POST | `/categories` | Crea una categoría | Admin |
| PUT | `/categories/:id` | Edita una categoría | Admin |
| PATCH | `/categories/:id/status` | Activa o desactiva una categoría | Admin |
| GET | `/admin/stats` | Estadísticas del panel | Admin |

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`. **Admin** son las cuentas con rol de administrador. Una cuenta inactiva no puede iniciar sesión y sus artículos dejan de mostrarse.

### Dar de baja la cuenta

`PATCH /users/me/status` con `{ "status": "Inactivo", "password": "…" }` deja la cuenta inactiva, igual que cuando la inactiva un administrador: la sesión se cierra, no se puede volver a entrar y sus publicaciones dejan de mostrarse. Solo un administrador puede reactivarla. Si la contraseña falta o no es correcta, responde 400. La cuenta principal del administrador no se puede dar de baja (403).

### Estados de una solicitud

| Quién | Cambio | Efecto en el artículo |
|-------|--------|-----------------------|
| Dueño del artículo | Pendiente → Aceptada | Disponible → En proceso |
| Dueño del artículo | Pendiente → Rechazada | — |
| Dueño del artículo | Aceptada → Pendiente (deshacer) | En proceso → Disponible |
| Dueño del artículo | Rechazada → Pendiente (deshacer) | — |
| Dueño del artículo | Aceptada → Cancelada (cancelar la entrega) | En proceso → Disponible |
| Dueño del artículo | Aceptada → Entregada | En proceso → Entregado; las demás solicitudes pendientes del artículo pasan a Rechazada |
| Quien pidió | Pendiente o Aceptada → Cancelada | Si estaba aceptada, En proceso → Disponible |

Entregada y Cancelada son estados finales. El campo `cancelledBy` dice quién canceló (`requester` u `owner`). Quien pidió ve los datos de contacto del dueño mientras la solicitud está Aceptada o Entregada. En la app, aceptar, marcar como entregado y cancelar una entrega piden confirmación.

### Cuándo se ve una publicación

Explorar, la búsqueda y la página de inicio solo muestran publicaciones **Disponible** de cuentas activas. Nada se borra de la base: lo que deja de mostrarse sigue en Mis publicaciones del dueño y en Mis solicitudes de quien la pidió.

| Estado del artículo | Cuándo pasa | ¿Sale en Explorar? | ¿Recibe solicitudes? |
|---------------------|-------------|--------------------|----------------------|
| Disponible | Al publicar, o cuando una aceptación se deshace o se cancela | Sí | Sí, de varias personas a la vez |
| En proceso | El dueño acepta una solicitud | No (el enlace directo sigue abriendo) | No |
| Entregado | El dueño marca la solicitud aceptada como entregada | No (el enlace directo sigue abriendo) | No, para siempre |
| Inactivo | El dueño la inactiva, o la cuenta del dueño queda inactiva | No (solo la ven el dueño y los administradores) | No |

Recibir una solicitud no cambia el artículo: sigue Disponible hasta que el dueño acepta una.

### Fotos de un artículo

Cada publicación lleva de 1 a 5 fotos (`photos` en `POST /items` y `PUT /items/:id`); la primera es la portada. El navegador reduce cada foto a 1000 px en JPG antes de enviarla, así que cinco fotos caben en el límite de 4,5 MB por petición de Vercel. Al editar, enviar la URL de una foto actual la conserva y omitirla la quita. Las listas solo devuelven la portada; el detalle devuelve todas.

## 7. Estructura del proyecto

```
Second-Hand/
├── backend/
│   ├── pruebas/
│   │   └── api.http                 # Pruebas para REST Client (VS Code)
│   ├── src/
│   │   ├── config/env.js            # Lee y valida las variables de entorno
│   │   ├── config/db.js             # Conexión a MongoDB
│   │   ├── controllers/             # items.controller.js… (reciben la petición y responden)
│   │   ├── data/initial.js          # Administrador y categorías base (base vacía y npm run reset)
│   │   ├── data/seed.js             # Datos de prueba (npm run seed)
│   │   ├── docs/openapi.js          # Documentación Swagger
│   │   ├── middlewares/             # auth (JWT y roles), errors, logger
│   │   ├── models/                  # Esquemas de Mongoose (User, Item, Category, Request)
│   │   ├── scripts/                 # npm run seed y npm run reset
│   │   ├── routes/                  # items.routes.js… (una ruta por recurso)
│   │   ├── services/                # items.service.js… (reglas de negocio y validaciones)
│   │   ├── utils/                   # HttpError, fechas, serializadores, envío de correos…
│   │   ├── constants.js
│   │   ├── app.js                   # Configuración de Express
│   │   └── server.js                # Punto de entrada
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/images/               # Imágenes de los artículos
│   ├── src/
│   │   ├── assets/                  # Logos
│   │   ├── components/              # Componentes reutilizables por sección
│   │   ├── context/AuthContext.jsx  # Sesión del usuario
│   │   ├── data/                    # Listas fijas (localidades, estados del artículo)
│   │   ├── hooks/                   # Hooks personalizados
│   │   ├── pages/                   # Una página por ruta
│   │   ├── services/                # Llamadas a la API (api.js: fetch + token JWT)
│   │   ├── styles/                  # CSS global y por sección
│   │   ├── utils/                   # Formato, imágenes, validaciones
│   │   ├── App.jsx · main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── api/index.js                     # La API como función de Vercel
├── .vscode/extensions.json          # Extensiones recomendadas
├── .env.example                     # Referencia de todas las variables
├── .gitignore
├── package.json
├── vercel.json                      # Despliegue único: frontend + API
└── README.md
```

## 8. Pruebas

Con la API encendida:

- **REST Client (VS Code):** abre `backend/pruebas/api.http` y pulsa *Send Request* sobre cada petición.
- **Swagger:** abre `http://localhost:3000/api/docs` y prueba cada endpoint desde el navegador.
- **curl:**
  ```bash
  curl http://localhost:3000/api/health
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@secondhand.com","password":"Admin12345"}'
  ```

## 9. Despliegue en Vercel

El frontend y la API se despliegan juntos en **un solo proyecto** de Vercel. `vercel.json` instala las dependencias de `backend/` y `frontend/`, compila el frontend y envía `/api/*` a la API (`api/index.js`). Desplegado queda:

- `/` → la aplicación
- `/api` → la API
- `/api/docs` → Swagger

Pasos:

1. En Vercel, **Add New → Project** e importa este repositorio. Deja la carpeta raíz del repositorio como *Root Directory*.
2. En **Settings → Environment Variables** agrega `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET` y, para recuperar contraseñas, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS`. `CORS_ORIGIN` y `VITE_API_URL` no hacen falta: todo va en el mismo dominio.
3. En MongoDB Atlas, **Network Access → Add IP Address → `0.0.0.0/0`**, porque Vercel no tiene una IP fija.
4. **Deploy**.

La cuenta del administrador y las categorías base las crea el backend al arrancar en local (`npm run dev`) con una base vacía. Si la base de Atlas es nueva, arranca el backend en local una vez contra ella antes de usar el despliegue.
