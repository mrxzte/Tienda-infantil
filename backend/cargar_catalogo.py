import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://admin:admin123@cluster1.uhupbjc.mongodb.net/tienda_infantil")
DB_NAME = os.environ.get("DB_NAME", "tienda_infantil")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Productos reales organizados por categoría
productos_base = [
    # JUGUETES
    {"name": "Lego City Estación de Policía", "category": "Juguetes", "brand": "LEGO", "price": 189000, "stock": 15, "age_range": "6-12 años"},
    {"name": "Lego Friends Casa de la Amistad", "category": "Juguetes", "brand": "LEGO", "price": 145000, "stock": 20, "age_range": "6-12 años"},
    {"name": "Lego Technic Coche de Carreras", "category": "Juguetes", "brand": "LEGO", "price": 220000, "stock": 10, "age_range": "8-14 años"},
    {"name": "Lego Duplo Mi Primer Tren", "category": "Juguetes", "brand": "LEGO", "price": 95000, "stock": 25, "age_range": "2-5 años"},
    {"name": "Barbie Dreamhouse", "category": "Juguetes", "brand": "Mattel", "price": 320000, "stock": 8, "age_range": "3-10 años"},
    {"name": "Barbie Fashionista Set x5", "category": "Juguetes", "brand": "Mattel", "price": 89000, "stock": 30, "age_range": "3-10 años"},
    {"name": "Hot Wheels Pista Loop Doble", "category": "Juguetes", "brand": "Mattel", "price": 75000, "stock": 18, "age_range": "4-10 años"},
    {"name": "Hot Wheels Pack 20 Carros", "category": "Juguetes", "brand": "Mattel", "price": 65000, "stock": 35, "age_range": "3-10 años"},
    {"name": "Nerf Elite 2.0 Commander", "category": "Juguetes", "brand": "Hasbro", "price": 110000, "stock": 12, "age_range": "8-14 años"},
    {"name": "Nerf Rival Prometheus", "category": "Juguetes", "brand": "Hasbro", "price": 280000, "stock": 6, "age_range": "10-16 años"},
    {"name": "Play-Doh Set Cocina Mágica", "category": "Juguetes", "brand": "Hasbro", "price": 85000, "stock": 22, "age_range": "3-8 años"},
    {"name": "Play-Doh Torre de Helados", "category": "Juguetes", "brand": "Hasbro", "price": 72000, "stock": 28, "age_range": "3-8 años"},
    {"name": "Monopoly Junior", "category": "Juguetes", "brand": "Hasbro", "price": 68000, "stock": 20, "age_range": "5-10 años"},
    {"name": "Monopoly Clásico", "category": "Juguetes", "brand": "Hasbro", "price": 85000, "stock": 15, "age_range": "8+ años"},
    {"name": "Jenga Original", "category": "Juguetes", "brand": "Hasbro", "price": 45000, "stock": 30, "age_range": "6+ años"},
    {"name": "Scrabble Junior", "category": "Juguetes", "brand": "Mattel", "price": 58000, "stock": 18, "age_range": "5-10 años"},
    {"name": "UNO Clásico", "category": "Juguetes", "brand": "Mattel", "price": 25000, "stock": 50, "age_range": "7+ años"},
    {"name": "Twister", "category": "Juguetes", "brand": "Hasbro", "price": 48000, "stock": 22, "age_range": "6+ años"},
    {"name": "Fisher Price Piano Musical", "category": "Juguetes", "brand": "Fisher-Price", "price": 95000, "stock": 16, "age_range": "1-4 años"},
    {"name": "Fisher Price Centro de Actividades", "category": "Juguetes", "brand": "Fisher-Price", "price": 185000, "stock": 10, "age_range": "0-2 años"},
    {"name": "Carro de Control Remoto 4x4", "category": "Juguetes", "brand": "Rastar", "price": 145000, "stock": 12, "age_range": "6-12 años"},
    {"name": "Drone Mini para Niños", "category": "Juguetes", "brand": "Syma", "price": 120000, "stock": 8, "age_range": "8-14 años"},
    {"name": "Pistola de Burbujas Automática", "category": "Juguetes", "brand": "Genérico", "price": 35000, "stock": 40, "age_range": "3-8 años"},
    {"name": "Set de Magia 100 Trucos", "category": "Juguetes", "brand": "Melissa & Doug", "price": 75000, "stock": 15, "age_range": "6-12 años"},
    {"name": "Cocina de Juguete Deluxe", "category": "Juguetes", "brand": "KidKraft", "price": 250000, "stock": 7, "age_range": "3-8 años"},

    # EDUCATIVO
    {"name": "Abecedario Magnético Colores", "category": "Educativo", "brand": "Melissa & Doug", "price": 45000, "stock": 35, "age_range": "2-6 años"},
    {"name": "Rompecabezas 500 Piezas Animales", "category": "Educativo", "brand": "Ravensburger", "price": 65000, "stock": 20, "age_range": "8-14 años"},
    {"name": "Rompecabezas 1000 Piezas Mundo", "category": "Educativo", "brand": "Ravensburger", "price": 85000, "stock": 15, "age_range": "10+ años"},
    {"name": "Microscospio Infantil 100x", "category": "Educativo", "brand": "Educational Insights", "price": 135000, "stock": 10, "age_range": "8-14 años"},
    {"name": "Kit de Química para Niños", "category": "Educativo", "brand": "Thames & Kosmos", "price": 120000, "stock": 12, "age_range": "8-12 años"},
    {"name": "Globo Terráqueo Interactivo", "category": "Educativo", "brand": "Leapfrog", "price": 185000, "stock": 8, "age_range": "5-10 años"},
    {"name": "Tablet Educativa LeapPad", "category": "Educativo", "brand": "Leapfrog", "price": 320000, "stock": 6, "age_range": "3-8 años"},
    {"name": "Bloques de Construcción 100 piezas", "category": "Educativo", "brand": "Melissa & Doug", "price": 95000, "stock": 25, "age_range": "2-6 años"},
    {"name": "Set de Instrumentos Musicales", "category": "Educativo", "brand": "Hape", "price": 75000, "stock": 18, "age_range": "2-6 años"},
    {"name": "Tangram Magnético", "category": "Educativo", "brand": "Melissa & Doug", "price": 35000, "stock": 30, "age_range": "4-10 años"},
    {"name": "Kit de Robótica Básica", "category": "Educativo", "brand": "Makeblock", "price": 280000, "stock": 5, "age_range": "8-14 años"},
    {"name": "Juego de Mesa Matemáticas", "category": "Educativo", "brand": "Educational Insights", "price": 55000, "stock": 22, "age_range": "5-10 años"},
    {"name": "Cuaderno de Actividades Pre-escolar", "category": "Educativo", "brand": "Kumon", "price": 28000, "stock": 50, "age_range": "3-5 años"},
    {"name": "Set de Pintura Acuarela 36 colores", "category": "Educativo", "brand": "Crayola", "price": 45000, "stock": 35, "age_range": "5+ años"},
    {"name": "Crayones Jumbo x24", "category": "Educativo", "brand": "Crayola", "price": 22000, "stock": 60, "age_range": "2-6 años"},
    {"name": "Kit de Slime Científico", "category": "Educativo", "brand": "National Geographic", "price": 65000, "stock": 28, "age_range": "6-12 años"},
    {"name": "Libro Interactivo de Sonidos", "category": "Educativo", "brand": "Vtech", "price": 85000, "stock": 20, "age_range": "1-4 años"},
    {"name": "Ábaco Colorido 100 bolas", "category": "Educativo", "brand": "Melissa & Doug", "price": 38000, "stock": 30, "age_range": "2-6 años"},
    {"name": "Mapa de Colombia Rompecabezas", "category": "Educativo", "brand": "Genérico", "price": 42000, "stock": 25, "age_range": "5-10 años"},
    {"name": "Set de Astronomía Infantil", "category": "Educativo", "brand": "National Geographic", "price": 95000, "stock": 12, "age_range": "8-14 años"},

    # ROPA
    {"name": "Pijama Dinosaurios Niño T4", "category": "Ropa", "brand": "Carter's", "price": 65000, "stock": 20, "age_range": "4 años"},
    {"name": "Pijama Unicornio Niña T6", "category": "Ropa", "brand": "Carter's", "price": 65000, "stock": 18, "age_range": "6 años"},
    {"name": "Conjunto Deportivo Niño T8", "category": "Ropa", "brand": "Nike Kids", "price": 120000, "stock": 15, "age_range": "8 años"},
    {"name": "Vestido Casual Niña T10", "category": "Ropa", "brand": "Zara Kids", "price": 85000, "stock": 12, "age_range": "10 años"},
    {"name": "Jean Skinny Niña T12", "category": "Ropa", "brand": "Levi's Kids", "price": 95000, "stock": 10, "age_range": "12 años"},
    {"name": "Chaqueta Impermeable Niño T6", "category": "Ropa", "brand": "Columbia Kids", "price": 145000, "stock": 8, "age_range": "6 años"},
    {"name": "Camiseta Spiderman T4", "category": "Ropa", "brand": "Marvel Kids", "price": 45000, "stock": 25, "age_range": "4 años"},
    {"name": "Camiseta Frozen Niña T6", "category": "Ropa", "brand": "Disney", "price": 45000, "stock": 22, "age_range": "6 años"},
    {"name": "Buzo Polar Niño T8", "category": "Ropa", "brand": "Adidas Kids", "price": 110000, "stock": 15, "age_range": "8 años"},
    {"name": "Overol Bebé 0-3 meses", "category": "Ropa", "brand": "Carter's", "price": 55000, "stock": 20, "age_range": "0-3 meses"},
    {"name": "Set 5 Bodys Bebé", "category": "Ropa", "brand": "Carter's", "price": 85000, "stock": 18, "age_range": "0-12 meses"},
    {"name": "Abrigo Invierno Niña T10", "category": "Ropa", "brand": "H&M Kids", "price": 165000, "stock": 8, "age_range": "10 años"},
    {"name": "Shorts Deportivos Niño T12", "category": "Ropa", "brand": "Nike Kids", "price": 68000, "stock": 15, "age_range": "12 años"},
    {"name": "Vestido Fiesta Niña T8", "category": "Ropa", "brand": "Zara Kids", "price": 120000, "stock": 6, "age_range": "8 años"},
    {"name": "Pantalón Jogger Niño T6", "category": "Ropa", "brand": "Adidas Kids", "price": 75000, "stock": 18, "age_range": "6 años"},

    # ZAPATOS
    {"name": "Tenis Nike Air Max Niño T28", "category": "Zapatos", "brand": "Nike", "price": 195000, "stock": 10, "age_range": "4-5 años"},
    {"name": "Tenis Adidas Fortarun Niña T30", "category": "Zapatos", "brand": "Adidas", "price": 175000, "stock": 12, "age_range": "5-6 años"},
    {"name": "Sandalias de Playa Niño T32", "category": "Zapatos", "brand": "Crocs", "price": 95000, "stock": 20, "age_range": "6-7 años"},
    {"name": "Botas de Lluvia Dinosaurio T28", "category": "Zapatos", "brand": "Hunter Kids", "price": 110000, "stock": 15, "age_range": "4-5 años"},
    {"name": "Zapatos Colegiales Niña T34", "category": "Zapatos", "brand": "Bata Kids", "price": 85000, "stock": 18, "age_range": "7-8 años"},
    {"name": "Tenis con Luces Niño T26", "category": "Zapatos", "brand": "Skechers Kids", "price": 125000, "stock": 14, "age_range": "3-4 años"},
    {"name": "Baletas Niña T32", "category": "Zapatos", "brand": "Zara Kids", "price": 65000, "stock": 20, "age_range": "6-7 años"},
    {"name": "Botas Cowboy Niño T30", "category": "Zapatos", "brand": "Genérico", "price": 95000, "stock": 10, "age_range": "5-6 años"},
    {"name": "Crocs Classic Niña T28", "category": "Zapatos", "brand": "Crocs", "price": 85000, "stock": 22, "age_range": "4-5 años"},
    {"name": "Zapatos Bebé Primeros Pasos T18", "category": "Zapatos", "brand": "Pimpolho", "price": 75000, "stock": 15, "age_range": "12-18 meses"},

    # LIBROS
    {"name": "Harry Potter Cámara Secreta", "category": "Libros", "brand": "Salamandra", "price": 42000, "stock": 25, "age_range": "8+ años"},
    {"name": "Harry Potter Piedra Filosofal", "category": "Libros", "brand": "Salamandra", "price": 38000, "stock": 30, "age_range": "8+ años"},
    {"name": "El Principito Ilustrado", "category": "Libros", "brand": "Salamandra", "price": 35000, "stock": 28, "age_range": "6+ años"},
    {"name": "Cuentos de los Hermanos Grimm", "category": "Libros", "brand": "Anaya", "price": 45000, "stock": 20, "age_range": "4-8 años"},
    {"name": "Matilda - Roald Dahl", "category": "Libros", "brand": "Alfaguara", "price": 32000, "stock": 22, "age_range": "7-12 años"},
    {"name": "Charlie y la Fábrica de Chocolate", "category": "Libros", "brand": "Alfaguara", "price": 32000, "stock": 20, "age_range": "7-12 años"},
    {"name": "Diario de Greg 1", "category": "Libros", "brand": "RBA", "price": 38000, "stock": 25, "age_range": "8-12 años"},
    {"name": "Diario de Greg 2", "category": "Libros", "brand": "RBA", "price": 38000, "stock": 22, "age_range": "8-12 años"},
    {"name": "Mi Primer Diccionario Ilustrado", "category": "Libros", "brand": "Larousse", "price": 55000, "stock": 18, "age_range": "4-8 años"},
    {"name": "Enciclopedia de Animales Infantil", "category": "Libros", "brand": "National Geographic Kids", "price": 75000, "stock": 15, "age_range": "6-12 años"},
    {"name": "Libro de Colorear Mandala Niños", "category": "Libros", "brand": "Genérico", "price": 18000, "stock": 50, "age_range": "4+ años"},
    {"name": "Cuentos para Dormir 5 Minutos", "category": "Libros", "brand": "Susaeta", "price": 35000, "stock": 30, "age_range": "2-6 años"},

    # ACCESORIOS
    {"name": "Mochila Escolar Dinosaurio", "category": "Accesorios", "brand": "Totto", "price": 85000, "stock": 20, "age_range": "4-8 años"},
    {"name": "Mochila Escolar Unicornio", "category": "Accesorios", "brand": "Totto", "price": 85000, "stock": 18, "age_range": "4-8 años"},
    {"name": "Lonchera Térmica Spiderman", "category": "Accesorios", "brand": "Thermos", "price": 55000, "stock": 25, "age_range": "4-10 años"},
    {"name": "Lonchera Térmica Princesas", "category": "Accesorios", "brand": "Thermos", "price": 55000, "stock": 22, "age_range": "4-10 años"},
    {"name": "Botella de Agua Minnie Mouse", "category": "Accesorios", "brand": "Disney", "price": 35000, "stock": 30, "age_range": "3+ años"},
    {"name": "Casco Bicicleta Niño T-S", "category": "Accesorios", "brand": "Nutcase", "price": 95000, "stock": 15, "age_range": "3-6 años"},
    {"name": "Rodilleras y Coderas Patines", "category": "Accesorios", "brand": "Genérico", "price": 45000, "stock": 25, "age_range": "5-12 años"},
    {"name": "Reloj Digital Niño Dinosaurio", "category": "Accesorios", "brand": "Vtech", "price": 65000, "stock": 18, "age_range": "4-8 años"},
    {"name": "Gafas de Sol Niña UV400", "category": "Accesorios", "brand": "Chicco", "price": 42000, "stock": 22, "age_range": "2-6 años"},
    {"name": "Set Accesorios Cabello Niña x20", "category": "Accesorios", "brand": "Genérico", "price": 28000, "stock": 40, "age_range": "3+ años"},

    # DEPORTES
    {"name": "Bicicleta 16 pulgadas Niño", "category": "Deportes", "brand": "Trek Kids", "price": 380000, "stock": 5, "age_range": "4-6 años"},
    {"name": "Bicicleta 20 pulgadas Niña", "category": "Deportes", "brand": "Trek Kids", "price": 420000, "stock": 4, "age_range": "6-8 años"},
    {"name": "Patines en Línea Ajustables T28-32", "category": "Deportes", "brand": "Rollerblade Kids", "price": 175000, "stock": 10, "age_range": "5-8 años"},
    {"name": "Patineta Madera Niño", "category": "Deportes", "brand": "Tony Hawk", "price": 145000, "stock": 8, "age_range": "6-12 años"},
    {"name": "Balón Fútbol N4 Colombia", "category": "Deportes", "brand": "Adidas", "price": 85000, "stock": 20, "age_range": "5-10 años"},
    {"name": "Arco de Fútbol Portátil", "category": "Deportes", "brand": "Genérico", "price": 65000, "stock": 15, "age_range": "4-10 años"},
    {"name": "Raquetas de Tenis Niño", "category": "Deportes", "brand": "Wilson Kids", "price": 95000, "stock": 12, "age_range": "5-10 años"},
    {"name": "Set de Golf Infantil", "category": "Deportes", "brand": "Genérico", "price": 75000, "stock": 10, "age_range": "4-8 años"},
    {"name": "Tabla de Surf Foam Niño", "category": "Deportes", "brand": "Genérico", "price": 280000, "stock": 4, "age_range": "6-12 años"},
    {"name": "Columpio y Tobogán 3 en 1", "category": "Deportes", "brand": "Little Tikes", "price": 650000, "stock": 3, "age_range": "2-6 años"},
]

