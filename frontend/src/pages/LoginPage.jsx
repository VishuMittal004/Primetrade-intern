import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import toast from 'react-hot-toast';

const LogoIcon = () => (
  <svg style={{ width: 20, height: 20, fill: '#fff' }} viewBox="0 0 24 24">
    <path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <>
      <AnimatedBackground />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark"><LogoIcon /></div>
            <span className="auth-brand">TaskFlow</span>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">Enter your credentials to access your workspace</p>
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, fontSize: 11 }}
              onClick={() => fill('admin@taskflow.dev', 'Admin123')}
            >
              Admin Demo
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ flex: 1, fontSize: 11 }}
              onClick={() => fill('alice@taskflow.dev', 'Alice123')}
            >
              User Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${errors.email ? ' is-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 22 }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`form-input${errors.password ? ' is-error' : ''}`}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit">
              {loading ? <><div className="spinner" /> Signing in</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
