import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import './Orders.css';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}/`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="container section"><div className="skeleton" style={{ height: 300 }} /></div>;

  return (
    <div className="container section order-detail">
      {location.state?.justPlaced && (
        <div className="success-banner card">Order placed! A confirmation email is on its way.</div>
      )}
      <h1>Order #{order.id}</h1>
      <span className={`status-badge status-${order.status}`}>{order.status}</span>

      <div className="order-detail-grid">
        <div className="card order-items-card">
          <h3>Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="checkout-line">
              <span>{item.product_name} × {item.quantity}</span>
              <span>₹{item.subtotal ?? (item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="checkout-line"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          {Number(order.discount_amount) > 0 && (
            <div className="checkout-line"><span>Discount</span><span>−₹{order.discount_amount}</span></div>
          )}
          <div className="checkout-line total"><span>Total</span><span>₹{order.total}</span></div>
        </div>

        <div className="card">
          <h3>Shipping to</h3>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
          <p className="muted">{order.phone}</p>
        </div>
      </div>
    </div>
  );
}
