import asyncio
from database import (
    users_collection,
    categories_collection,
    products_collection,
    db
)
from auth import get_password_hash
from datetime import datetime
from uuid import uuid4

async def seed_database():
    print("🌱 Iniciando seed de base de datos...")
    
    # Crear usuario admin
    admin_exists = await users_collection.find_one({"email": "admin@tienda.com"})
    if not admin_exists:
        admin = {
            "id": str(uuid4()),
            "email": "admin@tienda.com",
            "full_name": "Administrador",
            "phone": "+57 300 123 4567",
            "address": "Bogotá, Colombia",
            "role": "admin",
            "hashed_password": get_password_hash("admin123"),
            "created_at": datetime.utcnow()
        }
        await users_collection.insert_one(admin)
        print("✅ Admin creado: admin@tienda.com / admin123")
    else:
        print("ℹ️  Admin ya existe")
    
    # Crear categorías
    categories_count = await categories_collection.count_documents({})
    if categories_count == 0:
        categories = [
            {
                "id": str(uuid4()),
                "name": "Juguetes",
                "slug": "juguetes",
                "description": "Los mejores juguetes para niños de todas las edades",
                "image_base64": "",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Ropa",
                "slug": "ropa",
                "description": "Ropa cómoda y divertida para los más pequeños",
                "image_base64": "",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Libros",
                "slug": "libros",
                "description": "Cuentos y libros educativos para fomentar la lectura",
                "image_base64": "",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Juegos de Mesa",
                "slug": "juegos-de-mesa",
                "description": "Juegos para toda la familia",
                "image_base64": "",
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Arte y Manualidades",
                "slug": "arte-manualidades",
                "description": "Materiales creativos para pequeños artistas",
                "image_base64": "",
                "created_at": datetime.utcnow()
            }
        ]
        await categories_collection.insert_many(categories)
        print(f"✅ {len(categories)} categorías creadas")
    else:
        print(f"ℹ️  Ya existen {categories_count} categorías")
    
    # Crear productos de ejemplo
    products_count = await products_collection.count_documents({})
    if products_count == 0:
        # Obtener IDs de categorías
        cat_juguetes = await categories_collection.find_one({"slug": "juguetes"})
        cat_ropa = await categories_collection.find_one({"slug": "ropa"})
        cat_libros = await categories_collection.find_one({"slug": "libros"})
        cat_juegos = await categories_collection.find_one({"slug": "juegos-de-mesa"})
        cat_arte = await categories_collection.find_one({"slug": "arte-manualidades"})
        
        products = [
            {
                "id": str(uuid4()),
                "name": "Set de Bloques de Construcción",
                "slug": "set-bloques-construccion",
                "description": "Set de 100 bloques coloridos de madera para estimular la creatividad y el desarrollo motor.",
                "price": 89900,
                "stock": 50,
                "category_id": cat_juguetes["id"] if cat_juguetes else None,
                "image_base64": "",
                "featured": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Muñeca Articulada Clásica",
                "slug": "muneca-articulada-clasica",
                "description": "Hermosa muñeca articulada de 30cm con ropa intercambiable. Material seguro y libre de BPA.",
                "price": 74900,
                "stock": 30,
                "category_id": cat_juguetes["id"] if cat_juguetes else None,
                "image_base64": "",
                "featured": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Tren de Madera con Rieles",
                "slug": "tren-madera-rieles",
                "description": "Encantador set de tren de madera con 20 piezas de rieles, locomotora y 3 vagones.",
                "price": 134900,
                "stock": 20,
                "category_id": cat_juguetes["id"] if cat_juguetes else None,
                "image_base64": "",
                "featured": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Conjunto Pijama Estampado",
                "slug": "conjunto-pijama-estampado",
                "description": "Suave pijama de algodón 100% con estampados de animales. Disponible en tallas 2-8 años.",
                "price": 56900,
                "stock": 100,
                "category_id": cat_ropa["id"] if cat_ropa else None,
                "image_base64": "",
                "featured": False,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Mochila Escolar Dinosaurio",
                "slug": "mochila-escolar-dinosaurio",
                "description": "Resistente mochila con diseño de dinosaurio. Interior organizado con múltiples compartimentos.",
                "price": 68900,
                "stock": 45,
                "category_id": cat_ropa["id"] if cat_ropa else None,
                "image_base64": "",
                "featured": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Cuento Ilustrado - El Gran Mundo",
                "slug": "cuento-ilustrado-gran-mundo",
                "description": "Hermoso libro ilustrado con vibrantes acuarelas. Ideal para 4-8 años.",
                "price": 44900,
                "stock": 60,
                "category_id": cat_libros["id"] if cat_libros else None,
                "image_base64": "",
                "featured": False,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Enciclopedia de Animales",
                "slug": "enciclopedia-animales",
                "description": "Fascinante enciclopedia con más de 500 animales del mundo, fotografías reales y datos curiosos.",
                "price": 98900,
                "stock": 25,
                "category_id": cat_libros["id"] if cat_libros else None,
                "image_base64": "",
                "featured": False,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Juego de Mesa - Serpientes y Escaleras",
                "slug": "serpientes-escaleras",
                "description": "Clásico juego con tablero gigante y fichas de colores vivos. Para 2-6 jugadores, edades 4+.",
                "price": 50900,
                "stock": 40,
                "category_id": cat_juegos["id"] if cat_juegos else None,
                "image_base64": "",
                "featured": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Set de Pinturas y Pinceles",
                "slug": "set-pinturas-pinceles",
                "description": "Completo set de 36 pinturas acrílicas no tóxicas con 12 pinceles de diferentes tamaños.",
                "price": 83900,
                "stock": 35,
                "category_id": cat_arte["id"] if cat_arte else None,
                "image_base64": "",
                "featured": False,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Kit de Plastilina 20 Colores",
                "slug": "kit-plastilina-20-colores",
                "description": "Set de plastilina suave y moldeable en 20 colores vibrantes. No tóxica y reutilizable.",
                "price": 38900,
                "stock": 80,
                "category_id": cat_arte["id"] if cat_arte else None,
                "image_base64": "",
                "featured": False,
                "created_at": datetime.utcnow()
            }
        ]
        await products_collection.insert_many(products)
        print(f"✅ {len(products)} productos creados")
    else:
        print(f"ℹ️  Ya existen {products_count} productos")
    
    print("\n🎉 Seed completado exitosamente!")
    print("\n📋 Credenciales de acceso:")
    print("   Email: admin@tienda.com")
    print("   Password: admin123")

if __name__ == "__main__":
    asyncio.run(seed_database())
