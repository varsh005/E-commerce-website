import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/products/wishlist/').then((res) => {
      setItems(res.data.results || res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="container section"><div className="skeleton" style={{ height: 300 }} /></div>;

  if (items.length === 0) {
    return (
      <div className="container section empty-state">
        <h2>Your wishlist is empty</h2>
        <p className="muted">Tap the heart on any product to save it here.</p>
        <Link to="/products" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Your wishlist</h1>
      <div className="product-grid" style={{ marginTop: 24 }}>
        {items.map((w) => (
          <ProductCard
            key={w.id}
            product={{ ...w.product_detail, wishlistId: w.id }}
            wished
            onWishlistChange={load}
          />
        ))}
      </div>
    </div>
  );
}
