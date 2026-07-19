import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/payments/dashboard/').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="skeleton" style={{ height: 200 }} />;

  return (
    <div>
      <h1>Sales dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card card">
          <div className="stat-value">₹{stats.total_revenue}</div>
          <div className="stat-label">Total revenue</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{stats.total_orders}</div>
          <div className="stat-label">Total orders</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{stats.pending_orders}</div>
          <div className="stat-label">Pending orders</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{stats.low_stock_products}</div>
          <div className="stat-label">Low stock items</div>
        </div>
      </div>

      <h3>Top selling products</h3>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Units sold</th></tr></thead>
          <tbody>
            {stats.top_products.map((p, i) => (
              <tr key={i}>
                <td>{p.items__product__name || '—'}</td>
                <td>{p.units_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
