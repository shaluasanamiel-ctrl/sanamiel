const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const dbUrl = (process.env.DATABASE_URL || 'postgresql://localhost:5432/sanamiel').replace(/\?.*$/, '');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'sanamiel-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: !!process.env.DATABASE_URL, maxAge: 24 * 60 * 60 * 1000 },
}));

const upload = multer({ dest: 'uploads/' });

const requireAuth = (req, res, next) => {
  if (!req.session.adminId) return res.status(401).json({ error: 'No autorizado' });
  next();
};

async function migrate() {
  const sql = `
    CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('fragancia','joyeria')),
      imagen_url TEXT, orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      descripcion TEXT, precio NUMERIC(12,2) NOT NULL, precio_anterior NUMERIC(12,2),
      stock INTEGER NOT NULL DEFAULT 0, categoria_id INTEGER REFERENCES categorias(id),
      material TEXT, marca TEXT, genero TEXT, volumen_ml NUMERIC, notas_olfativas TEXT,
      tipo TEXT DEFAULT 'fragancia', destacado BOOLEAN DEFAULT FALSE, nuevo BOOLEAN DEFAULT FALSE,
      activo BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS producto_imagenes (
      id SERIAL PRIMARY KEY, producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      url TEXT NOT NULL, alt TEXT, orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS producto_variantes (
      id SERIAL PRIMARY KEY, producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      atributo TEXT NOT NULL, valor TEXT NOT NULL, precio NUMERIC(12,2), stock INTEGER DEFAULT 0, sku TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY, codigo TEXT UNIQUE NOT NULL, cliente_nombre TEXT NOT NULL,
      cliente_whatsapp TEXT NOT NULL, direccion TEXT, ciudad TEXT, total NUMERIC(12,2) NOT NULL,
      estado TEXT DEFAULT 'pendiente', created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS pedido_items (
      id SERIAL PRIMARY KEY, pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
      producto_id INTEGER REFERENCES productos(id), variante_id INTEGER REFERENCES producto_variantes(id),
      cantidad INTEGER NOT NULL, precio_unitario NUMERIC(12,2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY, clave TEXT UNIQUE NOT NULL, valor TEXT NOT NULL DEFAULT '',
      tipo TEXT DEFAULT 'texto', descripcion TEXT
    );
    CREATE TABLE IF NOT EXISTS payment_methods (
      id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT NOT NULL CHECK (tipo IN ('qr','wompi','transferencia','efectivo')),
      descripcion TEXT, instrucciones TEXT, imagen_url TEXT, config TEXT, activo BOOLEAN DEFAULT TRUE, orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY, usuario TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, nombre TEXT
    );
  `;
  await pool.query(sql);

  const settingCount = await pool.query('SELECT COUNT(*) FROM site_settings');
  if (parseInt(settingCount.rows[0].count) === 0) {
    await pool.query(`INSERT INTO site_settings (clave, valor, tipo, descripcion) VALUES
      ('whatsapp_number', '573001234567', 'texto', 'Número de WhatsApp para recibir pedidos'),
      ('whatsapp_message', '¡Hola! Quiero información sobre un pedido en Sanamiel', 'texto', 'Mensaje predefinido de WhatsApp'),
      ('hero_title', 'Tu aroma. Tu brillo. Tu historia.', 'texto', 'Título del hero principal'),
      ('hero_subtitle', 'Fragancias memorables y joyas que transforman los detalles cotidianos en algo extraordinario.', 'texto', 'Subtítulo del hero'),
      ('shipping_free_min', '199000', 'numero', 'Monto mínimo para envío gratis'),
      ('store_name', 'Sanamiel', 'texto', 'Nombre de la tienda'),
      ('store_description', 'Perfumes y joyería para acompañar tus momentos más especiales.', 'texto', 'Descripción de la tienda'),
      ('store_email', 'hola@sanamiel.co', 'texto', 'Email de contacto'),
      ('store_instagram', '#', 'texto', 'URL de Instagram'),
      ('store_tiktok', '#', 'texto', 'URL de TikTok'),
      ('store_facebook', '#', 'texto', 'URL de Facebook')`);
  }

  const adminCount = await pool.query('SELECT COUNT(*) FROM admin_users');
  if (parseInt(adminCount.rows[0].count) === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'sanamiel2024', 10);
    await pool.query('INSERT INTO admin_users (usuario, password_hash, nombre) VALUES ($1, $2, $3)',
      [process.env.ADMIN_USER || 'admin', hash, 'Administrador']);
  }
}

