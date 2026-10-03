-- Analítica básica del configurador (prompt 11). Sin datos personales: ni IP, ni email, ni cookies.
-- `sesion` es un id al azar por pestaña (sessionStorage), solo para contar sesiones.
-- Se aplica con `npm run migrar`. Consultas: `npm run analitica`.

CREATE TABLE IF NOT EXISTS eventos (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evento     VARCHAR(40)     NOT NULL,   -- configurador_iniciado | configuracion_completa | presupuesto_enviado | whatsapp_click
  sesion     CHAR(36)        NULL,       -- NULL en los que registra el server
  ref        VARCHAR(20)     NULL,       -- referencia del pedido, si corresponde
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_eventos_evento_fecha (evento, created_at),
  KEY ix_eventos_sesion (sesion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
