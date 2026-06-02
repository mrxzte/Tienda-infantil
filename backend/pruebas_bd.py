import asyncio
import time
import random
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://admin:admin123@cluster1.uhupbjc.mongodb.net/tienda_infantil")
DB_NAME = os.environ.get("DB_NAME", "tienda_infantil")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

categorias = ["Juguetes", "Ropa", "Zapatos", "Libros", "Accesorios", "Educativo", "Deportes"]
marcas = ["Fisher Price", "Lego", "Mattel", "Hasbro", "Nike Kids", "Adidas Kids"]

async def rf01_insertar_1000():
    print("\n=== RF-01: Insertando 1000+ registros ===")
    productos = []
    for i in range(1050):
        productos.append({
            "name": f"Producto de prueba {i+1}",
            "description": f"Descripción del producto {i+1} para prueba de desempeño",
            "price": round(random.uniform(10000, 200000), 2),
            "category": random.choice(categorias),
            "brand": random.choice(marcas),
            "stock": random.randint(0, 100),
            "image_url": f"https://via.placeholder.com/300?text=Producto{i+1}",
            "is_active": True,
            "test_record": True
        })
    result = await db.products.insert_many(productos)
    print(f"✅ RF-01 COMPLETADO: Se insertaron {len(result.inserted_ids)} registros en la colección 'products'")
    return len(result.inserted_ids)

async def rf02_contar_registros():
    print("\n=== RF-02: Contando registros en la tabla más importante ===")
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    print(f"📊 Colección 'products': {total_products} registros")
    print(f"📊 Colección 'users': {total_users} registros")
    print(f"📊 Colección 'orders': {total_orders} registros")
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
    minimo = min(tiempos)
    maximo = max(tiempos)
    print(f"\n✅ RF-03 COMPLETADO:")
    print(f"   Latencia promedio: {promedio:.2f} ms")
    print(f"   Latencia mínima:   {minimo:.2f} ms")
    print(f"   Latencia máxima:   {maximo:.2f} ms")

async def rf04_validaciones_stock():
    print("\n=== RF-04: Revisando validaciones de stock ===")
    sin_stock = await db.products.count_documents({"stock": 0, "test_record": True})
    con_stock = await db.products.count_documents({"stock": {"$gt": 0}, "test_record": True})
    stock_bajo = await db.products.count_documents({"stock": {"$gt": 0, "$lte": 5}, "test_record": True})
    stock_alto = await db.products.count_documents({"stock": {"$gt": 50}, "test_record": True})
    total = await db.products.count_documents({"test_record": True})
    print(f"📦 Total productos de prueba: {total}")
    print(f"❌ Sin stock (stock = 0): {sin_stock} productos")
    print(f"⚠️  Stock bajo (1-5 unidades): {stock_bajo} productos")
    print(f"✅ Con stock disponible (>0): {con_stock} productos")
    print(f"🟢 Stock alto (>50 unidades): {stock_alto} productos")
    print(f"✅ RF-04 COMPLETADO: Validaciones de stock revisadas correctamente")

async def main():
    print("🚀 Iniciando pruebas de desempeño - PequeWorld")
    print("=" * 50)
    await rf01_insertar_1000()
    await rf02_contar_registros()
    await rf03_medir_latencia()
    await rf04_validaciones_stock()
    print("\n" + "=" * 50)
    print("✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE")
    client.close()

asyncio.run(main())
