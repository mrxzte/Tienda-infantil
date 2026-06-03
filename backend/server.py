from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from typing import List, Optional
from datetime import timedelta

# Importar modelos, database y auth
from models import (
    User, UserCreate, UserLogin, UserUpdate, Token,
    Category, CategoryCreate,
    Product, ProductCreate, ProductUpdate, ProductWithCategory,
    CartItem, CartItemCreate, CartItemWithProduct,
    Order, OrderCreate, OrderWithItems, OrderItem,
    DashboardStats
)
from database import (
    users_collection, categories_collection, products_collection,
    cart_items_collection, orders_collection, order_items_collection,
    close_db
)
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, get_current_admin, ACCESS_TOKEN_EXPIRE_MINUTES
)
import mercadopago_service as mp_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Crear app principal
app = FastAPI(title="PequeWorld API", version="1.0.0")

# Crear router con prefijo /api
api_router = APIRouter(prefix="/api")

# ============ AUTENTICACIÓN ============

@api_router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Registrar nuevo usuario"""
    # Verificar si el email ya existe
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    user = User(**user_data.model_dump(exclude={"password"}))
    user_in_db = {
        **user.model_dump(),
        "hashed_password": get_password_hash(user_data.password)
    }
    
    await users_collection.insert_one(user_in_db)
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Iniciar sesión"""
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Retornar sin hashed_password
    user_response = User(**user.model_dump(exclude={"hashed_password"}))
    return Token(access_token=access_token, user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtener perfil del usuario actual"""
    return current_user

@api_router.put("/auth/profile", response_model=User)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Actualizar perfil del usuario"""
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if update_data:
        await users_collection.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
    
    # Obtener usuario actualizado
    updated_user = await users_collection.find_one({"id": current_user.id}, {"_id": 0, "hashed_password": 0})
    return User(**updated_user)

# ============ CATEGORÍAS ============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Obtener todas las categorías"""
    categories = await categories_collection.find({}, {"_id": 0}).to_list(1000)
    return [Category(**cat) for cat in categories]

@api_router.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_admin: User = Depends(get_current_admin)
):
    """Crear nueva categoría (solo admin)"""
    # Verificar slug único
    existing = await categories_collection.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con ese slug"
        )
    
    category = Category(**category_data.model_dump())
    await categories_collection.insert_one(category.model_dump())
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryCreate,
    current_admin: User = Depends(get_current_admin)
):
    """Actualizar categoría (solo admin)"""
    result = await categories_collection.update_one(
        {"id": category_id},
        {"$set": category_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    updated = await categories_collection.find_one({"id": category_id}, {"_id": 0})
    return Category(**updated)

@api_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_admin: User = Depends(get_current_admin)
):
    """Eliminar categoría (solo admin)"""
    result = await categories_collection.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

# ============ PRODUCTOS ============

@api_router.get("/products", response_model=List[ProductWithCategory])
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000)
):
    """Obtener productos con filtros opcionales"""
    query = {}
    
    if category:
        # Buscar categoría por slug
        cat = await categories_collection.find_one({"slug": category})
        if cat:
            query["category_id"] = cat["id"]
    
    if featured is not None:
        query["featured"] = featured
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await products_collection.find(query, {"_id": 0, "image_base64": 0}).limit(limit).to_list(limit)
    
    # Agregar información de categoría
    result = []
    for prod in products:
        product = Product(**prod)
        category_info = None
        if prod.get("category_id"):
            cat = await categories_collection.find_one({"id": prod["category_id"]}, {"_id": 0})
            if cat:
                category_info = Category(**cat)
        
        result.append(ProductWithCategory(**product.model_dump(), category=category_info))
    
    return result

@api_router.get("/products/{product_id}", response_model=ProductWithCategory)
async def get_product(product_id: str):
    """Obtener detalle de un producto"""
    product = await products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Agregar categoría
    category_info = None
    if product.get("category_id"):
        cat = await categories_collection.find_one({"id": product["category_id"]}, {"_id": 0})
        if cat:
            category_info = Category(**cat)
    
    prod = Product(**product)
    return ProductWithCategory(**prod.model_dump(), category=category_info)

@api_router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_admin: User = Depends(get_current_admin)
):
    """Crear nuevo producto (solo admin)"""
    # Verificar slug único
    existing = await products_collection.find_one({"slug": product_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un producto con ese slug"
        )
    
    product = Product(**product_data.model_dump())
    await products_collection.insert_one(product.model_dump())
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_admin: User = Depends(get_current_admin)
):
    """Actualizar producto (solo admin)"""
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await products_collection.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    updated = await products_collection.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated)

@api_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_admin: User = Depends(get_current_admin)
):
    """Eliminar producto (solo admin)"""
    result = await products_collection.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

# ============ CARRITO ============

@api_router.get("/cart", response_model=List[CartItemWithProduct])
async def get_cart(current_user: User = Depends(get_current_user)):
    """Obtener carrito del usuario"""
    cart_items = await cart_items_collection.find(
        {"user_id": current_user.id}, {"_id": 0}
    ).to_list(1000)
    
    result = []
    for item in cart_items:
        cart_item = CartItem(**item)
        product = await products_collection.find_one({"id": item["product_id"]}, {"_id": 0})
        product_obj = Product(**product) if product else None
        result.append(CartItemWithProduct(**cart_item.model_dump(), product=product_obj))
    
    return result

