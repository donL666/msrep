# BMW Moto Parts – Inventory Manager

A modern web app for managing the inventory of a **BMW motorbike accessories** retail store.

## Features

- 🏍️ Browse, search and filter BMW accessories by category
- ➕ Add new products with name, SKU, category, price, quantity and description
- 🗑️ Delete products with a confirmation dialog
- ✏️ Adjust stock quantities in-line with ＋ / − controls
- 📊 Live sidebar stats: total SKUs, total units, low-stock count
- 🎨 BMW-branded UI (BMW Blue colour scheme, per-category badges)

## Product Categories

| Category | Description |
|---|---|
| Helmets | Full-face, flip-front and open-face helmets |
| Riding Gear | Jackets, gloves, boots and trousers |
| Luggage | Panniers, top cases and tank bags |
| Electronics | GPS, heated grips and intercom systems |
| Maintenance | Oils, filters and brake parts |
| Protection | Crash bars, windshields and comfort seats |

## Getting Started

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

The app uses a local **SQLite** database (`inventory.db`) which is automatically
created and seeded with **20 BMW accessory products** on first run.
