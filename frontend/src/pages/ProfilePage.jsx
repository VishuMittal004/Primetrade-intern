import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, userApi } from '../api';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ name: name.trim() });
      updateUser(res.data.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const validatePw = () => {
    const e = {};
    if (!pw.currentPassword) e.currentPassword = 'Required';
    if (!pw.newPassword) e.newPassword = 'Required';
    else if (pw.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw.newPassword))
      e.newPassword = 'Must have uppercase, lowercase, and a number';
    if (pw.newPassword !== pw.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setSavingPw(true);
    try {
      await authApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed. Please sign in again.');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally { setSavingPw(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const upd = (field) => (e) => setPw(f => ({ ...f, [field]: e.target.value }));

  const infoItems = [
    { label: 'Email',        value: user?.email },
    { label: 'Role',         value: user?.role },
    { label: 'Status',       value: user?.isActive ? 'Active' : 'Inactive' },
    { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
  ];

  return (
    <AppLayout>
      <div className="page-wrapper">
        <div className="accent-line" />
        <h1 className="page-title" style={{ marginBottom: 28 }}>Profile</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Identity card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
              <div className="avatar avatar-lg">{initials}</div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
                <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="divider" />

            <form onSubmit={handleProfileSave}>
              <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Update Name
              </h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 400 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" htmlFor="profile-name">Display Name</label>
                  <input id="profile-name" type="text" className="form-input" value={name}
                    onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <button type="submit" className="btn btn-ghost" style={{ flexShrink: 0, height: 42 }} disabled={savingProfile}>
                  {savingProfile ? <div className="spinner" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="card">
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} noValidate style={{ maxWidth: 420 }}>
              {[
                { id: 'cur-pw', key: 'currentPassword', label: 'Current Password', ph: 'Your current password' },
                { id: 'new-pw', key: 'newPassword',     label: 'New Password',     ph: 'Min 6 chars, upper+lower+number' },
                { id: 'cnf-pw', key: 'confirmPassword', label: 'Confirm New',      ph: 'Repeat new password' },
              ].map(({ id, key, label, ph }) => (
                <div className="form-group" key={key}>
                  <label className="form-label" htmlFor={id}>{label}</label>
                  <input id={id} type="password" className={`form-input${pwErrors[key] ? ' is-error' : ''}`}
                    placeholder={ph} value={pw[key]} onChange={upd(key)} />
                  {pwErrors[key] && <div className="form-error">{pwErrors[key]}</div>}
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', minWidth: 160 }} disabled={savingPw}>
                {savingPw ? <><div className="spinner" /> Updating</> : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Account info */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Account Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18 }}>
              {infoItems.map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
