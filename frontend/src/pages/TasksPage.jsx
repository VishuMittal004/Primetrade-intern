import { useEffect, useState, useCallback } from 'react';
import { taskApi } from '../api';
import AppLayout from '../components/AppLayout';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const statusLabel = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const statusClass = { todo: 'badge-todo', 'in-progress': 'badge-in-progress', done: 'badge-done' };

const EditSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const SearchSvg = () => (
  <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
      const res = await taskApi.getAll(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const handleSave = async (data, id) => {
    try {
      if (id) { await taskApi.update(id, data); toast.success('Task updated'); }
      else { await taskApi.create(data); toast.success('Task created'); }
      setModalOpen(false); setEditing(null); fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); throw err; }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.delete(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      fetchTasks();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  return (
    <AppLayout>
      <div className="page-wrapper">
        <div className="accent-line" />
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">
              {user?.role === 'admin' ? 'All tasks across the platform' : 'Your personal task list'}
            </p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto', minWidth: 120 }}
            onClick={() => { setEditing(null); setModalOpen(true); }}>
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="task-filters">
          <div className="search-wrap">
            <SearchSvg />
            <input className="form-input search-input" placeholder="Search tasks..." value={filters.search}
              onChange={e => setFilter('search', e.target.value)} />
          </div>
          {[
            { key: 'status', opts: [['', 'All Status'], ['todo', 'To Do'], ['in-progress', 'In Progress'], ['done', 'Done']] },
            { key: 'priority', opts: [['', 'All Priority'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']] },
            { key: 'sortBy', opts: [['createdAt', 'Newest'], ['dueDate', 'Due Date'], ['priority', 'Priority'], ['title', 'Title']] },
          ].map(({ key, opts }) => (
            <div key={key} className="filter-group">
              <select className="form-input form-select" value={filters[key]} onChange={e => setFilter(key, e.target.value)}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="spinner-center"><div className="spinner spinner-lg" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <div className="empty-title">No tasks found</div>
            <div className="empty-desc">{filters.status || filters.priority || filters.search ? 'Try adjusting your filters' : 'Create your first task to get started'}</div>
            <button className="btn btn-primary" style={{ width: 'auto', margin: '0 auto' }}
              onClick={() => { setEditing(null); setModalOpen(true); }}>New Task</button>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map(task => (
              <div className="task-row" key={task._id}>
                <div className="task-row-body">
                  <div className="task-row-title">{task.title}</div>
                  {task.description && <div className="task-row-desc">{task.description}</div>}
                  <div className="task-row-meta">
                    <span className={`badge ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                        {new Date(task.dueDate) < new Date() && task.status !== 'done' ? ' · Overdue' : ''}
                      </span>
                    )}
                    {task.tags?.map(t => <span className="chip" key={t}>{t}</span>)}
                    {user?.role === 'admin' && task.owner && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.owner.name}</span>
                    )}
                  </div>
                </div>
                <div className="task-row-actions">
                  <button className="btn-icon" onClick={() => { setEditing(task); setModalOpen(true); }} title="Edit">
                    <EditSvg />
                  </button>
                  <button className="btn-icon" onClick={() => setDeleteId(task._id)} title="Delete"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(255,68,102,0.2)' }}>
                    <TrashSvg />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={!pagination.hasPrevPage}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Prev</button>
            <span className="pagination-label">Page {pagination.page} / {pagination.totalPages}</span>
            <button className="btn btn-ghost btn-sm" disabled={!pagination.hasNextPage}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</button>
          </div>
        )}
      </div>

      {modalOpen && <TaskModal task={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Task</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this task? This cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><div className="spinner" /> Deleting</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
