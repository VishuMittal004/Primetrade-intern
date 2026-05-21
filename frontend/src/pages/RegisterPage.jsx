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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must include uppercase, lowercase, and a number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fe = {};
        err.response.data.errors.forEach(e => { fe[e.field] = e.message; });
        setErrors(fe);
      }
    } finally {
      setLoading(false);
    }
  };

  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

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
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Start managing your work with TaskFlow</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className={`form-input${errors.name ? ' is-error' : ''}`}
                placeholder="John Doe" value={form.name} onChange={upd('name')} autoComplete="name" />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className={`form-input${errors.email ? ' is-error' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={upd('email')} autoComplete="email" />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pw">Password</label>
                <input id="reg-pw" type="password" className={`form-input${errors.password ? ' is-error' : ''}`}
                  placeholder="Min. 6 chars" value={form.password} onChange={upd('password')} autoComplete="new-password" />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm</label>
                <input id="reg-confirm" type="password" className={`form-input${errors.confirmPassword ? ' is-error' : ''}`}
                  placeholder="Repeat password" value={form.confirmPassword} onChange={upd('confirmPassword')} autoComplete="new-password" />
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            <p className="form-hint" style={{ marginBottom: 18 }}>
              Password: uppercase + lowercase + number required
            </p>

            <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit">
              {loading ? <><div className="spinner" /> Creating account</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
