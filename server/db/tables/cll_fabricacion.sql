-- ---------------------------------------------------------------------------
-- EN DESUSO: seed de MySQL. La app migró a MongoDB, donde las imagenes se
-- guardan como binario dentro de la base (no como rutas a /public).
-- Seed vigente: `npm run seed` -> server/scripts/seed-imagenes.js
-- Se conserva (no se borra) por si hay que volver atras a MySQL.
-- ---------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS CLL;
USE CLL;

DROP TABLE IF EXISTS imagenesfabricacion;
CREATE TABLE imagenesfabricacion (
	ID int NOT NULL AUTO_INCREMENT,
	producto varchar(50),
	imageUrl varchar(255) unique,
	imageUrl2 varchar(255) unique,
    PRIMARY KEY (ID)
);

SELECT * FROM imagenesfabricacion;

-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-1.webp','/murales/arg/mural-1-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-2.webp', '/murales/ch/mural-2-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-2.webp', '/murales/arg/mural-2-2.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-3.webp', '/murales/ch/mural-3-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-3-4.webp', '/murales/arg/mural-3-2.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-5.webp', '/murales/ch/mural-5-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-4.webp', '/murales/arg/mural-4-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-7.webp', '/murales/ch/mural-7-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-5.webp', '/murales/arg/mural-5-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-8.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-6.webp', '/murales/arg/mural-6-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales', '/murales/ch/mural-9-1.webp','/murales/ch/mural-9.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-7.webp', '/murales/arg/mural-7-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-10.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-8.webp', '/murales/arg/mural-8-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-11.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-9.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-10.webp', '/murales/arg/mural-10-2.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-12.webp', '/murales/ch/mural-12-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-11.webp', '/murales/arg/mural-11-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-13.webp', '/murales/ch/mural-13-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-14.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-15.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales', '/murales/arg/mural-14-1.webp','/murales/arg/mural-14.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-16.webp', '/murales/ch/mural-16-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-15.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-1.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-16.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-17.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-17.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-18.webp', '/murales/ch/mural-18-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-19.webp', '/murales/ch/mural-19-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-18.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-25.webp', '/murales/ch/mural-25-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/arg/mural-19.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-20.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-21.webp', '/murales/ch/mural-21-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-22.webp', null);
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-23.webp', '/murales/ch/mural-23-1.webp');
-- insert into imagenesfabricacion(producto,imageUrl,imageUrl2) values ('murales','/murales/ch/mural-24.webp', null);