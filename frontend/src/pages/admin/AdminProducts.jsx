import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', slug: '', category: '', description: '', price: '', discount_price: '', stock: '', is_active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/products/?page_size=100').then((res) => setProducts(res.data.results || res.data));
    api.get('/products/categories/').then((res) => setCategories(res.data.results || res.data));
  };

  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, category: p.category, description: p.description || '',
      price: p.price, discount_price: p.discount_price || '', stock: p.stock, is_active: p.is_active,
    });
    setModalOpen(true);
  };

  const update = (key) => (e) => {
    const val = key === 'is_active' ? e.target.checked : e.target.value;
    setForm({ ...form, [key]: val });
  };

  const autoSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || autoSlug(form.name), discount_price: form.discount_price || null };
    if (editing) {
      await api.patch(`/products/${editing.slug}/`, payload);
    } else {
      await api.post('/products/', payload);
    }
    setModalOpen(false);
    load();
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.slug}/`);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add product</button>
      </div>

      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category_name}</td>
                <td>₹{p.price}{p.discount_price && ` (₹${p.discount_price})`}</td>
                <td>{p.stock}</td>
                <td>{p.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>{editing ? 'Edit product' : 'New product'}</h3>
            <div className="field"><label>Name</label><input required value={form.name} onChange={update('name')} /></div>
            <div className="field"><label>Category</label>
              <select required value={form.category} onChange={update('category')}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Description</label><textarea rows="2" value={form.description} onChange={update('description')} /></div>
            <div className="form-row">
              <div className="field"><label>Price</label><input type="number" step="0.01" required value={form.price} onChange={update('price')} /></div>
              <div className="field"><label>Discount price</label><input type="number" step="0.01" value={form.discount_price} onChange={update('discount_price')} /></div>
            </div>
            <div className="field"><label>Stock</label><input type="number" required value={form.stock} onChange={update('stock')} /></div>
            <div className="field">
              <label><input type="checkbox" checked={form.is_active} onChange={update('is_active')} style={{ width: 'auto', marginRight: 6 }} />Active</label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Create product'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
