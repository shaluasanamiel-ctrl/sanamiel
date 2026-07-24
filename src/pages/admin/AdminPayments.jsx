import { useState, useEffect } from 'react'
import { fetchAdminPaymentMethods, crearPaymentMethod, actualizarPaymentMethod, eliminarPaymentMethod } from '../../api.js'

export default function AdminPayments() {
  const [methods, setMethods] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', tipo: 'qr', descripcion: '', instrucciones: '', imagen_url: '' })

  useEffect(() => { load() }, [])

  const load = async () => {
    setMethods(await fetchAdminPaymentMethods())
  }

  const handleSave = async () => {
    if (editing) {
      await actualizarPaymentMethod(editing, form)
    } else {
      await crearPaymentMethod(form)
    }
    setEditing(null)
    setForm({ nombre: '', tipo: 'qr', descripcion: '', instrucciones: '', imagen_url: '' })
    load()
  }

  const startEdit = (m) => {
    setEditing(m.id)
    setForm({ nombre: m.nombre, tipo: m.tipo, descripcion: m.descripcion || '', instrucciones: m.instrucciones || '', imagen_url: m.imagen_url || '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este método de pago?')) return
    await eliminarPaymentMethod(id)
    load()
  }

  const handleImageSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const result = await uploadBase64(ev.target.result, file.name)
        setForm(f => ({ ...f, imagen_url: result.url }))
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div>
      <h1 className="font-display font-semibold text-[28px] mb-8">Métodos de pago</h1>
      <div className="bg-white border border-sand rounded p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">{editing ? 'Editar' : 'Nuevo'} método de pago</h2>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <input type="text" placeholder="Nombre (ej: Nequi)" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="border border-sand rounded px-4 py-3">
            <option value="qr">QR (Nequi, Bancolombia, etc)</option>
            <option value="wompi">Wompi</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="efectivo">Efectivo / Contraentrega</option>
          </select>
          <input type="text" placeholder="Descripción corta" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="border border-sand rounded px-4 py-3" />
          <div>
            <div className="flex gap-2">
              <input type="text" placeholder="URL de imagen QR" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} className="flex-1 border border-sand rounded px-4 py-3" />
              <button type="button" onClick={handleImageSelect} className="border border-sand rounded px-4 py-3 text-sm">Subir</button>
            </div>
          </div>
          <textarea placeholder="Instrucciones para el cliente (opcional)" value={form.instrucciones} onChange={e => setForm({...form, instrucciones: e.target.value})} className="border border-sand rounded px-4 py-3 col-span-2" rows={3} />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="bg-ink text-white px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ nombre: '', tipo: 'qr', descripcion: '', instrucciones: '', imagen_url: '' }) }} className="border border-sand px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">Cancelar</button>}
        </div>
      </div>
      <div className="space-y-4">
        {methods.map(m => (
          <div key={m.id} className="bg-white border border-sand rounded p-4 flex items-center gap-4">
            {m.imagen_url && <img src={m.imagen_url} alt={m.nombre} className="w-16 h-16 object-contain rounded border border-sand" />}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{m.nombre}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-sand/50 uppercase">{m.tipo}</span>
                {!m.activo && <span className="text-xs text-red-600">Inactivo</span>}
              </div>
              {m.descripcion && <p className="text-muted text-sm">{m.descripcion}</p>}
            </div>
            <button onClick={() => startEdit(m)} className="text-gold font-semibold text-xs uppercase tracking-wider">Editar</button>
            <button onClick={() => handleDelete(m.id)} className="text-red-600 font-semibold text-xs uppercase tracking-wider">Eliminar</button>
          </div>
        ))}
        {methods.length === 0 && <p className="text-muted">No hay métodos de pago configurados.</p>}
      </div>
    </div>
  )
}