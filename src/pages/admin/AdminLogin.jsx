import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../api.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await loginAdmin(usuario, password)
      if (result.ok) navigate('/admin')
    } catch (err) {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white border border-sand rounded p-10 max-w-[400px] w-full mx-4">
        <h1 className="font-display font-semibold text-[28px] mb-2 text-center">sanamiel</h1>
        <p className="text-muted text-sm text-center mb-8">Panel administrativo</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full border border-sand rounded px-4 py-3 bg-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-sand rounded px-4 py-3 bg-white" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-ink text-white py-4 text-[12px] font-bold tracking-[.12em] uppercase">Ingresar</button>
          <a href="/" className="block text-center text-sm text-muted hover:text-ink">← Volver a la tienda</a>
        </form>
      </div>
    </div>
  )
}