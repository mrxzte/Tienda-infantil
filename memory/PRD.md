# PRD - PequeWorld Tienda Infantil Profesional

## 📋 Problema Original

Convertir un proyecto base en una tienda infantil profesional y funcional con:
1. **Panel de administración completo** - CRUD de productos, imágenes, inventario, categorías, pedidos, clientes, usuarios, estadísticas
2. **Métodos de pago reales** - Nequi, Bancolombia, tarjeta, transferencia (con Mercado Pago)
3. **Login en modal** - Sin redirección, con fondo oscuro y blur
4. **Mantener estructura actual** - Sin eliminar funcionalidades existentes

## 🎯 Decisiones del Usuario

- **Backend:** FastAPI + MongoDB + JWT custom (no Supabase)
- **Pagos:** Mercado Pago (credenciales pendientes)
- **Imágenes:** Base64 en MongoDB
- **Admin:** admin@tienda.com / admin123
- **Idioma:** Español 🇨🇴
- **Moneda:** Pesos Colombianos (COP)

## 🏗️ Arquitectura

### Backend (`/app/backend/`)
- **Framework:** FastAPI
- **Base de datos:** MongoDB (DB: tienda_infantil)
- **Auth:** JWT con bcrypt
- **Archivos:**
  - `server.py` - API principal con 30+ endpoints
  - `models.py` - Modelos Pydantic
  - `database.py` - Conexión MongoDB
  - `auth.py` - JWT y middleware
  - `seed.py` - Datos iniciales

### Frontend (`/app/frontend/`)
- **Framework:** React + Tailwind CSS
- **Routing:** Custom useRouter hook
- **State:** Context API (AuthContext, CartContext)
- **HTTP:** Axios con interceptores JWT

## 👥 User Personas

### Cliente
- Compra productos para sus hijos
- Necesita: catálogo, carrito, checkout, ver pedidos

### Administrador
- Gestiona la tienda
- Necesita: CRUD productos/categorías, gestionar pedidos/usuarios, ver estadísticas

## ✅ Implementado (20 May 2026)

### Backend (35/35 tests pasados - 100%)
- ✅ Autenticación JWT (register, login, me, profile)
- ✅ Productos CRUD con filtros (categoría, búsqueda, destacados)
- ✅ Categorías CRUD (solo admin)
- ✅ Carrito completo (sincronizado con BD)
- ✅ Pedidos con estados (pending → processing → shipped → delivered/cancelled)
- ✅ Stock se decrementa automáticamente al crear pedido
- ✅ Cart se limpia al crear pedido
- ✅ Gestión de usuarios (solo admin)
- ✅ Dashboard stats (productos, pedidos, usuarios, ingresos)
- ✅ Autorización por roles (customer/admin)
- ✅ Seed data: 1 admin, 5 categorías, 10 productos

### Frontend
**Páginas Públicas:**
- ✅ Home - Hero, categorías, productos destacados
- ✅ Products - Catálogo con filtros y búsqueda
- ✅ ProductDetail - Detalle completo
- ✅ Cart - Carrito de compras
- ✅ Checkout - 2 pasos (envío + método de pago)

**Modal de Auth:**
- ✅ Login/Register en modal con backdrop oscuro y blur
- ✅ Sin redirección
- ✅ Switch entre login y register sin cerrar

**Panel Admin:**
- ✅ Dashboard - Estadísticas y pedidos recientes
- ✅ Productos - Lista con búsqueda
- ✅ Agregar Producto - Con subida de imagen base64
- ✅ Editar Producto - Edición completa
- ✅ Categorías - CRUD con modal e imagen
- ✅ Pedidos - Filtros por estado, cambio de estado, modal de detalle
- ✅ Usuarios - Lista, cambio de roles

**Componentes:**
- ✅ Modal con backdrop blur
- ✅ AuthModal (login/register)
- ✅ Navbar con cart count y user menu
- ✅ Footer
- ✅ ProductCard
- ✅ ImageUploader (base64)
- ✅ SidebarAdmin

## 📝 Credenciales

```
Admin Email: admin@tienda.com
Admin Password: admin123
```

## 🔜 Backlog (P0/P1/P2)

### P0 - Crítico (próxima sesión)
- Integración real con Mercado Pago Checkout Pro (requiere credenciales del usuario)
- Webhook de notificaciones de pago

### P1 - Importante
- Gráficos de ventas detallados en dashboard (ventas por día/semana/mes)
- Productos más vendidos
- Exportación de pedidos a Excel/PDF
- Notificaciones por email (SendGrid)

### P2 - Mejoras
- Reviews y ratings de productos
- Lista de deseos (wishlist)
- Cupones de descuento
- Sistema de puntos/lealtad
- Multi-imagen por producto
- Variantes (tallas, colores)
- Búsqueda avanzada con autocompletado

## 🚀 Próximos Pasos

1. **Obtener credenciales de Mercado Pago** del usuario
2. **Implementar integración real de pagos** con Mercado Pago Checkout Pro
3. **Mejorar dashboard** con gráficos (recharts ya instalado)
4. **Testing E2E del frontend** completo

## 📊 Estado Actual

- ✅ Backend: Funcionando al 100% (35/35 tests pasados)
- ✅ Frontend: Compilado sin errores, todas las páginas funcionando
- ✅ MongoDB: Conectado con datos iniciales
- ✅ Modal de Login: Con blur y backdrop oscuro
- ✅ Panel Admin: Completo y funcional
- ⏳ Pagos: Estructura lista, pendiente integración con Mercado Pago
