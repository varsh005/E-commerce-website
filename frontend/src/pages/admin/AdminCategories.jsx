import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', slug: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/products/categories/').then((res) => setCategories(res.data.results || res.data));
  useEffect(load, []);

  const autoSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm(c); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || autoSlug(form.name) };
    if (editing) await api.patch(`/products/categories/${editing.slug}/`, payload);
    else await api.post('/products/categories/', payload);
    setModalOpen(false);
    load();
  };

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"? Products inside it will also be deleted.`)) return;
    await api.delete(`/products/categories/${c.slug}/`);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add category</button>
      </div>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>{editing ? 'Edit category' : 'New category'}</h3>
            <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Description</label><textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Create category'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
