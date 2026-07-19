import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';

export default function AdminLayout() {
  return (
    <div className="container section admin-layout">
      <aside className="admin-nav card">
        <h3>Admin</h3>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/categories">Categories</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/coupons">Coupons</NavLink>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
