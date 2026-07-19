import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders/history/').then((res) => setOrders(res.data.results || res.data));
  useEffect(load, []);

  const updateStatus = async (order, status) => {
    await api.patch(`/orders/${order.id}/status/`, { status });
    load();
  };

  return (
    <div>
      <h1>Orders</h1>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Placed</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user_display || o.phone}</td>
                <td>₹{o.total}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
