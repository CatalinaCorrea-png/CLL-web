-- Pedidos de presupuesto del configurador 3D (prompt 9).
-- Migración aparte: NO va en seed.sh, que hace DROP TABLE y borraría los pedidos.
-- Se aplica con `npm run migrar` (desde server/). Se puede correr más de una vez.

CREATE TABLE IF NOT EXISTS presupuestos (
  id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ref                VARCHAR(20)   NOT NULL,              -- CLL-2026-0001
  producto           VARCHAR(40)   NOT NULL,              -- 'bateas'
  config_json        JSON          NOT NULL,              -- la configuración validada (línea + módulos)
  config_hash        CHAR(64)      NOT NULL,              -- SHA-256 de la configuración, para detectar pedidos repetidos
  version_catalogo   INT UNSIGNED  NOT NULL,
  nombre             VARCHAR(120)  NOT NULL,
  empresa            VARCHAR(120)  NOT NULL,
  email              VARCHAR(160)  NOT NULL,              -- en minúsculas
  telefono           VARCHAR(40)   NOT NULL,
  localidad          VARCHAR(120)  NOT NULL,
  plazo              VARCHAR(80)   NOT NULL,
  cuit               VARCHAR(20)   NULL,
  medidas_especiales TEXT          NULL,                  -- "Medidas especiales o algo que no pudiste simular"
  snapshot_path      VARCHAR(255)  NULL,                  -- captura del 3D (no hay en el modo sin WebGL)
  estado             VARCHAR(20)   NOT NULL DEFAULT 'nuevo',  -- nuevo | error_mail | (los que defina ventas)
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_presupuestos_ref (ref),
  KEY ix_presupuestos_repetido (email, config_hash, created_at),
  KEY ix_presupuestos_created_at (created_at),
  KEY ix_presupuestos_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Último número de referencia usado en cada año: las referencias arrancan en 0001 cada año y nunca
-- se repiten, aunque lleguen dos pedidos a la vez (se incrementa con una sola sentencia atómica).
CREATE TABLE IF NOT EXISTS presupuestos_contador (
  anio   SMALLINT UNSIGNED NOT NULL,
  ultimo INT UNSIGNED      NOT NULL,
  PRIMARY KEY (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
