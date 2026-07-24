import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Carrito() {
  const { items, removeItem, updateCantidad, total, count } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-[1240px] mx-auto px-7 py-[52px] text-center">
        <h1 className="font-display font-semibold text-[32px] mb-6">Tu carrito está vacío</h1>
        <p className="text-muted mb-8">Agrega productos desde nuestro catálogo.</p>
        <a href="/catalogo" className="inline-block bg-ink text-white px-8 py-4 text-[12px] font-bold tracking-[.12em] uppercase">Ver catálogo</a>
      </div>
    )
  }

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px] max-md:px-[18px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Carrito ({count} productos)</h1>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="flex gap-4 items-center bg-white p-4 rounded border border-sand">
            <div className="w-20 h-20 bg-[#f0ece7] rounded overflow-hidden flex-shrink-0">
              {item.imagen && <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.nombre}</h3>
              {item.variante && <p className="text-muted text-sm">{item.variante}</p>}
              <p className="font-bold mt-1">${Number(item.precio).toLocaleString('es-CO')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateCantidad(item.key, item.cantidad - 1)} className="w-8 h-8 border border-sand rounded">-</button>
              <span className="w-8 text-center">{item.cantidad}</span>
              <button onClick={() => updateCantidad(item.key, item.cantidad + 1)} className="w-8 h-8 border border-sand rounded">+</button>
            </div>
            <button onClick={() => removeItem(item.key)} className="text-muted text-sm hover:text-wine">Eliminar</button>
          </div>
        ))}
      </div>
      <div className="mt-8 text-right">
        <p className="text-xl font-bold mb-4">Total: ${Number(total).toLocaleString('es-CO')}</p>
        <Link to="/checkout" className="inline-block bg-ink text-white px-8 py-4 text-[12px] font-bold tracking-[.12em] uppercase">Finalizar pedido</Link>
      </div>
    </div>
  )
}