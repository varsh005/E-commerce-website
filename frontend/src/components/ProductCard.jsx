import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistChange, wished = false }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const onSale = product.discount_price && Number(product.discount_price) < Number(product.price);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return;
    await addToCart(product.id, 1);
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (wished) {
      await api.delete(`/products/wishlist/${product.wishlistId}/`);
    } else {
      await api.post('/products/wishlist/', { product: product.id });
    }
    onWishlistChange?.();
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card card">
      <div className="product-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">{product.name.charAt(0)}</div>
        )}
        {onSale && <span className="price-tag product-card-tag">Sale</span>}
        {user && (
          <button
            className={`wishlist-btn ${wished ? 'active' : ''}`}
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
          >
            ♥
          </button>
        )}
      </div>
      <div className="product-card-body">
        <span className="eyebrow">{product.category_name}</span>
        <h3>{product.name}</h3>
        <div className="product-card-rating">
          {'★'.repeat(Math.round(product.average_rating || 0))}
          {'☆'.repeat(5 - Math.round(product.average_rating || 0))}
          <span className="muted"> ({product.average_rating || 0})</span>
        </div>
        <div className="product-card-footer">
          <div className="product-card-price">
            {onSale && <span className="strike">₹{product.price}</span>}
            <span className="current-price">₹{product.effective_price ?? product.price}</span>
          </div>
          {user && (
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of stock' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
