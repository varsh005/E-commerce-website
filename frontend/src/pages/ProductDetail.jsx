import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');

  const load = () => api.get(`/products/${slug}/`).then((res) => setProduct(res.data));

  useEffect(() => { load(); }, [slug]);

  if (!product) {
    return <div className="container section"><div className="skeleton" style={{ height: 400 }} /></div>;
  }

  const onSale = product.discount_price && Number(product.discount_price) < Number(product.price);

  const handleAdd = async () => {
    await addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post('/products/reviews/', { product: product.id, ...reviewForm });
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setReviewError(err.response?.data?.non_field_errors?.[0] || 'Could not submit review. You may have already reviewed this product.');
    }
  };

  return (
    <div className="container section pdp">
      <Link to="/products" className="muted back-link">← Back to shop</Link>
      <div className="pdp-grid">
        <div className="pdp-media card">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="pdp-placeholder">{product.name.charAt(0)}</div>
          )}
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <div className="pdp-rating">
            {'★'.repeat(Math.round(product.average_rating || 0))}
            {'☆'.repeat(5 - Math.round(product.average_rating || 0))}
            <span className="muted"> {product.average_rating || 0} ({product.reviews.length} reviews)</span>
          </div>

          <div className="pdp-price">
            {onSale && <span className="strike">₹{product.price}</span>}
            <span className="current-price">₹{product.effective_price}</span>
            {onSale && <span className="price-tag">Sale</span>}
          </div>

          <p className="pdp-desc">{product.description}</p>
          <p className="muted">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          {user ? (
            <div className="pdp-actions">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
              <button className="btn btn-primary" onClick={handleAdd} disabled={product.stock === 0}>
                {added ? 'Added ✓' : 'Add to cart'}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Log in to purchase</Link>
          )}
        </div>
      </div>

      <section className="pdp-reviews">
        <h2>Reviews</h2>
        {product.reviews.length === 0 && <p className="muted">No reviews yet — be the first.</p>}
        <div className="review-list">
          {product.reviews.map((r) => (
            <div key={r.id} className="review-item card">
              <div className="review-head">
                <strong>{r.username}</strong>
                <span className="muted">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </div>

        {user && (
          <form className="review-form card" onSubmit={submitReview}>
            <h3>Leave a review</h3>
            <div className="field">
              <label>Rating</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Comment</label>
              <textarea rows="3" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </div>
            {reviewError && <p className="form-error">{reviewError}</p>}
            <button className="btn btn-primary" type="submit">Submit review</button>
          </form>
        )}
      </section>
    </div>
  );
}
