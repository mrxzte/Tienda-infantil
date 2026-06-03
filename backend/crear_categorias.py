import asyncio
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "tienda_infantil")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

categorias = [
    {"name": "Juguetes", "slug": "juguetes", "description": "Los mejores juguetes para niños de todas las edades"},
    {"name": "Educativo", "slug": "educativo", "description": "Juguetes y materiales educativos para aprender jugando"},
    {"name": "Ropa", "slug": "ropa", "description": "Ropa cómoda y de calidad para niños y bebés"},
    {"name": "Zapatos", "slug": "zapatos", "description": "Calzado seguro y cómodo para los pequeños"},
    {"name": "Libros", "slug": "libros", "description": "Libros infantiles y juveniles para fomentar la lectura"},
    {"name": "Accesorios", "slug": "accesorios", "description": "Accesorios y complementos para niños"},
    {"name": "Deportes", "slug": "deportes", "description": "Todo para el deporte y la actividad física infantil"},
]

async def main():
    print("🚀 Creando categorías y actualizando productos...")

    # Insertar categorías
    categoria_ids = {}
    for cat in categorias:
        existente = await db.categories.find_one({"slug": cat["slug"]})
        if existente:
            categoria_ids[cat["name"]] = existente["id"]
            print(f"  ✅ Categoría ya existe: {cat['name']}")
        else:
            cat_id = str(uuid.uuid4())
            await db.categories.insert_one({
                "name": cat["name"],
                "slug": cat["slug"],
                "description": cat["description"],
                "image_base64": "",
                "id": cat_id,
                "created_at": datetime.now(timezone.utc)
            })
            categoria_ids[cat["name"]] = cat_id
            print(f"  ✅ Categoría creada: {cat['name']} → {cat_id}")

    # Actualizar productos con category_id correcto
    print("\n📦 Actualizando productos con category_id...")
    total = 0
    for nombre_cat, cat_id in categoria_ids.items():
        result = await db.products.update_many(
            {"category": nombre_cat, "category_id": {"$exists": False}},
            {"$set": {"category_id": cat_id, "featured": False, "slug": nombre_cat.lower()}}
        )
        if result.modified_count > 0:
            print(f"  ✅ {nombre_cat}: {result.modified_count} productos actualizados")
            total += result.modified_count

    print(f"\n✅ COMPLETADO: {total} productos actualizados con category_id")
    
    # Verificar
    sin_categoria = await db.products.count_documents({"category_id": {"$exists": False}})
    con_categoria = await db.products.count_documents({"category_id": {"$exists": True}})
    print(f"📊 Productos con category_id: {con_categoria}")
    print(f"⚠️  Productos sin category_id: {sin_categoria}")
    
    client.close()

asyncio.run(main())
