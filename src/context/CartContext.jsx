import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sanamiel_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('sanamiel_cart', JSON.stringify(items))
  }, [items])

  const addItem = (producto, variante = null, cantidad = 1) => {
    setItems(prev => {
      const key = variante ? `${producto.id}-${variante.id}` : `${producto.id}`
      const exist = prev.find(i => i.key === key)
      if (exist) {
        return prev.map(i =>
          i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, {
        key,
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: variante?.precio || producto.precio,
        imagen: producto.imagenes?.[0]?.url || '',
        variante: variante ? `${variante.atributo}: ${variante.valor}` : null,
        cantidad,
        stock: variante?.stock ?? producto.stock,
      }]
    })
  }

  const removeItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }

  const updateCantidad = (key, cantidad) => {
    if (cantidad < 1) return removeItem(key)
    setItems(prev => prev.map(i => i.key === key ? { ...i, cantidad } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const count = items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateCantidad, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}