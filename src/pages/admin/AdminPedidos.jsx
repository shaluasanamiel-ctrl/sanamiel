import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminPedidos, actualizarEstadoPedido } from '../../api.js'

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']

export default function AdminPedidos() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    fetchAdminPedidos().then(setPedidos).catch(() => navigate('/admin/login'))
  }, [])

  const cambiarEstado = async (id, estado) => {
    await actualizarEstadoPedido(id, estado)
    const updated = await fetchAdminPedidos()
    setPedidos(updated)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Pedidos</h1>
      {pedidos.length === 0 ? (
        <p className="text-muted">No hay pedidos aún.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map(p => (
            <div key={p.id} className="bg-white border border-sand rounded p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-bold text-lg">#{p.codigo}</span>
                  <span className={`ml-3 px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    p.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                    p.estado === 'enviado' ? 'bg-purple-100 text-purple-800' :
                    p.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{p.estado}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">${Number(p.total).toLocaleString('es-CO')}</p>
                  <p className="text-muted text-sm">{new Date(p.created_at).toLocaleDateString('es-CO')}</p>
                </div>
              </div>
              <p className="text-sm"><strong>Cliente:</strong> {p.cliente_nombre} · {p.cliente_whatsapp}</p>
              {p.direccion && <p className="text-sm"><strong>Dirección:</strong> {p.direccion}, {p.ciudad}</p>}
              <div className="mt-4 flex gap-2">
                {ESTADOS.map(est => (
                  <button key={est} onClick={() => cambiarEstado(p.id, est)}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded ${p.estado === est ? 'bg-ink text-white' : 'border border-sand'}`}
                  >{est}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}