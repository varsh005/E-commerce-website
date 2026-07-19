import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, setQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container section empty-state">
        <h2>Your cart is empty</h2>
        <p className="muted">Add something you like — it'll show up here.</p>
        <Link to="/products" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container section cart-page">
      <h1>Your cart</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item card">
              <div className="cart-item-media">
                {item.product_detail.image ? (
                  <img src={item.product_detail.image} alt={item.product_detail.name} />
                ) : (
                  <div className="cart-item-placeholder">{item.product_detail.name.charAt(0)}</div>
                )}
              </div>
              <div className="cart-item-info">
                <Link to={`/products/${item.product_detail.slug}`}><strong>{item.product_detail.name}</strong></Link>
                <span className="muted">₹{item.product_detail.effective_price} each</span>
              </div>
              <input
                type="number"
                min="1"
                max={item.product_detail.stock}
                value={item.quantity}
                onChange={(e) => setQuantity(item.product, Math.max(1, Number(e.target.value)))}
              />
              <span className="cart-item-subtotal">₹{item.subtotal}</span>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.product)}>Remove</button>
            </div>
          ))}
        </div>

        <aside className="cart-summary card">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{cart.total}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{cart.total}</span></div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
