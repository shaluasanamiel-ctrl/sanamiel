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

// --- Settings ---
export async function fetchSettings() {
  return fetchJSON('/settings')
}

export async function fetchAdminSettings() {
  return fetchJSON('/admin/settings')
}

export async function saveAdminSettings(settings) {
  return fetchJSON('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  })
}

// --- Payment Methods ---
export async function fetchPaymentMethods() {
  return fetchJSON('/payment-methods')
}

export async function fetchAdminPaymentMethods() {
  return fetchJSON('/admin/payment-methods')
}

export async function crearPaymentMethod(data) {
  return fetchJSON('/admin/payment-methods', {
    method: 'POST', body: JSON.stringify(data),
  })
}

export async function actualizarPaymentMethod(id, data) {
  return fetchJSON(`/admin/payment-methods/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  })
}

export async function eliminarPaymentMethod(id) {
  return fetchJSON(`/admin/payment-methods/${id}`, { method: 'DELETE' })
}

// --- Products ---
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

// --- Orders ---
export async function crearPedido(data) {
  return fetchJSON('/pedidos', {
    method: 'POST', body: JSON.stringify(data),
  })
}

// --- Admin Auth ---
export async function loginAdmin(usuario, password) {
  return fetchJSON('/admin/login', {
    method: 'POST', body: JSON.stringify({ usuario, password }),
  })
}

export async function fetchAdminMe() {
  return fetchJSON('/admin/me')
}

export async function logoutAdmin() {
  return fetchJSON('/admin/logout', { method: 'POST' })
}

// --- Admin Dashboard ---
export async function fetchDashboard() {
  return fetchJSON('/admin/dashboard')
}

// --- Admin Products ---
export async function fetchAdminProductos() {
  return fetchJSON('/admin/productos')
}

export async function crearProducto(data) {
  return fetchJSON('/admin/productos', {
    method: 'POST', body: JSON.stringify(data),
  })
}

export async function actualizarProducto(id, data) {
  return fetchJSON(`/admin/productos/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  })
}

export async function eliminarProducto(id) {
  return fetchJSON(`/admin/productos/${id}`, { method: 'DELETE' })
}

export async function agregarImagenProducto(id, url, alt) {
  return fetchJSON(`/admin/productos/${id}/imagenes`, {
    method: 'POST', body: JSON.stringify({ url, alt }),
  })
}

export async function eliminarImagenProducto(pid, id) {
  return fetchJSON(`/admin/productos/${pid}/imagenes/${id}`, { method: 'DELETE' })
}

export async function agregarVarianteProducto(id, data) {
  return fetchJSON(`/admin/productos/${id}/variantes`, {
    method: 'POST', body: JSON.stringify(data),
  })
}

export async function eliminarVarianteProducto(pid, id) {
  return fetchJSON(`/admin/productos/${pid}/variantes/${id}`, { method: 'DELETE' })
}

// --- Admin Orders ---
export async function fetchAdminPedidos() {
  return fetchJSON('/admin/pedidos')
}

export async function actualizarEstadoPedido(id, estado) {
  return fetchJSON(`/admin/pedidos/${id}`, {
    method: 'PUT', body: JSON.stringify({ estado }),
  })
}

// --- Upload ---
export async function uploadBase64(image, name) {
  return fetchJSON('/upload-base64', {
    method: 'POST', body: JSON.stringify({ image, name }),
  })
}