import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Producto from './pages/Producto.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminPedidos from './pages/admin/AdminPedidos.jsx'
import AdminConfig from './pages/admin/AdminConfig.jsx'
import AdminPayments from './pages/admin/AdminPayments.jsx'

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
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="config" element={<AdminConfig />} />
          <Route path="pagos" element={<AdminPayments />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}

export default App