import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products/categories/'),
      api.get('/products/?ordering=-created_at'),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.results || catRes.data);
      setFeatured((prodRes.data.results || prodRes.data).slice(0, 8));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Est. this week — a shop for everyday goods</span>
          <h1>Everything for the week, <em>none of the noise.</em></h1>
          <p className="muted hero-sub">
            Electronics, fashion, home goods, books and sports gear — picked, priced fairly,
            and delivered to your door.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Browse the shop</Link>
            <Link to="/products?ordering=-created_at" className="btn btn-outline">See what's new</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Shop by category</h2>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="category-chip card">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Freshly stocked</h2>
          <Link to="/products" className="muted">View all →</Link>
        </div>
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280 }} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
