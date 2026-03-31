const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT
  )
`);

const count = db.prepare('SELECT COUNT(*) AS cnt FROM products').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, category, sku, price, quantity, description) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const seed = db.transaction(() => {
    insert.run('Wireless Headphones', 'Electronics', 'ELEC-001', 79.99, 45, 'Over-ear noise-cancelling wireless headphones');
    insert.run('USB-C Charging Cable', 'Electronics', 'ELEC-002', 12.99, 200, 'Braided 2m USB-C to USB-A cable, 60W fast charge');
    insert.run('Mechanical Keyboard', 'Electronics', 'ELEC-003', 129.99, 30, 'Compact tenkeyless mechanical keyboard, Cherry MX switches');
    insert.run('Ergonomic Office Chair', 'Furniture', 'FURN-001', 349.99, 12, 'Adjustable lumbar support, breathable mesh back');
    insert.run('Standing Desk', 'Furniture', 'FURN-002', 499.99, 8, 'Electric height-adjustable desk, 140x70cm');
    insert.run('Monitor Stand', 'Furniture', 'FURN-003', 49.99, 55, 'Bamboo monitor riser with USB hub, 2-tier design');
    insert.run('Stainless Steel Water Bottle', 'Kitchen', 'KTCH-001', 24.99, 120, 'Vacuum insulated, keeps drinks cold 24h / hot 12h, 750ml');
    insert.run('Pour-Over Coffee Maker', 'Kitchen', 'KTCH-002', 34.99, 60, 'Borosilicate glass carafe with stainless steel filter, 600ml');
    insert.run('Chef\'s Knife', 'Kitchen', 'KTCH-003', 59.99, 40, '20cm German steel blade, full-tang construction');
    insert.run('Yoga Mat', 'Sports', 'SPRT-001', 39.99, 75, 'Non-slip 6mm thick TPE mat, 183x61cm, includes carry strap');
    insert.run('Resistance Bands Set', 'Sports', 'SPRT-002', 19.99, 150, 'Set of 5 latex resistance bands, 10-50 lbs');
    insert.run('Running Shoes', 'Sports', 'SPRT-003', 89.99, 35, 'Lightweight cushioned road running shoes, various sizes');
    insert.run('Scented Candle Set', 'Home & Decor', 'DECO-001', 29.99, 90, 'Set of 3 soy wax candles: vanilla, lavender, cedar');
    insert.run('Throw Pillow Cover', 'Home & Decor', 'DECO-002', 14.99, 180, 'Linen blend, 45x45cm, multiple colours available');
    insert.run('Wooden Photo Frame', 'Home & Decor', 'DECO-003', 18.99, 65, 'Solid pine, natural finish, 15x20cm');
    insert.run('Notebook Set', 'Stationery', 'STAT-001', 16.99, 110, 'Set of 3 A5 dot-grid notebooks, 160 pages each');
    insert.run('Ballpoint Pen Pack', 'Stationery', 'STAT-002', 8.99, 300, 'Pack of 10 smooth ballpoint pens, black ink, 0.7mm');
    insert.run('Desk Organiser', 'Stationery', 'STAT-003', 22.99, 50, 'Bamboo desk organiser with 5 compartments');
    insert.run('Face Moisturiser SPF 30', 'Beauty', 'BEAU-001', 32.99, 80, 'Lightweight daily moisturiser with broad-spectrum SPF 30');
    insert.run('Lip Balm Pack', 'Beauty', 'BEAU-002', 9.99, 250, 'Set of 4 tinted lip balms with vitamin E, assorted flavours');
  });
  seed();
}

module.exports = db;
