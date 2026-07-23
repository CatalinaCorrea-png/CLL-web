#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# EN DESUSO: este es el seed de MySQL. La app migró a MongoDB, donde las
# imagenes se guardan como binario dentro de la base (no como rutas a /public).
# El seed vigente es `npm run seed` -> server/scripts/seed-imagenes.js
# Se conserva (no se borra) por si hay que volver atras a MySQL.
# ---------------------------------------------------------------------------
# Seed de la tabla `imagenesFabricacion` en MySQL (categorias de Fabricacion).
#
# Carga, EN ORDEN:
#   1) cll_fabricacion.sql            -> crea la tabla (DROP + CREATE: re-crea limpia)
#   2) cll_fabricacion_murales.sql    -> INSERT murales
#   3) cll_fabricacion_bateas.sql     -> INSERT bateas
#   4) cll_fabricacion_camaras.sql    -> INSERT camaras
#   5) cll_fabricacion_congelados.sql -> INSERT congelados
#   6) cll_fabricacion_exhibidoras.sql-> INSERT exhibidoras
#
# OJO: el paso 1 hace DROP TABLE -> re-correr el seed BORRA y recarga la tabla.
#
# Uso (local, contenedor por defecto `cll-mysql`):
#   bash server/db/seed.sh
#
# Uso (VPS / Docker Compose): pasar el nombre real del contenedor de la DB
# (miralo con `docker ps` -- suele ser algo tipo <proyecto>-db-1):
#   DB_CONTAINER=web-db-1 bash server/db/seed.sh
#
# Variables (con defaults). La password sale del .env de la raiz (no del repo):
#   DB_CONTAINER  contenedor MySQL   (default: cll-mysql)
#   DB_USER       usuario            (default: root  / o el del .env)
#   DB_PASSWORD   password           (del .env de la raiz; obligatoria)
#   DB_NAME       base de datos      (default: CLL)
# ---------------------------------------------------------------------------
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cargar el .env de la raiz del proyecto (server/db -> ../../.env), si existe.
# Ahi vive DB_USER/DB_PASSWORD/DB_NAME. El .env NO esta en git (esta gitignoreado).
ROOT_ENV="$(cd "$HERE/../.." && pwd)/.env"
if [ -f "$ROOT_ENV" ]; then
  set -a; . "$ROOT_ENV"; set +a
fi

DB_CONTAINER="${DB_CONTAINER:-cll-mysql}"
DB_USER="${DB_USER:-root}"
DB_NAME="${DB_NAME:-CLL}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: falta DB_PASSWORD (no se encontro en $ROOT_ENV ni en el entorno)." >&2
  exit 1
fi

FILES=(
  cll_fabricacion.sql
  cll_fabricacion_murales.sql
  cll_fabricacion_bateas.sql
  cll_fabricacion_camaras.sql
  cll_fabricacion_congelados.sql
  cll_fabricacion_exhibidoras.sql
)

echo "Seed -> contenedor='$DB_CONTAINER'  db='$DB_NAME'  user='$DB_USER'"
for f in "${FILES[@]}"; do
  echo "  cargando $f ..."
  # MYSQL_PWD evita el warning "password on the command line".
  # --force tolera errores no-fatales (CREATE DATABASE ya existe, 1er DROP TABLE, SELECT final).
  docker exec -i -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
    mysql --force -u"$DB_USER" "$DB_NAME" < "$HERE/tables/$f"
done

echo "Conteo final por producto:"
docker exec -e MYSQL_PWD="$DB_PASSWORD" "$DB_CONTAINER" \
  mysql -u"$DB_USER" "$DB_NAME" \
  -e "SELECT producto, COUNT(*) AS n FROM imagenesfabricacion GROUP BY producto;"
echo "OK."
