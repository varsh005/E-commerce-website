import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { code: '', discount_percent: '', active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/orders/coupons/').then((res) => setCoupons(res.data.results || res.data));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/orders/coupons/', form);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  };

  const toggleActive = async (c) => {
    await api.patch(`/orders/coupons/${c.id}/`, { active: !c.active });
    load();
  };

  const remove = async (c) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    await api.delete(`/orders/coupons/${c.id}/`);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h1>Coupons</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add coupon</button>
      </div>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Discount</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.discount_percent}%</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleActive(c)}>
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td><button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>New coupon</h3>
            <div className="field"><label>Code</label><input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
            <div className="field"><label>Discount percent</label><input type="number" min="1" max="100" required value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create coupon</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
