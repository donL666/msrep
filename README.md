# BMW Moto Parts – Inventory Manager

A modern full-stack web app for managing the inventory of a **BMW motorbike accessories** retail store.  
Staff can browse, search, add, delete and restock products through a clean browser-based interface backed by a REST API and a local SQLite database.

## What Does This Program Do?

This application solves a real-world retail problem: keeping track of parts and accessories stock levels for a BMW motorcycle shop.

| Who uses it | What they can do |
|---|---|
| Shop staff | View the full product catalogue, filter by category or search by name/SKU/description |
| Shop staff | Add new products (name, SKU, category, price, quantity, description) |
| Shop staff | Adjust stock quantities on-the-fly using inline ＋ / − buttons |
| Shop staff | Delete discontinued products with a confirmation dialog |
| Shop manager | See live at-a-glance statistics: total SKUs, total units in stock, low-stock count |

On first run the database is automatically created and seeded with **20 real BMW Motorrad accessory products** across six categories.

## Features

- 🏍️ Browse, search and filter BMW accessories by category
- ➕ Add new products with name, SKU, category, price, quantity and description
- 🗑️ Delete products with a confirmation dialog
- ✏️ Adjust stock quantities in-line with ＋ / − controls
- 📊 Live sidebar stats: total SKUs, total units, low-stock count
- 🎨 BMW-branded UI (BMW Blue colour scheme, per-category badges)
- 🔒 Rate limiting on all API endpoints (200 reads / 50 writes per 15 min)

## Product Categories

| Category | Description |
|---|---|
| Helmets | Full-face, flip-front and open-face helmets |
| Riding Gear | Jackets, gloves, boots and trousers |
| Luggage | Panniers, top cases and tank bags |
| Electronics | GPS, heated grips and intercom systems |
| Maintenance | Oils, filters and brake parts |
| Protection | Crash bars, windshields and comfort seats |

## Architecture

```
Browser (HTML + CSS + Vanilla JS)
        │  fetch() calls
        ▼
Express HTTP Server  (server.js, port 3000)
        │  better-sqlite3 (synchronous)
        ▼
SQLite database  (inventory.db – auto-created on first run)
```

| Layer | File(s) | Responsibility |
|---|---|---|
| Frontend | `public/index.html`, `public/styles.css`, `public/app.js` | Single-page UI, XSS-safe HTML rendering, debounced search |
| Backend | `server.js` | Express REST API, input validation, rate limiting |
| Database | `db.js`, `inventory.db` | Schema creation, seed data, `better-sqlite3` connection |

## REST API Reference

All endpoints are served under `/api`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | List all products. Supports `?search=` (name/SKU/description) and `?category=` filters. |
| `GET` | `/api/categories` | Return a sorted list of distinct category names. |
| `POST` | `/api/products` | Create a new product. Body: `{ name, category, sku, price, quantity, description? }` |
| `PATCH` | `/api/products/:id/quantity` | Update the stock quantity of a product. Body: `{ quantity }` |
| `DELETE` | `/api/products/:id` | Remove a product from the catalogue. |

### Example: Add a product

```bash
curl -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Tank Pad","category":"Protection","sku":"PROT-010","price":29.99,"quantity":50}'
```

## Data Model

```sql
CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  sku         TEXT    UNIQUE NOT NULL,   -- auto-uppercased on insert
  price       REAL    NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 0,
  description TEXT
);
```

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | SQLite via `better-sqlite3` |
| Rate limiting | `express-rate-limit` |
| Frontend | Vanilla HTML / CSS / JavaScript (no framework) |

## Getting Started

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

The app uses a local **SQLite** database (`inventory.db`) which is automatically
created and seeded with **20 BMW accessory products** on first run.
