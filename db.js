const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, 'inventory.db');

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
    // Helmets
    insert.run('BMW Motorrad System 7 Carbon Helmet', 'Helmets', 'HELM-001', 849.99, 18, 'Lightweight full-face/open-face flip helmet, carbon fibre shell, ECE 22.06 certified');
    insert.run('BMW Motorrad Evo Strada Helmet', 'Helmets', 'HELM-002', 399.99, 25, 'Aerodynamic full-face helmet, integrated sun visor, Pinlock-ready');
    // Riding Gear
    insert.run('BMW GS Dry Jacket', 'Riding Gear', 'GEAR-001', 649.99, 14, 'Waterproof 3-layer laminate adventure jacket, CE Level 2 armour, ventilation zips');
    insert.run('BMW Motorrad AirShell Jacket', 'Riding Gear', 'GEAR-002', 549.99, 20, 'Mesh summer jacket with integrated armour and back protector pocket');
    insert.run('BMW Rallye 4 GTX Boots', 'Riding Gear', 'GEAR-003', 449.99, 30, 'GORE-TEX adventure boots, ankle support, oil-resistant sole, WP certified');
    insert.run('BMW GS Dry Gloves', 'Riding Gear', 'GEAR-004', 149.99, 40, 'Waterproof 3-layer laminate gloves, touchscreen-compatible fingertips, wrist strap');
    insert.run('BMW Motorrad ProRace Pants', 'Riding Gear', 'GEAR-005', 379.99, 22, 'Abrasion-resistant textile trousers, CE Level 2 knee and hip armour');
    // Luggage
    insert.run('BMW Vario Pannier Set 37+47L', 'Luggage', 'LUGG-001', 699.99, 10, 'Expandable hard-case pannier pair for R/F/G/S models, tool-free mounting');
    insert.run('BMW Vario Top Case 49L', 'Luggage', 'LUGG-002', 449.99, 15, 'Hard top case with one-handed opening, colour-matched, fits pillion backrest');
    insert.run('BMW Tank Bag 8L (TF)', 'Luggage', 'LUGG-003', 189.99, 28, 'Magnetic tank bag with transparent map pocket and removable shoulder strap');
    // Electronics & Navigation
    insert.run('BMW Motorrad Navigator 6', 'Electronics', 'ELEC-001', 599.99, 12, '5" glove-friendly touchscreen GPS, BMW ConnectedRide integration, lifetime maps');
    insert.run('BMW Motorrad Heated Grip EVO', 'Electronics', 'ELEC-002', 229.99, 35, 'Retrofit heated grips with 5 heat levels, CAN-bus compatible, plug-and-play');
    insert.run('Cardo PackTalk Bold (BMW Edition)', 'Electronics', 'ELEC-003', 369.99, 20, 'Mesh Intercom Bluetooth system, 1.6 km range, FM radio, voice commands');
    insert.run('BMW Motorrad USB-C Charger Socket', 'Electronics', 'ELEC-004', 59.99, 60, 'OEM-spec USB-C socket with 18W fast charge, weatherproof, handlebar-mount');
    // Maintenance & Parts
    insert.run('BMW Motorrad Twin Power Turbo Oil 5W-40 4L', 'Maintenance', 'MANT-001', 49.99, 80, 'OEM BMW Motorrad engine oil, full synthetic, suitable for all BMW boxer & inline engines');
    insert.run('BMW Air Filter Element (OEM)', 'Maintenance', 'MANT-002', 34.99, 55, 'Genuine OEM paper air filter for R1300GS / R1250GS, service interval replacement');
    insert.run('BMW EBC Brake Pad Set – Front', 'Maintenance', 'MANT-003', 64.99, 45, 'Sintered front brake pads compatible with BMW R/S/F series, OEM replacement spec');
    // Protection & Accessories
    insert.run('BMW R1300GS Engine Guard Set', 'Protection', 'PROT-001', 299.99, 16, 'Powder-coated aluminium crash bars protecting engine and lower fairings');
    insert.run('BMW GS Windshield Touring (Tall)', 'Protection', 'PROT-002', 179.99, 24, 'Tall adjustable touring windshield for R1300GS/R1250GS, scratch-resistant, smoke tint');
    insert.run('BMW Motorrad Comfort Seat (Driver)', 'Protection', 'PROT-003', 259.99, 18, 'Low-profile memory foam driver seat for R1300GS, 10mm lower than standard');
  });
  seed();
}

module.exports = db;
