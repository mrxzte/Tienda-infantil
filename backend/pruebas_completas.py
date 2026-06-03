import asyncio
import random
import uuid
import time
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "tienda_infantil")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def obtener_categorias():
    categorias = {}
    async for cat in db.categories.find({}):
        categorias[cat["name"]] = cat["id"]
    return categorias

async def rf01_insertar_1000(categorias):
    print("\n=== RF-01: Insertando 1000+ registros ===")

    productos_data = [
        # JUGUETES
        ("Lego City Estación de Policía", "Juguetes", 189000, 15, "El set de policía más completo para construir aventuras"),
        ("Lego Friends Casa de la Amistad", "Juguetes", 145000, 20, "Construye y decora la casa de tus sueños"),
        ("Lego Technic Coche de Carreras", "Juguetes", 220000, 10, "Coche técnico con mecanismos reales"),
        ("Lego Duplo Mi Primer Tren", "Juguetes", 95000, 25, "Tren colorido para los más pequeños"),
        ("Barbie Dreamhouse", "Juguetes", 320000, 8, "La casa de los sueños de Barbie con 3 pisos"),
        ("Barbie Fashionista Set x5", "Juguetes", 89000, 30, "5 Barbies con diferentes estilos de moda"),
        ("Hot Wheels Pista Loop Doble", "Juguetes", 75000, 18, "Pista con doble loop de alta velocidad"),
        ("Hot Wheels Pack 20 Carros", "Juguetes", 65000, 35, "Pack coleccionable de 20 carros miniatura"),
        ("Nerf Elite 2.0 Commander", "Juguetes", 110000, 12, "Pistola Nerf con 6 dardos de espuma"),
        ("Nerf Rival Prometheus", "Juguetes", 280000, 6, "La Nerf más potente de la línea Rival"),
        ("Play-Doh Set Cocina Mágica", "Juguetes", 85000, 22, "Crea comidas divertidas con plastilina"),
        ("Play-Doh Torre de Helados", "Juguetes", 72000, 28, "Fabrica helados coloridos con Play-Doh"),
        ("Monopoly Junior", "Juguetes", 68000, 20, "Versión simplificada del clásico Monopoly"),
        ("Monopoly Clásico", "Juguetes", 85000, 15, "El juego de mesa más famoso del mundo"),
        ("Jenga Original", "Juguetes", 45000, 30, "Torre de bloques para poner a prueba el pulso"),
        ("Scrabble Junior", "Juguetes", 58000, 18, "Aprende palabras jugando con letras"),
        ("UNO Clásico", "Juguetes", 25000, 50, "El juego de cartas favorito de la familia"),
        ("Twister", "Juguetes", 48000, 22, "El juego que pone a prueba el equilibrio"),
        ("Fisher Price Piano Musical", "Juguetes", 95000, 16, "Piano colorido con sonidos y luces"),
        ("Fisher Price Centro Actividades", "Juguetes", 185000, 10, "Centro de actividades para bebés"),
        ("Carro Control Remoto 4x4", "Juguetes", 145000, 12, "Carro todoterreno con control remoto"),
        ("Drone Mini para Niños", "Juguetes", 120000, 8, "Drone fácil de manejar para principiantes"),
        ("Pistola de Burbujas Automática", "Juguetes", 35000, 40, "Crea miles de burbujas automáticamente"),
        ("Set de Magia 100 Trucos", "Juguetes", 75000, 15, "Aprende magia con 100 trucos incluidos"),
        ("Cocina de Juguete Deluxe", "Juguetes", 250000, 7, "Cocina completa con accesorios"),
        ("Muñeca Baby Alive", "Juguetes", 175000, 12, "Muñeca que come y hace sus necesidades"),
        ("Figura de Acción Batman 30cm", "Juguetes", 65000, 20, "Figura articulada del Caballero Oscuro"),
        ("Figura de Acción Spiderman", "Juguetes", 65000, 18, "Figura articulada del Hombre Araña"),
        ("Set de Dinosaurios x12", "Juguetes", 55000, 25, "12 dinosaurios de diferentes especies"),
        ("Castillo de Princesas", "Juguetes", 185000, 8, "Castillo rosado con accesorios incluidos"),
        ("Nave Espacial de Juguete", "Juguetes", 95000, 15, "Nave con luces y sonidos galácticos"),
        ("Robot Bailarín con Luz", "Juguetes", 85000, 18, "Robot que baila y emite luces de colores"),
        ("Tren Eléctrico Set Completo", "Juguetes", 220000, 6, "Tren eléctrico con rieles y accesorios"),
        ("Títere de Mano x5", "Juguetes", 45000, 30, "Set de 5 títeres de personajes divertidos"),
        ("Yoyo Profesional Luminoso", "Juguetes", 28000, 40, "Yoyo con luces LED para trucos"),

        # EDUCATIVO
        ("Abecedario Magnético Colores", "Educativo", 45000, 35, "Letras magnéticas coloridas para aprender"),
        ("Rompecabezas 500 Piezas Animales", "Educativo", 65000, 20, "Rompecabezas con animales del mundo"),
        ("Rompecabezas 1000 Piezas Mundo", "Educativo", 85000, 15, "Mapa del mundo en 1000 piezas"),
        ("Microscopio Infantil 100x", "Educativo", 135000, 10, "Microscopio real para pequeños científicos"),
        ("Kit de Química para Niños", "Educativo", 120000, 12, "Experimentos químicos seguros y divertidos"),
        ("Globo Terráqueo Interactivo", "Educativo", 185000, 8, "Globo con información de cada país"),
        ("Tablet Educativa LeapPad", "Educativo", 320000, 6, "Tablet con juegos educativos preinstalados"),
        ("Bloques de Construcción 100 pz", "Educativo", 95000, 25, "Bloques de madera para construir"),
        ("Set de Instrumentos Musicales", "Educativo", 75000, 18, "Set con tambor, flauta y maracas"),
        ("Tangram Magnético", "Educativo", 35000, 30, "Figuras geométricas magnéticas"),
        ("Kit de Robótica Básica", "Educativo", 280000, 5, "Construye tu propio robot programable"),
        ("Juego de Mesa Matemáticas", "Educativo", 55000, 22, "Aprende sumas y restas jugando"),
        ("Cuaderno Actividades Pre-escolar", "Educativo", 28000, 50, "Actividades para preparar el colegio"),
        ("Set Pintura Acuarela 36 colores", "Educativo", 45000, 35, "Acuarelas profesionales para niños"),
        ("Crayones Jumbo x24", "Educativo", 22000, 60, "Crayones gruesos fáciles de usar"),
        ("Kit de Slime Científico", "Educativo", 65000, 28, "Crea tu propio slime con ciencia"),
        ("Libro Interactivo de Sonidos", "Educativo", 85000, 20, "Libro con botones de sonidos animales"),
        ("Ábaco Colorido 100 bolas", "Educativo", 38000, 30, "Ábaco para aprender a contar"),
        ("Mapa de Colombia Rompecabezas", "Educativo", 42000, 25, "Aprende los departamentos de Colombia"),
        ("Set de Astronomía Infantil", "Educativo", 95000, 12, "Telescopio y guía de estrellas"),
        ("Dominó de Animales", "Educativo", 32000, 35, "Dominó con imágenes de animales"),
        ("Memoria de Frutas x40", "Educativo", 28000, 40, "Juego de memoria con frutas coloridas"),
        ("Plastilina Set 20 colores", "Educativo", 35000, 45, "Plastilina suave en 20 colores"),
        ("Juego de Lógica Nivel 1", "Educativo", 58000, 20, "Puzzles de lógica para niños"),
        ("Set Experimentos Física", "Educativo", 95000, 10, "Experimentos de física para el hogar"),

        # ROPA
        ("Pijama Dinosaurios Niño T4", "Ropa", 65000, 20, "Pijama suave con estampado de dinosaurios"),
        ("Pijama Unicornio Niña T6", "Ropa", 65000, 18, "Pijama rosa con unicornios brillantes"),
        ("Conjunto Deportivo Niño T8", "Ropa", 120000, 15, "Conjunto transpirable para deporte"),
        ("Vestido Casual Niña T10", "Ropa", 85000, 12, "Vestido floral para el día a día"),
        ("Jean Skinny Niña T12", "Ropa", 95000, 10, "Jean ajustado con elastano para comodidad"),
        ("Chaqueta Impermeable Niño T6", "Ropa", 145000, 8, "Chaqueta resistente al agua"),
        ("Camiseta Spiderman T4", "Ropa", 45000, 25, "Camiseta oficial del Hombre Araña"),
        ("Camiseta Frozen Niña T6", "Ropa", 45000, 22, "Camiseta con Elsa y Anna"),
        ("Buzo Polar Niño T8", "Ropa", 110000, 15, "Buzo abrigado para días fríos"),
        ("Overol Bebé 0-3 meses", "Ropa", 55000, 20, "Overol suave de algodón para bebé"),
        ("Set 5 Bodys Bebé", "Ropa", 85000, 18, "Pack de 5 bodys en colores pastel"),
        ("Abrigo Invierno Niña T10", "Ropa", 165000, 8, "Abrigo largo con capucha y botones"),
        ("Shorts Deportivos Niño T12", "Ropa", 68000, 15, "Shorts ligeros para actividad física"),
        ("Vestido Fiesta Niña T8", "Ropa", 120000, 6, "Vestido elegante para ocasiones especiales"),
        ("Pantalón Jogger Niño T6", "Ropa", 75000, 18, "Pantalón cómodo con elástico"),
        ("Camiseta Minnie Mouse T4", "Ropa", 48000, 22, "Camiseta con Minnie Mouse en brillo"),
        ("Conjunto Pijama Navidad T8", "Ropa", 75000, 15, "Pijama navideño familiar"),
        ("Vestido Playa Niña T6", "Ropa", 55000, 20, "Vestido playero colorido"),
        ("Camiseta Sin Mangas Niño T10", "Ropa", 38000, 25, "Camiseta deportiva sin mangas"),
        ("Medias Antideslizantes Bebé x3", "Ropa", 25000, 40, "Pack de 3 medias con suela antideslizante"),

        # ZAPATOS
        ("Tenis Nike Air Max Niño T28", "Zapatos", 195000, 10, "Tenis cómodos con amortiguación Air"),
        ("Tenis Adidas Fortarun Niña T30", "Zapatos", 175000, 12, "Tenis ligeros para correr y jugar"),
        ("Sandalias de Playa Niño T32", "Zapatos", 95000, 20, "Sandalias resistentes al agua"),
        ("Botas de Lluvia Dinosaurio T28", "Zapatos", 110000, 15, "Botas impermeables con dinosaurios"),
        ("Zapatos Colegiales Niña T34", "Zapatos", 85000, 18, "Zapatos formales para el colegio"),
        ("Tenis con Luces Niño T26", "Zapatos", 125000, 14, "Tenis que se iluminan al caminar"),
        ("Baletas Niña T32", "Zapatos", 65000, 20, "Baletas cómodas para uso diario"),
        ("Botas Cowboy Niño T30", "Zapatos", 95000, 10, "Botas estilo vaquero para niños"),
        ("Crocs Classic Niña T28", "Zapatos", 85000, 22, "Crocs originales ultralivianos"),
        ("Zapatos Primeros Pasos T18", "Zapatos", 75000, 15, "Zapatos flexibles para aprender a caminar"),
        ("Tenis Puma Niño T32", "Zapatos", 165000, 10, "Tenis clásicos Puma para niños"),
        ("Pantuflas Unicornio T30", "Zapatos", 45000, 25, "Pantuflas suaves con unicornio"),
        ("Botas de Montaña T34", "Zapatos", 145000, 8, "Botas para senderismo infantil"),
        ("Tenis Skechers con Luces T28", "Zapatos", 135000, 12, "Tenis con ruedas y luces LED"),
        ("Sandalias Cuero Niña T30", "Zapatos", 85000, 15, "Sandalias de cuero genuino"),

        # LIBROS
        ("Harry Potter Cámara Secreta", "Libros", 42000, 25, "Segunda entrega de la saga de Harry Potter"),
        ("Harry Potter Piedra Filosofal", "Libros", 38000, 30, "El inicio de la magia en Hogwarts"),
        ("El Principito Ilustrado", "Libros", 35000, 28, "Edición especial con ilustraciones a color"),
        ("Cuentos Hermanos Grimm", "Libros", 45000, 20, "Los cuentos clásicos de los Grimm"),
        ("Matilda - Roald Dahl", "Libros", 32000, 22, "La niña con poderes telequinéticos"),
        ("Charlie Fábrica de Chocolate", "Libros", 32000, 20, "La aventura más dulce de Roald Dahl"),
        ("Diario de Greg 1", "Libros", 38000, 25, "Las aventuras del torpe Greg Heffley"),
        ("Diario de Greg 2", "Libros", 38000, 22, "Continúan las aventuras de Greg"),
        ("Mi Primer Diccionario Ilustrado", "Libros", 55000, 18, "Diccionario con imágenes para niños"),
        ("Enciclopedia de Animales", "Libros", 75000, 15, "Más de 500 animales con fotos reales"),
        ("Libro Colorear Mandala Niños", "Libros", 18000, 50, "Mandalas para colorear y relajarse"),
        ("Cuentos para Dormir 5 Minutos", "Libros", 35000, 30, "Cuentos cortos para la hora de dormir"),
        ("Aprende a Leer con Peppa Pig", "Libros", 28000, 35, "Lectura inicial con Peppa Pig"),
        ("Atlas del Mundo Infantil", "Libros", 65000, 15, "Conoce todos los países del mundo"),
        ("100 Experimentos para Niños", "Libros", 48000, 20, "Ciencia divertida para hacer en casa"),

        # ACCESORIOS
        ("Mochila Escolar Dinosaurio", "Accesorios", 85000, 20, "Mochila ergonómica con dinosaurio"),
        ("Mochila Escolar Unicornio", "Accesorios", 85000, 18, "Mochila rosa con unicornio brillante"),
        ("Lonchera Térmica Spiderman", "Accesorios", 55000, 25, "Lonchera que mantiene la temperatura"),
        ("Lonchera Térmica Princesas", "Accesorios", 55000, 22, "Lonchera con personajes Disney"),
        ("Botella Agua Minnie Mouse", "Accesorios", 35000, 30, "Botella sin BPA con tapa de rosca"),
        ("Casco Bicicleta Niño T-S", "Accesorios", 95000, 15, "Casco certificado para ciclismo"),
        ("Rodilleras y Coderas Patines", "Accesorios", 45000, 25, "Protecciones para patinar seguro"),
        ("Reloj Digital Niño Dinosaurio", "Accesorios", 65000, 18, "Reloj resistente al agua con alarma"),
        ("Gafas de Sol Niña UV400", "Accesorios", 42000, 22, "Gafas con protección UV400"),
        ("Set Accesorios Cabello x20", "Accesorios", 28000, 40, "Coletas, diademas y pinches"),
        ("Paraguas Plegable Niño", "Accesorios", 38000, 25, "Paraguas compacto con diseño divertido"),
        ("Billetera Infantil Dinosaurio", "Accesorios", 32000, 30, "Billetera para los primeros ahorros"),
        ("Set Joyería Niña x10", "Accesorios", 45000, 20, "Collar, pulseras y aretes de fantasía"),
        ("Mochila Guardería Animales", "Accesorios", 65000, 25, "Mochila pequeña para guardería"),
        ("Correa para Mochila Reflectiva", "Accesorios", 22000, 35, "Seguridad vial para niños"),

        # DEPORTES
        ("Bicicleta 16 pulgadas Niño", "Deportes", 380000, 5, "Bicicleta con rueditas de entrenamiento"),
        ("Bicicleta 20 pulgadas Niña", "Deportes", 420000, 4, "Bicicleta rosa con canasta delantera"),
        ("Patines en Línea Ajustables", "Deportes", 175000, 10, "Patines que crecen con el niño"),
        ("Patineta Madera Niño", "Deportes", 145000, 8, "Patineta profesional de arce"),
        ("Balón Fútbol N4 Colombia", "Deportes", 85000, 20, "Balón oficial talla 4"),
        ("Arco de Fútbol Portátil", "Deportes", 65000, 15, "Arco plegable para el parque"),
        ("Raquetas de Tenis Niño", "Deportes", 95000, 12, "Set de 2 raquetas con pelota"),
        ("Set de Golf Infantil", "Deportes", 75000, 10, "Palos de golf de plástico resistente"),
        ("Columpio y Tobogán 3 en 1", "Deportes", 650000, 3, "Parque infantil para el jardín"),
        ("Cuerda para Saltar", "Deportes", 22000, 50, "Cuerda ajustable con mangos ergonómicos"),
        ("Hula Hoop Niño", "Deportes", 28000, 35, "Aro de hula hoop de colores"),
        ("Set Natación Niño", "Deportes", 85000, 15, "Gafas, tapones y gorro de natación"),
        ("Guantes Boxeo Infantil", "Deportes", 75000, 12, "Guantes acolchados para entrenamiento"),
        ("Red de Voleibol Infantil", "Deportes", 95000, 8, "Red ajustable para jugar en casa"),
        ("Frisbee Profesional", "Deportes", 32000, 30, "Disco volador ultraligero"),
    ]

    productos_finales = []
    for nombre, categoria, precio, stock, descripcion in productos_data:
        cat_id = categorias.get(categoria)
        if not cat_id:
            continue
        slug = nombre.lower().replace(" ", "-").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ñ","n")
        producto = {
            "name": nombre,
            "slug": f"{slug}-{str(uuid.uuid4())[:8]}",
            "description": descripcion,
            "price": precio,
            "stock": stock,
            "category_id": cat_id,
            "image_base64": "",
            "featured": random.choice([True, False]),
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc)
        }
        productos_finales.append(producto)

    # Generar variantes para llegar a 1000+
    nombres_extra = ["Deluxe", "Pro", "Mini", "XL", "Premium", "Especial", "Edición Limitada", "Clásico", "Nuevo", "Plus"]
    while len(productos_finales) < 1050:
        base = random.choice(productos_data)
        nombre, categoria, precio, stock, descripcion = base
        cat_id = categorias.get(categoria)
        if not cat_id:
            continue
        variante = random.choice(nombres_extra)
        nombre_var = f"{nombre} {variante}"
        slug = nombre_var.lower().replace(" ", "-").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ñ","n")
        precio_var = int(precio * random.uniform(0.9, 1.2))
        producto = {
            "name": nombre_var,
            "slug": f"{slug[:40]}-{str(uuid.uuid4())[:8]}",
            "description": f"{descripcion} Versión {variante}.",
            "price": precio_var,
            "stock": random.randint(1, 50),
            "category_id": cat_id,
            "image_base64": "",
            "featured": random.choice([True, False]),
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc)
        }
        productos_finales.append(producto)

    # Insertar en lotes
    lote = 100
    total = 0
    for i in range(0, len(productos_finales), lote):
        result = await db.products.insert_many(productos_finales[i:i+lote])
        total += len(result.inserted_ids)
        print(f"  Insertados {total}/{len(productos_finales)} productos...")

    print(f"✅ RF-01 COMPLETADO: Se insertaron {total} registros en la colección 'products'")
    return total

