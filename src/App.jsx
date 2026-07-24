import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Producto from './pages/Producto.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import Admin from './pages/admin/Admin.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminPedidos from './pages/admin/AdminPedidos.jsx'

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:slug" element={<Producto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}

export default App