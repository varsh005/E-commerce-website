import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_pincode: user?.pincode || '',
    phone: user?.phone || '',
    coupon_code: '',
  });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders/checkout/', form);
      await refreshCart();
      navigate(`/orders/${data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not place order. Please check your details.');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container section checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <form className="checkout-form card" onSubmit={submit}>
          <h3>Shipping details</h3>
          <div className="field">
            <label>Address</label>
            <textarea rows="2" required value={form.shipping_address} onChange={update('shipping_address')} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>City</label>
              <input required value={form.shipping_city} onChange={update('shipping_city')} />
            </div>
            <div className="field">
              <label>State</label>
              <input required value={form.shipping_state} onChange={update('shipping_state')} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Pincode</label>
              <input required value={form.shipping_pincode} onChange={update('shipping_pincode')} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input required value={form.phone} onChange={update('phone')} />
            </div>
          </div>
          <div className="field">
            <label>Coupon code (optional)</label>
            <input value={form.coupon_code} onChange={update('coupon_code')} placeholder="e.g. WELCOME10" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={placing}>
            {placing ? 'Placing order…' : `Place order — ₹${cart.total}`}
          </button>
          <p className="muted checkout-note">
            Payment is collected via Razorpay after order confirmation. Cash on delivery can be
            wired in the same way — this demo marks orders as pending until payment is verified.
          </p>
        </form>

        <aside className="checkout-summary card">
          <h3>Order summary</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="checkout-line">
              <span>{item.product_detail.name} × {item.quantity}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
          <div className="checkout-line total"><span>Total</span><span>₹{cart.total}</span></div>
        </aside>
      </div>
    </div>
  );
}
