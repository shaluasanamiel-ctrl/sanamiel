import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { fetchAdminMe, logoutAdmin } from '../../api.js'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminMe().then(u => {
      if (!u) { navigate('/admin/login') }
      else { setAdmin(u) }
    }).catch(() => navigate('/admin/login'))
    .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logoutAdmin()
    navigate('/admin/login')
  }

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center text-muted">Verificando sesión...</div>
  if (!admin) return null

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-64 bg-ink text-white p-6 flex flex-col max-md:w-16 max-md:p-3">
        <div className="font-display font-semibold text-xl mb-8 max-md:hidden">Admin</div>
        <nav className="flex-1 space-y-2">
          <Link to="/admin" className="block py-2 px-3 rounded hover:bg-white/10 text-sm max-md:hidden">Dashboard</Link>
          <Link to="/admin/productos" className="block py-2 px-3 rounded hover:bg-white/10 text-sm max-md:hidden">Productos</Link>
          <Link to="/admin/pedidos" className="block py-2 px-3 rounded hover:bg-white/10 text-sm max-md:hidden">Pedidos</Link>
          <Link to="/admin/config" className="block py-2 px-3 rounded hover:bg-white/10 text-sm max-md:hidden">Configuración</Link>
          <Link to="/admin/pagos" className="block py-2 px-3 rounded hover:bg-white/10 text-sm max-md:hidden">Métodos de pago</Link>
        </nav>
        <div className="border-t border-white/20 pt-4 max-md:hidden">
          <p className="text-xs text-white/60 mb-2">{admin.nombre || admin.usuario}</p>
          <a href="/" className="block text-xs text-white/60 hover:text-white mb-2">← Ver tienda</a>
          <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white">Cerrar sesión</button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-md:p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}