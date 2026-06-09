import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    prod = await db.products.find_one({}, {'_id': 0})
    print('Campos:', list(prod.keys()))
    client.close()

asyncio.run(main())
