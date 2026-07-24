import { useState, useEffect } from 'react'
import { fetchProductos, fetchCategorias } from '../api.js'

export default function Home() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    fetchProductos({ destacado: true, limit: 4 }).then(setProductos).catch(() => {})
    fetchCategorias().catch(() => {})
  }, [])

  return (
    <>
      <section className="min-h-[560px] bg-gradient-to-r from-[rgba(31,24,21,.76)] to-[rgba(31,24,21,.08)] bg-cover bg-center flex items-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85')"}}>
        <div className="w-full max-w-[1240px] mx-auto px-[7.5%] py-16 text-white">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">Esencia que permanece</div>
          <h1 className="font-display font-semibold text-[clamp(45px,6vw,78px)] leading-[1.04] max-w-[670px] my-[18px]">Tu aroma. Tu brillo. Tu historia.</h1>
          <p className="text-[18px] max-w-[420px] leading-[1.55] mb-[30px]">Fragancias memorables y joyas que transforman los detalles cotidianos en algo extraordinario.</p>
          <a href="/catalogo?tipo=fragancia" className="inline-block bg-white text-ink px-6 py-3.5 text-[12px] font-bold tracking-[.12em] uppercase">Descubrir fragancias</a>
          <a href="/catalogo?tipo=joyeria" className="inline-block bg-transparent text-white border border-white px-6 py-3.5 text-[12px] font-bold tracking-[.12em] uppercase ml-2">Ver joyería</a>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-7 py-[76px] max-md:px-[18px] max-md:py-[52px]">
        <div className="text-center mb-[33px]">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">Encuentra tu favorito</div>
          <h2 className="font-display font-semibold text-[37px] my-[7px]">Todo lo que expresa tu esencia</h2>
          <p className="text-muted">Una tienda, dos mundos pensados para regalar y recordar.</p>
        </div>
        <div className="grid grid-cols-4 gap-[18px] max-md:grid-cols-2 max-md:gap-[10px]">
          {[
            { href: '/catalogo?tipo=fragancia', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=650&q=80', alt: 'Perfumes', title: 'Fragancias', sub: 'Perfumes · body splash · sets' },
            { href: '/catalogo?tipo=joyeria', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=650&q=80', alt: 'Anillos', title: 'Anillos', sub: 'Plata · rodio · oro laminado' },
            { href: '/catalogo?tipo=joyeria', img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=650&q=80', alt: 'Cadenas', title: 'Cadenas y dijes', sub: 'Un detalle para siempre' },
            { href: '/catalogo?tipo=joyeria', img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=650&q=80', alt: 'Pulseras', title: 'Pulseras', sub: 'Para cada momento' },
          ].map(cat => (
            <a key={cat.title} href={cat.href} className="h-[260px] relative overflow-hidden bg-[#ddd] max-md:h-[190px] group">
              <img src={cat.img} alt={cat.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 p-[42px_18px_17px] text-white bg-gradient-to-t from-[rgba(0,0,0,.62)] to-transparent font-display font-semibold text-[21px]">
                {cat.title}
                <small className="block font-sans font-semibold text-[10px] tracking-[.12em] uppercase mt-[5px]">{cat.sub}</small>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 max-md:grid-cols-1 bg-sand min-h-[470px]">
        <div className="bg-cover bg-center min-h-[320px]" style={{backgroundImage: "url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1100&q=85')"}} aria-label="Perfume y joyas"></div>
        <div className="py-20 px-[max(40px,10vw)] self-center max-md:py-[52px] max-md:px-[30px]">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">Selección Sanamiel</div>
          <h2 className="font-display font-semibold text-[44px] leading-[1.1] my-[14px] max-md:text-[32px]">Fragancias que dejan huella</h2>
          <p className="leading-[1.65] text-[#5c5550] max-w-[400px]">Descubre perfumes para ella, él y aromas unisex.</p>
          <a href="/catalogo?tipo=fragancia" className="inline-block bg-ink text-white px-6 py-3.5 text-[12px] font-bold tracking-[.12em] uppercase mt-[15px]">Ver perfumes</a>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-7 py-[76px] max-md:px-[18px] max-md:py-[52px]">
        <div className="text-center mb-[33px]">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">Recién llegados</div>
          <h2 className="font-display font-semibold text-[37px] my-[7px]">Novedades para enamorarse</h2>
        </div>
        <div className="grid grid-cols-4 gap-[22px] max-md:grid-cols-2 max-md:gap-[10px]">
          {productos.slice(0, 4).map(p => (
            <a key={p.id} href={`/producto/${p.slug}`} className="group relative">
              <div className="bg-[#f0ece7] aspect-[1/1.1] overflow-hidden">
                <img src={p.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=500&q=80'} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              {p.nuevo && <span className="absolute top-3 left-3 bg-white px-[9px] py-[7px] text-[10px] font-bold tracking-[.1em]">NUEVO</span>}
              <h3 className="text-[14px] mt-[14px] mb-[5px]">{p.nombre}</h3>
              <p className="text-muted text-[12px] m-0">{p.material || (p.volumen_ml ? `${p.volumen_ml} ml` : '')}</p>
              <span className="block mt-[7px] font-bold">${Number(p.precio).toLocaleString('es-CO')}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="max-w-[1240px] mx-auto px-7 py-[31px] grid grid-cols-4 gap-[25px] text-center max-md:grid-cols-2">
          <div><b className="block font-display font-semibold text-[17px]">Envíos nacionales</b><span className="text-[11px] text-[#d9d1c9]">Llevamos Sanamiel a todo Colombia</span></div>
          <div><b className="block font-display font-semibold text-[17px]">Compra segura</b><span className="text-[11px] text-[#d9d1c9]">Pagos protegidos y asesoría cercana</span></div>
          <div><b className="block font-display font-semibold text-[17px]">Materiales seleccionados</b><span className="text-[11px] text-[#d9d1c9]">Plata, rodio y oro laminado</span></div>
          <div><b className="block font-display font-semibold text-[17px]">Regalos con intención</b><span className="text-[11px] text-[#d9d1c9]">Empaque listo para sorprender</span></div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-7 py-[76px] max-md:px-[18px] max-md:py-[52px]" id="joyeria">
        <div className="text-center mb-[33px]">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">Brilla a tu manera</div>
          <h2 className="font-display font-semibold text-[37px] my-[7px]">Joyería para todos los días</h2>
          <p className="text-muted">Diseños atemporales en plata, rodio y oro laminado.</p>
        </div>
        <div className="grid grid-cols-4 gap-[22px] max-md:grid-cols-2 max-md:gap-[10px]">
          {productos.filter(p => p.tipo === 'joyeria').slice(0, 4).map(p => (
            <a key={p.id} href={`/producto/${p.slug}`} className="group relative">
              <div className="bg-[#f0ece7] aspect-[1/1.1] overflow-hidden">
                <img src={p.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=500&q=80'} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <h3 className="text-[14px] mt-[14px] mb-[5px]">{p.nombre}</h3>
              <p className="text-muted text-[12px] m-0">{p.material}</p>
              <span className="block mt-[7px] font-bold">${Number(p.precio).toLocaleString('es-CO')}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto my-[76px] max-w-[1184px] min-h-[310px] bg-gradient-to-r from-[#dbc4ae] to-[rgba(219,196,174,.25)] bg-cover bg-center flex items-center max-md:mx-[18px] max-md:my-[48px]" style={{backgroundImage: "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1500&q=85')"}}>
        <div className="px-[7%] py-[54px] max-w-[530px]">
          <div className="text-[12px] tracking-[.18em] font-bold uppercase">No sabes qué elegir</div>
          <h2 className="font-display font-semibold text-[42px] leading-[1.08] my-[10px] max-md:text-[32px]">Regalos que cuentan una historia</h2>
          <p className="leading-[1.6]">Responde tres preguntas y encuentra el detalle perfecto para esa persona especial.</p>
          <a href="/catalogo" className="inline-block bg-ink text-white px-6 py-3.5 text-[12px] font-bold tracking-[.12em] uppercase mt-[15px]">Ir a guía de regalos</a>
        </div>
      </section>
    </>
  )
}