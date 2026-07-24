import { useState, useEffect } from 'react'
import { fetchDashboard } from '../../api.js'

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchDashboard().then(setData).catch(() => {})
  }, [])

  if (!data) return <div className="text-muted">Cargando...</div>

  return (
    <div>
      <h1 className="font-display font-semibold text-[28px] mb-8">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6 mb-10 max-md:grid-cols-2">
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-wine">{data.pedidosPendientes}</div>
          <div className="text-muted text-sm mt-2">Pedidos pendientes</div>
        </div>
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-ink">{data.totalProductos}</div>
          <div className="text-muted text-sm mt-2">Productos</div>
        </div>
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-wine">{data.stockBajo}</div>
          <div className="text-muted text-sm mt-2">Stock bajo (&lt;5)</div>
        </div>
        <div className="bg-white border border-sand rounded p-6 text-center">
          <div className="text-3xl font-bold text-gold">${Number(data.ventasMes).toLocaleString('es-CO')}</div>
          <div className="text-muted text-sm mt-2">Ventas del mes</div>
        </div>
      </div>
      <h2 className="font-semibold text-lg mb-4">Pedidos recientes</h2>
      {data.pedidosRecientes?.length === 0 ? (
        <p className="text-muted">No hay pedidos aún.</p>
      ) : (
        <div className="space-y-3">
          {data.pedidosRecientes?.map(p => (
            <div key={p.id} className="bg-white border border-sand rounded p-4 flex justify-between items-center">
              <div>
                <span className="font-semibold">#{p.codigo}</span>
                <span className="text-muted text-sm ml-3">{p.cliente_nombre}</span>
              </div>
              <div className="text-right">
                <span className="font-bold">${Number(p.total).toLocaleString('es-CO')}</span>
                <span className={`ml-3 px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  p.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                  p.estado === 'enviado' ? 'bg-purple-100 text-purple-800' :
                  p.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>{p.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}