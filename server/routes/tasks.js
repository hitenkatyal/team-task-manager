const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const TASK_SELECT = `
  SELECT t.*, u1.name as assigned_to_name, u1.email as assigned_to_email,
    u2.name as created_by_name, p.name as project_name
  FROM tasks t
  LEFT JOIN users u1 ON t.assigned_to=u1.id
  LEFT JOIN users u2 ON t.created_by=u2.id
  LEFT JOIN projects p ON t.project_id=p.id`;

router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const uid = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const f = isAdmin ? '' : `AND (p.owner_id=${uid} OR t.assigned_to=${uid} OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id=t.project_id AND pm.user_id=${uid}))`;
    const base = `FROM tasks t JOIN projects p ON t.project_id=p.id WHERE 1=1 ${f}`;
    const total = (await db.get(`SELECT COUNT(*) as c ${base}`)).c;
    const todo = (await db.get(`SELECT COUNT(*) as c ${base} AND t.status='todo'`)).c;
    const in_progress = (await db.get(`SELECT COUNT(*) as c ${base} AND t.status='in_progress'`)).c;
    const done = (await db.get(`SELECT COUNT(*) as c ${base} AND t.status='done'`)).c;
    const overdue = (await db.get(`SELECT COUNT(*) as c ${base} AND t.due_date < date('now') AND t.status!='done' AND t.due_date IS NOT NULL`)).c;
    res.json({ total, todo, in_progress, done, overdue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { project_id, status, assigned_to, overdue } = req.query;
    let q = `${TASK_SELECT} WHERE 1=1`;
    const p = [];
    if (req.user.role !== 'admin') {
      q += ` AND (p.owner_id=? OR t.assigned_to=? OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id=t.project_id AND pm.user_id=?))`;
      p.push(req.user.id, req.user.id, req.user.id);
    }
    if (project_id) { q += ' AND t.project_id=?'; p.push(project_id); }
    if (status) { q += ' AND t.status=?'; p.push(status); }
    if (assigned_to) { q += ' AND t.assigned_to=?'; p.push(assigned_to); }
    if (overdue === 'true') q += ` AND t.due_date < date('now') AND t.status!='done' AND t.due_date IS NOT NULL`;
    q += ' ORDER BY t.created_at DESC';
    res.json(await db.all(q, p));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    if (!project_id) return res.status(400).json({ error: 'Project required' });
    const project = await db.get('SELECT * FROM projects WHERE id=?', [project_id]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const member = await db.get(
      'SELECT * FROM project_members WHERE project_id=? AND user_id=?', [project_id, req.user.id]
    );
    if (project.owner_id !== req.user.id && req.user.role !== 'admin' && !member)
      return res.status(403).json({ error: 'No access' });
    const result = await db.run(
      `INSERT INTO tasks(title,description,status,priority,project_id,assigned_to,created_by,due_date)
       VALUES(?,?,?,?,?,?,?,?)`,
      [title, description || '', status || 'todo', priority || 'medium',
       project_id, assigned_to || null, req.user.id, due_date || null]
    );
    res.status(201).json(await db.get(`${TASK_SELECT} WHERE t.id=?`, [result.lastInsertRowid]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await db.get(`${TASK_SELECT} WHERE t.id=?`, [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id=?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await db.get('SELECT * FROM projects WHERE id=?', [task.project_id]);
    const member = await db.get(
      'SELECT * FROM project_members WHERE project_id=? AND user_id=?', [task.project_id, req.user.id]
    );
    if (project.owner_id !== req.user.id && req.user.role !== 'admin' && !member)
      return res.status(403).json({ error: 'No access' });
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    await db.run(
      `UPDATE tasks SET title=?,description=?,status=?,priority=?,assigned_to=?,due_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [title ?? task.title, description ?? task.description,
       status ?? task.status, priority ?? task.priority,
       assigned_to !== undefined ? (assigned_to || null) : task.assigned_to,
       due_date !== undefined ? (due_date || null) : task.due_date,
       req.params.id]
    );
    res.json(await db.get(`${TASK_SELECT} WHERE t.id=?`, [req.params.id]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id=?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await db.get('SELECT * FROM projects WHERE id=?', [task.project_id]);
    if (project.owner_id !== req.user.id && req.user.role !== 'admin' && task.created_by !== req.user.id)
      return res.status(403).json({ error: 'Cannot delete' });
    await db.run('DELETE FROM tasks WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;