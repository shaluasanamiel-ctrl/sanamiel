import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAdminPedidos, fetchAdminProductos } from '../../api.js'

export default function Admin() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pedidosPendientes: 0, productosBajos: 0, totalProductos: 0 })

  useEffect(() => {
    fetchAdminPedidos().then(pedidos => {
      const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
      setStats(s => ({ ...s, pedidosPendientes: pendientes }))
    }).catch(() => navigate('/admin/login'))

    fetchAdminProductos().then(productos => {
      const bajos = productos.filter(p => p.stock < 5).length
      setStats(s => ({ ...s, totalProductos: productos.length, productosBajos: bajos }))
    }).catch(() => {})
  }, [])

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Panel Administrativo</h1>
      <div className="grid grid-cols-3 gap-6 mb-10 max-md:grid-cols-1">
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-wine">{stats.pedidosPendientes}</div>
          <div className="text-muted text-sm mt-2">Pedidos pendientes</div>
        </div>
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-ink">{stats.totalProductos}</div>
          <div className="text-muted text-sm mt-2">Productos activos</div>
        </div>
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-wine">{stats.productosBajos}</div>
          <div className="text-muted text-sm mt-2">Stock bajo (&lt;5)</div>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/admin/productos" className="flex-1 bg-ink text-white text-center py-4 text-[12px] font-bold tracking-[.12em] uppercase">Gestionar productos</Link>
        <Link to="/admin/pedidos" className="flex-1 bg-ink text-white text-center py-4 text-[12px] font-bold tracking-[.12em] uppercase">Gestionar pedidos</Link>
      </div>
    </div>
  )
}