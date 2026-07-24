import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminProductos, crearProducto, actualizarProducto } from '../../api.js'

export default function AdminProductos() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', precio: '', stock: '', tipo: 'fragancia', material: '', genero: '' })

  useEffect(() => {
    fetchAdminProductos().then(setProductos).catch(() => navigate('/admin/login'))
  }, [])

  const handleSave = async () => {
    const data = { ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock) || 0 }
    if (editing) {
      await actualizarProducto(editing, data)
    } else {
      await crearProducto(data)
    }
    setEditing(null)
    setForm({ nombre: '', slug: '', descripcion: '', precio: '', stock: '', tipo: 'fragancia', material: '', genero: '' })
    const prods = await fetchAdminProductos()
    setProductos(prods)
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ nombre: p.nombre, slug: p.slug, descripcion: p.descripcion || '', precio: String(p.precio), stock: String(p.stock), tipo: p.tipo, material: p.material || '', genero: p.genero || '' })
  }

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px]">
      <h1 className="font-display font-semibold text-[32px] mb-8">Productos</h1>
      <div className="bg-white border border-sand rounded p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="border border-sand rounded px-4 py-3" />
          <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border border-sand rounded px-4 py-3 col-span-2" />
          <input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="border border-sand rounded px-4 py-3">
            <option value="fragancia">Fragancia</option>
            <option value="joyeria">Joyería</option>
          </select>
          <input type="text" placeholder="Material (ej: plata 925)" value={form.material} onChange={e => setForm({...form, material: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <select value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} className="border border-sand rounded px-4 py-3">
            <option value="">Sin género</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="bg-ink text-white px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">{editing ? 'Guardar cambios' : 'Crear producto'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ nombre: '', slug: '', descripcion: '', precio: '', stock: '', tipo: 'fragancia', material: '', genero: '' }) }} className="border border-sand px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">Cancelar</button>}
        </div>
      </div>
      <table className="w-full bg-white border border-sand rounded">
        <thead>
          <tr className="border-b border-sand text-left text-sm">
            <th className="p-4">Nombre</th>
            <th className="p-4">Tipo</th>
            <th className="p-4">Precio</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} className="border-b border-sand text-sm">
              <td className="p-4">{p.nombre}</td>
              <td className="p-4">{p.tipo}</td>
              <td className="p-4">${Number(p.precio).toLocaleString('es-CO')}</td>
              <td className="p-4">{p.stock}</td>
              <td className="p-4">
                <button onClick={() => startEdit(p)} className="text-gold font-semibold text-xs uppercase tracking-wider">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}