import { useState, useEffect } from 'react'
import { fetchAdminSettings, saveAdminSettings } from '../../api.js'

export default function AdminConfig() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchAdminSettings().then(data => {
      setSettings(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleChange = (clave, valor) => {
    setSettings(prev => prev.map(s => s.clave === clave ? { ...s, valor } : s))
  }

  const handleSave = async () => {
    await saveAdminSettings(settings.map(s => ({ clave: s.clave, valor: s.valor })))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="text-muted">Cargando...</div>

  const groupLabels = {
    whatsapp_number: 'WhatsApp', whatsapp_message: 'WhatsApp',
    hero_title: 'Hero / Portada', hero_subtitle: 'Hero / Portada',
    shipping_free_min: 'Envíos',
    store_name: 'Tienda', store_description: 'Tienda', store_email: 'Tienda',
    store_instagram: 'Redes Sociales', store_tiktok: 'Redes Sociales', store_facebook: 'Redes Sociales',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-semibold text-[28px]">Configuración</h1>
        <button onClick={handleSave} className="bg-ink text-white px-6 py-3 text-[12px] font-bold tracking-[.12em] uppercase">
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
      <div className="space-y-6">
        {['WhatsApp', 'Hero / Portada', 'Envíos', 'Tienda', 'Redes Sociales'].map(group => (
          <div key={group} className="bg-white border border-sand rounded p-6">
            <h2 className="font-semibold text-lg mb-4">{group}</h2>
            <div className="space-y-4">
              {settings.filter(s => groupLabels[s.clave] === group).map(s => (
                <div key={s.clave}>
                  <label className="block text-sm font-medium mb-1 text-muted">{s.descripcion || s.clave}</label>
                  {s.clave === 'hero_subtitle' || s.clave === 'store_description' || s.clave === 'whatsapp_message' ? (
                    <textarea value={s.valor} onChange={e => handleChange(s.clave, e.target.value)}
                      className="w-full border border-sand rounded px-4 py-3 text-sm" rows={3} />
                  ) : s.clave === 'shipping_free_min' ? (
                    <input type="number" value={s.valor} onChange={e => handleChange(s.clave, e.target.value)}
                      className="w-full border border-sand rounded px-4 py-3 text-sm" />
                  ) : (
                    <input type="text" value={s.valor} onChange={e => handleChange(s.clave, e.target.value)}
                      className="w-full border border-sand rounded px-4 py-3 text-sm" />
                  )}
                  <p className="text-[11px] text-muted/60 mt-1">clave: {s.clave}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}