-- ---------------------------------------------------------------------------
-- EN DESUSO: seed de MySQL. La app migró a MongoDB, donde las imagenes se
-- guardan como binario dentro de la base (no como rutas a /public).
-- Seed vigente: `npm run seed` -> server/scripts/seed-imagenes.js
-- Se conserva (no se borra) por si hay que volver atras a MySQL.
-- ---------------------------------------------------------------------------

USE CLL;

insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados','/congelados/DSCN3101.webp', NULL);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados','/congelados/P1010061.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados','/congelados/P1010060.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados','/congelados/DSCN3449.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados','/congelados/eh_500.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('congelados', '/congelados/pozo_frio.webp', '/congelados/pozo_frio_azul.webp' );

SELECT * FROM imagenesfabricacion;
-- DELETE FROM imagenesfabricacion WHERE id > 35;