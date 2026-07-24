const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sanamiel',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
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
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('fragancia','joyeria')),
      imagen_url TEXT,
      orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      descripcion TEXT,
      precio NUMERIC(12,2) NOT NULL,
      precio_anterior NUMERIC(12,2),
      stock INTEGER NOT NULL DEFAULT 0,
      categoria_id INTEGER REFERENCES categorias(id),
      material TEXT,
      marca TEXT,
      genero TEXT,
      volumen_ml NUMERIC,
      notas_olfativas TEXT,
      tipo TEXT DEFAULT 'fragancia',
      destacado BOOLEAN DEFAULT FALSE,
      nuevo BOOLEAN DEFAULT FALSE,
      activo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS producto_imagenes (
      id SERIAL PRIMARY KEY,
      producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt TEXT,
      orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS producto_variantes (
      id SERIAL PRIMARY KEY,
      producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      atributo TEXT NOT NULL,
      valor TEXT NOT NULL,
      precio NUMERIC(12,2),
      stock INTEGER DEFAULT 0,
      sku TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_whatsapp TEXT NOT NULL,
      direccion TEXT,
      ciudad TEXT,
      total NUMERIC(12,2) NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS pedido_items (
      id SERIAL PRIMARY KEY,
      pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
      producto_id INTEGER REFERENCES productos(id),
      variante_id INTEGER REFERENCES producto_variantes(id),
      cantidad INTEGER NOT NULL,
      precio_unitario NUMERIC(12,2) NOT NULL
    );
  `;
  await pool.query(sql);
  console.log('Migraciones ejecutadas');
}

async function seed() {
  const catCount = await pool.query('SELECT COUNT(*) FROM categorias');
  if (parseInt(catCount.rows[0].count) > 0) return;

  await pool.query(`
    INSERT INTO categorias (nombre, slug, tipo, orden) VALUES
      ('Perfumes', 'perfumes', 'fragancia', 1),
      ('Body Splash', 'body-splash', 'fragancia', 2),
      ('Anillos', 'anillos', 'joyeria', 1),
      ('Pulseras', 'pulseras', 'joyeria', 2),
      ('Cadenas y dijes', 'cadenas-dijes', 'joyeria', 3),
      ('Aretes', 'aretes', 'joyeria', 4);
  `);

  await pool.query(`
    INSERT INTO productos (nombre, slug, descripcion, precio, precio_anterior, stock, material, genero, volumen_ml, notas_olfativas, tipo, destacado, nuevo, categoria_id) VALUES
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
      ('Pulsera Mar', 'pulsera-mar', 'Pulsera con cuentas y charms en plata 925.', 94900, NULL, 14, 'plata 925', 'mujer', NULL, NULL, 'joyeria', FALSE, TRUE, 4);
  `);

  const prods = await pool.query('SELECT id FROM productos');
  for (const p of prods.rows) {
    await pool.query(
      'INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES ($1, $2, $3, 1)',
      [p.id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', 'Imagen del producto']
    );
  }

  console.log('Datos semilla insertados');
}

// --- API Routes ---

app.get('/api/productos', async (req, res) => {
  const { tipo, categoria, material, genero, q, orden, destacado, limit } = req.query;
  let sql = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.activo = TRUE';
  const params = [];
  let idx = 1;

  if (tipo) { sql += ` AND p.tipo = $${idx++}`; params.push(tipo); }
  if (categoria) { sql += ` AND c.slug = $${idx++}`; params.push(categoria); }
  if (material) { sql += ` AND LOWER(p.material) LIKE $${idx++}`; params.push(`%${material.toLowerCase()}%`); }
  if (genero) { sql += ` AND p.genero = $${idx++}`; params.push(genero); }
  if (q) { sql += ` AND (LOWER(p.nombre) LIKE $${idx++} OR LOWER(p.descripcion) LIKE $${idx++})`; const sq = `%${q.toLowerCase()}%`; params.push(sq, sq); }
  if (destacado === 'true') { sql += ' AND p.destacado = TRUE'; }

  const orderMap = { precio_asc: 'p.precio ASC', precio_desc: 'p.precio DESC', nombre: 'p.nombre ASC', nuevo: 'p.created_at DESC' };
  if (orden && orderMap[orden]) sql += ` ORDER BY ${orderMap[orden]}`;
  else sql += ' ORDER BY p.destacado DESC, p.nuevo DESC, p.created_at DESC';

  if (limit) { sql += ` LIMIT $${idx++}`; params.push(parseInt(limit)); }

  const result = await pool.query(sql, params);
  const rows = result.rows;

  for (const row of rows) {
    const imgs = await pool.query('SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [row.id]);
    row.imagenes = imgs.rows;
  }

  res.json(rows);
});

app.get('/api/productos/:slug', async (req, res) => {
  const result = await pool.query('SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.slug = $1 AND p.activo = TRUE', [req.params.slug]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });

  const p = result.rows[0];
  const imgs = await pool.query('SELECT * FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden', [p.id]);
  const vars = await pool.query('SELECT * FROM producto_variantes WHERE producto_id = $1', [p.id]);
  p.imagenes = imgs.rows;
  p.variantes = vars.rows;

  res.json(p);
});

app.get('/api/categorias', async (req, res) => {
  const result = await pool.query('SELECT * FROM categorias ORDER BY tipo, orden');
  res.json(result.rows);
});

app.post('/api/pedidos', async (req, res) => {
  const { items, cliente_nombre, cliente_whatsapp, direccion, ciudad, total } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });

  const codigo = 'SM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const pedido = await pool.query(
    'INSERT INTO pedidos (codigo, cliente_nombre, cliente_whatsapp, direccion, ciudad, total) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [codigo, cliente_nombre, cliente_whatsapp, direccion || null, ciudad || null, total]
  );

  for (const item of items) {
    await pool.query(
      'INSERT INTO pedido_items (pedido_id, producto_id, variante_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4,$5)',
      [pedido.rows[0].id, item.producto_id, item.variante_id || null, item.cantidad, item.precio_unitario]
    );
  }

  res.json(pedido.rows[0]);
});

app.post('/api/admin/login', async (req, res) => {
  const { usuario, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'sanamiel2024';

  if (usuario !== adminUser || password !== adminPass) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  req.session.adminId = 1;
  res.json({ ok: true });
});

app.get('/api/admin/productos', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM productos ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/admin/productos', requireAuth, async (req, res) => {
  const { nombre, slug, descripcion, precio, stock, tipo, material, genero } = req.body;
  const result = await pool.query(
    'INSERT INTO productos (nombre, slug, descripcion, precio, stock, tipo, material, genero) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [nombre, slug, descripcion, precio, stock, tipo, material || null, genero || null]
  );
  res.json(result.rows[0]);
});

app.put('/api/admin/productos/:id', requireAuth, async (req, res) => {
  const { nombre, slug, descripcion, precio, stock, tipo, material, genero } = req.body;
  const result = await pool.query(
    'UPDATE productos SET nombre=$1, slug=$2, descripcion=$3, precio=$4, stock=$5, tipo=$6, material=$7, genero=$8 WHERE id=$9 RETURNING *',
    [nombre, slug, descripcion, precio, stock, tipo, material || null, genero || null, req.params.id]
  );
  res.json(result.rows[0]);
});

app.get('/api/admin/pedidos', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
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