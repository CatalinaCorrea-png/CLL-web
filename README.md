# CLL Heladeras Comerciales — sitio web

Sitio institucional y catálogo de productos de **CLL**, fabricante de equipamiento de
refrigeración comercial (murales, bateas, exhibidoras, congelados y cámaras) en Victoria,
Buenos Aires.

**En producción:** [cllheladeras.cloud](https://cllheladeras.cloud)

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/React_Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)

---

## Qué hay en el sitio

| Página | Contenido |
|---|---|
| **Inicio** | Carrusel, productos destacados, sobre nosotros, trabajos realizados y contacto (Gmail y WhatsApp). |
| **Fabricación** | Cinco categorías (murales, bateas, exhibidoras, congelados y cámaras) con galería cargada desde la API y vista ampliada en un modal, más una sección de equipos usados reacondicionados. Murales y bateas tienen además un modal de detalles técnicos. Un menú lateral (*offcanvas*) permite saltar entre categorías. |
| **Reparación** | Trabajos de reparación con un comparador **antes / después**. |
| **Servicios** | Cerramientos con puertas y cúpulas de vidrio, cortinas nocturnas y reparación de cámaras, heladeras e iluminación, también con comparadores antes / después. |

---

## Arquitectura

Tres contenedores orquestados con Docker Compose y desplegados en un VPS con
[Dokploy](https://dokploy.com), que enruta los dominios con Traefik.

```
                   ┌──────────────────────────────┐
  navegador ──────▶│ web · Nginx                  │  SPA de React (build estático)
      │            └──────────────────────────────┘
      │            ┌──────────────────────────────┐     ┌──────────────┐
      └───────────▶│ api · Node + Express  :3001  │────▶│ db · MySQL 8 │
       VITE_API_URL└──────────────────────────────┘     └──────────────┘
                     CORS: solo orígenes de CORS_ORIGIN        volumen mysql_data
```

El navegador descarga la SPA desde Nginx y después llama **directamente** a la API en su
propio dominio (`VITE_API_URL`). Por eso la API valida el origen contra una lista blanca
(`CORS_ORIGIN`, separada por comas) y rechaza el resto. La base no expone puertos: solo es
accesible desde la red interna de Compose.

### API

| Método | Ruta | Devuelve | Origen |
|---|---|---|---|
| `GET` | `/fabricacion` | Detalles técnicos y diferenciales de cada categoría | JSON estático (`server/db/json/cll.fabricacion.json`) |
| `GET` | `/fabricacion/imagenes/:producto` | Imágenes de una categoría (`murales`, `bateas`, …) | MySQL, consulta parametrizada |

La API está organizada en capas **rutas → controlador → modelo**, y usa un *pool* de
conexiones de `mysql2` con promesas.

### Datos

```sql
CREATE TABLE imagenesfabricacion (
  ID        int NOT NULL AUTO_INCREMENT,
  producto  varchar(50),
  imageUrl  varchar(255) UNIQUE,
  imageUrl2 varchar(255) UNIQUE,   -- segunda foto opcional: la tarjeta muestra las dos
  PRIMARY KEY (ID)
);
```

Los datos se cargan con `server/db/seed.sh`, que crea la tabla y la llena con un archivo SQL
por categoría (`server/db/tables/`).

> El proyecto empezó con **MongoDB** y en marzo de 2025 pasó a **MySQL**.

---

## Decisiones técnicas

- **Imágenes en WebP con carga diferida.** El catálogo pasó de JPG a WebP y las galerías
  usan `loading="lazy"`, así que solo se descargan las fotos que entran en pantalla.
- **Caché de Nginx según si el archivo lleva hash.** Lo que genera Vite en `/assets/` (JS, CSS
  e imágenes importadas desde el código) tiene un hash en el nombre que cambia con el
  contenido, así que se cachea **un año** como `immutable`. Las fotos de `public/` conservan
  su nombre, así que se cachean **un día**: después el navegador revalida con `ETag` y Nginx
  responde `304` si no cambiaron. `index.html` va con `no-cache` para que un deploy nuevo se
  vea al instante.
- **Fallback de SPA solo para rutas.** Si falta un asset, Nginx devuelve un **404** real en
  lugar de `index.html`. Así una imagen rota no se disfraza de página y el error se ve.
- **Sistema de diseño propio.** `client/src/css/theme.css` define tokens semánticos (colores,
  sombras, radios) y utilidades reutilizables (`.ice-card`, `.btn-ice`, `.section-title`…)
  con una estética fría y minimalista, aplicada en todas las páginas.

---

## Correr el proyecto

### Con Docker Compose

Crear un `.env` en la raíz:

```env
DB_NAME=CLL
DB_USER=root
DB_PASSWORD=...
DB_ROOT_PASSWORD=...
CORS_ORIGIN=http://localhost:8080
VITE_API_URL=http://localhost:3001
```

```bash
docker compose up -d --build
DB_CONTAINER=<contenedor-de-la-db> bash server/db/seed.sh   # ver el nombre con: docker ps
```

`docker-compose.yml` está pensado para el VPS: los servicios **no publican puertos** al host,
porque en producción el tráfico entra por Traefik. Para probarlo en local hay que agregar
`ports` a `web` y a `api`.

### En desarrollo

```bash
# 1. MySQL en Docker
docker run -d --name cll-mysql -e MYSQL_ROOT_PASSWORD=... -e MYSQL_DATABASE=CLL -p 3306:3306 mysql:8.0
bash server/db/seed.sh        # usa el contenedor cll-mysql y la contraseña del .env de la raíz

# 2. API — lee server/.env (DB_HOST=localhost, DB_*, CORS_ORIGIN=http://localhost:5173)
cd server && npm install && npm run dev

# 3. Cliente — lee client/.env (VITE_API_URL=http://localhost:3001)
cd client && npm install && npm run dev
```

> **Nota:** `seed.sh` hace `DROP TABLE` antes de cargar, así que volver a correrlo **borra**
> la tabla y la recarga.

---

## Estructura

```
.
├── docker-compose.yml         # db + api + web
├── client/                    # React + Vite
│   ├── Dockerfile             # build con Node → Nginx
│   ├── nginx/default.conf     # caché, 404 para assets, fallback de SPA
│   ├── public/                # imágenes del catálogo (WebP)
│   └── src/
│       ├── pages/             # Home, Fabricacion, Reparacion, Servicios
│       ├── components/        # galerías, modales, antes/después, secciones de la home
│       ├── router/            # rutas y layout (Navbar + Footer)
│       └── css/theme.css      # tokens y utilidades del sistema de diseño
└── server/                    # Node + Express
    ├── server.js
    ├── src/                   # app (CORS) → routes → controller → models
    └── db/
        ├── db.js              # pool de MySQL
        ├── seed.sh            # carga de datos
        ├── tables/            # esquema + un .sql por categoría
        └── json/              # detalles técnicos de fabricación
```

---

## Despliegue

`main` es la rama desplegada en producción. Dokploy construye las imágenes con
`docker-compose.yml`, inyecta las variables de entorno y publica los dominios de `web` y
`api` a través de Traefik.

---

Desarrollado por **Catalina Correa** · [GitHub](https://github.com/CatalinaCorrea-png)
