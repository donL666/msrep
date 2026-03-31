const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/products  – list all products (optional ?search= and ?category=)
app.get('/api/products', (req, res) => {
  const { search = '', category = '' } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ' ORDER BY name ASC';

  try {
    const products = db.prepare(sql).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/categories – distinct category list
app.get('/api/categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/products – add a new product
app.post('/api/products', (req, res) => {
  const { name, category, sku, price, quantity, description } = req.body;

  if (!name || !category || !sku || price == null || quantity == null) {
    return res.status(400).json({ error: 'name, category, sku, price and quantity are required' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO products (name, category, sku, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(name.trim(), category.trim(), sku.trim().toUpperCase(), price, quantity, (description || '').trim());
    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A product with that SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/products/:id/quantity – update quantity only
app.patch('/api/products/:id/quantity', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }

  try {
    const info = db.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(quantity, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// DELETE /api/products/:id – remove a product
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory app running at http://localhost:${PORT}`);
});

module.exports = app;
