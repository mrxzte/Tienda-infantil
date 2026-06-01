from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'tienda_infantil')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
users_collection = db.users
categories_collection = db.categories
products_collection = db.products
cart_items_collection = db.cart_items
orders_collection = db.orders
order_items_collection = db.order_items

async def close_db():
    client.close()