@api_router.post("/cart", response_model=CartItem, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_data: CartItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Agregar producto al carrito"""
    # Verificar si el producto existe
    product = await products_collection.find_one({"id": cart_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar si ya existe en el carrito
    existing = await cart_items_collection.find_one({
        "user_id": current_user.id,
        "product_id": cart_data.product_id
    })
    
    if existing:
        # Actualizar cantidad
        new_quantity = existing["quantity"] + cart_data.quantity
        await cart_items_collection.update_one(
            {"id": existing["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        updated = await cart_items_collection.find_one({"id": existing["id"]}, {"_id": 0})
        return CartItem(**updated)
    else:
        # Crear nuevo item
        cart_item = CartItem(**cart_data.model_dump(), user_id=current_user.id)
        await cart_items_collection.insert_one(cart_item.model_dump())
        return cart_item

@api_router.put("/cart/{item_id}", response_model=CartItem)
async def update_cart_item(
    item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user)
):
    """Actualizar cantidad en el carrito"""
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
    
    result = await cart_items_collection.update_one(
        {"id": item_id, "user_id": current_user.id},
        {"$set": {"quantity": quantity}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    updated = await cart_items_collection.find_one({"id": item_id}, {"_id": 0})
    return CartItem(**updated)

@api_router.delete("/cart/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    """Eliminar item del carrito"""
    result = await cart_items_collection.delete_one({
        "id": item_id,
        "user_id": current_user.id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")

@api_router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Limpiar todo el carrito"""
    await cart_items_collection.delete_many({"user_id": current_user.id})

# ============ PEDIDOS ============

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    """Obtener pedidos del usuario (o todos si es admin)"""
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    orders = await orders_collection.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=OrderWithItems)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener detalle de un pedido"""
    order = await orders_collection.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Verificar permisos
    if current_user.role != "admin" and order["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")
    
    # Obtener items del pedido
    items = await order_items_collection.find({"order_id": order_id}, {"_id": 0}).to_list(1000)
    items_with_products = []
    for item in items:
        order_item = OrderItem(**item)
        product = await products_collection.find_one({"id": item["product_id"]}, {"_id": 0})
        product_obj = Product(**product) if product else None
        items_with_products.append({**order_item.model_dump(), "product": product_obj})
    
    # Obtener usuario
    user = await users_collection.find_one({"id": order["user_id"]}, {"_id": 0, "hashed_password": 0})
    user_obj = User(**user) if user else None
    
    return OrderWithItems(**order, items=items_with_products, user=user_obj)

@api_router.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    """Crear nuevo pedido desde el carrito"""
    # Obtener items del carrito
    cart_items = await cart_items_collection.find(
        {"user_id": current_user.id}, {"_id": 0}
    ).to_list(1000)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    
    # Calcular total
    total = 0
    order_items = []
    
    for item in cart_items:
        product = await products_collection.find_one({"id": item["product_id"]})
        if product:
            # Verificar stock
            if product["stock"] < item["quantity"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para {product['name']}"
                )
            
            item_total = product["price"] * item["quantity"]
            total += item_total
            
            order_items.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "price": product["price"]
            })
    
    # Crear pedido
    order = Order(
        **order_data.model_dump(),
        user_id=current_user.id,
        total=total
    )
    await orders_collection.insert_one(order.model_dump())
    
    # Crear items del pedido
    for item_data in order_items:
        order_item = OrderItem(**item_data, order_id=order.id)
        await order_items_collection.insert_one(order_item.model_dump())
        
        # Actualizar stock
        await products_collection.update_one(
            {"id": item_data["product_id"]},
            {"$inc": {"stock": -item_data["quantity"]}}
        )
    
    # Limpiar carrito
    await cart_items_collection.delete_many({"user_id": current_user.id})
    
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_admin: User = Depends(get_current_admin)
):
    """Actualizar estado del pedido (solo admin)"""
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    result = await orders_collection.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    return {"message": "Estado actualizado correctamente"}

# ============ USUARIOS (ADMIN) ============

@api_router.get("/users", response_model=List[User])
async def get_users(current_admin: User = Depends(get_current_admin)):
    """Obtener todos los usuarios (solo admin)"""
    users = await users_collection.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return [User(**user) for user in users]

@api_router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_admin: User = Depends(get_current_admin)
):
    """Cambiar rol de usuario (solo admin)"""
    if role not in ["customer", "admin"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    result = await users_collection.update_one(
        {"id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Rol actualizado correctamente"}

# ============ DASHBOARD (ADMIN) ============

@api_router.get("/admin/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_admin: User = Depends(get_current_admin)):
    """Obtener estadísticas del dashboard (solo admin)"""
    total_products = await products_collection.count_documents({})
    total_orders = await orders_collection.count_documents({})
    total_users = await users_collection.count_documents({})
    
    # Calcular ingresos totales
    all_orders = await orders_collection.find({}, {"_id": 0, "total": 1}).to_list(10000)
    total_revenue = sum(order.get("total", 0) for order in all_orders)
    
    # Obtener pedidos recientes
    recent_orders = await orders_collection.find(
        {}, {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return DashboardStats(
        total_products=total_products,
        total_orders=total_orders,
        total_users=total_users,
        total_revenue=total_revenue,
        recent_orders=[Order(**order) for order in recent_orders]
    )

# ============ MERCADO PAGO ============

from fastapi import Request

@api_router.post("/payments/create-preference/{order_id}")
async def create_payment_preference(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Crea una preferencia de pago en Mercado Pago para un pedido existente"""
    if not mp_service.is_configured():
        raise HTTPException(status_code=503, detail="Mercado Pago no está configurado")
    
    # Buscar el pedido
    order = await orders_collection.find_one({"id": order_id, "user_id": current_user.id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Obtener items del pedido
    order_items = await order_items_collection.find(
        {"order_id": order_id}, {"_id": 0}
    ).to_list(1000)
    
    if not order_items:
        raise HTTPException(status_code=400, detail="El pedido no tiene items")
    
    # Construir items con info del producto
    items_for_mp = []
    for item in order_items:
        product = await products_collection.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            items_for_mp.append({
                "product_id": item["product_id"],
                "name": product["name"],
                "description": product.get("description", ""),
                "quantity": item["quantity"],
                "price": item["price"],
            })
    
    try:
        preference = mp_service.create_preference(
            order_id=order_id,
            items=items_for_mp,
            payer_email=current_user.email,
            payer_name=current_user.full_name,
        )
        
        # Guardar preference_id en el pedido
        await orders_collection.update_one(
            {"id": order_id},
            {"$set": {"payment_info.preference_id": preference["preference_id"]}}
        )
        
        return {
            "init_point": preference["init_point"],
            "sandbox_init_point": preference["sandbox_init_point"],
            "preference_id": preference["preference_id"],
            "public_key": mp_service.MP_PUBLIC_KEY,
        }
    except Exception as e:
        logger.error(f"Error creando preferencia MP: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/payments/webhook")
async def mercadopago_webhook(request: Request):
    """
    Webhook para recibir notificaciones de pago de Mercado Pago.
    MP envía: ?type=payment&data.id=XXX o cuerpo JSON con la info
    """
    try:
        # Parse query params
        params = dict(request.query_params)
        topic = params.get("type") or params.get("topic")
        data_id = params.get("data.id") or params.get("id")
        
        # Si viene en el body
        try:
            body = await request.json()
            if not data_id and isinstance(body, dict):
                data_id = body.get("data", {}).get("id") or body.get("id")
            if not topic and isinstance(body, dict):
                topic = body.get("type") or body.get("topic")
        except Exception:
            body = {}
        
        logger.info(f"Webhook MP recibido: topic={topic}, data_id={data_id}")
        
        if topic != "payment" or not data_id:
            return {"status": "ignored", "message": "Event not relevant"}
        
        # Obtener detalles del pago desde MP
        payment = mp_service.get_payment(data_id)
        if not payment:
            logger.warning(f"No se pudo obtener pago {data_id} de MP")
            return {"status": "error", "message": "Payment not found"}
        
        # Extraer info
        external_reference = payment.get("external_reference")  # order_id
        mp_status = payment.get("status", "pending")
        payment_method = payment.get("payment_method_id", "unknown")
        transaction_id = str(payment.get("id"))
        
        if not external_reference:
            logger.warning(f"Pago {data_id} sin external_reference")
            return {"status": "error", "message": "No external_reference"}
        
        # Actualizar pedido
        new_order_status = mp_service.map_mp_status_to_order_status(mp_status)
        new_payment_status = mp_service.map_mp_status_to_payment_status(mp_status)
        
        result = await orders_collection.update_one(
            {"id": external_reference},
            {"$set": {
                "status": new_order_status,
                "payment_info.method": "mercadopago",
                "payment_info.payment_method_detail": payment_method,
                "payment_info.transaction_id": transaction_id,
                "payment_info.status": new_payment_status,
                "payment_info.mp_status": mp_status,
            }}
        )
        
        logger.info(f"Pedido {external_reference} actualizado: status={new_order_status}, payment_status={new_payment_status}")
        
        return {"status": "ok", "order_id": external_reference, "payment_status": new_payment_status}
    
    except Exception as e:
        logger.error(f"Error en webhook MP: {e}")
        # Devolver 200 igual para que MP no reintente infinitamente
        return {"status": "error", "message": str(e)}


@api_router.get("/payments/status/{order_id}")
async def get_payment_status(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtiene el estado de pago de un pedido"""
    order = await orders_collection.find_one(
        {"id": order_id, "user_id": current_user.id}, {"_id": 0}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    return {
        "order_id": order_id,
        "order_status": order.get("status", "pending"),
        "payment_info": order.get("payment_info", {}),
        "total": order.get("total", 0),
    }


# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {
        "message": "PequeWorld API",
        "version": "1.0.0",
        "status": "online"
    }

# Incluir router en la app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
    logger.info("Database connection closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