async function seed() {
  const catCount = await pool.query('SELECT COUNT(*) FROM categorias');
  if (parseInt(catCount.rows[0].count) > 0) return;
  await pool.query(`INSERT INTO categorias (nombre, slug, tipo, orden) VALUES
    ('Perfumes', 'perfumes', 'fragancia', 1), ('Body Splash', 'body-splash', 'fragancia', 2),
    ('Anillos', 'anillos', 'joyeria', 1), ('Pulseras', 'pulseras', 'joyeria', 2),
    ('Cadenas y dijes', 'cadenas-dijes', 'joyeria', 3), ('Aretes', 'aretes', 'joyeria', 4)`);
  await pool.query(`INSERT INTO productos (nombre, slug, descripcion, precio, precio_anterior, stock, material, genero, volumen_ml, notas_olfativas, tipo, destacado, nuevo, categoria_id) VALUES
    ('Aurora Eau de Parfum', 'aurora-edp', 'Una fragancia floral que captura la esencia de un amanecer.', 189900, 219900, 15, NULL, 'mujer', 100, 'Jazmín, rosa, vainilla', 'fragancia', TRUE, TRUE, 1),
    ('Ámbar Intense', 'ambar-intense', 'Notas orientales intensas y duraderas.', 219900, NULL, 10, NULL, 'mujer', 80, 'Ámbar, sándalo, pachulí', 'fragancia', TRUE, FALSE, 1),
    ('Brisa Coastal', 'brisa-coastal', 'Fragancia fresca y marina para el día a día.', 149900, 179900, 20, NULL, 'unisex', 100, 'Bergamota, algas, musk', 'fragancia', FALSE, TRUE, 1),
    ('Sueño No. 5', 'sueno-no-5', 'Clásico moderno con notas empolvadas.', 259900, NULL, 8, NULL, 'mujer', 50, 'Iris, almizcle, lirio', 'fragancia', TRUE, FALSE, 1),
    ('Body Splash Frutos Rojos', 'body-splash-frutos', 'Aroma dulce y juvenil para el verano.', 69900, 89900, 25, NULL, 'mujer', 200, 'Fresa, frambuesa, vainilla', 'fragancia', FALSE, TRUE, 2),
    ('Body Splash Cítricos', 'body-splash-citricos', 'Energía natural con notas cítricas refrescantes.', 59900, NULL, 30, NULL, 'unisex', 200, 'Limón, naranja, menta', 'fragancia', FALSE, FALSE, 2),
    ('Anillo Luna', 'anillo-luna', 'Anillo delicado con diseño de luna creciente.', 109900, 129900, 12, 'plata 925', 'mujer', NULL, NULL, 'joyeria', TRUE, FALSE, 3),
    ('Anillo Eterno', 'anillo-eterno', 'Anillo clásico de compromiso en rodio.', 189900, NULL, 5, 'rodio', 'mujer', NULL, NULL, 'joyeria', FALSE, FALSE, 3),
    ('Pulsera Prisma', 'pulsera-prisma', 'Pulsera geométrica con acabado brillante.', 84900, NULL, 18, 'rodio', 'mujer', NULL, NULL, 'joyeria', TRUE, FALSE, 4),
    ('Cadena Celeste', 'cadena-celeste', 'Cadena delgada en oro laminado con dije de estrella.', 129900, 149900, 7, 'oro laminado', 'mujer', NULL, NULL, 'joyeria', FALSE, TRUE, 5),
    ('Aretes Sol', 'aretes-sol', 'Aretes circulares en plata 925 con brillo natural.', 74900, NULL, 22, 'plata 925', 'mujer', NULL, NULL, 'joyeria', FALSE, FALSE, 6),
    ('Pulsera Mar', 'pulsera-mar', 'Pulsera con cuentas y charms en plata 925.', 94900, NULL, 14, 'plata 925', 'mujer', NULL, NULL, 'joyeria', FALSE, TRUE, 4)`);
  const prods = await pool.query('SELECT id FROM productos');
  for (const p of prods.rows) {
    await pool.query('INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES ($1, $2, $3, 1)',
      [p.id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 'Imagen del producto']);
  }
}

