import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { crearPedido } from '../api.js'

const WHATSAPP_NUMBER = '573001234567'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', whatsapp: '', direccion: '', ciudad: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.whatsapp) {
      setError('Nombre y WhatsApp son obligatorios')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const pedido = await crearPedido({
        items: items.map(i => ({
          producto_id: i.producto_id,
          variante_id: i.variante ? null : null,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
        cliente_nombre: form.nombre,
        cliente_whatsapp: form.whatsapp,
        direccion: form.direccion,
        ciudad: form.ciudad,
        total,
      })

      const resumen = items.map(i =>
        `• ${i.nombre}${i.variante ? ` (${i.variante})` : ''} x${i.cantidad} = $${(i.precio * i.cantidad).toLocaleString('es-CO')}`
      ).join('\n')

      const mensaje = encodeURIComponent(
        `¡Hola! Quiero confirmar mi pedido en Sanamiel 🎉\n\n` +
        `Pedido: #${pedido.codigo}\n\n` +
        `${resumen}\n\n` +
        `Total: $${total.toLocaleString('es-CO')}\n\n` +
        `Nombre: ${form.nombre}\n` +
        `WhatsApp: ${form.whatsapp}\n` +
        `${form.direccion ? `Dirección: ${form.direccion}\n` : ''}` +
        `${form.ciudad ? `Ciudad: ${form.ciudad}\n` : ''}`
      )

      clearCart()
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`, '_blank')
    } catch (err) {
      setError(err.message || 'Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[800px] mx-auto px-7 py-[52px] max-md:px-[18px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Finalizar pedido</h1>
      <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1">
        <div>
          <h2 className="font-semibold text-lg mb-4">Tus datos</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp *</label>
              <input type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="573001234567" className="w-full border border-sand rounded px-4 py-3 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección de envío</label>
              <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input type="text" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full bg-ink text-white py-4 text-[12px] font-bold tracking-[.12em] uppercase disabled:opacity-50">
              {submitting ? 'Creando pedido...' : 'Finalizar pedido por WhatsApp'}
            </button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-4">Resumen del pedido</h2>
          <div className="bg-white border border-sand rounded p-4 space-y-3">
            {items.map(item => (
              <div key={item.key} className="flex justify-between text-sm">
                <span>{item.nombre}{item.variante ? ` (${item.variante})` : ''} x{item.cantidad}</span>
                <span>${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
              </div>
            ))}
            <div className="border-t border-sand pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}