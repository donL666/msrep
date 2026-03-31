/* =============================================
   Inventory App – Client-Side JavaScript
   ============================================= */

const API = '/api';
let allProducts = [];
let toastTimer = null;
let deleteTarget = null;

// ── DOM refs ──────────────────────────────────
const tbody          = document.getElementById('product-tbody');
const searchInput    = document.getElementById('search');
const categoryFilter = document.getElementById('filter-category');
const modalAdd       = document.getElementById('modal-add');
const modalDelete    = document.getElementById('modal-delete');
const formAdd        = document.getElementById('form-add');
const formError      = document.getElementById('form-error');
const toastEl        = document.getElementById('toast');
const statTotal      = document.getElementById('stat-total');
const statUnits      = document.getElementById('stat-units');
const statLow        = document.getElementById('stat-low');
const catDatalist    = document.getElementById('category-list');

// ── Bootstrap ─────────────────────────────────
(async () => {
  await Promise.all([loadProducts(), loadCategories()]);
})();

// ── Data Loading ──────────────────────────────
async function loadProducts() {
  try {
    const params = new URLSearchParams();
    const q = searchInput.value.trim();
    const cat = categoryFilter.value;
    if (q) params.set('search', q);
    if (cat) params.set('category', cat);

    const res = await fetch(`${API}/products?${params}`);
    if (!res.ok) throw new Error('Failed to load products');
    allProducts = await res.json();
    renderTable(allProducts);
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`);
    if (!res.ok) return;
    const cats = await res.json();
    populateCategoryFilter(cats);
    populateCategoryDatalist(cats);
  } catch (_) { /* silent */ }
}

// ── Rendering ─────────────────────────────────
function renderTable(products) {
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No products found. Try adjusting your search or <button class="btn-link" onclick="openAddModal()">add a new product</button>.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const lowStock = p.quantity <= 5;
    const qtyClass = lowStock ? 'low' : 'ok';
    return `
    <tr data-id="${p.id}">
      <td>
        <div class="product-name">${escHtml(p.name)}</div>
        ${p.description ? `<div class="product-desc" title="${escHtml(p.description)}">${escHtml(p.description)}</div>` : ''}
      </td>
      <td><code>${escHtml(p.sku)}</code></td>
      <td><span class="badge">${escHtml(p.category)}</span></td>
      <td class="price">£${Number(p.price).toFixed(2)}</td>
      <td>
        <div class="qty-control">
          <button class="qty-btn" aria-label="Decrease quantity" onclick="changeQty(${p.id}, ${p.quantity - 1})">−</button>
          <span class="qty-value ${qtyClass}">${p.quantity}</span>
          <button class="qty-btn" aria-label="Increase quantity" onclick="changeQty(${p.id}, ${p.quantity + 1})">＋</button>
        </div>
      </td>
      <td class="col-actions">
        <div class="actions-cell">
          <button class="btn-icon delete" title="Delete product" aria-label="Delete ${escHtml(p.name)}" onclick="confirmDelete(${p.id}, '${escAttr(p.name)}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function updateStats() {
  const total = allProducts.length;
  const units = allProducts.reduce((s, p) => s + p.quantity, 0);
  const low   = allProducts.filter(p => p.quantity <= 5).length;
  statTotal.textContent = total;
  statUnits.textContent = units;
  statLow.textContent   = low;
}

function populateCategoryFilter(cats) {
  const current = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${escHtml(c)}" ${c === current ? 'selected' : ''}>${escHtml(c)}</option>`).join('');
}

function populateCategoryDatalist(cats) {
  catDatalist.innerHTML = cats.map(c => `<option value="${escHtml(c)}">`).join('');
}

// ── Quantity Update ───────────────────────────
async function changeQty(id, newQty) {
  if (newQty < 0) return;
  try {
    const res = await fetch(`${API}/products/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    const updated = await res.json();
    // Update in-memory & re-render just that row
    const idx = allProducts.findIndex(p => p.id === id);
    if (idx !== -1) allProducts[idx] = updated;
    renderTable(allProducts);
    updateStats();
    showToast('Quantity updated', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Add Product ───────────────────────────────
function openAddModal() {
  formAdd.reset();
  formError.textContent = '';
  modalAdd.classList.add('open');
  document.getElementById('f-name').focus();
}

function closeAddModal() { modalAdd.classList.remove('open'); }

document.getElementById('btn-add').addEventListener('click', openAddModal);
document.getElementById('btn-modal-close').addEventListener('click', closeAddModal);
document.getElementById('btn-cancel').addEventListener('click', closeAddModal);
modalAdd.addEventListener('click', e => { if (e.target === modalAdd) closeAddModal(); });

formAdd.addEventListener('submit', async e => {
  e.preventDefault();
  formError.textContent = '';

  const name        = document.getElementById('f-name').value.trim();
  const sku         = document.getElementById('f-sku').value.trim();
  const category    = document.getElementById('f-category').value.trim();
  const price       = parseFloat(document.getElementById('f-price').value);
  const quantity    = parseInt(document.getElementById('f-quantity').value, 10);
  const description = document.getElementById('f-description').value.trim();

  if (!name || !sku || !category || isNaN(price) || isNaN(quantity)) {
    formError.textContent = 'Please fill in all required fields.';
    return;
  }

  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sku, category, price, quantity, description }),
    });
    const data = await res.json();
    if (!res.ok) { formError.textContent = data.error || 'Failed to add product'; return; }

    closeAddModal();
    await Promise.all([loadProducts(), loadCategories()]);
    showToast(`"${name}" added successfully`, 'success');
  } catch (err) {
    formError.textContent = err.message;
  }
});

// ── Delete Product ────────────────────────────
function confirmDelete(id, name) {
  deleteTarget = id;
  document.getElementById('delete-product-name').textContent = name;
  modalDelete.classList.add('open');
}

function closeDeleteModal() { modalDelete.classList.remove('open'); deleteTarget = null; }

document.getElementById('btn-delete-close').addEventListener('click', closeDeleteModal);
document.getElementById('btn-delete-cancel').addEventListener('click', closeDeleteModal);
modalDelete.addEventListener('click', e => { if (e.target === modalDelete) closeDeleteModal(); });

document.getElementById('btn-delete-confirm').addEventListener('click', async () => {
  if (!deleteTarget) return;
  const id = deleteTarget;
  closeDeleteModal();
  try {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    await Promise.all([loadProducts(), loadCategories()]);
    showToast('Product deleted', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ── Search & Filter ───────────────────────────
let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadProducts, 280);
});
categoryFilter.addEventListener('change', loadProducts);

// ── Toast ─────────────────────────────────────
function showToast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, 3200);
}

// ── Escape helpers (XSS prevention) ──────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

// ── Keyboard shortcuts ─────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAddModal();
    closeDeleteModal();
  }
});
