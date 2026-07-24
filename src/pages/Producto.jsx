import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProducto } from '../api.js'
import { useCart } from '../context/CartContext.jsx'

export default function Producto() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariante, setSelectedVariante] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchProducto(slug).then(data => {
      setProducto(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="text-center py-20 text-muted">Cargando...</div>
  if (!producto) return <div className="text-center py-20 text-muted">Producto no encontrado.</div>

  const p = producto
  const precioActual = selectedVariante?.precio || p.precio
  const stockActual = selectedVariante?.stock ?? p.stock

  const handleAdd = () => {
    addItem(p, selectedVariante || null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px] max-md:px-[18px]">
      <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1">
        <div>
          <div className="bg-[#f0ece7] aspect-[1/1.1] overflow-hidden rounded mb-4">
            <img src={p.imagenes?.[selectedImage]?.url || ''} alt={p.nombre} className="w-full h-full object-cover" />
          </div>
          {p.imagenes?.length > 1 && (
            <div className="flex gap-3 overflow-auto">
              {p.imagenes.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 ${i === selectedImage ? 'border-gold' : 'border-transparent'}`}>
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display font-semibold text-[32px] mb-2">{p.nombre}</h1>
          {p.precio_anterior && (
            <span className="text-muted line-through text-sm mr-3">${Number(p.precio_anterior).toLocaleString('es-CO')}</span>
          )}
          <span className="text-[28px] font-bold">${Number(precioActual).toLocaleString('es-CO')}</span>
          {p.material && <p className="text-muted text-sm mt-2">Material: {p.material}</p>}
          {p.volumen_ml && <p className="text-muted text-sm">{p.volumen_ml} ml</p>}
          {p.notas_olfativas && <p className="text-muted text-sm mt-2">Notas: {p.notas_olfativas}</p>}
          {p.descripcion && <p className="mt-4 leading-[1.6]">{p.descripcion}</p>}
          <p className={`text-sm mt-4 ${stockActual > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {stockActual > 0 ? `En stock (${stockActual} disponibles)` : 'Agotado'}
          </p>
          {p.variantes?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Variantes</h3>
              <div className="flex flex-wrap gap-2">
                {p.variantes.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariante(v)}
                    className={`px-4 py-2 text-sm border rounded ${selectedVariante?.id === v.id ? 'border-gold bg-gold/10' : 'border-sand'}`}
                  >
                    {v.atributo}: {v.valor} {v.precio && `· $${Number(v.precio).toLocaleString('es-CO')}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={stockActual < 1}
            className="mt-6 w-full bg-ink text-white py-4 text-[12px] font-bold tracking-[.12em] uppercase disabled:opacity-50"
          >
            {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}