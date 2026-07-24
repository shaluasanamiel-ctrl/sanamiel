import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { crearPedido, fetchSettings, fetchPaymentMethods } from '../api.js'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({ whatsapp_number: '573001234567', whatsapp_message: '' })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [form, setForm] = useState({ nombre: '', whatsapp: '', direccion: '', ciudad: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pedidoCreado, setPedidoCreado] = useState(null)

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {})
    fetchPaymentMethods().then(setPaymentMethods).catch(() => {})
  }, [])

  if (items.length === 0 && !pedidoCreado) {
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
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
        cliente_nombre: form.nombre,
        cliente_whatsapp: form.whatsapp,
        direccion: form.direccion,
        ciudad: form.ciudad,
        total,
      })

      setPedidoCreado(pedido)

      const resumen = items.map(i =>
        `• ${i.nombre}${i.variante ? ` (${i.variante})` : ''} x${i.cantidad} = $${(i.precio * i.cantidad).toLocaleString('es-CO')}`
      ).join('\n')

      const mensaje = encodeURIComponent(
        `¡Hola! Quiero confirmar mi pedido en Sanamiel 🎉\n\n` +
        `Pedido: #${pedido.codigo}\n\n${resumen}\n\n` +
        `Total: $${total.toLocaleString('es-CO')}\n\n` +
        `Nombre: ${form.nombre}\nWhatsApp: ${form.whatsapp}\n` +
        `${form.direccion ? `Dirección: ${form.direccion}\n` : ''}${form.ciudad ? `Ciudad: ${form.ciudad}\n` : ''}`
      )

      clearCart()
      window.open(`https://wa.me/${settings.whatsapp_number}?text=${mensaje}`, '_blank')
    } catch (err) {
      setError(err.message || 'Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (pedidoCreado) {
    return (
      <div className="max-w-[600px] mx-auto px-7 py-[52px] text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="font-display font-semibold text-[32px] mb-4">¡Pedido creado!</h1>
        <p className="text-muted mb-2">Código: <strong>#{pedidoCreado.codigo}</strong></p>
        <p className="text-muted mb-8">Te hemos redirigido a WhatsApp para confirmar el pedido.</p>
        <a href="/" className="inline-block bg-ink text-white px-8 py-4 text-[12px] font-bold tracking-[.12em] uppercase">Volver a la tienda</a>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto px-7 py-[52px] max-md:px-[18px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Finalizar pedido</h1>
      <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1">
        <div>
          <h2 className="font-semibold text-lg mb-4">Tus datos</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nombre completo *" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" required />
            <input type="tel" placeholder="WhatsApp * (ej: 573001234567)" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" required />
            <input type="text" placeholder="Dirección de envío" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" />
            <input type="text" placeholder="Ciudad" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} className="w-full border border-sand rounded px-4 py-3 bg-white" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full bg-ink text-white py-4 text-[12px] font-bold tracking-[.12em] uppercase disabled:opacity-50">
              {submitting ? 'Creando pedido...' : 'Finalizar pedido por WhatsApp'}
            </button>
          </form>

          {paymentMethods.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-sm mb-3">Métodos de pago aceptados</h3>
              <div className="space-y-2">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className="flex items-center gap-3 bg-white border border-sand rounded p-3">
                    {pm.imagen_url && <img src={pm.imagen_url} alt={pm.nombre} className="w-10 h-10 object-contain" />}
                    <div>
                      <p className="font-semibold text-sm">{pm.nombre}</p>
                      {pm.descripcion && <p className="text-muted text-xs">{pm.descripcion}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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