import { useEffect, useState, useCallback } from 'react';
import { userApi } from '../api';
import AppLayout from '../components/AppLayout';
import toast from 'react-hot-toast';

const TrashSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({ page, limit: 15 });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const mark = (id, val) => setBusy(b => ({ ...b, [id]: val }));

  const toggleStatus = async (id) => {
    mark(id, 'status');
    try {
      const res = await userApi.toggleStatus(id);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { mark(id, null); }
  };

  const changeRole = async (id, role) => {
    mark(id, 'role');
    try {
      const res = await userApi.updateRole(id, role);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { mark(id, null); }
  };

  const handleDelete = async () => {
    mark(deleteId, 'del');
    try {
      await userApi.delete(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    finally { mark(deleteId, null); }
  };

  return (
    <AppLayout>
      <div className="page-wrapper">
        <div className="accent-line" />
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Users</h1>
            <p className="page-subtitle">Admin — view, assign roles and manage accounts</p>
          </div>
          {pagination && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {pagination.total} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="spinner-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <div className="glass-table">
            <table>
              <thead>
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <select
                          className="form-input form-select"
                          style={{ padding: '4px 28px 4px 8px', fontSize: 12, width: 'auto', minWidth: 90 }}
                          value={u.role}
                          disabled={!!busy[u._id]}
                          onChange={e => changeRole(u._id, e.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-done' : 'badge-high'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={!!busy[u._id]}
                            onClick={() => toggleStatus(u._id)}
                          >
                            {busy[u._id] === 'status'
                              ? <div className="spinner" style={{ width: 12, height: 12 }} />
                              : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn-icon"
                            disabled={!!busy[u._id]}
                            onClick={() => setDeleteId(u._id)}
                            style={{ color: 'var(--danger)', borderColor: 'rgba(255,68,102,0.2)' }}
                            title="Delete user"
                          >
                            <TrashSvg />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-title">No users found</div>
              </div>
            )}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span className="pagination-label">Page {pagination.page} / {pagination.totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Delete User</h2></div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              This permanently deletes the user account and cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={!!busy[deleteId]}>
                {busy[deleteId] ? <><div className="spinner" /> Deleting</> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
