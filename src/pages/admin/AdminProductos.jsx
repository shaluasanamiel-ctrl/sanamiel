import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAdminProductos, crearProducto, actualizarProducto, eliminarProducto, agregarImagenProducto, eliminarImagenProducto, agregarVarianteProducto, eliminarVarianteProducto, uploadBase64 } from '../../api.js'

export default function AdminProductos() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [editing, setEditing] = useState(null)
  const [tab, setTab] = useState('form')
  const [form, setForm] = useState({
    nombre: '', slug: '', descripcion: '', precio: '', precio_anterior: '', stock: '0',
    tipo: 'fragancia', material: '', genero: '', categoria_id: '', volumen_ml: '', notas_olfativas: '',
    destacado: false, nuevo: false,
  })

  useEffect(() => {
    fetchAdminProductos().then(setProductos).catch(() => navigate('/admin/login'))
  }, [])

  const handleSave = async () => {
    const data = {
      ...form,
      precio: parseFloat(form.precio),
      precio_anterior: form.precio_anterior ? parseFloat(form.precio_anterior) : null,
      stock: parseInt(form.stock) || 0,
      volumen_ml: form.volumen_ml ? parseFloat(form.volumen_ml) : null,
    }
    if (editing) {
      const updated = await actualizarProducto(editing, data)
      setProductos(prev => prev.map(p => p.id === editing ? { ...p, ...updated } : p))
    } else {
      await crearProducto(data)
    }
    resetForm()
    const prods = await fetchAdminProductos()
    setProductos(prods)
  }

  const resetForm = () => {
    setEditing(null)
    setTab('form')
    setForm({ nombre: '', slug: '', descripcion: '', precio: '', precio_anterior: '', stock: '0', tipo: 'fragancia', material: '', genero: '', categoria_id: '', volumen_ml: '', notas_olfativas: '', destacado: false, nuevo: false })
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setForm({
      nombre: p.nombre, slug: p.slug, descripcion: p.descripcion || '', precio: String(p.precio),
      precio_anterior: p.precio_anterior ? String(p.precio_anterior) : '', stock: String(p.stock),
      tipo: p.tipo, material: p.material || '', genero: p.genero || '', categoria_id: p.categoria_id || '',
      volumen_ml: p.volumen_ml ? String(p.volumen_ml) : '', notas_olfativas: p.notas_olfativas || '',
      destacado: p.destacado || false, nuevo: p.nuevo || false,
    })
    setTab('form')
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await eliminarProducto(id)
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  const handleImageUpload = async (productoId) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      for (const file of e.target.files) {
        const reader = new FileReader()
        reader.onload = async (ev) => {
          const result = await uploadBase64(ev.target.result, file.name)
          await agregarImagenProducto(productoId, result.url, file.name)
          const prods = await fetchAdminProductos()
          setProductos(prods)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleDeleteImage = async (pid, id) => {
    await eliminarImagenProducto(pid, id)
    const prods = await fetchAdminProductos()
    setProductos(prods)
  }

  const handleAddVariante = async (productoId) => {
    const atributo = prompt('Atributo (ej: talla, color, volumen):')
    if (!atributo) return
    const valor = prompt('Valor (ej: 50ml, oro, S):')
    if (!valor) return
    const precio = prompt('Precio adicional (vacío = mismo precio):')
    const stock = prompt('Stock:')
    await agregarVarianteProducto(productoId, { atributo, valor, precio: precio ? parseFloat(precio) : null, stock: parseInt(stock) || 0 })
    const prods = await fetchAdminProductos()
    setProductos(prods)
  }

  const handleDeleteVariante = async (pid, id) => {
    await eliminarVarianteProducto(pid, id)
    const prods = await fetchAdminProductos()
    setProductos(prods)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-semibold text-[28px]">Productos</h1>
        {!editing && <button onClick={() => { resetForm(); setTab('form') }} className="bg-ink text-white px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">+ Nuevo</button>}
      </div>

      {tab === 'form' && (
        <div className="bg-white border border-sand rounded p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <input type="text" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="border border-sand rounded px-4 py-3" />
            <input type="text" placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="border border-sand rounded px-4 py-3" />
            <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border border-sand rounded px-4 py-3 col-span-2" rows={3} />
            <input type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="border border-sand rounded px-4 py-3" />
            <input type="number" step="0.01" placeholder="Precio anterior (opcional)" value={form.precio_anterior} onChange={e => setForm({...form, precio_anterior: e.target.value})} className="border border-sand rounded px-4 py-3" />
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
            <input type="number" step="0.1" placeholder="Volumen (ml, solo fragancias)" value={form.volumen_ml} onChange={e => setForm({...form, volumen_ml: e.target.value})} className="border border-sand rounded px-4 py-3" />
            <input type="text" placeholder="Notas olfativas (ej: jazmín, rosa)" value={form.notas_olfativas} onChange={e => setForm({...form, notas_olfativas: e.target.value})} className="border border-sand rounded px-4 py-3" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.destacado} onChange={e => setForm({...form, destacado: e.target.checked})} /> Destacado</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.nuevo} onChange={e => setForm({...form, nuevo: e.target.checked})} /> Nuevo</label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="bg-ink text-white px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">{editing ? 'Guardar cambios' : 'Crear producto'}</button>
            {editing && <button onClick={resetForm} className="border border-sand px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">Cancelar</button>}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {productos.map(p => (
          <div key={p.id} className="bg-white border border-sand rounded overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              {p.imagenes?.[0] && <img src={p.imagenes[0].url} alt="" className="w-20 h-20 object-cover rounded" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{p.nombre}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-sand/50 uppercase">{p.tipo}</span>
                  {!p.activo && <span className="text-xs text-red-600">Inactivo</span>}
                  {p.stock < 5 && <span className="text-xs text-red-600">Stock: {p.stock}</span>}
                </div>
                <p className="text-muted text-sm mt-1">${Number(p.precio).toLocaleString('es-CO')} · Stock: {p.stock}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleImageUpload(p.id)} className="text-xs border border-sand rounded px-3 py-1.5">+ Fotos</button>
                <button onClick={() => handleAddVariante(p.id)} className="text-xs border border-sand rounded px-3 py-1.5">+ Variante</button>
                <button onClick={() => startEdit(p)} className="text-gold font-semibold text-xs uppercase px-2">Editar</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-600 font-semibold text-xs uppercase px-2">Eliminar</button>
              </div>
            </div>
            {p.imagenes?.length > 0 && (
              <div className="px-4 pb-4 flex gap-2 overflow-auto">
                {p.imagenes.map(img => (
                  <div key={img.id} className="relative w-16 h-16 flex-shrink-0">
                    <img src={img.url} alt="" className="w-full h-full object-cover rounded" />
                    <button onClick={() => handleDeleteImage(p.id, img.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full">×</button>
                  </div>
                ))}
              </div>
            )}
            {p.variantes?.length > 0 && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {p.variantes.map(v => (
                  <span key={v.id} className="text-xs bg-sand/50 rounded px-2 py-1 flex items-center gap-1">
                    {v.atributo}: {v.valor} {v.precio && `(+$${Number(v.precio).toLocaleString('es-CO')})`} · stock: {v.stock}
                    <button onClick={() => handleDeleteVariante(p.id, v.id)} className="text-red-600 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}