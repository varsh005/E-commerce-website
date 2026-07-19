import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">M</span>arket&nbsp;Co
        </Link>

        <form className="search-form" onSubmit={submitSearch}>
          <input
            type="text"
            placeholder="Search products…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="Search">→</button>
        </form>

        <button className="nav-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">☰</button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          {user && <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
          {user && <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode">
            {dark ? '☀' : '☾'}
          </button>
          <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
            Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>{user.username}</Link>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
