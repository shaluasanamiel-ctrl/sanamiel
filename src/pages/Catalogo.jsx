import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProductos, fetchCategorias } from '../api.js'

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  const tipo = searchParams.get('tipo') || ''
  const categoria = searchParams.get('categoria') || ''
  const material = searchParams.get('material') || ''
  const genero = searchParams.get('genero') || ''
  const q = searchParams.get('q') || ''
  const orden = searchParams.get('orden') || ''

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (tipo) params.tipo = tipo
    if (categoria) params.categoria = categoria
    if (material) params.material = material
    if (genero) params.genero = genero
    if (q) params.q = q
    if (orden) params.orden = orden
    fetchProductos(params).then(data => {
      setProductos(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [tipo, categoria, material, genero, q, orden])

  useEffect(() => {
    fetchCategorias().then(setCategorias).catch(() => {})
  }, [])

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-[52px] max-md:px-[18px]">
      <h1 className="font-display font-semibold text-[37px] mb-8">Catálogo</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={q}
          onChange={e => setParam('q', e.target.value)}
          className="border border-sand rounded px-4 py-2 text-sm flex-1 min-w-[200px] bg-white"
        />
        <select value={categoria} onChange={e => setParam('categoria', e.target.value)} className="border border-sand rounded px-4 py-2 text-sm bg-white">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
        </select>
        <select value={tipo} onChange={e => setParam('tipo', e.target.value)} className="border border-sand rounded px-4 py-2 text-sm bg-white">
          <option value="">Todos los tipos</option>
          <option value="fragancia">Fragancias</option>
          <option value="joyeria">Joyería</option>
        </select>
        <select value={material} onChange={e => setParam('material', e.target.value)} className="border border-sand rounded px-4 py-2 text-sm bg-white">
          <option value="">Todos los materiales</option>
          <option value="plata 925">Plata 925</option>
          <option value="rodio">Rodio</option>
          <option value="oro laminado">Oro laminado</option>
        </select>
        <select value={genero} onChange={e => setParam('genero', e.target.value)} className="border border-sand rounded px-4 py-2 text-sm bg-white">
          <option value="">Todos los géneros</option>
          <option value="mujer">Mujer</option>
          <option value="hombre">Hombre</option>
          <option value="unisex">Unisex</option>
        </select>
        <select value={orden} onChange={e => setParam('orden', e.target.value)} className="border border-sand rounded px-4 py-2 text-sm bg-white">
          <option value="">Ordenar por</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
          <option value="nombre">A-Z</option>
          <option value="nuevo">Más recientes</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center py-20 text-muted">Cargando productos...</div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-muted">No encontramos productos con esos filtros.</div>
      ) : (
        <div className="grid grid-cols-4 gap-[22px] max-md:grid-cols-2 max-md:gap-[10px]">
          {productos.map(p => (
            <a key={p.id} href={`/producto/${p.slug}`} className="group relative">
              <div className="bg-[#f0ece7] aspect-[1/1.1] overflow-hidden">
                <img src={p.imagenes?.[0]?.url || ''} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              {p.nuevo && <span className="absolute top-3 left-3 bg-white px-[9px] py-[7px] text-[10px] font-bold tracking-[.1em]">NUEVO</span>}
              <h3 className="text-[14px] mt-[14px] mb-[5px]">{p.nombre}</h3>
              <p className="text-muted text-[12px] m-0">{p.categoria_nombre || p.material || ''}</p>
              <span className="block mt-[7px] font-bold">${Number(p.precio).toLocaleString('es-CO')}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}