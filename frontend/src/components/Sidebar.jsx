import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// SVG icon components — no emojis
const IconHome = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconTask = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconUser = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconUsers = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconLogout = () => (
  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconLogo = () => (
  <svg style={{ width: 18, height: 18, fill: '#fff' }} viewBox="0 0 24 24">
    <path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const navItems = [
  { to: '/dashboard', icon: <IconHome />, label: 'Dashboard' },
  { to: '/tasks',     icon: <IconTask />, label: 'My Tasks'  },
  { to: '/profile',  icon: <IconUser />, label: 'Profile'   },
];
const adminItems = [
  { to: '/admin/users', icon: <IconUsers />, label: 'Manage Users' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-mark">
          <IconLogo />
        </div>
        <span className="sidebar-brand">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="nav-section">
            <div className="nav-section-label">Admin</div>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-pill-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-pill-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width: '100%', gap: 8 }} onClick={handleLogout}>
          <IconLogout />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
