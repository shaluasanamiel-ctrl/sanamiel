const API = '/api'

export async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

export async function fetchProductos(params = {}) {
  const q = new URLSearchParams(params).toString()
  return fetchJSON(`/productos${q ? `?${q}` : ''}`)
}

export async function fetchProducto(slug) {
  return fetchJSON(`/productos/${slug}`)
}

export async function fetchCategorias() {
  return fetchJSON('/categorias')
}

export async function crearPedido(data) {
  return fetchJSON('/pedidos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginAdmin(usuario, password) {
  return fetchJSON('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ usuario, password }),
  })
}

export async function fetchAdminProductos() {
  return fetchJSON('/admin/productos')
}

export async function crearProducto(data) {
  return fetchJSON('/admin/productos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function actualizarProducto(id, data) {
  return fetchJSON(`/admin/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function fetchAdminPedidos() {
  return fetchJSON('/admin/pedidos')
}

export async function actualizarEstadoPedido(id, estado) {
  return fetchJSON(`/admin/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  })
}