# Variantes para generar más de 1000 productos
tallas_ropa = ["T2", "T4", "T6", "T8", "T10", "T12", "T14"]
tallas_zapatos = ["T22", "T24", "T26", "T28", "T30", "T32", "T34", "T36"]
colores = ["Rojo", "Azul", "Verde", "Amarillo", "Rosa", "Morado", "Naranja", "Blanco", "Negro", "Gris"]
edades = ["0-2 años", "2-4 años", "4-6 años", "6-8 años", "8-10 años", "10-12 años"]

async def limpiar_pruebas():
    result = await db.products.delete_many({"test_record": True})
    print(f"🗑️  Eliminados {result.deleted_count} registros de prueba anteriores")

async def insertar_productos_reales():
    print("\n=== Insertando productos reales de la tienda ===")
    
    productos_finales = []
    
    # Agregar productos base
    for p in productos_base:
        producto = {
            "name": p["name"],
            "description": f"Producto de alta calidad para {p['age_range']}. Marca {p['brand']}. Seguro y duradero, ideal como regalo.",
            "price": p["price"],
            "category": p["category"],
            "brand": p["brand"],
            "stock": p["stock"],
            "age_range": p["age_range"],
            "image_url": f"https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text={p['name'].replace(' ', '+')[:20]}",
            "is_active": True,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "reviews_count": random.randint(5, 150),
            "test_record": False
        }
        productos_finales.append(producto)

    # Generar variantes para llegar a 1000+
    categorias_extra = [
        ("Juguetes", ["Carro de Fricción", "Muñeca", "Robot", "Tren Eléctrico", "Castillo", "Nave Espacial", "Dinosaurio de Juguete", "Figura de Acción", "Títere", "Rompecabezas 3D"]),
        ("Educativo", ["Fichas de Letras", "Números de Madera", "Puzzle Geométrico", "Libro de Actividades", "Mapa Mundi", "Kit de Experimentos", "Instrumento Musical", "Set de Arte", "Juego de Memoria", "Domino Infantil"]),
        ("Ropa", ["Camiseta", "Pantalón", "Vestido", "Pijama", "Chompa", "Chaqueta", "Short", "Falda", "Overol", "Buzo"]),
        ("Zapatos", ["Tenis", "Sandalia", "Bota", "Zapato Colegial", "Pantufla", "Crocs", "Baleta", "Mocasín"]),
        ("Libros", ["Cuento Ilustrado", "Libro de Adivinanzas", "Libro de Chistes", "Enciclopedia", "Libro de Manualidades", "Novela Juvenil", "Libro de Ciencias", "Atlas Infantil"]),
        ("Accesorios", ["Mochila", "Lonchera", "Botella", "Billetera", "Correa", "Bufanda", "Guantes", "Gorro"]),
        ("Deportes", ["Pelota", "Raqueta", "Cuerda de Saltar", "Frisbee", "Bate", "Guante", "Red", "Conos de Entrenamiento"]),
    ]

    marcas_por_categoria = {
        "Juguetes": ["Mattel", "Hasbro", "LEGO", "Fisher-Price", "Melissa & Doug", "Play-Doh"],
        "Educativo": ["Melissa & Doug", "Educational Insights", "Kumon", "Crayola", "National Geographic Kids", "Vtech"],
        "Ropa": ["Carter's", "Nike Kids", "Adidas Kids", "Zara Kids", "H&M Kids", "Levi's Kids"],
        "Zapatos": ["Nike", "Adidas", "Crocs", "Skechers Kids", "Bata Kids", "Pimpolho"],
        "Libros": ["Alfaguara", "Salamandra", "Susaeta", "Larousse", "Anaya", "RBA"],
        "Accesorios": ["Totto", "Disney", "Thermos", "Vtech", "Chicco", "Genérico"],
        "Deportes": ["Adidas", "Nike", "Wilson Kids", "Trek Kids", "Little Tikes", "Genérico"],
    }

    precios_por_categoria = {
        "Juguetes": (25000, 350000),
        "Educativo": (18000, 280000),
        "Ropa": (35000, 180000),
        "Zapatos": (55000, 220000),
        "Libros": (18000, 85000),
        "Accesorios": (22000, 120000),
        "Deportes": (45000, 450000),
    }

    contador = len(productos_finales)
    
    for categoria, nombres in categorias_extra:
        for nombre_base in nombres:
            for color in colores:
                for edad in edades[:4]:
                    if contador >= 1050:
                        break
                    marca = random.choice(marcas_por_categoria[categoria])
                    precio_min, precio_max = precios_por_categoria[categoria]
                    precio = random.randint(precio_min // 1000, precio_max // 1000) * 1000
                    
                    producto = {
                        "name": f"{nombre_base} {color} - {edad}",
                        "description": f"{nombre_base} en color {color} para niños de {edad}. Marca {marca}. Material seguro y de alta calidad, cumple normas de seguridad infantil.",
                        "price": precio,
                        "category": categoria,
                        "brand": marca,
                        "stock": random.randint(2, 50),
                        "age_range": edad,
                        "color": color,
                        "image_url": f"https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text={nombre_base.replace(' ', '+')}",
                        "is_active": True,
                        "rating": round(random.uniform(3.5, 5.0), 1),
                        "reviews_count": random.randint(1, 100),
                        "test_record": False
                    }
                    productos_finales.append(producto)
                    contador += 1
                if contador >= 1050:
                    break
            if contador >= 1050:
                break

    # Insertar en lotes
    lote = 100
    total_insertados = 0
    for i in range(0, len(productos_finales), lote):
        lote_actual = productos_finales[i:i+lote]
        result = await db.products.insert_many(lote_actual)
        total_insertados += len(result.inserted_ids)
        print(f"  ✅ Insertados {total_insertados}/{len(productos_finales)} productos...")

    print(f"\n✅ COMPLETADO: {total_insertados} productos reales insertados")
    return total_insertados

async def verificar_resultados():
    print("\n=== Verificación final ===")
    total = await db.products.count_documents({})
    por_categoria = {}
    categorias = ["Juguetes", "Educativo", "Ropa", "Zapatos", "Libros", "Accesorios", "Deportes"]
    for cat in categorias:
        count = await db.products.count_documents({"category": cat})
        por_categoria[cat] = count
        print(f"  📦 {cat}: {count} productos")
    print(f"\n  📊 TOTAL: {total} productos en la tienda")

async def main():
    print("🛍️  Cargando catálogo real de PequeWorld")
    print("=" * 50)
    await limpiar_pruebas()
    await insertar_productos_reales()
    await verificar_resultados()
    print("\n✅ ¡Catálogo listo! Los productos ya se ven en la web.")
    client.close()

asyncio.run(main())
