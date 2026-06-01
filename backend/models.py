from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
from uuid import uuid4

# ============ USER MODELS ============

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str = ""
    address: str = ""

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    role: Literal["customer", "admin"] = "customer"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    hashed_password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

# ============ CATEGORY MODELS ============

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str = ""
    image_base64: str = ""

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============ PRODUCT MODELS ============

class ProductBase(BaseModel):
    name: str
    slug: str
    description: str = ""
    price: float
    stock: int
    category_id: Optional[str] = None
    image_base64: str = ""
    featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[str] = None
    image_base64: Optional[str] = None
    featured: Optional[bool] = None

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductWithCategory(Product):
    category: Optional[Category] = None

# ============ CART MODELS ============

class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CartItemWithProduct(CartItem):
    product: Optional[Product] = None

# ============ ORDER MODELS ============

class ShippingAddress(BaseModel):
    name: str
    phone: str
    street: str
    city: str
    state: str
    zip_code: str

class PaymentInfo(BaseModel):
    method: Literal["mercadopago", "nequi", "bancolombia", "transferencia", "efectivo"] = "mercadopago"
    transaction_id: Optional[str] = None
    status: Literal["pending", "approved", "rejected", "cancelled"] = "pending"

class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    order_id: str

class OrderItemWithProduct(OrderItem):
    product: Optional[Product] = None

class OrderBase(BaseModel):
    shipping_address: ShippingAddress
    payment_info: PaymentInfo

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    total: float
    status: Literal["pending", "processing", "shipped", "delivered", "cancelled"] = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderWithItems(Order):
    items: List[OrderItemWithProduct] = []
    user: Optional[User] = None

# ============ AUTH MODELS ============

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

# ============ STATS MODELS ============

class DashboardStats(BaseModel):
    total_products: int
    total_orders: int
    total_users: int
    total_revenue: float
    recent_orders: List[Order] = []
