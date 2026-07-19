import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Orders.css';

const STATUS_COLORS = {
  pending: 'status-pending', paid: 'status-paid', processing: 'status-processing',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/history/').then((res) => {
      setOrders(res.data.results || res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container section"><div className="skeleton" style={{ height: 300 }} /></div>;

  if (orders.length === 0) {
    return (
      <div className="container section empty-state">
        <h2>No orders yet</h2>
        <p className="muted">Once you place an order, it'll show up here.</p>
        <Link to="/products" className="btn btn-primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Order history</h1>
      <div className="order-list">
        {orders.map((o) => (
          <Link to={`/orders/${o.id}`} key={o.id} className="order-row card">
            <div>
              <strong>Order #{o.id}</strong>
              <span className="muted"> · {new Date(o.created_at).toLocaleDateString()}</span>
            </div>
            <span className={`status-badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
            <span className="order-total">₹{o.total}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
