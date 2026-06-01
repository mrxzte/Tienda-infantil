/*
  # Datos iniciales - Tienda Infantil

  Inserta categorías y productos de ejemplo para demostrar la tienda.

  ## Categorías
  - Juguetes, Ropa, Libros, Juegos de Mesa, Arte y Manualidades

  ## Productos
  - 10 productos de ejemplo con imágenes reales de Pexels
*/

-- Insertar categorías
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Juguetes', 'juguetes', 'Los mejores juguetes para niños de todas las edades', 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=600'),
  ('22222222-2222-2222-2222-222222222222', 'Ropa', 'ropa', 'Ropa cómoda y divertida para los más pequeños', 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600'),
  ('33333333-3333-3333-3333-333333333333', 'Libros', 'libros', 'Cuentos y libros educativos para fomentar la lectura', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600'),
  ('44444444-4444-4444-4444-444444444444', 'Juegos de Mesa', 'juegos-de-mesa', 'Juegos para toda la familia', 'https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg?auto=compress&cs=tinysrgb&w=600'),
  ('55555555-5555-5555-5555-555555555555', 'Arte y Manualidades', 'arte-manualidades', 'Materiales creativos para pequeños artistas', 'https://images.pexels.com/photos/1148996/pexels-photo-1148996.jpeg?auto=compress&cs=tinysrgb&w=600')
ON CONFLICT (id) DO NOTHING;

-- Insertar productos
INSERT INTO products (name, slug, description, price, stock, category_id, image_url, featured) VALUES
  ('Set de Bloques de Construcción', 'set-bloques-construccion', 'Set de 100 bloques coloridos de madera para estimular la creatividad y el desarrollo motor. Incluye formas geométricas variadas.', 29.99, 50, '11111111-1111-1111-1111-111111111111', 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=600', true),
  ('Muñeca Articulada Clásica', 'muneca-articulada-clasica', 'Hermosa muñeca articulada de 30cm con ropa intercambiable. Material seguro y libre de BPA, ideal para niños de 3 años en adelante.', 24.99, 30, '11111111-1111-1111-1111-111111111111', 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600', true),
  ('Tren de Madera con Rieles', 'tren-madera-rieles', 'Encantador set de tren de madera con 20 piezas de rieles, locomotora y 3 vagones. Compatible con otros sets de rieles estándar.', 44.99, 20, '11111111-1111-1111-1111-111111111111', 'https://images.pexels.com/photos/163036/mario-luigi-yoshi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600', true),
  ('Conjunto Pijama Estampado', 'conjunto-pijama-estampado', 'Suave pijama de algodón 100% con estampados de animales. Disponible en tallas 2-8 años. Lavable en lavadora.', 18.99, 100, '22222222-2222-2222-2222-222222222222', 'https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600', false),
  ('Mochila Escolar Dinosaurio', 'mochila-escolar-dinosaurio', 'Resistente mochila con diseño de dinosaurio. Interior organizado con múltiples compartimentos. Tamaño ideal para preescolar.', 22.99, 45, '22222222-2222-2222-2222-222222222222', 'https://images.pexels.com/photos/1648375/pexels-photo-1648375.jpeg?auto=compress&cs=tinysrgb&w=600', true),
  ('Cuento Ilustrado - El Gran Mundo', 'cuento-ilustrado-gran-mundo', 'Hermoso libro ilustrado con vibrantes acuarelas que lleva a los niños en un viaje por diferentes culturas del mundo. Ideal para 4-8 años.', 14.99, 60, '33333333-3333-3333-3333-333333333333', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  ('Enciclopedia de Animales', 'enciclopedia-animales', 'Fascinante enciclopedia con más de 500 animales del mundo, fotografías reales y datos curiosos. Tapa dura, ideal para niños de 6 años en adelante.', 32.99, 25, '33333333-3333-3333-3333-333333333333', 'https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  ('Juego de Mesa - Serpientes y Escaleras', 'serpientes-escaleras', 'Clásico juego de serpientes y escaleras con tablero gigante y fichas de colores vivos. Para 2-6 jugadores, edades 4+.', 16.99, 40, '44444444-4444-4444-4444-444444444444', 'https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg?auto=compress&cs=tinysrgb&w=600', true),
  ('Set de Pinturas y Pinceles', 'set-pinturas-pinceles', 'Completo set de 36 pinturas acrílicas no tóxicas con 12 pinceles de diferentes tamaños. Incluye delantal y paleta de colores.', 27.99, 35, '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1148996/pexels-photo-1148996.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  ('Kit de Plastilina 20 Colores', 'kit-plastilina-20-colores', 'Set de plastilina suave y moldeable en 20 colores vibrantes. No tóxica, fácil de moldear y reutilizable. Incluye moldes y herramientas.', 12.99, 80, '55555555-5555-5555-5555-555555555555', 'https://images.pexels.com/photos/1148996/pexels-photo-1148996.jpeg?auto=compress&cs=tinysrgb&w=600', false)
ON CONFLICT (slug) DO NOTHING;
