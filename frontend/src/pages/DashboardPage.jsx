import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../api';
import AppLayout from '../components/AppLayout';

const statusLabel = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const statusClass = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([taskApi.getStats(), taskApi.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' })])
      .then(([sRes, tRes]) => {
        setStats(sRes.data.data.stats);
        setRecent(tRes.data.data.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const statCards = stats ? [
    { label: 'Total',       value: stats.total,       color: 'var(--accent)',   bar: '#00c8ff' },
    { label: 'To Do',       value: stats.todo,        color: 'var(--text)',     bar: '#ffffff44' },
    { label: 'In Progress', value: stats.inProgress,  color: 'var(--warning)',  bar: '#ffb300' },
    { label: 'Done',        value: stats.done,        color: 'var(--success)',  bar: '#00e5a0' },
    { label: 'High Priority',value: stats.highPriority,color: 'var(--danger)', bar: '#ff4466' },
    { label: 'Overdue',     value: stats.overdue,     color: 'var(--danger)',   bar: '#ff4466' },
  ] : [];

  return (
    <AppLayout>
      <div className="page-wrapper">
        <div className="accent-line" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <h1 className="page-title">
              {user?.name?.split(' ')[0]}
              {user?.role === 'admin' && (
                <span className="badge badge-admin" style={{ marginLeft: 10, verticalAlign: 'middle', fontSize: 11 }}>
                  Admin
                </span>
              )}
            </h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {statCards.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-bar" style={{ background: s.bar, opacity: 0.5 }} />
                </div>
              ))}
            </div>

            {/* Recent tasks */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Tasks</h2>
                <Link to="/tasks" className="btn btn-ghost btn-sm">View all</Link>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <div className="empty-title">No tasks yet</div>
                  <div className="empty-desc">Create your first task to get started</div>
                  <Link to="/tasks" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: 4 }}>
                    New Task
                  </Link>
                </div>
              ) : (
                <div className="task-list">
                  {recent.map((task) => (
                    <div className="task-row" key={task._id}>
                      <div className="task-row-body">
                        <div className="task-row-title">{task.title}</div>
                        {task.description && <div className="task-row-desc">{task.description}</div>}
                        <div className="task-row-meta">
                          <span className={`badge ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                          {task.dueDate && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