// --- API: Settings ---
app.get('/api/settings', async (req, res) => {
  const result = await pool.query('SELECT clave, valor, tipo FROM site_settings');
  const settings = {};
  result.rows.forEach(r => { settings[r.clave] = r.valor; });
  res.json(settings);
});

app.get('/api/admin/settings', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM site_settings ORDER BY id');
  res.json(result.rows);
});

app.put('/api/admin/settings', requireAuth, async (req, res) => {
  const { settings } = req.body;
  for (const s of settings) {
    await pool.query('UPDATE site_settings SET valor=$1 WHERE clave=$2', [s.valor, s.clave]);
  }
  res.json({ ok: true });
});

// --- API: Payment Methods ---
app.get('/api/payment-methods', async (req, res) => {
  const result = await pool.query('SELECT * FROM payment_methods WHERE activo = TRUE ORDER BY orden');
  res.json(result.rows);
});

app.get('/api/admin/payment-methods', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM payment_methods ORDER BY orden');
  res.json(result.rows);
});

app.post('/api/admin/payment-methods', requireAuth, async (req, res) => {
  const { nombre, tipo, descripcion, instrucciones, imagen_url, config, activo, orden } = req.body;
  const result = await pool.query(
    'INSERT INTO payment_methods (nombre, tipo, descripcion, instrucciones, imagen_url, config, activo, orden) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [nombre, tipo, descripcion || '', instrucciones || '', imagen_url || '', config || null, activo !== false, orden || 0]
  );
  res.json(result.rows[0]);
});

