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
      await loginAdmin(usuario, password)
      navigate('/admin')
    } catch (err) {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="max-w-[400px] mx-auto px-7 py-[52px]">
      <h1 className="font-display font-semibold text-[28px] mb-8 text-center">Admin Sanamiel</h1>
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
      </form>
    </div>
  )
}