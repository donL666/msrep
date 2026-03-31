'use strict';

// Use an in-memory SQLite database for tests so the production inventory.db
// is never touched.
process.env.DB_PATH = ':memory:';

const request = require('supertest');

// Require app *after* setting DB_PATH so db.js picks up the env variable.
const app = require('../server');

describe('GET /api/categories', () => {
  it('returns an array of category strings', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Seed data contains these categories
    expect(res.body).toEqual(expect.arrayContaining([
      'Electronics',
      'Helmets',
      'Luggage',
      'Maintenance',
      'Protection',
      'Riding Gear',
    ]));
  });
});

describe('GET /api/products', () => {
  it('returns all 20 seeded products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(20);
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/products?search=helmet');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(p => {
      const haystack = `${p.name} ${p.sku} ${p.description}`.toLowerCase();
      expect(haystack).toContain('helmet');
    });
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Helmets');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(p => expect(p.category).toBe('Helmets'));
  });

  it('returns empty array for non-existent category', async () => {
    const res = await request(app).get('/api/products?category=NonExistent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/products', () => {
  const newProduct = {
    name: 'Test Helmet',
    category: 'Helmets',
    sku: 'TEST-001',
    price: 99.99,
    quantity: 5,
    description: 'A test product',
  };

  it('creates a new product and returns 201', async () => {
    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Test Helmet',
      category: 'Helmets',
      sku: 'TEST-001',
      price: 99.99,
      quantity: 5,
    });
    expect(res.body.id).toBeDefined();
  });

  it('returns 409 when SKU is already taken', async () => {
    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/SKU already exists/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app).post('/api/products').send({
      ...newProduct,
      sku: 'TEST-BAD-PRICE',
      price: -1,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it('returns 400 when quantity is not an integer', async () => {
    const res = await request(app).post('/api/products').send({
      ...newProduct,
      sku: 'TEST-BAD-QTY',
      quantity: 1.5,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });
});

describe('PATCH /api/products/:id/quantity', () => {
  let productId;

  beforeAll(async () => {
    // Create a product to patch
    const res = await request(app).post('/api/products').send({
      name: 'Patch Test Product',
      category: 'Maintenance',
      sku: 'PATCH-001',
      price: 10.00,
      quantity: 3,
    });
    productId = res.body.id;
  });

  it('updates the quantity and returns the updated product', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}/quantity`)
      .send({ quantity: 42 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(42);
    expect(res.body.id).toBe(productId);
  });

  it('returns 400 when quantity is negative', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}/quantity`)
      .send({ quantity: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/i);
  });

  it('returns 404 for a non-existent product id', async () => {
    const res = await request(app)
      .patch('/api/products/999999/quantity')
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Delete Test Product',
      category: 'Protection',
      sku: 'DEL-001',
      price: 20.00,
      quantity: 1,
    });
    productId = res.body.id;
  });

  it('deletes a product and returns 204', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when deleting a non-existent product', async () => {
    const res = await request(app).delete('/api/products/999999');
    expect(res.status).toBe(404);
  });
});