app.put('/api/admin/payment-methods/:id', requireAuth, async (req, res) => {
  const { nombre, tipo, descripcion, instrucciones, imagen_url, config, activo, orden } = req.body;
  const result = await pool.query(
    'UPDATE payment_methods SET nombre=$1, tipo=$2, descripcion=$3, instrucciones=$4, imagen_url=$5, config=$6, activo=$7, orden=$8 WHERE id=$9 RETURNING *',
    [nombre, tipo, descripcion, instrucciones, imagen_url, config, activo !== false, orden || 0, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/admin/payment-methods/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM payment_methods WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// --- API: Products (public) ---
app.get('/api/productos', async (req, res) => {
  const { tipo, categoria, material, genero, q, orden, destacado, limit } = req.query;
  let sql = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.activo = TRUE';
  const params = []; let idx = 1;
  if (tipo) { sql += ` AND p.tipo = $${idx++}`; params.push(tipo); }
  if (categoria) { sql += ` AND c.slug = $${idx++}`; params.push(categoria); }
  if (material) { sql += ` AND LOWER(p.material) LIKE $${idx++}`; params.push(`%${material.toLowerCase()}%`); }
  if (genero) { sql += ` AND p.genero = $${idx++}`; params.push(genero); }
  if (q) { sql += ` AND (LOWER(p.nombre) LIKE $${idx++} OR LOWER(p.descripcion) LIKE $${idx++})`; const sq = `%${q.toLowerCase()}%`; params.push(sq, sq); }
  if (destacado === 'true') sql += ' AND p.destacado = TRUE';
  const orderMap = { precio_asc: 'p.precio ASC', precio_desc: 'p.precio DESC', nombre: 'p.nombre ASC', nuevo: 'p.created_at DESC' };
  sql += ` ORDER BY ${(orden && orderMap[orden]) || 'p.destacado DESC, p.nuevo DESC, p.created_at DESC'}`;
  if (limit) { sql += ` LIMIT $${idx++}`; params.push(parseInt(limit)); }
  const result = await pool.query(sql, params);
  for (const row of result.rows) {
    const imgs = await pool.query('SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [row.id]);
    row.imagenes = imgs.rows;
  }
  res.json(result.rows);
});

app.get('/api/productos/:slug', async (req, res) => {
  const result = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.slug = $1 AND p.activo = TRUE', [req.params.slug]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
  const p = result.rows[0];
  p.imagenes = (await pool.query('SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [p.id])).rows;
  p.variantes = (await pool.query('SELECT * FROM producto_variantes WHERE producto_id = $1', [p.id])).rows;
  res.json(p);
});

app.get('/api/categorias', async (req, res) => {
  res.json((await pool.query('SELECT * FROM categorias ORDER BY tipo, orden')).rows);
});

// --- API: Orders ---
app.post('/api/pedidos', async (req, res) => {
  const { items, cliente_nombre, cliente_whatsapp, direccion, ciudad, total } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });
  const codigo = 'SM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const pedido = await pool.query(
    'INSERT INTO pedidos (codigo, cliente_nombre, cliente_whatsapp, direccion, ciudad, total) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [codigo, cliente_nombre, cliente_whatsapp, direccion || null, ciudad || null, total]);
  for (const item of items) {
    await pool.query('INSERT INTO pedido_items (pedido_id, producto_id, variante_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4,$5)',
      [pedido.rows[0].id, item.producto_id, item.variante_id || null, item.cantidad, item.precio_unitario]);
  }
  res.json(pedido.rows[0]);
});

// --- API: Admin ---
app.post('/api/admin/login', async (req, res) => {
  const { usuario, password } = req.body;
  const result = await pool.query('SELECT * FROM admin_users WHERE usuario = $1', [usuario]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
  const admin = result.rows[0];
  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
  req.session.adminId = admin.id;
  res.json({ ok: true, usuario: admin.usuario, nombre: admin.nombre });
});

app.get('/api/admin/me', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, usuario, nombre FROM admin_users WHERE id = $1', [req.session.adminId]);
  res.json(result.rows[0] || null);
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/admin/dashboard', requireAuth, async (req, res) => {
  const pedidosPendientes = (await pool.query("SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente'")).rows[0].count;
  const totalProductos = (await pool.query('SELECT COUNT(*) FROM productos')).rows[0].count;
  const stockBajo = (await pool.query('SELECT COUNT(*) FROM productos WHERE stock < 5 AND activo = TRUE')).rows[0].count;
  const ventasMes = (await pool.query("SELECT COALESCE(SUM(total),0) FROM pedidos WHERE estado != 'cancelado' AND created_at > NOW() - INTERVAL '30 days'")).rows[0].coalesce;
  const pedidosRecientes = (await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 5')).rows;
  res.json({ pedidosPendientes: parseInt(pedidosPendientes), totalProductos: parseInt(totalProductos), stockBajo: parseInt(stockBajo), ventasMes: parseFloat(ventasMes), pedidosRecientes });
});

app.get('/api/admin/productos', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.created_at DESC');
  for (const row of result.rows) {
    row.imagenes = (await pool.query('SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [row.id])).rows;
    row.variantes = (await pool.query('SELECT * FROM producto_variantes WHERE producto_id = $1', [row.id])).rows;
  }
  res.json(result.rows);
});

app.post('/api/admin/productos', requireAuth, async (req, res) => {
  const { nombre, slug, descripcion, precio, precio_anterior, stock, tipo, material, genero, categoria_id, volumen_ml, notas_olfativas, destacado, nuevo } = req.body;
  const result = await pool.query(
    'INSERT INTO productos (nombre, slug, descripcion, precio, precio_anterior, stock, tipo, material, genero, categoria_id, volumen_ml, notas_olfativas, destacado, nuevo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
    [nombre, slug, descripcion, precio, precio_anterior || null, stock, tipo, material || null, genero || null, categoria_id || null, volumen_ml || null, notas_olfativas || null, destacado || false, nuevo || false]);
  res.json(result.rows[0]);
});

app.put('/api/admin/productos/:id', requireAuth, async (req, res) => {
  const { nombre, slug, descripcion, precio, precio_anterior, stock, tipo, material, genero, categoria_id, volumen_ml, notas_olfativas, destacado, nuevo, activo } = req.body;
  const result = await pool.query(
    'UPDATE productos SET nombre=$1, slug=$2, descripcion=$3, precio=$4, precio_anterior=$5, stock=$6, tipo=$7, material=$8, genero=$9, categoria_id=$10, volumen_ml=$11, notas_olfativas=$12, destacado=$13, nuevo=$14, activo=$15 WHERE id=$16 RETURNING *',
    [nombre, slug, descripcion, precio, precio_anterior || null, stock, tipo, material || null, genero || null, categoria_id || null, volumen_ml || null, notas_olfativas || null, destacado || false, nuevo || false, activo !== false, req.params.id]);
  res.json(result.rows[0]);
});

app.delete('/api/admin/productos/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [req.params.id]);
  await pool.query('DELETE FROM producto_variantes WHERE producto_id = $1', [req.params.id]);
  await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/admin/productos/:id/imagenes', requireAuth, async (req, res) => {
  const { url, alt } = req.body;
  const maxOrd = await pool.query('SELECT COALESCE(MAX(orden),0) + 1 as next FROM producto_imagenes WHERE producto_id = $1', [req.params.id]);
  const result = await pool.query('INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.id, url, alt || '', maxOrd.rows[0].next]);
  res.json(result.rows[0]);
});

app.delete('/api/admin/productos/:pid/imagenes/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM producto_imagenes WHERE id = $1 AND producto_id = $2', [req.params.id, req.params.pid]);
  res.json({ ok: true });
});

app.post('/api/admin/productos/:id/variantes', requireAuth, async (req, res) => {
  const { atributo, valor, precio, stock, sku } = req.body;
  const result = await pool.query(
    'INSERT INTO producto_variantes (producto_id, atributo, valor, precio, stock, sku) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.params.id, atributo, valor, precio || null, stock || 0, sku || null]);
  res.json(result.rows[0]);
});

app.delete('/api/admin/productos/:pid/variantes/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM producto_variantes WHERE id = $1 AND producto_id = $2', [req.params.id, req.params.pid]);
  res.json({ ok: true });
});

app.post('/api/admin/categorias', requireAuth, async (req, res) => {
  const { nombre, slug, tipo, imagen_url, orden } = req.body;
  const result = await pool.query(
    'INSERT INTO categorias (nombre, slug, tipo, imagen_url, orden) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [nombre, slug, tipo, imagen_url || null, orden || 0]);
  res.json(result.rows[0]);
});

app.get('/api/admin/pedidos', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
  for (const row of result.rows) {
    row.items = (await pool.query('SELECT pi.*, p.nombre as producto_nombre FROM pedido_items pi LEFT JOIN productos p ON pi.producto_id = p.id WHERE pi.pedido_id = $1', [row.id])).rows;
  }
  res.json(result.rows);
});

app.put('/api/admin/pedidos/:id', requireAuth, async (req, res) => {
  const { estado } = req.body;
  const result = await pool.query('UPDATE pedidos SET estado=$1 WHERE id=$2 RETURNING *', [estado, req.params.id]);
  res.json(result.rows[0]);
});

app.post('/api/upload', requireAuth, upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/upload-base64', requireAuth, (req, res) => {
  const { image, name } = req.body;
  if (!image) return res.status(400).json({ error: 'No image data' });
  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: 'Invalid image format' });
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const filename = `${Date.now()}-${(name || 'image').replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
  const filepath = path.join(__dirname, 'uploads', filename);
  fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
  res.json({ url: `/uploads/${filename}` });
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return;
  res.sendFile(path.join(distPath, 'index.html'));
});

async function start() {
  try {
    await migrate();
    await seed();
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  } catch (err) {
    console.error('Error al iniciar:', err);
    process.exit(1);
  }
}

start();