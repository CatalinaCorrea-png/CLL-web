-- ---------------------------------------------------------------------------
-- EN DESUSO: seed de MySQL. La app migró a MongoDB, donde las imagenes se
-- guardan como binario dentro de la base (no como rutas a /public).
-- Seed vigente: `npm run seed` -> server/scripts/seed-imagenes.js
-- Se conserva (no se borra) por si hay que volver atras a MySQL.
-- ---------------------------------------------------------------------------

USE CLL;

insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/arg/exhibidora-1.webp', NULL);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/arg/exhibidora-2.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/arg/exhibidora-3.webp', '/exhibidoras/arg/exhibidora-3-1.webp');
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/arg/exhibidora-4.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/ch/exhibidora-1.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/ch/exhibidora-3-1.webp', '/exhibidoras/ch/exhibidora-3.webp');
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras','/exhibidoras/ch/exhibidora-4.webp', '/exhibidoras/ch/exhibidora-4-1.webp');
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras', '/exhibidoras/ch/exhibidora-5.webp', null );
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras', '/exhibidoras/ch/exhibidora-5-1.webp', null);
insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('exhibidoras', '/exhibidoras/ch/vertical-24-puertas .webp', null);

SELECT * FROM imagenesfabricacion;
-- DELETE FROM imagenesfabricacion WHERE id > 35;
