import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import './ProductList.css';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistMap, setWishlistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const ordering = searchParams.get('ordering') || '';

  useEffect(() => {
    api.get('/products/categories/').then((res) => setCategories(res.data.results || res.data));
  }, []);

  const loadWishlist = useCallback(() => {
    if (!user) return;
    api.get('/products/wishlist/').then((res) => {
      const map = {};
      (res.data.results || res.data).forEach((w) => { map[w.product] = w.id; });
      setWishlistMap(map);
    });
  }, [user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (ordering) params.ordering = ordering;
    if (searchParams.get('min_price')) params.min_price = searchParams.get('min_price');
    if (searchParams.get('max_price')) params.max_price = searchParams.get('max_price');
    api.get('/products/', { params }).then((res) => {
      setProducts(res.data.results || res.data);
      setLoading(false);
    });
  }, [search, category, ordering, searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const applyPriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('min_price', minPrice); else next.delete('min_price');
    if (maxPrice) next.set('max_price', maxPrice); else next.delete('max_price');
    setSearchParams(next);
  };

  return (
    <div className="container section plp">
      <aside className="plp-filters card">
        <h3>Category</h3>
        <ul className="filter-list">
          <li>
            <button className={!category ? 'active' : ''} onClick={() => updateParam('category', '')}>
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                className={String(category) === String(c.id) ? 'active' : ''}
                onClick={() => updateParam('category', c.id)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>

        <h3>Price</h3>
        <form onSubmit={applyPriceFilter} className="price-filter">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <span>–</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <button type="submit" className="btn btn-outline btn-sm">Go</button>
        </form>
      </aside>

      <div className="plp-main">
        <div className="plp-toolbar">
          <span className="muted">{loading ? 'Loading…' : `${products.length} products`}{search && ` for "${search}"`}</span>
          <select value={ordering} onChange={(e) => updateParam('ordering', e.target.value)}>
            <option value="">Sort: Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}
          </div>
        ) : products.length === 0 ? (
          <p className="muted">No products match your filters. Try widening your search.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{ ...p, wishlistId: wishlistMap[p.id] }}
                wished={!!wishlistMap[p.id]}
                onWishlistChange={loadWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
