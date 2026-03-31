process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./server');

// ─── GET /api/products ────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('returns 200 and an array of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/products?search=helmet');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(p => {
      const searchable = `${p.name} ${p.sku} ${p.description}`.toLowerCase();
      expect(searchable).toMatch(/helmet/);
    });
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Helmets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(p => expect(p.category).toBe('Helmets'));
  });
});

// ─── GET /api/categories ──────────────────────────────────────────────────────

describe('GET /api/categories', () => {
  it('returns 200 and a non-empty array of strings', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(c => expect(typeof c).toBe('string'));
  });
});

// ─── POST /api/products ───────────────────────────────────────────────────────

describe('POST /api/products', () => {
  it('creates a product and returns 201 with the new record', async () => {
    const payload = {
      name: 'Test Helmet',
      category: 'Helmets',
      sku: 'TEST-001',
      price: 99.99,
      quantity: 5,
      description: 'A test helmet',
    };
    const res = await request(app).post('/api/products').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('TEST-001');
    expect(res.body.name).toBe('Test Helmet');
    expect(res.body.id).toBeDefined();
  });

  it('returns 409 when SKU already exists', async () => {
    const payload = {
      name: 'Duplicate Helmet',
      category: 'Helmets',
      sku: 'TEST-001',
      price: 49.99,
      quantity: 1,
    };
    const res = await request(app).post('/api/products').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/SKU already exists/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/products').send({ name: 'No SKU' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Price',
      category: 'Helmets',
      sku: 'TEST-BAD-PRICE',
      price: -1,
      quantity: 1,
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when quantity is not an integer', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Qty',
      category: 'Helmets',
      sku: 'TEST-BAD-QTY',
      price: 10,
      quantity: 1.5,
    });
    expect(res.status).toBe(400);
  });
});

// ─── PATCH /api/products/:id/quantity ────────────────────────────────────────

describe('PATCH /api/products/:id/quantity', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Patch Target',
      category: 'Maintenance',
      sku: 'PATCH-001',
      price: 19.99,
      quantity: 10,
    });
    productId = res.body.id;
  });

  it('updates the quantity and returns the updated product', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}/quantity`)
      .send({ quantity: 42 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(42);
  });

  it('returns 404 for a non-existent product id', async () => {
    const res = await request(app)
      .patch('/api/products/999999/quantity')
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid quantity', async () => {
    const res = await request(app)
      .patch(`/api/products/${productId}/quantity`)
      .send({ quantity: -5 });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeAll(async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Delete Target',
      category: 'Luggage',
      sku: 'DEL-001',
      price: 9.99,
      quantity: 3,
    });
    productId = res.body.id;
  });

  it('deletes a product and returns 204', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when the product no longer exists', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.status).toBe(404);
  });
});
