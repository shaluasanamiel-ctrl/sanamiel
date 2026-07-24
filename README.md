# Sanamiel

Tienda online de perfumes y joyería con panel administrativo completo.

## Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4
- **Backend**: Express 5 + PostgreSQL (Aiven)
- **Autenticación**: Sesiones con bcrypt
- **Despliegue**: Render

## Estructura

```
src/
├── api.js                    # Cliente API
├── context/CartContext.jsx    # Carrito (localStorage)
├── components/Layout.jsx      # Header, nav, footer
└── pages/
    ├── Home.jsx               # Portada
    ├── Catalogo.jsx           # Catálogo con filtros
    ├── Producto.jsx           # Detalle de producto
    ├── Carrito.jsx            # Carrito de compras
    ├── Checkout.jsx           # Checkout por WhatsApp
    └── admin/
        ├── AdminLayout.jsx    # Layout del panel
        ├── AdminLogin.jsx     # Login
        ├── AdminDashboard.jsx # Dashboard
        ├── AdminProductos.jsx # CRUD productos + fotos + variantes
        ├── AdminPedidos.jsx   # Gestión de pedidos
        ├── AdminConfig.jsx    # Configuración de la tienda
        └── AdminPayments.jsx  # Métodos de pago
server.cjs                     # Servidor Express + API
```

## Funcionalidades

### Tienda pública
- Catálogo con filtros (tipo, categoría, material, género, búsqueda, orden)
- Galería de imágenes, variantes, stock
- Carrito persistente en localStorage
- Checkout: crea pedido en BD y abre WhatsApp

### Panel administrativo (`/admin`)
- Login con bcrypt y sesiones
- Dashboard con indicadores (pedidos pendientes, stock bajo, ventas del mes)
- CRUD de productos con fotos y variantes
- Gestión de pedidos (cambiar estado)
- Configuración de la tienda (WhatsApp, hero, redes sociales)
- Métodos de pago (QR, Wompi, transferencia, efectivo)

### Base de datos (PostgreSQL)
- 9 tablas: categorías, productos, imágenes, variantes, pedidos, items, settings, payment_methods, admin_users
- Seed automático con 12 productos y 6 categorías

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de PostgreSQL (Aiven) |
| `SESSION_SECRET` | Secreto de sesión |
| `ADMIN_USER` | Usuario admin (defecto: admin) |
| `ADMIN_PASS` | Contraseña admin |
| `CORS_ORIGIN` | Origen CORS |

## Desarrollo local

```bash
npm install
npm run dev         # Frontend :5173
npm run server      # Backend :3001
npm run dev:all     # Ambos
```

## Despliegue (Render)

1. Crear Web Service desde GitHub
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Variables de entorno: DATABASE_URL, SESSION_SECRET, ADMIN_USER, ADMIN_PASS

## URL

- Tienda: https://sanamiel.onrender.com
- Admin: https://sanamiel.onrender.com/admin