async def rf02_contar_registros():
    print("\n=== RF-02: Contando registros en la tabla más importante ===")
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_categories = await db.categories.count_documents({})
    print(f"📊 Colección 'products': {total_products} registros")
    print(f"📊 Colección 'users': {total_users} registros")
    print(f"📊 Colección 'orders': {total_orders} registros")
    print(f"📊 Colección 'categories': {total_categories} registros")
    print(f"✅ RF-02 COMPLETADO: La colección más importante es 'products' con {total_products} registros")

async def rf03_medir_latencia():
    print("\n=== RF-03: Midiendo latencia de consulta ===")
    tiempos = []
    for i in range(5):
        inicio = time.time()
        count = await db.products.count_documents({})
        fin = time.time()
        latencia = (fin - inicio) * 1000
        tiempos.append(latencia)
        print(f"  Consulta {i+1}: {latencia:.2f} ms — {count} registros")
    promedio = sum(tiempos) / len(tiempos)
    print(f"\n✅ RF-03 COMPLETADO:")
    print(f"   Latencia promedio: {promedio:.2f} ms")
    print(f"   Latencia mínima:   {min(tiempos):.2f} ms")
    print(f"   Latencia máxima:   {max(tiempos):.2f} ms")

async def rf04_validaciones_stock():
    print("\n=== RF-04: Revisando validaciones de stock ===")
    total = await db.products.count_documents({})
    sin_stock = await db.products.count_documents({"stock": 0})
    con_stock = await db.products.count_documents({"stock": {"$gt": 0}})
    stock_bajo = await db.products.count_documents({"stock": {"$gt": 0, "$lte": 5}})
    stock_alto = await db.products.count_documents({"stock": {"$gt": 50}})
    print(f"📦 Total productos: {total}")
    print(f"❌ Sin stock (stock = 0): {sin_stock} productos")
    print(f"⚠️  Stock bajo (1-5 unidades): {stock_bajo} productos")
    print(f"✅ Con stock disponible (>0): {con_stock} productos")
    print(f"🟢 Stock alto (>50 unidades): {stock_alto} productos")
    print(f"✅ RF-04 COMPLETADO: Validaciones de stock revisadas correctamente")

async def main():
    print("🚀 Iniciando pruebas de desempeño - PequeWorld")
    print("=" * 50)
    
    categorias = await obtener_categorias()
    if not categorias:
        print("❌ ERROR: No hay categorías. Ejecuta crear_categorias.py primero.")
        return
    
    print(f"✅ Categorías encontradas: {list(categorias.keys())}")
    
    await rf01_insertar_1000(categorias)
    await rf02_contar_registros()
    await rf03_medir_latencia()
    await rf04_validaciones_stock()
    
    print("\n" + "=" * 50)
    print("✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE")
    client.close()

asyncio.run(main())
