import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.patch('/auth/profile/', form);
    localStorage.setItem('user', JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container auth-page">
      <form className="auth-card card" onSubmit={submit}>
        <h1>Your profile</h1>
        <p className="muted">Keep your shipping details up to date for faster checkout.</p>
        <div className="form-row">
          <div className="field">
            <label>First name</label>
            <input value={form.first_name || ''} onChange={update('first_name')} />
          </div>
          <div className="field">
            <label>Last name</label>
            <input value={form.last_name || ''} onChange={update('last_name')} />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email || ''} onChange={update('email')} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={form.phone || ''} onChange={update('phone')} />
        </div>
        <div className="field">
          <label>Address</label>
          <textarea rows="2" value={form.address || ''} onChange={update('address')} />
        </div>
        <div className="form-row">
          <div className="field">
            <label>City</label>
            <input value={form.city || ''} onChange={update('city')} />
          </div>
          <div className="field">
            <label>State</label>
            <input value={form.state || ''} onChange={update('state')} />
          </div>
        </div>
        <div className="field">
          <label>Pincode</label>
          <input value={form.pincode || ''} onChange={update('pincode')} />
        </div>
        <button className="btn btn-primary btn-block" type="submit">
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
