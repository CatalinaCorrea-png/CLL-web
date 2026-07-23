-- ---------------------------------------------------------------------------
-- EN DESUSO: seed de MySQL. La app migró a MongoDB, donde las imagenes se
-- guardan como binario dentro de la base (no como rutas a /public).
-- Seed vigente: `npm run seed` -> server/scripts/seed-imagenes.js
-- Se conserva (no se borra) por si hay que volver atras a MySQL.
-- ---------------------------------------------------------------------------

USE CLL;

insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/camara-1.webp', NULL);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/camara-1-1.webp', '/camaras/camara-1-2.webp');
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-1.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-2.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-3.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-4.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-5.webp', null);

SELECT * FROM imagenesfabricacion;
-- DELETE FROM imagenesfabricacion WHERE id > 35;