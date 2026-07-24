import { Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Layout() {
  const { count } = useCart()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-wine text-white text-center py-2.5 px-4 text-xs tracking-widest uppercase">
        Envío gratis en Colombia desde $199.000 · Compra segura por WhatsApp
      </div>
      <header className="bg-white border-b border-[#eee8e1] sticky top-0 z-50">
        <div className="h-[82px] max-w-[1240px] mx-auto px-7 flex items-center justify-between max-md:h-[65px] max-md:px-[18px]">
          <a href="/" className="font-display font-semibold text-[32px] tracking-[.08em] max-md:text-[25px]">
            sanamiel<span className="font-[italic] text-[15px] text-gold align-top">®</span>
          </a>
          <div className="flex gap-[19px] text-[19px] items-center">
            <a href="/catalogo">⌕</a>
            <a href="/carrito" className="relative">
              ♧
              {count > 0 && (
                <b className="absolute -top-3 -right-3 text-[12px] bg-wine text-white rounded-[10px] px-[5px] py-[1px]">
                  {count}
                </b>
              )}
            </a>
          </div>
        </div>
        <nav className="border-t border-[#f3eee8] text-center flex justify-center gap-9 py-[15px] px-[18px] font-semibold text-[12px] tracking-[.12em] uppercase overflow-auto max-md:justify-start max-md:gap-[22px] max-md:whitespace-nowrap">
          <a href="/catalogo?tipo=fragancia">Fragancias</a>
          <a href="/catalogo?tipo=joyeria">Joyería</a>
          <a href="/catalogo">Colecciones</a>
          <a href="/catalogo">Guía de regalos</a>
          <a href="/">Nosotros</a>
          <a href="/catalogo" className="text-wine">Ofertas</a>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-[#f0e9e2] px-7 pb-6 pt-[52px] max-md:px-[18px]">
      <div className="max-w-[1184px] mx-auto grid grid-cols-[2fr_1fr_1fr_1fr] gap-[30px] max-md:grid-cols-2">
        <div className="max-md:col-span-2">
          <div className="font-display font-semibold text-[30px]">sanamiel</div>
          <p className="text-[13px] text-[#625b55] mt-2.5">Perfumes y joyería para acompañar tus momentos más especiales.</p>
          <p className="text-[13px] text-[#625b55] mt-2.5">Instagram · TikTok · WhatsApp</p>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[.12em] uppercase font-semibold mb-2">Comprar</h4>
          <a href="/catalogo?tipo=fragancia" className="text-[13px] text-[#625b55] block my-2.5">Fragancias</a>
          <a href="/catalogo?tipo=joyeria" className="text-[13px] text-[#625b55] block my-2.5">Joyería</a>
          <a href="/catalogo" className="text-[13px] text-[#625b55] block my-2.5">Ofertas</a>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[.12em] uppercase font-semibold mb-2">Ayuda</h4>
          <a href="#" className="text-[13px] text-[#625b55] block my-2.5">Envíos y devoluciones</a>
          <a href="#" className="text-[13px] text-[#625b55] block my-2.5">Medios de pago</a>
          <a href="#" className="text-[13px] text-[#625b55] block my-2.5">Contáctanos</a>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[.12em] uppercase font-semibold mb-2">Newsletter</h4>
          <p className="text-[13px] text-[#625b55] mt-2.5">Recibe lanzamientos y beneficios.</p>
          <p className="text-[13px] text-[#625b55] mt-2.5">tu@email.com →</p>
        </div>
      </div>
      <div className="max-w-[1184px] mx-auto mt-[35px] pt-[18px] border-t border-[#dcd2c8] text-[#7b726a] text-[11px]">
        © 2026 Sanamiel. Todos los derechos reservados.
      </div>
    </footer>
  )
}