USE CLL;

insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/camara-1.webp', NULL);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/camara-1-1.webp', '/camaras/camara-1-2.webp');
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1.webp', null);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-1.webp', null);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-2.webp', null);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-3.webp', null);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-4.webp', null);
insert into imagenesFabricacion(producto,imageUrl,imageUrl2) values ('camaras','/camaras/wic-1-5.webp', null);

SELECT * FROM cll.imagenesfabricacion;
-- DELETE FROM cll.imagenesFabricacion WHERE id > 35;