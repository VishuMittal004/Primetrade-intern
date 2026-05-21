import { useState } from 'react';

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    dueDate:     task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    tags:        task?.tags?.join(', ') || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (form.description.length > 1000) e.description = 'Max 1000 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        status:      form.status,
        priority:    form.priority,
        dueDate:     form.dueDate || null,
        tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      await onSave(payload, task?._id);
    } catch (err) {
      const apiErrs = err.response?.data?.errors;
      if (apiErrs) {
        const fe = {};
        apiErrs.forEach(e => { fe[e.field] = e.message; });
        setErrors(fe);
      }
    } finally {
      setLoading(false);
    }
  };

  const u = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title</label>
            <input id="task-title" type="text" className={`form-input${errors.title ? ' is-error' : ''}`}
              placeholder="What needs to be done?" value={form.title} onChange={u('title')} autoFocus />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea id="task-desc" className={`form-input${errors.description ? ' is-error' : ''}`}
              placeholder="Add more details..." rows={3} value={form.description} onChange={u('description')} />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select id="task-status" className="form-input form-select" value={form.status} onChange={u('status')}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" className="form-input form-select" value={form.priority} onChange={u('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input id="task-due" type="date" className="form-input" value={form.dueDate} onChange={u('dueDate')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-tags">Tags</label>
              <input id="task-tags" type="text" className="form-input"
                placeholder="backend, api, urgent" value={form.tags} onChange={u('tags')} />
              <div className="form-hint">Comma-separated</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', minWidth: 120 }} disabled={loading}>
              {loading ? <><div className="spinner" /> Saving</> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
